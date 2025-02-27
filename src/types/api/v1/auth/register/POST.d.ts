import { RequestWithAuth } from "@/types/Request";
import { User } from "@/types/User";

export interface POSTUserRegisterRequest extends RequestWithAuth {
    body: Pick<User, "name" | "email" | "tel" | "password" | "role">;
}
