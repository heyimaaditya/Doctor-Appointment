import { Request, Response } from "express";
import { Doctor } from "../models/Doctor";
import { User } from "../models/User";
import { Appointment } from "../models/Appointment";

export const getAllDoctorsController = async (req: Request, res: Response) => {
  try {
    const doctors = await Doctor.findAll({ where: { status: "accepted" } });
    res.status(200).json({
      success: true,
      message: "Doctors list fetched successfully",
      data: doctors,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error while fetching doctors",
      error,
    });
  }
};

export const getDoctorProfileController = async (req: Request, res: Response) => {
  try {
    const doctor = await Doctor.findOne({ where: { userId: req.body.userId } });
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }
    res.status(200).json({
      success: true,
      message: "Doctor data fetched successfully",
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error while fetching doctor info",
      error,
    });
  }
};

export const updateDoctorProfileController = async (req: Request, res: Response) => {
  try {
    const doctor = await Doctor.findOne({ where: { userId: req.body.userId } });
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }
    await doctor.update(req.body);
    res.status(200).json({
      success: true,
      message: "Doctor profile updated successfully",
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error while updating profile",
      error,
    });
  }
};

export const getDoctorByIdController = async (req: Request, res: Response) => {
  try {
    const doctor = await Doctor.findByPk(req.body.doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }
    res.status(200).json({
      success: true,
      message: "Single doctor information fetched successfully",
      data: doctor,
    });
  } catch (error) {
    console.log(error);
   res.status(500).json({
      success: false,
      message: "Error while fetching single doctor information",
      error,
    });
  }
};

export const doctorAppointmentsController = async (req: Request, res: Response) => {
  try {
    const doctor = await Doctor.findOne({ where: { userId: req.body.userId } });
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }
    const appointments = await Appointment.findAll({ where: { doctorId: doctor.id } });
    res.status(200).json({
      success: true,
      message: "Doctor appointments fetched successfully",
      data: appointments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error while fetching doctor appointments",
      error,
    });
  }
};

export const updateStatusController = async (req: Request, res: Response) => {
  try {
    const { appointmentId, status } = req.body;
    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }
    await appointment.update({ status });
    const user = await User.findByPk(appointment.userId);
    if (user) {
      const notification = user.notification || [];
      notification.push({
        type: "Status-updated",
        message: `Your appointment has been updated to ${status}`,
        onClickPath: "/doctor-appointments",
      });
      await user.update({ notification });
    }
    res.status(200).json({
      success: true,
      message: "Appointment status updated",
      data: appointment,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error while updating status",
      error,
    });
  }
};

export const changeAccountStatusController = async (req: Request, res: Response) => {
  try {
    const { doctorId, status } = req.body;
    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }
    await doctor.update({ status });
    const user = await User.findByPk(doctor.userId);
    if (user) {
      const notification = user.notification || [];
      notification.push({
        type: "Doctor Account request updated",
        message: `Your Doctor Account Request has been ${status}`,
        onClickPath: "/notification",
      });
      await user.update({ isDoctor: status === "accepted", notification });
    }
    res.status(201).json({
      success: true,
      message: "Account Status Updated",
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error in Doctor account status",
      error,
    });
  }
};