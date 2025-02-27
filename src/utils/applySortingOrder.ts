import { Query } from "mongoose";

export function applySortingOrder (
    query: Query<any[], any>,
    sort: string,
): Query<any[], any> {
    const sortBy = sort.split(",").join(" ");
    query = query.sort(sortBy);
    return query;
}