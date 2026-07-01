import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, "uploads/");
  },

  filename(_req, file, cb) {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9,
    )}${path.extname(file.originalname)}`;

    cb(null, uniqueName);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowedTypes = /jpg|jpeg|png|webp/;
  const extName = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimeType = allowedTypes.test(file.mimetype);

  if (extName && mimeType) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};

const uploadImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

export default uploadImage;
