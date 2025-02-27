import { Request } from "express";
import { User } from "@/types/User";

export interface RequestWithAuth extends Request {
    user: User;
}
