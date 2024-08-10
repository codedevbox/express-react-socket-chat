import multer, { StorageEngine } from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { Request, Response, NextFunction } from "express";

type MulterError = Error & { code?: string };

interface MulterConfigOptions {
	destFolder: string;
	allowedTypes: RegExp;
	maxFileSize: number;
}

export const createMulterConfig = ({
	destFolder,
	allowedTypes,
	maxFileSize,
}: MulterConfigOptions): multer.Multer => {
	const storage: StorageEngine = multer.diskStorage({
		destination: (req, file, cb) => {
			const uploadDir = path.join("uploads", destFolder || "default");
			if (!fs.existsSync(uploadDir)) {
				fs.mkdirSync(uploadDir, { recursive: true });
			}
			cb(null, uploadDir);
		},
		filename: (req, file, cb) => {
			const uniqueSuffix =
				Date.now() + "-" + Math.round(Math.random() * 1e9);
			const hashName = crypto
				.createHash("MD5")
				.update(uniqueSuffix)
				.digest("hex");
			cb(null, hashName + path.extname(file.originalname));
		},
	});

	const fileFilter = (
		req: Request,
		file: Express.Multer.File,
		cb: multer.FileFilterCallback,
	) => {
		if (allowedTypes.test(file.mimetype)) {
			cb(null, true);
		} else {
			cb(
				new Error(
					"Invalid file type. Only jpg, jpeg, png, gif, and webp are allowed.",
				),
			);
		}
	};

	const limits = {
		fileSize: maxFileSize,
	};

	return multer({ storage, fileFilter, limits });
};

export const handleMulterError = (
	err: MulterError,
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	console.log(err);
	if (err instanceof multer.MulterError) {
		if (err.code === "LIMIT_FILE_SIZE") {
			return res
				.status(400)
				.json({ message: "File size is too large. Max size is 2MB." });
		}
	} else if (err) {
		return res.status(400).json({ message: err.message });
	}
	next();
};
