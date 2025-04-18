import { InterviewSessionModel } from "@/models/InterviewSession";
import { JobListingModel } from "@/models/JobListing";
import { Company } from "@/types/Company";
import { InterviewSession } from "@/types/InterviewSession";
import { JobListing } from "@/types/JobListing";
import { RequestWithAuth } from "@/types/Request";
import { POSTRegisterInterviewSessionRequest } from "@/types/api/v1/sessions/POST";
import { PUTUpdateInterviewSessionRequest } from "@/types/api/v1/sessions/PUT";
import { buildComparisonQuery } from "@/utils/buildComparisonQuery";
import { filterAndPaginate } from "@/utils/filterAndPaginate";
import { isWithinAllowedDateRange } from "@/utils/isWithinAllowedDateRange";
import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

// @desc    Get all interview sessions
// @route   GET /api/v1/sessions
// @access  Registered users can view their own sessions, admins can view all
export async function getInterviewSessions(
    req: Request,
    res: Response,
    next: NextFunction,
) {
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

        if (!result) {
            res.status(400).json({
                success: false,
                error: "Invalid pagination parameters: 'page' and 'limit' must be positive integers.",
            });

            return;
        }

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
}

// @desc    Get single interview session
// @route   GET /api/v1/sessions/:id
// @access  Public
export async function getInterviewSession(
    req: Request,
    res: Response,
    next: NextFunction,
) {
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
                error: `No interview session found with id ${req.params.id}`,
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: interviewSession,
        });
    } catch (error) {
        next(error);
    }
}

// @desc    Create interview session
// @route   POST /api/v1/sessions
// @access  Private
export async function createInterviewSession(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const request = req as POSTRegisterInterviewSessionRequest;
        const { id: userId, role: userRole } = request.user;

        const jobListing = await JobListingModel.findById(
            request.body.jobListing,
        );

        if (!jobListing) {
            res.status(404).json({
                success: false,
                error: "Job listing not found",
            });

            return;
        }

        request.body.user = userId;

        const existingSessions = await InterviewSessionModel.find({
            user: userId,
        });

        // If user is not an admin, they can only create up to 3 interview sessions
        if (existingSessions.length >= 3 && userRole !== "admin") {
            res.status(400).json({
                success: false,
                error: "You have reached the maximum number of interview sessions",
            });

            return;
        }


        if (!isWithinAllowedDateRange(request.body.date)) {
            res.status(400).json({
                success: false,
                error: "Interview sessions can only be scheduled from May 10th to May 13th, 2022",
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
}

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
        const { id: userId, role: userRole } = request.user;

        const rawInterviewSession = await InterviewSessionModel.findById(
            request.params.id,
        ).populate({
            path: "jobListing",
            populate: {
                path: "company",
                model: "Company",
            },
        });

        if (!rawInterviewSession) {
            res.status(404).json({
                success: false,
                error: "Interview session not found",
            });

            return;
        }

        const interviewSession =
            rawInterviewSession as unknown as InterviewSession & {
                jobListing: JobListing & { company: Company };
            } & Required<{ _id: mongoose.Types.ObjectId }>;

        if (!interviewSession.jobListing) {
            res.status(404).json({
                success: false,
                error: "Job listing associated with this interview session no longer exists",
            });
            return;
        }

        if (
            userRole !== "admin" &&
            !userId.equals(interviewSession.user) &&
            !userId.equals(interviewSession.jobListing.company.owner)
        ) {
            res.status(403).json({
                success: false,
                error: "You do not have permission to update this interview session",
            });

            return;
        }

        if (!isWithinAllowedDateRange(request.body.date)) {
            res.status(400).json({
                success: false,
                error: "Interview sessions can only be scheduled from May 10th to May 13th, 2022",
            });
            return;
        }

        const updatedInterviewSession =
            await InterviewSessionModel.findByIdAndUpdate(
                request.params.id,
                request.body,
                { new: true, runValidators: true },
            );

        res.status(200).json({ success: true, data: updatedInterviewSession });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete interview session
// @route   DELETE /api/v1/sessions/:id
// @access  Users can delete their own sessions, admins can delete any
export async function deleteInterviewSession(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const request = req as RequestWithAuth;
        const { id: userId, role: userRole } = request.user;

        const rawInterviewSession = await InterviewSessionModel.findById(
            request.params.id,
        ).populate({
            path: "jobListing",
            populate: {
                path: "company",
                model: "Company",
            },
        });

        if (!rawInterviewSession) {
            res.status(404).json({
                success: false,
                error: "Interview session not found",
            });

            return;
        }

        const interviewSession =
            rawInterviewSession as unknown as InterviewSession & {
                jobListing: JobListing & { company: Company };
            } & Required<{ _id: mongoose.Types.ObjectId }>;

        if (
            userRole !== "admin" &&
            !userId.equals(interviewSession.user) &&
            !userId.equals(interviewSession.jobListing.company.owner)
        ) {
            res.status(403).json({
                success: false,
                error: "You do not have permission to delete this interview session",
            });

            return;
        }

        await InterviewSessionModel.deleteOne({ _id: request.params.id });

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
}

export async function getInterviewSessionsByUser(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const interviewSession = await InterviewSessionModel.find({
            user: req.params.id,
        }).populate([
            {
                path: "user",
                select: "name email",
            },
            {
                path: "jobListing",
                populate: {
                    path: "company",
                    model: "Company",
                },
            },
        ]);

        if (!interviewSession) {
            res.status(404).json({
                success: false,
                error: "No interview sessions found for this user",
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: interviewSession,
        });
    } catch (error) {
        next(error);
    }
}

/// @desc     Get interview session by job listing
/// @route    GET /api/v1/job-listings/:id/sessions
/// @access   Protect
export async function getInterviewSessionsByJobListing(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const request = req as RequestWithAuth;

        const comparisonQuery = buildComparisonQuery(request.query);

        comparisonQuery.jobListing = String(request.params.id);

        if (request.user.role !== "admin") {
            comparisonQuery.user = String(request.user.id);
        }

        const baseQuery = InterviewSessionModel.find(comparisonQuery);

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
