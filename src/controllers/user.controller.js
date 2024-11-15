import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const getUsers = async (req, res) => {
  try {
    const users = await prisma.nguoi_dung.findMany();
    if (users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    return res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users info:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getUserFromToken = (token) => {
  console.log("Received Token:", token);
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
    return decoded; // Trả về thông tin người dùng từ token
  } catch (error) {
    return null; // Nếu token không hợp lệ, trả về null
  }
};

const getSavedImages = async (req, res) => {
  // Kiểm tra token từ header Authorization
  const token = req.headers["authorization"]?.split(" ")[1]; // Lấy token từ header 'Authorization'

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  // Giải mã token để lấy thông tin người dùng
  const user = getUserFromToken(token);

  if (!user) {
    return res.status(403).json({ message: "Invalid token" });
  }

  try {
    // Lấy danh sách các hình ảnh đã lưu của người dùng từ bảng 'luu_anh'
    const savedImages = await prisma.luu_anh.findMany({
      where: {
        nguoi_dung_id: user.nguoi_dung_id, // Lấy userId từ thông tin giải mã được trong token
      },
      include: {
        hinh_anh: true, // Lấy thông tin chi tiết của hình ảnh từ bảng hinh_anh
      },
    });

    if (savedImages.length === 0) {
      return res.status(404).json({ message: "No images found for this user" });
    }

    // Trả về thông tin danh sách hình ảnh đã lưu
    return res.status(200).json(savedImages.map((item) => item.hinh_anh));
  } catch (error) {
    console.error("Error fetching saved images:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getImagesByUserId = async (req, res) => {
  try {
    const userId = req.params.user_id || req.user?.userId;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const images = await prisma.hinh_anh.findMany({
      where: { nguoi_dung_id: Number(userId) },
    });

    if (images.length === 0) {
      return res.status(404).json({ message: "No images found for this user" });
    }
    return res.status(200).json({ images });
  } catch (error) {
    console.error("Error fetching images by userId:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Lấy token từ header Authorization

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    // Thêm userId vào request để sử dụng trong các route sau
    req.user = { userId: decoded.payload.userId }; // payload có userId
    next();
  });
};

const deleteImageById = async (req, res) => {
  const { image_id } = req.params;
  try {
    const image = await prisma.hinh_anh.findUnique({
      where: {
        hinh_id: Number(image_id), // Tìm ảnh theo hinh_id
      },
    });
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    // Xóa ảnh
    await prisma.hinh_anh.delete({
      where: {
        hinh_id: Number(image_id), // Xóa ảnh theo hinh_id
      },
    });
    // Trả về thông báo thành công
    return res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting image:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateUserInfor = async (req, res) => {
  const userId = Number(req.params.nguoi_dung_id);
  const { ho_ten, tuoi, anh_dai_dien, mat_khau } = req.body;
  if (!ho_ten || !tuoi || !anh_dai_dien || !mat_khau) {
    return res.status(400).json({ message: "Thiếu thông tin đầu vào" });
  }
  const hashedPassword = bcrypt.hashSync(mat_khau, 10);
  try {
    const updatedUser = await prisma.nguoi_dung.update({
      where: { nguoi_dung_id: userId },
      data: {
        ho_ten: ho_ten,
        tuoi: tuoi,
        anh_dai_dien: anh_dai_dien,
        mat_khau: hashedPassword,
      },
    });
    res.status(200).json({
      message: "Update user information successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật dữ liệu:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};
export {
  getUsers,
  getSavedImages,
  getImagesByUserId,
  authenticateToken,
  deleteImageById,
  updateUserInfor,
};
