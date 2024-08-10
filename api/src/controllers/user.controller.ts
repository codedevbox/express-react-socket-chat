import { Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../lib/prisma";
import { AuthenticatedRequest } from "../types/commonTypes";

export const getUsers = async (req: Request, res: Response) => {
	try {
		const users = await prisma.user.findMany();
		res.status(200).json(users);
	} catch (error) {
		res.status(500).json({ message: "Failed to get users!" });
	}
};

export const getUser = async (req: Request, res: Response) => {
	const id = req.params.id;
	try {
		const user = await prisma.user.findUnique({
			where: { id },
		});
		res.status(200).json(user);
	} catch (error) {
		res.status(500).json({ message: "Failed to get user!" });
	}
};

export const updateUser = async (req: Request, res: Response) => {
	const id = req.params.id;
	const userTokenId = (req as AuthenticatedRequest).userId;
	if (id !== userTokenId) {
		return res.status(401).json({ message: "Not Authenticated!" });
	}
	const { password, ...inputs } = req.body;
	const avatar = req.file ? req.file.path : null;
	let updatedPassword = null;
	try {
		if (password) {
			updatedPassword = await bcrypt.hash(password, 10);
		}
		const updatedUser = await prisma.user.update({
			where: { id },
			data: {
				...inputs,
				...(updatedPassword && { password: updatedPassword }),
				...(avatar && { avatar }),
			},
		});
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { password: _, chatIds, createdAt, ...userInfo } = updatedUser;
		res.status(200).json(userInfo);
	} catch (error) {
		res.status(500).json({ message: "Failed to update user!" });
	}
};

export const deleteUser = async (req: Request, res: Response) => {
	const id = req.params.id;
	const userTokenId = (req as AuthenticatedRequest).userId;
	if (id !== userTokenId) {
		return res.status(401).json({ message: "Not Authenticated!" });
	}
	try {
		await prisma.user.delete({ where: { id } });
		res.status(200).json({ message: "User deleted successfuly!" });
	} catch (error) {
		res.status(500).json({ message: "Failed to delete user!" });
	}
};

export const getUserByName = async (req: Request, res: Response) => {
	const username = String(req.query.username).replace(
		/[^a-zA-Z0-9-_@.]/g,
		"",
	);
	const userTokenId = (req as AuthenticatedRequest).userId;
	if (!username) {
		return res.status(401).json({ message: "Username input is required!" });
	}
	try {
		const curentUser = await prisma.user.findUnique({
			where: { id: userTokenId },
		});

		if (curentUser?.username === username) {
			return res.status(401).json({
				message: "Please enter a username other than your own.",
			});
		}

		const user = await prisma.user.findUnique({
			where: {
				username,
				AND: [
					{
						id: {
							not: userTokenId,
						},
					},
				],
			},
		});

		if (!user) {
			return res.status(404).json({ message: "User not found!" });
		}

		const chats = await prisma.chat.findMany({
			where: {
				userIds: {
					hasSome: [userTokenId],
				},
			},
		});

		if (chats) {
			const isUserInChats = chats.some(chat =>
				chat.userIds.includes(user?.id),
			);
			if (isUserInChats) {
				return res.status(401).json({
					message: "You allready has a chat with this user!",
				});
			}
		}

		res.status(200).json(user);
	} catch (error) {
		res.status(500).json({ message: "Failed to search user!" });
	}
};
