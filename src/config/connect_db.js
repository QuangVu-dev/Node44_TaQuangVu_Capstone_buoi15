import dotenv from "dotenv";

// Đọc file .env
dotenv.config();

export default {
  user: process.env.DB_USER,
  pass: process.env.DB_PASS,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  dialect: "mysql",
  port: process.env.DB_PORT,
};
