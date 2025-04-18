import { Request,Response } from "express";
import { User } from "../models/User";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
export const registerController = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        res.status(201).json({ message: "User registered successfully", user: newUser });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}

export const loginController = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "secret", { expiresIn: "1h" });
        res.status(200).json({ message: "Login successful", token, user });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}

export const getUserDataController = async (req: Request, res: Response) => {
    const userId = req.params.id;
    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ success:true,data:user });
    } catch (error) {
        res.status(500).json({ message: "Server error", success:false, error });
    }
}