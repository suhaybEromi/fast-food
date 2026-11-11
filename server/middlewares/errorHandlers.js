import process from "node:process";

export const notFoundHandler = (req, _res, next) => {
  const error = new Error(`Route ${req.method} ${req.path} not found`);
  error.status = 404;
  next(error);
};

export const errorHandler = (err, _req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  const status =
    err.status ||
    (err.code === 11000 ? 409 : err.name === "ValidationError" ? 400 : 500);
  const duplicateField =
    err.code === 11000 ? Object.keys(err.keyPattern || {})[0] : "";
  const message = duplicateField
    ? `${duplicateField} already exists`
    : status >= 500 && process.env.NODE_ENV === "production"
      ? "Server error"
      : err.message || "Server error";

  res.status(status).json({
    success: false,
    message,
  });
};
