import jwt from "jsonwebtoken";

export const generateResetToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.secret_key,
    { expiresIn: "10m" } // 10 minutes
  );
};
