import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  id: number;
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "No token provided", success: false });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as JwtPayload;
    req.body.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: "Authorization failed", success: false });
  }
};

