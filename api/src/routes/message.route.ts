import express from "express";
import { verifyToken } from "../middleware/verifyToken";
import { addMessage } from "../controllers/message.controller";

const router = express.Router();

router.post("/:chatId", verifyToken, addMessage);

export default router;
