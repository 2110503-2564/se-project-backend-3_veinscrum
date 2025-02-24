import { NextFunction, Request, Response } from "express";
import { Query } from "mongoose";
import { CompanyModel } from "../models/Company";
import { Company } from "../types/Company";

const EXCLUDED_QUERY_FIELDS = ["select", "sort", "page", "limit"];

/* routes */

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

    let query: Query<Company[], Company> = CompanyModel.find(comparisonQuery);

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
        const company = await CompanyModel.findById(req.params.id);

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

        // await Appointment.deleteMany({ company: req.params.id });
        await CompanyModel.deleteOne({ _id: req.params.id });

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
}

/* Helper functions */

// Set fields to select from the query
const applyFieldSelection = (
    query: Query<Company[], Company>,
    select: string,
): Query<Company[], Company> => {
    const fields = select.split(",").join(" ");
    query = query.select(fields);

    return query;
};

// Set sorting order for the query
const applySortingOrder = (
    query: Query<Company[], Company>,
    sort: string,
): Query<Company[], Company> => {
    const sortBy = sort.split(",").join(" ");
    query = query.sort(sortBy);
    return query;
};

// Validate and parse pagination parameters
const validatePaginationParams = (
    pageParam: any,
    limitParam: any,
    res: Response,
): { page: number | null; limit: number | null } => {
    const page = parseInt(pageParam as string, 10) || 1;
    const limit = parseInt(limitParam as string, 10) || 25;

    if (isNaN(page) || page <= 0) {
        res.status(400).json({
            success: false,
            message: "Invalid page number",
        });
        return { page: null, limit: null };
    }

    if (isNaN(limit) || limit <= 0) {
        res.status(400).json({
            success: false,
            message: "Invalid limit number",
        });
        return { page: null, limit: null };
    }

    return { page, limit };
};

// Apply pagination logic to the query
const applyPagination = async (
    query: Query<Company[], Company>,
    page: number,
    limit: number,
): Promise<PaginationResult> => {
    const startIndex = (page - 1) * limit;
    const total = await CompanyModel.countDocuments();

    const paginationResult: PaginationResult = {};

    if (startIndex + limit < total) {
        paginationResult.next = { page: page + 1, limit };
    }

    if (startIndex > 0) {
        paginationResult.prev = { page: page - 1, limit };
    }

    query = query.skip(startIndex).limit(limit);

    return paginationResult;
};

// Build the comparison query by adding MongoDB operators
const buildComparisonQuery = (query: qs.ParsedQs): qs.ParsedQs => {
    const filteredQuery: qs.ParsedQs = {};

    for (const key in query) {
        if (query.hasOwnProperty(key) && !EXCLUDED_QUERY_FIELDS.includes(key)) {
            filteredQuery[key] = query[key];
        }
    }

    // Convert comparison operators to MongoDB query operators
    return JSON.parse(
        JSON.stringify(filteredQuery).replace(
            /\b(gt|gte|lt|lte|in)\b/g,
            (match) => `$${match}`,
        ),
    );
};
