interface PaginationResult {
    next?: PaginationSubResult;
    prev?: PaginationSubResult;
}

interface PaginationSubResult {
    page: number;
    limit: number;
}
