import { RequestHandler } from "express";
import jwt from "jsonwebtoken";

export const authMiddleware: RequestHandler = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 1️⃣ No token at all
    if (!authHeader) {
      res.status(401).json({ message: "No token provided", success: false });
      return;          // ← early‑exit, *without* returning a Response
    }

    const token = authHeader.split(" ")[1];

    // 2️⃣ Verify token (callback form to keep it sync‑ish)
    jwt.verify(
      token,
      process.env.JWT_SECRET as string,
      (err, decoded: any) => {
        if (err) {
          res.status(401).json({ message: "Invalid token", success: false });
          return;
        }

        // 3️⃣ Attach user id for downstream handlers
        req.body.userId = decoded.id;
        next();         // let the request continue
      }
    );
  } catch (error) {
    res.status(401).json({ message: "Authorization failed", success: false });
  }
};
