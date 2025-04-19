import type { User } from "@/types/User";
import type { Request } from "express";

export interface RequestWithAuth extends Request {
    user: User;
}
