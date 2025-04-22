import type { SocketHandshakeQuery } from "@/types/socket/SocketHandshakeQuery";
import mongoose from "mongoose";
import type { ParsedUrlQuery } from "querystring";

export function convertToSocketHandShakeQuery(
    rawSocketHandshakeQuery: ParsedUrlQuery,
): Nullable<SocketHandshakeQuery> {
    try {
        return new mongoose.Types.ObjectId(
            rawSocketHandshakeQuery.interviewSession as string,
        );
    } catch {
        return null;
    }
}
