import { CompanyModel } from "@/models/Company";
import { InterviewSessionModel } from "@/models/InterviewSession";
import { RequestWithAuth } from "@/types/Request";
import { POSTRegisterInterviewSessionRequest } from "@/types/api/v1/sessions/POST";
import { PUTUpdateInterviewSessionRequest } from "@/types/api/v1/sessions/PUT";
import { buildComparisonQuery } from "@/utils/buildComparisonQuery";
import { filterAndPaginate } from "@/utils/filterAndPaginate";
import { NextFunction, Request, Response } from "express";

// @desc    Get all interview sessions
// @route   GET /api/v1/sessions
// @access  Registered users can view their own sessions, admins can view all
export const getInterviewSessions = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const request = req as RequestWithAuth;

        const comparisonQuery = buildComparisonQuery(request.query);

        if (request.user.role !== "admin") {
            comparisonQuery.user = String(request.user.id);
        }

        const baseQuery = InterviewSessionModel.find(comparisonQuery).populate(
            request.user.role === "admin" ? "company user" : "company",
        );

        const result = await filterAndPaginate({
            request,
            response: res,
            baseQuery,
            total: await InterviewSessionModel.countDocuments(comparisonQuery),
        });

        if (!result) return;

        const sessions = await result.query.exec();

        res.status(200).json({
            success: true,
            count: sessions.length,
            pagination: result.pagination,
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

// @desc    Create interview session
// @route   POST /api/v1/sessions
// @access  Private
export const createInterviewSession = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const request = req as POSTRegisterInterviewSessionRequest;

        const companies = await CompanyModel.findById(request.body.company);

        if (!companies) {
            res.status(404).json({
                success: false,
                message: `No company found with id ${request.body.company}`,
            });

            return;
        }

        request.body.user = request.user.id;

        const existingSessions = await InterviewSessionModel.find({
            user: request.user.id,
        });

        // If user is not an admin, they can only create up to 3 interview sessions
        if (existingSessions.length >= 3 && request.user.role !== "admin") {
            res.status(400).json({
                success: false,
                message: `User with ID ${request.user.id} has reached the maximum number of interview sessions`,
            });

            return;
        }

        const startDate = new Date("2022-05-10T00:00:00Z");
        const endDate = new Date("2022-05-13T23:59:59Z");

        if (
            new Date(request.body.date) < startDate ||
            new Date(request.body.date) > endDate
        ) {
            res.status(400).json({
                success: false,
                message: `Interview sessions can only be scheduled from May 10th to May 13th, 2022`,
            });
            return;
        }

        const interviewSession = await InterviewSessionModel.create(
            request.body,
        );
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
        const request = req as PUTUpdateInterviewSessionRequest;
        let session = await InterviewSessionModel.findById(request.params.id);

        if (!session) {
            res.status(404).json({
                success: false,
                message: "Session not found",
            });
            return;
        }

        if (
            request.user?.role !== "admin" &&
            session.user.toString() !== String(request.user?.id)
        ) {
            res.status(403).json({ success: false, message: "Not authorized" });
            return;
        }

        session = await InterviewSessionModel.findByIdAndUpdate(
            request.params.id,
            request.body,
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
        const request = req as RequestWithAuth;
        const session = await InterviewSessionModel.findById(request.params.id);

        if (!session) {
            res.status(404).json({
                success: false,
                message: "Session not found",
            });
            return;
        }

        if (
            request.user?.role !== "admin" &&
            session.user.toString() !== String(request.user?.id)
        ) {
            res.status(403).json({ success: false, message: "Not authorized" });
        }

        await InterviewSessionModel.deleteOne({ _id: request.params.id });

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};

export const getInterviewSessionsByCompany = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const request = req as RequestWithAuth;

        const comparisonQuery = buildComparisonQuery(request.query);

        if (request.user.role !== "admin") {
            comparisonQuery.user = String(request.user.id);
        }

        const baseQuery = InterviewSessionModel.find(comparisonQuery).populate(
            request.user.role === "admin" ? "company user" : "company",
        );

        const result = await filterAndPaginate({
            request,
            response: res,
            baseQuery,
            total: await InterviewSessionModel.countDocuments(comparisonQuery),
        });

        if (!result) return;

        const sessions = await result.query;

        res.status(200).json({
            success: true,
            count: sessions.length,
            pagination: result.pagination,
            data: sessions,
        });
    } catch (err) {
        next(err);
    }
};

export const getInterviewSessionsByUser = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const interviewSession = await InterviewSessionModel.find({
            user: req.params.id,
        }).populate([
            {
                path: "user",
                select: "name email",
            },
            {
                path: "company",
            },
        ]);

        if (!interviewSession) {
            res.status(404).json({
                success: false,
                message: `No interview session found with user-id ${req.params.id}`,
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


/// @desc     Get interview session by job listing
/// @route    GET /api/v1/job-listings/:id/sessions
/// @access   Protect