import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const listOfImage = async (req, res) => {
  try {
    const images = await prisma.hinh_anh.findMany({
      include: {
        nguoi_dung: {
          select: {
            ho_ten: true, // Lấy tên người dùng
            email: true, // Email người dùng (nếu cần)
          },
        },
      },
    });
    return res.status(200).json({
      message: "Danh sách ảnh",
      data: images,
    });
  } catch (error) {
    console.error("Error fetching images:", error);
    return res.status(500).json({
      message: "Có lỗi xảy ra khi lấy danh sách ảnh.",
      error: error.message,
    });
  }
};

const getListOfImageByName = async (req, res) => {
  try {
    const { ten_hinh } = req.query;
    const images = await prisma.hinh_anh.findMany({
      where: {
        ten_hinh: {
          contains: ten_hinh || "", // Tìm kiếm tên ảnh chứa từ khóa (nếu có)
        },
      },
    });
    return res.status(200).json({
      message: "Danh sách ảnh tìm kiếm",
      data: images,
    });
  } catch (error) {
    console.error("Error fetching images:", error);
    return res.status(500).json({
      message: "Có lỗi xảy ra khi lấy danh sách ảnh.",
      error: error.message,
    });
  }
};

const getImageInfoAndCreatorById = async (req, res) => {
  const { hinh_id } = req.params;
  try {
    const imageDetails = await prisma.hinh_anh.findUnique({
      where: {
        hinh_id: Number(hinh_id), // Chuyển id ảnh thành kiểu số
      },
      include: {
        nguoi_dung: true, // Kết hợp thông tin người tạo ảnh (nguoi_dung)
      },
    });

    if (!imageDetails) {
      return res.status(404).json({ message: "Ảnh không tồn tại" });
    }

    return res.status(200).json({
      message: "Lấy thông tin ảnh thành công",
      data: imageDetails,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Có lỗi xảy ra khi lấy thông tin ảnh.",
      error: error.message,
    });
  }
};

const getCommentById = async (req, res) => {
  const { hinh_id } = req.params;

  try {
    const comments = await prisma.binh_luan.findMany({
      where: { hinh_id: Number(hinh_id) },
      select: {
        noi_dung: true,
      },
    });
    if (comments.length === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy bình luận cho ảnh này." });
    }
    return res.status(200).json({
      message: "Lấy bình luận thành công",
      data: comments,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Có lỗi xảy ra khi lấy bình luận theo id ảnh.",
      error: error.message,
    });
  }
};

const checkImage = async (req, res) => {
  const { hinh_id } = req.params;
  try {
    const savedImage = await prisma.luu_anh.findFirst({
      where: {
        hinh_id: Number(hinh_id),
      },
    });
    if (savedImage) {
      return res.status(200).json({ saved: true });
    } else {
      return res
        .status(404)
        .json({ saved: false, message: "Image not found or not saved yet" });
    }
  } catch (error) {
    console.error("Error checking image:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const commentWithImage = async (req, res) => {
  const { nguoi_dung_id, hinh_id, noi_dung } = req.body;
  if (!nguoi_dung_id || !hinh_id || !noi_dung) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  try {
    // Kiểm tra sự tồn tại của người dùng
    const userExists = await prisma.nguoi_dung.findUnique({
      where: {
        nguoi_dung_id: Number(nguoi_dung_id),
      },
    });

    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    // Kiểm tra sự tồn tại của hình ảnh
    const imageExists = await prisma.hinh_anh.findUnique({
      where: {
        hinh_id: Number(hinh_id),
      },
    });

    if (!imageExists) {
      return res.status(404).json({ message: "Image not found" });
    }
    const newComment = await prisma.binh_luan.create({
      data: {
        nguoi_dung_id: Number(nguoi_dung_id),
        hinh_id: Number(hinh_id),
        noi_dung: noi_dung,
        ngay_binh_luan: new Date(),
      },
    });
    return res.status(201).json(newComment);
  } catch (error) {
    console.error("Error saving comment:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const addImage = async (req, res) => {
  const { ten_hinh, mo_ta } = req.body;
  const nguoi_dung_id = req.user.userId;
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  try {
    const newImage = await prisma.hinh_anh.create({
      data: {
        ten_hinh: ten_hinh,
        duong_dan: req.file.path, // Lưu đường dẫn của ảnh
        mo_ta: mo_ta,
        nguoi_dung_id: nguoi_dung_id, // Liên kết ảnh với người dùng
      },
    });
    return res.status(200).json({
      message: "Image uploaded successfully",
      data: newImage,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Failed to upload image", error: error.message });
  }
};

export {
  listOfImage,
  getListOfImageByName,
  getImageInfoAndCreatorById,
  getCommentById,
  checkImage,
  commentWithImage,
  addImage,
};
