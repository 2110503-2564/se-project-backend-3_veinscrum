import { ChatModel } from "@/models/Chat";
import { CompanyModel } from "@/models/Company";
import { InterviewSessionModel } from "@/models/InterviewSession";
import { JobListingModel } from "@/models/JobListing";
import { UserModel } from "@/models/User";
import type { POSTCompanyRequest } from "@/types/api/v1/companies/POST";
import type { InterviewSession } from "@/types/models/InterviewSession";
import type { JobListing } from "@/types/models/JobListing";
import type { RequestWithAuth } from "@/types/Request";
import { buildComparisonQuery } from "@/utils/buildComparisonQuery";
import { filterAndPaginate } from "@/utils/filterAndPaginate";
import type { NextFunction, Request, Response } from "express";
import assert from "node:assert";

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
        const baseQuery = CompanyModel.find(comparisonQuery).populate({
            path: "jobListings",
        });
        const total = await CompanyModel.countDocuments();

        const result = await filterAndPaginate({
            request: req,
            response: res,
            baseQuery,
            total,
        });

        assert(result);

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
        const company = await CompanyModel.findById(req.params.id)
            .select("+logo")
            .populate({
                path: "jobListings",
            });

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
        const request = req as POSTCompanyRequest;
        const { id: userId } = request.user;

        const user = await UserModel.findById(userId);

        if (!user) {
            res.status(404).json({
                success: false,
                error: "User not found",
            });

            return;
        }

        if (user.company !== null) {
            res.status(400).json({
                success: false,
                error: "A company user is already linked to an existing company. Please edit or remove the existing company before creating a new one.",
            });

            return;
        }

        const requestBodyWithCompany = {
            ...request.body,
            owner: user._id,
        };

        const company = await CompanyModel.create(requestBodyWithCompany);

        await UserModel.findByIdAndUpdate(userId, {
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
                error: "You do not have permission to update this company",
            });

            return;
        }

        const updatedCompany = await CompanyModel.findByIdAndUpdate(
            request.params.id,
            request.body,
            {
                new: true,
                runValidators: true,
            },
        );

        if (!updatedCompany) {
            res.status(404).json({
                success: false,
                error: "Company not found",
            });

            return;
        }

        res.status(200).json({ success: true, data: updatedCompany });
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
                error: "You do not have permission to delete this company",
            });

            return;
        }

        const jobListingIds = await JobListingModel.find({
            company: company._id,
        })
            .select("_id")
            .then((jobs: JobListing[]) => jobs.map((job) => job._id));

        const interviewSessionIds = await InterviewSessionModel.find({
            jobListing: { $in: jobListingIds },
        })
            .select("_id")
            .then((interviewSessions: InterviewSession[]) =>
                interviewSessions.map(
                    (interviewSession) => interviewSession._id,
                ),
            );

        if (interviewSessionIds.length > 0) {
            await ChatModel.deleteMany({
                interviewSession: { $in: interviewSessionIds },
            });
        }

        if (jobListingIds.length > 0) {
            await InterviewSessionModel.deleteMany({
                jobListing: { $in: jobListingIds },
            });
        }

        await JobListingModel.deleteMany({ company: company._id });
        await UserModel.findByIdAndUpdate(company.owner, {
            company: null,
        });
        await CompanyModel.findByIdAndDelete(company._id);

        res.status(200).json({
            success: true,
            data: {},
        });
    } catch (error) {
        next(error);
    }
}
