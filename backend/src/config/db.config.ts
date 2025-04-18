import {Sequelize} from "sequelize";
import * as dotenv from "dotenv";
dotenv.config();
const sequelize = new Sequelize(
    process.env.DB_NAME || "doctor_appointment",
    process.env.DB_USER || "postgres",
    process.env.DB_PASSWORD || "postgres",
    {
        host: process.env.DB_HOST || "db",
        dialect: "postgres",
        port: parseInt(process.env.DB_PORT || "5432"),
    }
)
export default sequelize;