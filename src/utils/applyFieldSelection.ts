import { Query } from "mongoose";

export function applyFieldSelection(
    query: Query<any[], any>,
    select: string,
): Query<any[], any> {
    const fields = select.split(",").join(" ");
    query = query.select(fields);
    return query;
}
