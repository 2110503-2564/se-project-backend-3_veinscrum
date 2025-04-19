import type { RequestWithAuth } from "@/types/Request";
import type { User } from "@/types/User";

export interface POSTUserRegisterRequest extends RequestWithAuth {
    body: Pick<User, "name" | "email" | "tel" | "password" | "role">;
}
