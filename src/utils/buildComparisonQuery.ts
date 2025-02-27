import { EXCLUDED_QUERY_FIELDS } from "@/constants/queryFields";

export function buildComparisonQuery(query: qs.ParsedQs): qs.ParsedQs {
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
}
