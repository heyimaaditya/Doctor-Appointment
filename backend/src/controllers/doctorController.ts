import { Request, Response } from "express";
import { Doctor } from "../models/Doctor";
import { User } from "../models/User";
import { Appointment } from "../models/Appointment";

export const getDoctorProfileController = async (req: Request, res: Response):Promise<void> => {
  try {
    const doctor = await Doctor.findOne({ where: { userId: req.body.userId } });
    if (!doctor) {
      res.status(404).json({ message: "Doctor not found", success: false });
      return;
    }
    res.status(200).json({
      success: true,
      message: "Doctor data fetched successfully",
      data: doctor,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error while fetching doctor info", error });
  }
};

export const updateDoctorProfileController = async (req: Request, res: Response):Promise<void> => {
  try {
    const doctor = await Doctor.findOne({ where: { userId: req.body.userId } });
    if (!doctor) {
      res.status(404).json({ message: "Doctor not found", success: false });
      return;
    }
    await Doctor.update(req.body, { where: { userId: req.body.userId } });
    res.status(200).json({
      success: true,
      message: "Doctor profile updated successfully",
      data: doctor,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error while updating profile", error });
  }
};

export const getDoctorByIdController = async (req: Request, res: Response):Promise<void> => {
  try {
    const doctor = await Doctor.findByPk(req.body.doctorId);
    if (!doctor) {
      res.status(404).json({ message: "Doctor not found", success: false });
      return;
    }
    res.status(200).json({
      success: true,
      message: "Single doctor information fetched successfully",
      data: doctor,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error while fetching doctor information", error });
  }
};

export const doctorAppointmentsController = async (req: Request, res: Response):Promise<void> => {
  try {
    const doctor = await Doctor.findOne({ where: { userId: req.body.userId } });
    if (!doctor) {
      res.status(404).json({ message: "Doctor not found", success: false });
      return;
    }
    const appointments = await Appointment.findAll({ where: { doctorId: doctor.id } });
    res.status(200).json({
      success: true,
      message: "Doctor appointments fetched successfully",
      data: appointments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error while fetching doctor appointments", error });
  }
};

export const updateStatusController = async (req: Request, res: Response):Promise<void> => {
  try {
    const { appointmentId, status } = req.body;
    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) {
      res.status(404).json({ message: "Appointment not found", success: false });
      return;
    }
    await Appointment.update({ status }, { where: { id: appointmentId } });
    const user = await User.findByPk(appointment.userId);
    if (user) {
      const notification = user.notification || [];
      notification.push({
        type: "Status-updated",
        message: `Your appointment has been updated to ${status}`,
        onClickPath: "/doctor-appointments",
      });
      await User.update({ notification }, { where: { id: user.id } });
    }
    res.status(200).json({
      success: true,
      message: "Appointment status updated",
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error while updating status", error });
  }
};