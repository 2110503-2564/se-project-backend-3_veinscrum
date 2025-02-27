import { Query } from "mongoose";
import { InterviewSessionModel } from "../models/InterviewSession";

export async function applyPagination(
    query: Query<any[], any>,
    page: number,
    limit: number,
): Promise<PaginationResult> {
    const startIndex = (page - 1) * limit;
    const total = await InterviewSessionModel.countDocuments();

    const paginationResult: PaginationResult = {};

    if (startIndex + limit < total) {
        paginationResult.next = { page: page + 1, limit };
    }

    if (startIndex > 0) {
        paginationResult.prev = { page: page - 1, limit };
    }

    query = query.skip(startIndex).limit(limit);

    return paginationResult;
}
