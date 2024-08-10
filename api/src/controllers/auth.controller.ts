import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { TokenPayload } from "../types/commonTypes";

export const register = async (req: Request, res: Response) => {
	const { username, email, password } = req.body;
	const avatar = req.file ? req.file.path : null;
	if (!username || !password || !email) {
		return res
			.status(400)
			.json({ message: "Username, email and password are required!" });
	}
	try {
		const hashedPassword = await bcrypt.hash(password, 10);
		await prisma.user.create({
			data: {
				username,
				email,
				password: hashedPassword,
				avatar,
			},
		});
		res.status(201).json({
			message: "Account created! You can login now!",
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to create an account!" });
	}
};

export const login = async (req: Request, res: Response) => {
	const { username, password } = req.body;
	if (!username || !password) {
		return res
			.status(400)
			.json({ message: "Username and password are required!" });
	}
	try {
		const user = await prisma.user.findUnique({ where: { username } });
		if (!user || !user.password) {
			return res.status(401).json({ message: "Invalid credentials!" });
		}
		const isPasswordValid = await bcrypt.compare(password, user?.password);
		if (!isPasswordValid) {
			return res.status(401).json({ message: "Invalid credentials!" });
		}
		const age = 1000 * 60 * 60 * 24 * 7;
		const token = jwt.sign(
			{
				id: user.id,
			},
			process.env.JWT_SECRET_KEY,
			{ expiresIn: age },
		);
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { password: _, chatIds, createdAt, ...userInfo } = user;
		res.cookie("token", token, {
			httpOnly: true,
			//secure: true,
			maxAge: age,
		})
			.status(200)
			.json(userInfo);
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: "Failed to login!" });
	}
};

export const logout = (_req: Request, res: Response) => {
	res.clearCookie("token")
		.status(200)
		.json({ message: "Logout Successful!" });
};

export const checkAuth = async (req: Request, res: Response) => {
	const token = req.cookies.token;
	if (!token) {
		return res.status(200).json({ message: "No action needed" });
	}
	try {
		const decoded = jwt.verify(
			token,
			process.env.JWT_SECRET_KEY,
		) as TokenPayload;
		const user = await prisma.user.findUnique({
			where: { id: decoded.id },
		});
		if (!user) {
			return res.status(401).json({ message: "User not found" });
		}
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { password: _, chatIds, createdAt, ...userInfo } = user;
		res.status(200).json(userInfo);
	} catch (error) {
		res.status(401).json({ message: "Invalid token" });
	}
};
