import { Sequelize } from "sequelize";
import configDb from "../config/connect_db.js";

const sequelize = new Sequelize(
  configDb.database,
  configDb.user,
  configDb.pass,
  {
    host: configDb.host, // tên database
    port: configDb.port, //tên user
    dialect: configDb.dialect, //password user
  }
);

export default sequelize;
