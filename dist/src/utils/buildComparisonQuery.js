import { EXCLUDED_QUERY_FIELDS } from "../constants/queryFields.js";
export function buildComparisonQuery(query) {
    const filteredQuery = {};
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
}
