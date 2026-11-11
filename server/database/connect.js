import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";

export const connectDatabase = mongoUrl => mongoose.connect(mongoUrl);
