import dotenv from "dotenv";
dotenv.config();

import process from "node:process";
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";

// admin
import authAdminRoutes from "./routes/admin/auth.routes.js";
import foodAdminRoutes from "./routes/admin/food.routes.js";
import categoryRoutes from "./routes/admin/category.routes.js";
import orderAdminRoutes from "./routes/admin/order.routes.js";
import notificationAdminRoutes from "./routes/admin/notification.routes.js";
import protectAdmin from "./middlewares/adminAuth.js";

// client
import authClientRoutes from "./routes/client/auth.routes.js";
import foodClientRoutes from "./routes/client/food.routes.js";
import orderClientRoutes from "./routes/client/order.routes.js";
import notificationClientRoutes from "./routes/client/notification.routes.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",").map(origin => origin.trim())
      : true,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

const adminPrefix = `/${process.env.PREFIX_ROUTES_ADMIN}`;
const clientPrefix = `/${process.env.PREFIX_ROUTES_CLIENT}`;

// Admin Routes
app.use(`${adminPrefix}/auth`, authAdminRoutes);
app.use(`${adminPrefix}/food`, protectAdmin, foodAdminRoutes);
app.use(`${adminPrefix}/category`, protectAdmin, categoryRoutes);
app.use(`${adminPrefix}/order`, protectAdmin, orderAdminRoutes);
app.use(`${adminPrefix}/notification`, protectAdmin, notificationAdminRoutes);

// Client Routes
app.use(`${clientPrefix}/auth`, authClientRoutes);
app.use(`${clientPrefix}/food`, foodClientRoutes);
app.use(`${clientPrefix}/order`, orderClientRoutes);
app.use(`${clientPrefix}/notification`, notificationClientRoutes);

app.use((err, _req, res, _next) => {
  const status = err.status || 500;

  res.status(status).json({
    success: false,
    message: err.message || "Server error",
  });
});

const PORT = process.env.PORT || 5000;

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error);
  }
};

connectDB();
