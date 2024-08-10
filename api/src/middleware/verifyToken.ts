import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest, TokenPayload } from "../types/commonTypes";

export const verifyToken = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const token = req.cookies.token;

	if (!token) return res.status(401).json({ message: "Not Authenticated!" });

	try {
		const payload = jwt.verify(
			token,
			process.env.JWT_SECRET_KEY,
		) as TokenPayload;
		(req as AuthenticatedRequest).userId = payload.id;
		next();
	} catch (err) {
		if (err instanceof jwt.JsonWebTokenError) {
			return res.status(401).json({ message: "Invalid token" });
		}
		if (err instanceof jwt.TokenExpiredError) {
			return res.status(401).json({ message: "Token expired" });
		}
		return res.status(401).json({ message: "Not Authenticated!" });
	}
};
