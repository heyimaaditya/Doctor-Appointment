import { Router, RequestHandler } from "express";
import {
  registerController,
  loginController,
  getUserDataController,
} from "../controllers/userController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.post("/register", registerController);
router.post("/login", loginController );
router.post("/getUserData", authMiddleware, getUserDataController );

export default router;

