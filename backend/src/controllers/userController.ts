import { Request, Response } from "express";
import { User } from "../models/User";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { Doctor } from "../models/Doctor";
import { Appointment } from "../models/Appointment";

export const registerController = async (req: Request, res: Response):Promise<void> => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: "User already exists", success: false });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    res.status(201).json({ message: "Registration successful", success: true });
  } catch (error) {
    res.status(500).json({ message: "Error in registration", success: false, error });
  }
};

export const loginController = async (req: Request, res: Response):Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(400).json({ message: "User not found", success: false });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid password", success: false });
      return;
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: "1d" });
    res.status(200).json({ message: "Login successful", success: true, token });
  } catch (error) {
    res.status(500).json({ message: "Error in login", success: false, error });
  }
};

export const getUserDataController = async (req: Request, res: Response):Promise<void> => {
  try {
    const user = await User.findByPk(req.body.userId);
    if (!user) {
      res.status(404).json({ message: "User not found", success: false });
      return;
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user data", success: false, error });
  }
};

export const applyDoctorController = async (req: Request, res: Response) => {
  try {
    const newDoctor = await Doctor.create({ ...req.body, status: "pending" });
    const adminUser = await User.findOne({ where: { isAdmin: true } });
    if (adminUser) {
      const notification = adminUser.notification || [];
      notification.push({
        type: "apply-doctor-request",
        message: `${newDoctor.firstName} ${newDoctor.lastName} has applied as a Doctor`,
        data: {
          doctorId: newDoctor.id,
          name: `${newDoctor.firstName} ${newDoctor.lastName}`,
          onClickPath: "/admin/doctors",
        },
      });
      await User.update({ notification }, { where: { id: adminUser.id } });
    }
    res.status(201).json({ success: true, message: "Doctor Account Applied Successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error while applying for Doctor", error });
  }
};

export const getAllNotificationController = async (req: Request, res: Response):Promise<void> => {
  try {
    const user = await User.findByPk(req.body.userId);
    if (!user) {
      res.status(404).json({ message: "User not found", success: false });
      return;
    }
    const seenNotification = user.seenNotification || [];
    const notification = user.notification || [];
    seenNotification.push(...notification);
    await User.update(
      { notification: [], seenNotification },
      { where: { id: user.id } }
    );
    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: "Error in notification", success: false, error });
  }
};

export const deleteAllNotificationController = async (req: Request, res: Response):Promise<void> => {
  try {
    const user = await User.findByPk(req.body.userId);
    if (!user) {
      res.status(404).json({ message: "User not found", success: false });
      return;
    }
    await User.update(
      { notification: [], seenNotification: [] },
      { where: { id: user.id } }
    );
    res.status(200).json({
      success: true,
      message: "Notifications deleted successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: "Unable to delete all notifications", success: false, error });
  }
};

export const getAllDoctorsController = async (req: Request, res: Response) => {
  try {
    const doctors = await Doctor.findAll({ where: { status: "accepted" } });
    res.status(200).json({
      success: true,
      message: "Doctors list fetched successfully",
      data: doctors,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error while fetching doctors", error });
  }
};

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

export const getUserProfileController = async (req: Request, res: Response):Promise<void> => {
  try {
    const user = await User.findByPk(req.body.userId);
    if (!user) {
      res.status(404).json({ message: "User not found", success: false });
      return;
    }
    res.status(200).json({
      success: true,
      message: "User data fetched successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error while fetching user info", error });
  }
};

export const updateUserProfileController = async (req: Request, res: Response):Promise<void> => {
  try {
    const user = await User.findByPk(req.body.userId);
    if (!user) {
      res.status(404).json({ message: "User not found", success: false });
      return;
    }
    await User.update(req.body, { where: { id: req.body.userId } });
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error while updating profile", error });
  }
};