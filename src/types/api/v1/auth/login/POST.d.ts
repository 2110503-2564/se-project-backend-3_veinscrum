import type { RequestWithAuth } from "@/types/Request";
import type { User } from "@/types/User";

export interface POSTUserLoginRequest extends RequestWithAuth {
    body: Pick<User, "email" | "password">;
}
