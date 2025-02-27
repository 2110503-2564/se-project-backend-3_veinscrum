import { RequestWithAuth } from "@/types/Request";
import { User } from "@/types/User";

export interface POSTUserLoginRequest extends RequestWithAuth {
    body: Pick<User, "email" | "password">;
}
