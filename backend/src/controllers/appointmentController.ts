import { Request, Response } from "express";
import { Appointment } from "../models/Appointment";
import { User } from "../models/User";
import { Doctor } from "../models/Doctor";

export const bookAppointmentController = async (req: Request, res: Response) => {
  try {
    req.body.status = "pending";
    const newAppointment = await Appointment.create(req.body);
    const user = await User.findByPk(req.body.doctorInfo.userId);
    if (user) {
      const notification = user.notification || [];
      notification.push({
        type: "New-appointment-request",
        message: `A new Appointment Request from ${req.body.userInfo.name}`,
        onClickPath: "/user/appointments",
      });
      await User.update({ notification }, { where: { id: user.id } });
    }
    res.status(200).json({
      success: true,
      message: "Appointment booked successfully",
      data: newAppointment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error while booking appointment", error });
  }
};

export const bookingAvailabilityController = async (req: Request, res: Response):Promise<void> => {
  try {
    const { doctorId, date, officeTime } = req.body;
    const appointments = await Appointment.findAll({
      where: { doctorId, date, officeTime },
    });
    if (appointments.length > 0) {
      res.status(200).json({
        message: "Appointments not available at this time",
        success: true,
      });
      return;
    }
    res.status(200).json({
      message: "Appointments available",
      success: true,
    });
    return;
  } catch (error) {
    res.status(500).json({ success: false, message: "Error in booking availability", error });
  }
};

export const userAppointmentsController = async (req: Request, res: Response) => {
  try {
    const appointments = await Appointment.findAll({
      where: { userId: req.body.userId },
    });
    res.status(200).json({
      success: true,
      message: "User appointments fetched successfully",
      data: appointments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error in user appointments", error });
  }
};