import { Router } from "express";
import {
  loginController,
  registerController,
  getUserDataController,
  applyDoctorController,
  getAllNotificationController,
  deleteAllNotificationController,
  getAllDoctorsController,
  bookAppointmentController,
  bookingAvailabilityController,
  userAppointmentsController,
  getUserProfileController,
  updateUserProfileController,
} from "../controllers/userController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.post("/login", loginController);
router.post("/register", registerController);
router.post("/getUserData", authMiddleware, getUserDataController);
router.post("/apply-doctor", authMiddleware, applyDoctorController);
router.post("/get-all-notification", authMiddleware, getAllNotificationController);
router.post("/delete-all-notification", authMiddleware, deleteAllNotificationController);
router.get("/getAllDoctors", authMiddleware, getAllDoctorsController);
router.post("/book-appointment", authMiddleware, bookAppointmentController);
router.post("/booking-availability", authMiddleware, bookingAvailabilityController);
router.get("/user-appointments", authMiddleware, userAppointmentsController);
router.post("/getUserProfile", authMiddleware, getUserProfileController);
router.post("/updateUserProfile", authMiddleware, updateUserProfileController);

export default router;

