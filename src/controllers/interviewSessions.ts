import { NextFunction, Request, Response } from "express";
import { Query } from "mongoose";
import { InterviewSessionModel } from "../models/InterviewSession";
import { CompanyModel } from "../models/Company";
import { AuthRequest } from "../types/Request";


// Define the EXCLUDED_QUERY_FIELDS for query filtering
const EXCLUDED_QUERY_FIELDS = ["select", "sort", "page", "limit"];

/* routes */

// @desc    Get all interview sessions
// @route   GET /api/v1/interviewSessions
// @access  Registered users can view their own sessions, admins can view all
export const getInterviewSessions = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    let query: Query<any[], any>;

    const user = (req as AuthRequest).user;

    if (user?.role !== "admin") {
        query = InterviewSessionModel.find({ user: user?.id }).populate(
            "company",
        );
    } else {
        query = InterviewSessionModel.find().populate("company user");
    }

    try {
        const sessions = await query;
        res.status(200).json({
            success: true,
            count: sessions.length,
            data: sessions,
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single interview session
// @route   GET /api/v1/interviewSessions/:id
// @access  Public
export const getInterviewSession = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const interviewSession = await InterviewSessionModel.findById(
            req.params.id,
        ).populate({
            path: "user",
            select: "name email",
        });

        if (!interviewSession) {
            res.status(404).json({
                success: false,
                message: `No interview session found with id ${req.params.id}`,
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: interviewSession,
        });
    } catch (error) {
        next(error); // Pass the error to the next middleware
    }
};

// @desc    Add interview session
// @route   POST /api/v1/users/:userId/interviewSessions
// @access  Private
export const addInterviewSession = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        req.body.user = req.params.userId;
        const companies = await CompanyModel.findById(req.params.userId);

        if (!companies) {
            res.status(404).json({
                success: false,
                message: `No company found with id ${req.params.userId}`,
            });
            return;
        }

        const user = (req as AuthRequest).user;

        // Add user ID to request body
        req.body.user = user?.id;

        // Check for existing interview sessions
        const existingSessions = await InterviewSessionModel.find({
            user: user?.id,
        });

        // If user is not an admin, they can only create up to 3 interview sessions
        if (existingSessions.length >= 3 && user?.role !== "admin") {
            res.status(400).json({
                success: false,
                message: `User with ID ${user?.id} has already created 3 interview sessions`,
            });
            return;
        }

        const interviewSession = await InterviewSessionModel.create(req.body);
        res.status(201).json({
            success: true,
            data: interviewSession,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update interview session
// @route   PUT /api/v1/interviewSessions/:id
// @access  Users can edit their own sessions, admins can edit any
export const updateInterviewSession = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        let session = await InterviewSessionModel.findById(req.params.id);

        const user = (req as AuthRequest).user;

        if (!session) {
            res.status(404).json({
                success: false,
                message: "Session not found",
            });
            return;
        }

        if (
            user?.role !== "admin" &&
            session.user.toString() !== user?.id
        ) {
            res.status(403).json({ success: false, message: "Not authorized" });
            return;
        }

        session = await InterviewSessionModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true },
        );

        res.status(200).json({ success: true, data: session });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete interview session
// @route   DELETE /api/v1/interviewSessions/:id
// @access  Users can delete their own sessions, admins can delete any
export const deleteInterviewSession = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const session = await InterviewSessionModel.findById(req.params.id);

        const user = (req as AuthRequest).user;

        if (!session) {
            res.status(404).json({
                success: false,
                message: "Session not found",
            });
            return;
        }

        if (
            user?.role !== "admin" &&
            session.user.toString() !== user?.id
        ) {
            res.status(403).json({ success: false, message: "Not authorized" });
        }

        await InterviewSessionModel.deleteOne({ _id: req.params.id });

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};

/* Helper functions */

// Set fields to select from the query
const applyFieldSelection = (
    query: Query<any[], any>,
    select: string,
): Query<any[], any> => {
    const fields = select.split(",").join(" ");
    query = query.select(fields);
    return query;
};

// Set sorting order for the query
const applySortingOrder = (
    query: Query<any[], any>,
    sort: string,
): Query<any[], any> => {
    const sortBy = sort.split(",").join(" ");
    query = query.sort(sortBy);
    return query;
};

// Validate and parse pagination parameters
const validatePaginationParams = (
    pageParam: any,
    limitParam: any,
    res: Response,
): { page: number | null; limit: number | null } => {
    const page = parseInt(pageParam as string, 10) || 1;
    const limit = parseInt(limitParam as string, 10) || 25;

    if (isNaN(page) || page <= 0) {
        res.status(400).json({
            success: false,
            message: "Invalid page number",
        });
        return { page: null, limit: null };
    }

    if (isNaN(limit) || limit <= 0) {
        res.status(400).json({
            success: false,
            message: "Invalid limit number",
        });
        return { page: null, limit: null };
    }

    return { page, limit };
};

// Apply pagination logic to the query
const applyPagination = async (
    query: Query<any[], any>,
    page: number,
    limit: number,
): Promise<PaginationResult> => {
    const startIndex = (page - 1) * limit;
    const total = await InterviewSessionModel.countDocuments();

    const paginationResult: PaginationResult = {};

    if (startIndex + limit < total) {
        paginationResult.next = { page: page + 1, limit };
    }

    if (startIndex > 0) {
        paginationResult.prev = { page: page - 1, limit };
    }

    query = query.skip(startIndex).limit(limit);

    return paginationResult;
};

// Build the comparison query by adding MongoDB operators
const buildComparisonQuery = (query: qs.ParsedQs): qs.ParsedQs => {
    const filteredQuery: qs.ParsedQs = {};

    for (const key in query) {
        if (query.hasOwnProperty(key) && !EXCLUDED_QUERY_FIELDS.includes(key)) {
            filteredQuery[key] = query[key];
        }
    }

    // Convert comparison operators to MongoDB query operators
    return JSON.parse(
        JSON.stringify(filteredQuery).replace(
            /\b(gt|gte|lt|lte|in)\b/g,
            (match) => `$${match}`,
        ),
    );
};
