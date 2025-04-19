import { endDate, startDate } from "@/constants/dateRange";

export function isWithinAllowedDateRange(date: Date): boolean {
    return date >= startDate && date <= endDate;
}
