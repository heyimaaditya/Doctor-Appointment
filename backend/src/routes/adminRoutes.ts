import { Router } from "express";
import {
  getAllUsersController,
  getAllDoctorsController,
  changeAccountStatusController,
  getAdminProfileController,
  updateAdminProfileController,
  removeUserController,
} from "../controllers/adminController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/getAllUsers", authMiddleware, getAllUsersController);
router.get("/getAllDoctors", authMiddleware, getAllDoctorsController);
router.post("/changeAccountStatus", authMiddleware, changeAccountStatusController);
router.post("/getAdminProfile", authMiddleware, getAdminProfileController);
router.post("/updateAdminProfile", authMiddleware, updateAdminProfileController);
router.post("/removeUser", authMiddleware, removeUserController);

export default router;