import { User } from "@/types/User";
import { Request } from "express";

export interface RequestWithAuth extends Request {
    user: User;
}
