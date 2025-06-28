const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
require("dotenv").config();
app.use(express.json());
const foodRoutes = require("./routes/food");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/order");
const userRoutes = require("./routes/user");
const path = require("path");
const cookieParser = require("cookie-parser");

app.use(cookieParser());
app.use("/foods", foodRoutes);
app.use("/cart", cartRoutes);
app.use("/order", orderRoutes);
app.use("/user", userRoutes);

// Add error handling or input validation as needed.

app.use("/images", express.static(path.join(__dirname, "images")));

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

connectDB();
