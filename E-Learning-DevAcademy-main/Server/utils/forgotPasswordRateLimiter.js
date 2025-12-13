import rateLimit from "express-rate-limit";

export const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 requests per hour
  message: {
    status: 429,
    message: "Too many password reset attempts. Try again after 1 hour.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
