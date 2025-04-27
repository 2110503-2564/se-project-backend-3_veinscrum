import { ChatModel } from "@/models/Chat";
import { CompanyModel } from "@/models/Company";
import { InterviewSessionModel } from "@/models/InterviewSession";
import { JobListingModel } from "@/models/JobListing";
import { UserModel } from "@/models/User";
import type { POSTRegisterInterviewSessionRequest } from "@/types/api/v1/sessions/POST";
import type { PUTUpdateInterviewSessionRequest } from "@/types/api/v1/sessions/PUT";
import type { Company } from "@/types/models/Company";
import type { InterviewSession } from "@/types/models/InterviewSession";
import type { JobListing } from "@/types/models/JobListing";
import type { User } from "@/types/models/User";
import type { RequestWithAuth } from "@/types/Request";
import { buildComparisonQuery } from "@/utils/buildComparisonQuery";
import { filterAndPaginate } from "@/utils/filterAndPaginate";
import { isWithinAllowedDateRange } from "@/utils/isWithinAllowedDateRange";
import type { NextFunction, Request, Response } from "express";
import type mongoose from "mongoose";
import assert from "node:assert";

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

        const baseQuery = InterviewSessionModel.find(comparisonQuery).populate([
            {
                path: "user",
                select: "name email tel",
            },
            {
                path: "jobListing",
                populate: {
                    path: "company",
                    model: "Company",
                },
            },
        ]);

        const result = await filterAndPaginate({
            request,
            response: res,
            baseQuery,
            total: await InterviewSessionModel.countDocuments(comparisonQuery),
        });

        assert(result);

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
// @access  Private - Only accessible by the user who created it, the company owner, or an admin
export async function getInterviewSession(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const request = req as RequestWithAuth;
        const { id: userId, role: userRole } = request.user;

        const interviewSession = await InterviewSessionModel.findById(
            req.params.id,
        )
            .populate([
                {
                    path: "user",
                    select: "name email tel role",
                },
                {
                    path: "jobListing",
                    populate: {
                        path: "company",
                        model: "Company",
                    },
                },
            ])
            .lean<
                InterviewSession & {
                    jobListing: JobListing & { company: Company };
                } & { user: User } & Required<{ _id: mongoose.Types.ObjectId }>
            >();

        if (!interviewSession) {
            res.status(404).json({
                success: false,
                error: `No interview session found with id ${req.params.id}`,
            });
            return;
        }

        if (!interviewSession.jobListing) {
            res.status(404).json({
                success: false,
                error: "Job listing associated with this interview session no longer exists",
            });
            return;
        }

        if (
            userRole !== "admin" &&
            String(userId) !== String(interviewSession.user._id) &&
            String(userId) !== String(interviewSession.jobListing.company.owner)
        ) {
            res.status(403).json({
                success: false,
                error: "You do not have permission to view this interview session",
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

        if (!isWithinAllowedDateRange(new Date(request.body.date))) {
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

        const interviewSession = await InterviewSessionModel.findById(
            request.params.id,
        )
            .populate({
                path: "jobListing",
                populate: {
                    path: "company",
                    model: "Company",
                },
            })
            .lean<
                InterviewSession & {
                    jobListing: JobListing & { company: Company };
                } & { user: User } & Required<{ _id: mongoose.Types.ObjectId }>
            >();

        if (!interviewSession) {
            res.status(404).json({
                success: false,
                error: "Interview session not found",
            });

            return;
        }

        if (!interviewSession.jobListing) {
            res.status(404).json({
                success: false,
                error: "Job listing associated with this interview session no longer exists",
            });
            return;
        }

        if (
            userRole !== "admin" &&
            String(userId) !== String(interviewSession.user) &&
            String(userId) !== String(interviewSession.jobListing.company.owner)
        ) {
            res.status(403).json({
                success: false,
                error: "You do not have permission to update this interview session",
            });

            return;
        }

        if (!isWithinAllowedDateRange(new Date(request.body.date))) {
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
            String(userId) !== String(interviewSession.user) &&
            String(userId) !== String(interviewSession.jobListing.company.owner)
        ) {
            res.status(403).json({
                success: false,
                error: "You do not have permission to delete this interview session",
            });

            return;
        }

        await ChatModel.deleteOne({ interviewSession: request.params.id });
        await InterviewSessionModel.findByIdAndDelete(request.params.id);

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
        const request = req as RequestWithAuth;
        const { id: requestUserId, role: requestUserRole } = request.user;

        const requestedUser = await UserModel.findById(req.params.id);

        if (!requestedUser) {
            res.status(404).json({
                success: false,
                error: "User not found",
            });

            return;
        }

        if (
            requestUserRole !== "admin" &&
            String(requestUserId) !== String(requestedUser._id)
        ) {
            res.status(403).json({
                success: false,
                error: "You do not have permission to view this user interview sessions",
            });
        }

        const interviewSession = await InterviewSessionModel.find({
            user: req.params.id,
        }).populate([
            {
                path: "user",
                select: "name email tel",
            },
            {
                path: "jobListing",
                populate: {
                    path: "company",
                    model: "Company",
                },
            },
        ]);

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
        const { id: userId, role: userRole } = request.user;

        const jobListing = await JobListingModel.findById(
            req.params.id,
        ).populate({
            path: "company",
            select: "owner",
        });

        if (!jobListing) {
            res.status(404).json({
                success: false,
                error: "Job listing not found",
            });

            return;
        }

        if (
            userRole !== "admin" &&
            String(userId) !== String(jobListing.company.owner)
        ) {
            res.status(403).json({
                success: false,
                error: "You are not authorized to view interview sessions for this job listing",
            });

            return;
        }

        const interviewSessions = await InterviewSessionModel.find({
            jobListing: jobListing._id,
        }).populate([
            {
                path: "user",
                select: "name email tel",
            },
            {
                path: "jobListing",
                populate: {
                    path: "company",
                    model: "Company",
                },
            },
        ]);

        res.status(200).json({
            success: true,
            data: interviewSessions,
        });
    } catch (err) {
        next(err);
    }
}

/// @desc     Get interview session by company
/// @route    GET /api/v1/companies/:id/sessions
/// @access   Protect
export async function getInterviewSessionsByCompany(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const request = req as RequestWithAuth;
        const { id: userId, role: userRole } = request.user;

        const company = await CompanyModel.findById(req.params.id);

        if (!company) {
            res.status(404).json({
                success: false,
                error: "Company not found",
            });

            return;
        }

        if (userRole !== "admin" && String(userId) !== String(company.owner)) {
            res.status(403).json({
                success: false,
                error: "You are not authorized to view interview sessions for this company",
            });

            return;
        }

        const jobListingIds = await JobListingModel.find({
            company: company._id,
        })
            .select("_id")
            .then((jobs: JobListing[]) => jobs.map((job) => job._id));

        const interviewSessions = await InterviewSessionModel.find({
            jobListing: { $in: jobListingIds },
        }).populate([
            {
                path: "user",
                select: "name email tel",
            },
            {
                path: "jobListing",
                populate: {
                    path: "company",
                    model: "Company",
                },
            },
        ]);

        res.status(200).json({
            success: true,
            data: interviewSessions,
        });
    } catch (err) {
        next(err);
    }
}
