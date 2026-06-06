import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";

// admin
import foodAdminRoutes from "./routes/admin/food.routes.js";
import categoryRoutes from "./routes/admin/category.routes.js";

// client
import foodClientRoutes from "./routes/client/food.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

const adminPrefix = `/${process.env.PREFIX_ROUTES_ADMIN}`;
const clientPrefix = `/${process.env.PREFIX_ROUTES_CLIENT}`;

// Admin Routes
app.use(`${adminPrefix}/food`, foodAdminRoutes);
app.use(`${adminPrefix}/category`, categoryRoutes);

// Client Routes
app.use(`${clientPrefix}/food`, foodClientRoutes);

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
