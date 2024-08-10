import express from "express";
import {
	checkAuth,
	login,
	logout,
	register,
} from "../controllers/auth.controller";
import { verifyToken } from "../middleware/verifyToken";
import { createMulterConfig, handleMulterError } from "../lib/multer";

const avatarConfig = createMulterConfig({
	destFolder: "avatars",
	allowedTypes: /jpeg|jpg|png|gif|webp/,
	maxFileSize: 2 * 1024 * 1024, // 2MB
});
const uploadAvatar = [avatarConfig.single("avatar"), handleMulterError];

const router = express.Router();

router.post("/register", uploadAvatar, register);
router.post("/login", login);
router.post("/logout", verifyToken, logout);
router.get("/check-auth", checkAuth);

export default router;
