import express from "express";
import {
  listOfImage,
  getListOfImageByName,
  getImageInfoAndCreatorById,
  getCommentById,
  checkImage,
  commentWithImage,
  addImage,
} from "../controllers/image.controller.js";
import { authenticateToken } from "../controllers/user.controller.js";
import multer from "multer";

const imageRoutes = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Lưu vào thư mục 'uploads'
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Đặt tên file là thời gian hiện tại + extension
  },
});
const upload = multer({ storage: storage });

imageRoutes.get("/list-of-image", listOfImage);
imageRoutes.get("/get-list-of-image-by-name", getListOfImageByName);
imageRoutes.get(
  "/get-image-info-and-creator-by-id/:hinh_id",
  getImageInfoAndCreatorById
);
imageRoutes.get("/get-comment-by-id/:hinh_id", getCommentById);
imageRoutes.get("/check-image/:hinh_id", checkImage);
imageRoutes.post("/comment-with-image", commentWithImage);
imageRoutes.post(
  "/add-image",
  authenticateToken,
  upload.single("image"),
  addImage
);

export default imageRoutes;
