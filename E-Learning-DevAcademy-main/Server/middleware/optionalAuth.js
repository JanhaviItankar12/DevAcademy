import jwt from "jsonwebtoken"; 
import { User } from "../models/user.model.js";

export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return next(); //  allow guest users
    }

    const decoded = jwt.verify(token, process.env.secret_key);
    if (!decoded) {
      return next();
    }

    req.user = await User.findById(decoded.userId).select("-password");
    req.id = decoded.userId;

    next();
  } catch (error) {
    next(); //  never block public route
  }
};
