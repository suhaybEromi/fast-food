import process from "node:process";

export const getAllowedOrigins = () =>
  process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",")
        .map(origin => origin.trim())
        .filter(Boolean)
    : [];

const createCorsOrigin = allowedOrigins => (origin, callback) => {
  if (!origin) {
    callback(null, true);
    return;
  }

  if (allowedOrigins.length === 0 && process.env.NODE_ENV !== "production") {
    callback(null, true);
    return;
  }

  if (allowedOrigins.includes(origin)) {
    callback(null, true);
    return;
  }

  const error = new Error("Not allowed by CORS");
  error.status = 403;
  callback(error);
};

export const getCorsOptions = () => ({
  origin: createCorsOrigin(getAllowedOrigins()),
  credentials: true,
  maxAge: 60 * 60,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "x-csrf-token"],
  optionsSuccessStatus: 204,
});
