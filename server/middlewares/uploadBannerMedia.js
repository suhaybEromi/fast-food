import crypto from "node:crypto";
import path from "node:path";
import process from "node:process";

import multer from "multer";

const uploadDirectory = path.resolve("uploads");
const mediaExtensions = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["video/mp4", ".mp4"],
  ["video/webm", ".webm"],
]);

const storage = multer.diskStorage({
  destination(_req, _file, callback) {
    callback(null, uploadDirectory);
  },
  filename(_req, file, callback) {
    callback(null, `${crypto.randomUUID()}${mediaExtensions.get(file.mimetype)}`);
  },
});

const fileFilter = (_req, file, callback) => {
  if (mediaExtensions.has(file.mimetype)) {
    callback(null, true);
    return;
  }

  const error = new Error(
    "Banner media must be JPG, PNG, WEBP, MP4, or WEBM.",
  );
  error.status = 400;
  callback(error);
};

const getMaxUploadBytes = () => {
  const bytes = Number(process.env.MAX_BANNER_MEDIA_UPLOAD_BYTES);
  return Number.isFinite(bytes) && bytes > 0 ? bytes : 20 * 1024 * 1024;
};

const uploader = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: getMaxUploadBytes(),
    files: 1,
    fields: 30,
    fieldNameSize: 80,
    fieldSize: 10 * 1024,
    parts: 40,
  },
});

export default uploader;
