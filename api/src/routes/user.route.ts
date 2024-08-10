import express from "express";
import { verifyToken } from "../middleware/verifyToken";
import {
	deleteUser,
	getUser,
	getUserByName,
	getUsers,
	updateUser,
} from "../controllers/user.controller";
import { createMulterConfig, handleMulterError } from "../lib/multer";

const avatarConfig = createMulterConfig({
	destFolder: "avatars",
	allowedTypes: /jpeg|jpg|png|gif|webp/,
	maxFileSize: 2 * 1024 * 1024, // 2MB
});
const uploadAvatar = [avatarConfig.single("avatar"), handleMulterError];

const router = express.Router();

router.get("/", getUsers);
router.get("/search", verifyToken, getUserByName);
router.get("/:id", verifyToken, getUser);
router.put("/:id", verifyToken, uploadAvatar, updateUser);
router.delete("/:id", verifyToken, deleteUser);

export default router;
