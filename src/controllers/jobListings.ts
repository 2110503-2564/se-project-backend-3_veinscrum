import { ChatModel } from "@/models/Chat";
import { CompanyModel } from "@/models/Company";
import { InterviewSessionModel } from "@/models/InterviewSession";
import { JobListingModel } from "@/models/JobListing";
import type { InterviewSession } from "@/types/models/InterviewSession";
import type { RequestWithAuth } from "@/types/Request";
import { buildComparisonQuery } from "@/utils/buildComparisonQuery";
import { filterAndPaginate } from "@/utils/filterAndPaginate";
import type { NextFunction, Request, Response } from "express";
import assert from "node:assert";

/// @desc     Get job listing by id
/// @route    GET /api/v1/job-listings/:id
/// @access   Public
export const getJobListing = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const jobListing = await JobListingModel.findById(req.params.id)
            .select("+image")
            .populate({
                path: "company",
            });

        if (!jobListing) {
            res.status(404).json({
                success: false,
                error: "Job listing not found",
            });

            return;
        }

        res.status(200).json({ success: true, data: jobListing });
    } catch (err) {
        next(err);
    }
};

/// @desc     Get all job listings
/// @route    GET /api/v1/job-listings/
/// @access   Private
export const getJobListings = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const request = req as RequestWithAuth;
        const comparisonQuery = buildComparisonQuery(request.query);

        const baseQuery = JobListingModel.find(comparisonQuery).populate({
            path: "company",
        });

        const result = await filterAndPaginate({
            request,
            response: res,
            baseQuery,
            total: await JobListingModel.countDocuments(comparisonQuery),
        });
        /*
        if (!result) {
            res.status(400).json({
                success: false,
                error: "Invalid pagination parameters: 'page' and 'limit' must be positive integers.",
            });

            return;
        }
*/
        assert(result);
        const jobListings = await result.query.exec();

        res.status(200).json({
            success: true,
            count: jobListings.length,
            pagination: result.pagination,
            data: jobListings,
        });
    } catch (err) {
        next(err);
    }
};

/// @desc     Get job listings by company
/// @route    GET /api/v1/companies/:id/job-listings
/// @access   Public
export const getJobListingsByCompany = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const request = req as RequestWithAuth;
        const { id: userId, role: userRole } = request.user;

        const company = await CompanyModel.findById(request.params.id);

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
                error: "You do not have permission to view this company job listings",
            });
        }

        const jobListings = await JobListingModel.find({
            company: req.params.id,
        }).populate({
            path: "company",
        });

        res.status(200).json({
            success: true,
            data: jobListings,
        });
    } catch (error) {
        next(error);
    }
};

/// @desc     Create job listing (authentication required)
/// @route    POST /api/v1/job-listing
/// @access   Protected
export async function createJobListing(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const jobListing = await JobListingModel.create(req.body);
        const populatedJobListing = await JobListingModel.findById(
            jobListing._id,
        ).populate({
            path: "company",
        });

        res.status(201).json({ success: true, data: populatedJobListing });
    } catch (err) {
        next(err);
    }
}

/// @desc     Update job listing (authentication required)
/// @route    PUT /api/v1/job-listings/:id
/// @access   Protected
export async function updateJobListing(
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
                error: "You do not have permission to update this job listing",
            });

            return;
        }

        const updatedJobListing = await JobListingModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            },
        ).populate({
            path: "company",
        });

        res.status(200).json({ success: true, data: updatedJobListing });
    } catch (err) {
        next(err);
    }
}

/// @desc     Delete job listing (authentication required)
/// @route    DELETE /api/v1/job-listings/:id
/// @access   Protected
export async function deleteJobListing(
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
                error: "You do not have permission to delete this job listing",
            });

            return;
        }

        const interviewSessionIds = await InterviewSessionModel.find({
            jobListing: req.params.id,
        })
            .select("_id")
            .then((jobs: InterviewSession[]) =>
                jobs.map((interviewSession) => interviewSession._id),
            );

        if (interviewSessionIds.length > 0) {
            await ChatModel.deleteMany({
                interviewSession: { $in: interviewSessionIds },
            });
        }

        await InterviewSessionModel.deleteMany({ jobListing: req.params.id });
        await JobListingModel.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
}
