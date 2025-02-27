import { NextFunction, Request, Response } from "express";
import { Query } from "mongoose";
import { InterviewSessionModel } from "../models/InterviewSession";
import { CompanyModel } from "../models/Company";
import { AuthRequest } from "../types/Request";
import { applyFieldSelection } from "src/utils/applyFieldSelection";
import { applyPagination } from "src/utils/applyPagination";
import { applySortingOrder } from "src/utils/applySortingOrder";
import { buildComparisonQuery } from "src/utils/buildComparisonQuery";
import { validatePaginationParams } from "src/utils/validatePaginationParams";

// @desc    Get all interview sessions
// @route   GET /api/v1/sessions
// @access  Registered users can view their own sessions, admins can view all
export const getInterviewSessions = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        // Filter and parse query parameters for comparisons
        const comparisonQuery = buildComparisonQuery(req.query);
        
        const user = (req as AuthRequest).user;
        let query: Query<any[], any>;

        if (user?.role !== "admin") {
            // For regular users, only show their own sessions
            comparisonQuery.user = user?.id;
            query = InterviewSessionModel.find(comparisonQuery).populate(
                "company",
            );
        } else {
            // For admins, show all sessions
            query = InterviewSessionModel.find(comparisonQuery).populate("company user");
        }

        // Handle field selection
        if (req.query.select && typeof req.query.select === "string") {
            query = applyFieldSelection(query, req.query.select);
        }

        // Handle sorting
        if (req.query.sort && typeof req.query.sort === "string") {
            query = applySortingOrder(query, req.query.sort);
        } else {
            query = applySortingOrder(query, "-createdAt");
        }

        // Validate pagination parameters
        const { page, limit } = validatePaginationParams(
            req.query.page,
            req.query.limit,
            res,
        );

        if (!page || !limit) return;

        const pagination = await applyPagination(query, page, limit);

        const sessions = await query;
        res.status(200).json({
            success: true,
            count: sessions.length,
            pagination,
            data: sessions,
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single interview session
// @route   GET /api/v1/sessions/:id
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
// @route   PUT /api/v1/sessions/:id
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
// @route   DELETE /api/v1/sessions/:id
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