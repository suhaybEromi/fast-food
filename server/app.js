import dotenv from "dotenv";
dotenv.config();

import process from "node:process";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import { getCorsOptions } from "./config/cors.js";
import { getRoutePrefixes } from "./config/routes.js";
import { configureTrustProxy } from "./config/trustProxy.js";
import {
  compressionMiddleware,
  csrfProtection,
  getUploadStaticOptions,
  hppProtection,
  mongoSanitizeMiddleware,
  noStoreApiResponses,
  rateLimit,
  requestLogger,
  securityHeaders,
} from "./middlewares/security.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandlers.js";
import { registerAdminRoutes } from "./routes/admin.routes.js";
import { registerClientRoutes } from "./routes/client.routes.js";
import { registerHealthRoutes } from "./routes/health.routes.js";
import { startServer } from "./server.js";
import { validateServerConfig } from "./utils/secrets.js";

const app = express();
validateServerConfig();

app.disable("x-powered-by");
configureTrustProxy(app);

app.use(securityHeaders);
app.use(compressionMiddleware);
app.use(requestLogger);
app.use(cors(getCorsOptions()));
app.use("/uploads", express.static("uploads", getUploadStaticOptions()));
app.use(noStoreApiResponses);
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT }));
app.use(
  express.urlencoded({
    extended: false,
    limit: process.env.URLENCODED_BODY_LIMIT,
  }),
);
app.use(cookieParser());
app.use(mongoSanitizeMiddleware);
app.use(hppProtection);
app.use(rateLimit());
app.use(csrfProtection);

registerHealthRoutes(app);

const { admin: adminPrefix, client: clientPrefix } = getRoutePrefixes();

registerAdminRoutes(app, adminPrefix);
registerClientRoutes(app, clientPrefix);

app.use(notFoundHandler);
app.use(errorHandler);

startServer(app);
