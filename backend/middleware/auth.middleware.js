import jwt from "jsonwebtoken";
import User from "../module/user/user.model.js";

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Authentication required" });
  }
};
