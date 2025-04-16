import { CompanyModel } from "@/models/Company";
import { InterviewSessionModel } from "@/models/InterviewSession";
import { JobListingModel } from "@/models/JobListing";
import { UserModel } from "@/models/User";
import { RequestWithAuth } from "@/types/Request";
import { buildComparisonQuery } from "@/utils/buildComparisonQuery";
import { filterAndPaginate } from "@/utils/filterAndPaginate";
import { NextFunction, Request, Response } from "express";

/// @desc     Get companies (query is allowed)
/// @route    GET /api/v1/companies
/// @access   Public
export const getCompanies = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const request = req as RequestWithAuth;

        const comparisonQuery = buildComparisonQuery(request.query);

        const baseQuery =
            CompanyModel.find(comparisonQuery).populate("jobListings");
        const total = await CompanyModel.countDocuments();

        const result = await filterAndPaginate({
            request: req,
            response: res,
            baseQuery,
            total,
        });

        if (!result) return;

        const companies = await result.query.exec();

        res.status(200).json({
            success: true,
            count: companies.length,
            pagination: result.pagination,
            data: companies,
        });
    } catch (err) {
        next(err);
    }
};

/// @desc     Get company (authentication required)
/// @route    GET /api/v1/companies/:id
/// @access   Protected
export const getCompany = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const company = await CompanyModel.findById(req.params.id).populate(
            "jobListings",
        );

        if (!company) {
            res.status(404).json({
                success: false,
                error: "Company not found",
            });

            return;
        }

        res.status(200).json({ success: true, data: company });
    } catch (err) {
        next(err);
    }
};

/// @desc     Create company (authentication required)
/// @route    POST /api/v1/companies
/// @access   Protected
export async function createCompany(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const company = await CompanyModel.create(req.body);
        await UserModel.findByIdAndUpdate(req.body.owner, {
            company: company._id,
        });

        res.status(201).json({ success: true, data: company });
    } catch (err) {
        next(err);
    }
}

/// @desc     Update company (authentication required)
/// @route    PUT /api/v1/companies/:id
/// @access   Protected
export async function updateCompany(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const company = await CompanyModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            },
        );

        if (!company) {
            res.status(404).json({
                success: false,
                error: "Company not found",
            });

            return;
        }

        res.status(200).json({ success: true, data: company });
    } catch (err) {
        next(err);
    }
}

/// @desc     Delete company (authentication required)
/// @route    DELETE /api/v1/companies/:id
/// @access   Protected
export async function deleteCompany(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const company = await CompanyModel.findById(req.params.id);

        if (!company) {
            res.status(404).json({
                success: false,
                error: "Company not found",
            });

            return;
        }

        const jobListingIds = await JobListingModel.find({
            company: company._id,
        })
            .select("_id")
            .then((jobs) => jobs.map((job) => job._id));

        if (jobListingIds.length > 0) {
            await InterviewSessionModel.deleteMany({
                jobListing: { $in: jobListingIds },
            });
        }

        await JobListingModel.deleteMany({ company: company._id });
        await CompanyModel.findByIdAndDelete(company._id);

        res.status(200).json({
            success: true,
            error: "Company and all associated job listings and interview sessions have been deleted",
        });
    } catch (error) {
        next(error);
    }
}
