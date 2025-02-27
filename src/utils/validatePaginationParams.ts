import { Response } from "express";

export function validatePaginationParams(
    pageParam: any,
    limitParam: any,
    res: Response,
): { page: number | null; limit: number | null } {
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
}
