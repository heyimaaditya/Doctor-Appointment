import { Router } from "express";
import {
  getDoctorProfileController,
  updateDoctorProfileController,
  getDoctorByIdController,
  doctorAppointmentsController,
  updateStatusController,
} from "../controllers/doctorController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.post("/getDoctorProfile", authMiddleware, getDoctorProfileController);
router.post("/updateDoctorProfile", authMiddleware, updateDoctorProfileController);
router.post("/getDoctorById", authMiddleware, getDoctorByIdController);
router.get("/doctor-appointments", authMiddleware, doctorAppointmentsController);
router.post("/update-status", authMiddleware, updateStatusController);

export default router;