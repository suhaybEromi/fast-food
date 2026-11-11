import crypto from "node:crypto";
import path from "node:path";
import process from "node:process";

import multer from "multer";

const uploadDirectory = path.resolve("uploads");
const imageExtensions = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
]);

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, uploadDirectory);
  },

  filename(_req, file, cb) {
    cb(null, `${crypto.randomUUID()}${imageExtensions.get(file.mimetype)}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (imageExtensions.has(file.mimetype)) {
    cb(null, true);
    return;
  }

  const error = new Error("Only JPG, PNG, or WEBP images are allowed");
  error.status = 400;
  cb(error);
};

const getMaxImageUploadBytes = () => {
  const bytes = Number(process.env.MAX_IMAGE_UPLOAD_BYTES);
  return Number.isFinite(bytes) && bytes > 0 ? bytes : 2 * 1024 * 1024;
};

const createUploadImage = () =>
  multer({
    storage,
    fileFilter,
    limits: {
      fileSize: getMaxImageUploadBytes(),
      files: 1,
      fields: 30,
      fieldNameSize: 80,
      fieldSize: 10 * 1024,
      parts: 40,
    },
  });

let uploadImage;

const getUploadImage = () => {
  uploadImage ||= createUploadImage();
  return uploadImage;
};

export default {
  single(fieldName) {
    return (req, res, next) =>
      getUploadImage().single(fieldName)(req, res, next);
  },
};
