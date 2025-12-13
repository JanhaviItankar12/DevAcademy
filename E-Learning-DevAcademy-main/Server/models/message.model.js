import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    category: {
      type: String,
      enum: ["general", "technical", "instructor", "feedback"],
      default: "general",
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false, // to track if admin has read the message
    },
  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt
  }
);


export const Message=mongoose.model("Message",messageSchema);
