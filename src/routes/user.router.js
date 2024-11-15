import express from "express";
import {
  getUsers,
  getSavedImages,
  getImagesByUserId,
  authenticateToken,
  deleteImageById,
  updateUserInfor,
} from "../controllers/user.controller.js";

const userRoutes = express.Router();

userRoutes.get("/get-saved-images", getSavedImages);
userRoutes.get("/get-users", getUsers);
userRoutes.get(
  "/get-images-by-user/:user_id",
  authenticateToken,
  getImagesByUserId
);
userRoutes.delete(
  "/delete-image-by-id/:image_id",
  authenticateToken,
  deleteImageById
);
userRoutes.put(
  "/update-user-infor/:nguoi_dung_id",
  authenticateToken,
  updateUserInfor
);

export default userRoutes;
