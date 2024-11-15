import express from "express";
import userRoutes from "./user.router.js";
import imageRoutes from "./image.router.js";
import authRoutes from "./auth.router.js";

// tạo object router tổng
const rootRoutes = express.Router();

rootRoutes.use("/users", userRoutes);
rootRoutes.use("/image", imageRoutes);
rootRoutes.use("/auth", authRoutes);

// export rootRoutes cho index.js
export default rootRoutes;
