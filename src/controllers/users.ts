import { UserModel } from "@/models/User";
import { RequestWithAuth } from "@/types/Request";
import { buildComparisonQuery } from "@/utils/buildComparisonQuery";
import { filterAndPaginate } from "@/utils/filterAndPaginate";
import { NextFunction, Request, Response } from "express";

/// @desc     Get users (query is allowed)
/// @route    GET /api/v1/users
/// @access   Protected
export const getUsers = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const request = req as RequestWithAuth;

        const comparisonQuery = buildComparisonQuery(request.query);

        const baseQuery = UserModel.find(comparisonQuery);
        const total = await UserModel.countDocuments();

        const result = await filterAndPaginate({
            request: req,
            response: res,
            baseQuery,
            total,
        });

        if (!result) return;

        const companies = await result.query;

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
