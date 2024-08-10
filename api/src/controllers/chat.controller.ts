import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { AuthenticatedRequest, PrintChat } from "../types/commonTypes";

export const getChats = async (req: Request, res: Response) => {
	const tokenUserId = (req as AuthenticatedRequest).userId;
	try {
		const chats = await prisma.chat.findMany({
			where: {
				userIds: {
					hasSome: [tokenUserId],
				},
			},
		});
		const formattedChats: PrintChat[] = await Promise.all(
			chats.map(async chat => {
				const receiverId = chat.userIds.find(id => id !== tokenUserId);

				const receiver = await prisma.user.findUnique({
					where: {
						id: receiverId,
					},
					select: {
						id: true,
						username: true,
						avatar: true,
						email: true,
					},
				});

				return {
					...chat,
					receiver: receiver || {
						id: "",
						username: "unknown",
						avatar: null,
						email: "",
					},
				};
			}),
		);

		res.status(200).json(formattedChats);
	} catch (error) {
		res.status(500).json({ message: "Failed to get chats!" });
	}
};

export const getChat = async (req: Request, res: Response) => {
	const tokenUserId = (req as AuthenticatedRequest).userId;
	try {
		const id = req.params.id;
		await prisma.chat.update({
			where: {
				id,
			},
			data: {
				seenBy: {
					push: [tokenUserId],
				},
			},
		});
		const chat = await prisma.chat.findUnique({
			where: {
				id,
				userIds: {
					hasSome: [tokenUserId],
				},
			},
			include: {
				messages: {
					orderBy: {
						createdAt: "asc",
					},
				},
			},
		});
		res.status(200).json(chat);
	} catch (error) {
		res.status(500).json({ message: "Failed to get chat!" });
	}
};

export const addChat = async (req: Request, res: Response) => {
	const tokenUserId = (req as AuthenticatedRequest).userId;
	try {
		const newChat = await prisma.chat.create({
			data: {
				userIds: [tokenUserId, req.body.receirverId],
			},
		});
		res.status(200).json(newChat);
	} catch (error) {
		res.status(500).json({ message: "Failed to update user!" });
	}
};

export const readChat = async (req: Request, res: Response) => {
	const tokenUserId = (req as AuthenticatedRequest).userId;
	try {
		const id = req.params.id;
		const chat = await prisma.chat.update({
			where: {
				id,
				userIds: {
					hasSome: [tokenUserId],
				},
			},
			data: {
				seenBy: {
					push: tokenUserId,
				},
			},
		});
		res.status(200).json(chat);
	} catch (error) {
		res.status(500).json({ message: "Failed to delete user!" });
	}
};
