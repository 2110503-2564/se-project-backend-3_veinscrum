import { NextFunction, Request, Response } from "express";
import { RequestWithAuth } from "@/types/Request";
import { buildComparisonQuery } from "@/utils/buildComparisonQuery";
import { filterAndPaginate } from "@/utils/filterAndPaginate";
import { InterviewSessionModel } from "@/models/InterviewSession";
import { JobListingModel } from "@/models/JobListing";

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
            res.status(400).json({
                success: false,
                message: "Job listing not found",
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
export const getJobListingByCompany = async (
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
        const jobListing = await JobListingModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            },
        );

        if (!jobListing) {
            res.status(400).json({
                success: false,
                message: "Job listing not found",
            });

            return;
        }

        res.status(200).json({ success: true, data: jobListing });
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
        const jobListing = await JobListingModel.findById(req.params.id);

        if (!jobListing) {
            res.status(400).json({
                success: false,
                message: "Job listing not found",
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