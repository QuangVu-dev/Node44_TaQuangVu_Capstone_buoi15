import {
  createRefToken,
  // createRefTokenAsyncKey,
  createToken,
  // createTokenAsyncKey,
} from "../config/jwt.js";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
// import crypto from "crypto"; // lib để tạo random code cho flow forgot password
import { PrismaClient } from "@prisma/client";
// import speakeasy from "speakeasy";

const prisma = new PrismaClient();

const register = async (req, res, next) => {
  try {
    const { ho_ten, email, mat_khau, tuoi } = req.body;
    console.log({ ho_ten, email, mat_khau, tuoi });
    const userExist = await prisma.nguoi_dung.findFirst({
      where: { email },
    });
    console.log({ userExist });
    if (userExist) {
      return res
        .status(400)
        .json({ message: `Tài khoản đã tồn tại`, data: null });
    }

    const userNew = await prisma.nguoi_dung.create({
      data: {
        ho_ten: ho_ten,
        email,
        mat_khau: bcrypt.hashSync(mat_khau, 10),
        tuoi: Number(tuoi),
      },
    });

    return res.status(200).json({
      message: "Đăng ký thành công",
      data: userNew,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Có lỗi xảy ra. Vui lòng thử lại sau.",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    // b1: lấy email và pass_word từ body request
    // b2: check user thông qua email (get user từ db)
    //   b2.1: nếu không có user => ra error user not found
    //   b2.2: nếu có user => check tiếp pass_word
    //     b2.2.1: nếu password không trùng nhau => ra error password is wrong
    //     b2.2.2: nếu password trùng nhau => tạo access token
    let { email, mat_khau } = req.body;
    let user = await prisma.nguoi_dung.findFirst({
      where: { email },
    });
    if (!user) {
      return res.status(400).json({ message: "Email is wrong" });
    }
    let checkPass = bcrypt.compareSync(mat_khau, user.mat_khau);
    if (!checkPass) {
      return res.status(400).json({ message: "Password is wrong" });
    }
    // let payload = { userId: user.nguoi_dung_id };
    // tạo token
    // funtion sign của jwt
    // param 1: tạo payload và lưu vào token
    // param 2: key để tạo ra token
    // param 3: setting lifetime của token và thuật toán để tạo token
    // let accessToken = jwt.sign({ payload }, "NODE44", {
    //    algorithm: "HS256",
    //    expiresIn: "1d",
    // });
    let accessToken = createToken({ userId: user.nguoi_dung_id });
    console.log("Access Token:", accessToken);
    // tạo refresh token
    let refreshToken = createRefToken({ userId: user.nguoi_dung_id });
    // lưu refresh token vào database
    await prisma.nguoi_dung.update({
      data: {
        refresh_token: refreshToken,
      },
      where: { nguoi_dung_id: Number(user.nguoi_dung_id) },
    });

    // lưu refresh token vào cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true, // cookie không thể truy cập được từ javascript để bảo mật
      secure: false, // dùng cho localhost, nếu chạy https thì phải set là true
      sameSite: "Lax", // đảm bảo cookie được gửi trong nhiều domain khác nhau
      maxAge: 7 * 24 * 60 * 60 * 1000, // thời gian tồn tại là 7 ngày
    });

    return res.status(200).json({
      message: "Login successfully",
      data: accessToken,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Có lỗi xảy ra. Vui lòng thử lại sau.",
      error: error.message,
    });
  }
};

export { register, login };
