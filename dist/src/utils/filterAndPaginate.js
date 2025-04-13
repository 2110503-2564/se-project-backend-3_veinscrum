var __awaiter =
    (this && this.__awaiter) ||
    function (thisArg, _arguments, P, generator) {
        function adopt(value) {
            return value instanceof P
                ? value
                : new P(function (resolve) {
                      resolve(value);
                  });
        }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value));
                } catch (e) {
                    reject(e);
                }
            }
            function rejected(value) {
                try {
                    step(generator["throw"](value));
                } catch (e) {
                    reject(e);
                }
            }
            function step(result) {
                result.done
                    ? resolve(result.value)
                    : adopt(result.value).then(fulfilled, rejected);
            }
            step(
                (generator = generator.apply(thisArg, _arguments || [])).next(),
            );
        });
    };
// Make all helper functions generic to preserve type information
function applyPagination(query, page, total, limit) {
    return __awaiter(this, void 0, void 0, function* () {
        const startIndex = (page - 1) * limit;
        const paginationResult = {};
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
    });
}
function applyFieldSelection(query, select) {
    const fields = select.split(",").join(" ");
    query = query.select(fields);
    return query;
}
function applySortingOrder(query, sort) {
    const sortBy = sort.split(",").join(" ");
    query = query.sort(sortBy);
    return query;
}
function validatePaginationParams(pageParam, limitParam, res) {
    let page = parseInt(pageParam, 10) || 1;
    let limit = parseInt(limitParam, 10) || 25;
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
export function filterAndPaginate(_a) {
    return __awaiter(
        this,
        arguments,
        void 0,
        function* ({
            request,
            response,
            baseQuery,
            defaultSortField = "-createdAt",
            total,
        }) {
            let query = baseQuery;
            // Handle field selection
            if (
                request.query.select &&
                typeof request.query.select === "string"
            ) {
                query = applyFieldSelection(query, request.query.select);
            }
            // Handle sorting
            if (request.query.sort && typeof request.query.sort === "string") {
                query = applySortingOrder(query, request.query.sort);
            } else {
                query = applySortingOrder(query, defaultSortField);
            }
            // Validate pagination parameters
            const { page, limit } = validatePaginationParams(
                request.query.page,
                request.query.limit,
                response,
            );
            if (!page || !limit) return null;
            const pagination = yield applyPagination(query, page, total, limit);
            return { query, pagination };
        },
    );
}
