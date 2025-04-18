import { InterviewSessionModel } from "@/models/InterviewSession";
import { JobListingModel } from "@/models/JobListing";
import { RequestWithAuth } from "@/types/Request";
import { buildComparisonQuery } from "@/utils/buildComparisonQuery";
import { filterAndPaginate } from "@/utils/filterAndPaginate";
import { NextFunction, Request, Response } from "express";

/// @desc     Get job listing by id
/// @route    GET /api/v1/job-listings/:id
/// @access   Public
export const getJobListing = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const jobListing = await JobListingModel.findById(req.params.id);

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
        const jobListings = await JobListingModel.find();

        res.status(200).json({ success: true, data: jobListings });
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

        const comparisonQuery = buildComparisonQuery(request.query);

        const baseQuery = JobListingModel.find(comparisonQuery);

        const result = await filterAndPaginate({
            request,
            response: res,
            baseQuery,
            total: await JobListingModel.countDocuments(comparisonQuery),
        });

        if (!result) return;

        const interviewSessions = await result.query;

        res.status(200).json({
            success: true,
            count: interviewSessions.length,
            pagination: result.pagination,
            data: interviewSessions,
        });
    } catch (err) {
        next(err);
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
        res.status(201).json({ success: true, data: jobListing });
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

        const jobListing = await JobListingModel.findById(req.params.id).populate({
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

        if (userRole !== "admin" && !userId.equals(jobListing.company.owner)) {
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
        );

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

        const jobListing = await JobListingModel.findById(req.params.id).populate({
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

        if (userRole !== "admin" && !userId.equals(jobListing.company.owner)) {
            res.status(403).json({
                success: false,
                error: "You do not have permission to delete this job listing",
            });

            return;
        }

        await InterviewSessionModel.deleteMany({ jobListing: req.params.id });
        await JobListingModel.deleteOne({ _id: req.params.id });

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
}
