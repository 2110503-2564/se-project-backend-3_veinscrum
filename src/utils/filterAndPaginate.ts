import { Request, Response } from "express";
import { Document, Query } from "mongoose";

interface PaginationPage {
    page: number;
    limit: number;
}

interface PaginationResult {
    next?: PaginationPage;
    prev?: PaginationPage;
}

// Make all helper functions generic to preserve type information
async function applyPagination<T extends Document>(
    query: Query<T[], T>,
    page: number,
    total: number,
    limit: number,
): Promise<PaginationResult> {
    const startIndex = (page - 1) * limit;

    const paginationResult: PaginationResult = {};

    if (limit == -1) {
        return paginationResult;
    }

    if (startIndex + limit < total) {
        paginationResult.next = { page: page + 1, limit };
    }

    if (startIndex > 0) {
        paginationResult.prev = { page: page - 1, limit };
    }

    query = query.skip(startIndex).limit(limit);

    return paginationResult;
}

function applyFieldSelection<T extends Document>(
    query: Query<T[], T>,
    select: string,
): Query<T[], T> {
    const fields = select.split(",").join(" ");
    query = query.select(fields);
    return query;
}

function applySortingOrder<T extends Document>(
    query: Query<T[], T>,
    sort: string,
): Query<T[], T> {
    const sortBy = sort.split(",").join(" ");
    query = query.sort(sortBy);
    return query;
}

function validatePaginationParams(
    pageParam: unknown,
    limitParam: unknown,
    res: Response,
): { page: number | null; limit: number | null } {
    let page = parseInt(pageParam as string, 10) || 1;
    let limit = parseInt(limitParam as string, 10) || 25;

    if (limit == -1 && page != 1) {
        res.status(400).json({
            success: false,
            message:
                "For a complete list load, the page must always be set to 1.",
        });
        return { page: null, limit: null };
    }

    if (isNaN(page) || page <= 0) {
        res.status(400).json({
            success: false,
            message: "Invalid page number",
        });
        return { page: null, limit: null };
    }

    if (isNaN(limit) || limit < -1 || limit == 0) {
        res.status(400).json({
            success: false,
            message: "Invalid limit number",
        });
        return { page: null, limit: null };
    }

    return { page, limit };
}

interface FilterAndPaginateOptions<T extends Document> {
    request: Request;
    response: Response;
    baseQuery: Query<T[], T>;
    defaultSortField?: string;
    total: number;
}

interface FilterAndPaginateResult<T extends Document> {
    query: Query<T[], T>;
    pagination: PaginationResult;
}

export async function filterAndPaginate<T extends Document>({
    request,
    response,
    baseQuery,
    defaultSortField = "-createdAt",
    total,
}: FilterAndPaginateOptions<T>): Promise<FilterAndPaginateResult<T> | null> {
    let query = baseQuery;

    // Handle field selection
    if (request.query.select && typeof request.query.select === "string") {
        query = applyFieldSelection<T>(query, request.query.select);
    }

    // Handle sorting
    if (request.query.sort && typeof request.query.sort === "string") {
        query = applySortingOrder<T>(query, request.query.sort);
    } else {
        query = applySortingOrder<T>(query, defaultSortField);
    }

    // Validate pagination parameters
    const { page, limit } = validatePaginationParams(
        request.query.page,
        request.query.limit,
        response,
    );

    if (!page || !limit) return null;

    const pagination = await applyPagination<T>(query, page, total, limit);

    return { query, pagination };
}
