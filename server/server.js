import dotenv from "dotenv";
dotenv.config();

import process from "node:process";

import { connectDatabase } from "./database/connect.js";

export const startServer = async app => {
  const port = process.env.PORT || 5000;

  try {
    await connectDatabase(process.env.MONGO_URL);

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error);
  }
};
