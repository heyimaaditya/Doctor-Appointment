import express from "express";
import cors from "cors";
import morgan from "morgan";
import * as dotenv from "dotenv";
import sequelize from "./config/db.config";
import userRoutes from "./routes/userRoutes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/v1/user", userRoutes);

const PORT = process.env.PORT || 4000;

sequelize.sync().then(() => {
  console.log("Database connected successfully");
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((error) => {
  console.error("Database connection error:", error);
});