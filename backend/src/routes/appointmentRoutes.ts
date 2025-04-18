import { Router } from "express";
import {
  bookAppointmentController,
  bookingAvailabilityController,
  userAppointmentsController,
} from "../controllers/appointmentController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.post("/book-appointment", authMiddleware, bookAppointmentController);
router.post("/booking-availability", authMiddleware, bookingAvailabilityController);
router.get("/user-appointments", authMiddleware, userAppointmentsController);

export default router;