import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { AuthenticatedRequest } from "../types/commonTypes";

export const addMessage = async (req: Request, res: Response) => {
	const tokenUserId = (req as AuthenticatedRequest).userId;
	const chatId = req.params.chatId;
	const text = req.body.text;
	try {
		const chat = await prisma.chat.findUnique({
			where: {
				id: chatId,
				userIds: {
					hasSome: [tokenUserId],
				},
			},
		});
		if (!chat) {
			res.status(404).json({ message: "Chat not found!" });
		}
		const newMassage = await prisma.message.create({
			data: {
				chatId,
				userId: tokenUserId,
				text,
			},
		});

		await prisma.chat.update({
			where: {
				id: chatId,
			},
			data: {
				seenBy: [tokenUserId],
				lastMessage: text,
			},
		});
		res.status(200).json(newMassage);
	} catch (error) {
		res.status(500).json({ message: "Failed to get chats!" });
	}
};
