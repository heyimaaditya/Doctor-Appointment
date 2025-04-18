import { Request, Response } from "express";
import { User } from "../models/User";
import { Doctor } from "../models/Doctor";

export const getAllUsersController = async (req: Request, res: Response) => {
  try {
    const users = await User.findAll();
    res.status(200).json({
      success: true,
      message: "Users data",
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error while fetching users",
      error,
    });
  }
};

export const getAllDoctorsController = async (req: Request, res: Response) => {
  try {
    const doctors = await Doctor.findAll();
    res.status(200).json({
      success: true,
      message: "Doctors data",
      data: doctors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error while fetching doctors",
      error,
    });
  }
};

export const changeAccountStatusController = async (req: Request, res: Response) :Promise<void>=> {
  try {
    const { doctorId, status } = req.body;
    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) {
      res.status(404).json({ message: "Doctor not found", success: false });
      return;
    }
    await Doctor.update({ status }, { where: { id: doctorId } });
    const user = await User.findByPk(doctor.userId);
    if (user) {
      const notification = user.notification || [];
      notification.push({
        type: "Doctor Account request updated",
        message: `Your Doctor Account Request has been ${status}`,
        onClickPath: "/notification",
      });
      await User.update(
        { notification, isDoctor: status === "accepted" },
        { where: { id: doctor.userId } }
      );
    }
    res.status(201).json({
      success: true,
      message: "Account status updated",
      data: doctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in doctor account status",
      error,
    });
  }
};

export const getAdminProfileController = async (req: Request, res: Response):Promise<void> => {
  try {
    const admin = await User.findByPk(req.body.userId);
    if (!admin) {
      res.status(404).json({ message: "Admin not found", success: false });
      return;
    }
    res.status(200).json({
      success: true,
      message: "Admin data fetched successfully",
      data: admin,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error while fetching admin info",
      error,
    });
  }
};

export const updateAdminProfileController = async (req: Request, res: Response) :Promise<void>=> {
  try {
    const admin = await User.findByPk(req.body.userId);
    if (!admin) {
      res.status(404).json({ message: "Admin not found", success: false });
      return;
    }
    await User.update(req.body, { where: { id: req.body.userId } });
    res.status(200).json({
      success: true,
      message: "Admin profile updated successfully",
      data: admin,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error while updating profile",
      error,
    });
  }
};

export const removeUserController = async (req: Request, res: Response):Promise<void> => {
  try {
    const { userId } = req.body;
    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ message: "User not found", success: false });
      return;
    }
    await User.destroy({ where: { id: userId } });
    res.status(200).json({
      success: true,
      message: "User removed successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in removing user",
      error: error instanceof Error ? error.message : error,
    });
  }
};