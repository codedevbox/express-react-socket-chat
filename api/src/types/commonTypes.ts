import jwt from "jsonwebtoken";
import { Request } from "express";
import { Chat, User } from "@prisma/client";

export interface AuthenticatedRequest extends Request {
	userId: string;
}

export interface TokenPayload extends jwt.JwtPayload {
	id: string;
}

export type ChatUser = Pick<User, "id" | "username" | "avatar">;

export type PrintChat = Chat & {
	receiver: ChatUser;
};
