import { NextFunction, Request, Response } from "express";
import { Query } from "mongoose";
import { Company } from "../types/Company";
import { CompanyModel } from "../models/Company";
import { InterviewSessionModel } from "../models/InterviewSession";
import { applyFieldSelection } from "src/utils/applyFieldSelection";
import { applyPagination } from "src/utils/applyPagination";
import { applySortingOrder } from "src/utils/applySortingOrder";
import { buildComparisonQuery } from "src/utils/buildComparisonQuery";
import { validatePaginationParams } from "src/utils/validatePaginationParams";

/// @desc     Get companies (query is allowed)
/// @route    GET /api/v1/companies
/// @access   Public
export const getCompanies = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    // Filter and parse query parameters for comparisons
    const comparisonQuery = buildComparisonQuery(req.query);

    let query: Query<Company[], Company> =
        CompanyModel.find(comparisonQuery).populate("sessions");

    // Handle field selection
    if (req.query.select && typeof req.query.select === "string") {
        query = applyFieldSelection(query, req.query.select);
    }

    // Handle sorting
    if (req.query.sort && typeof req.query.sort === "string") {
        query = applySortingOrder(query, req.query.sort);
    } else {
        query = applySortingOrder(query, "-createAt");
    }

    // Validate pagination parameters
    const { page, limit } = validatePaginationParams(
        req.query.page,
        req.query.limit,
        res,
    );
    if (!page || !limit) return;

    const pagination = await applyPagination(query, page, limit);

    try {
        const companies = await query;
        res.status(200).json({
            success: true,
            count: companies.length,
            pagination,
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
            "sessions",
        );

        if (!company) {
            res.status(400).json({
                success: false,
                message: "Company not found",
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
            res.status(400).json({
                success: false,
                message: "Company not found",
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
            res.status(400).json({
                success: false,
                message: "Company not found",
            });

            return;
        }

        await InterviewSessionModel.deleteMany({ company: req.params.id });
        await CompanyModel.deleteOne({ _id: req.params.id });

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
}