import type { Company } from "@/types/Company";
import type { RequestWithAuth } from "@/types/Request";

export interface POSTCompanyRequest extends RequestWithAuth {
    body: Omit<Company, "owner">;
}

// export interface POSTUserLoginRequest extends RequestWithAuth {
//     body: Pick<User, "email" | "password">;
// }
