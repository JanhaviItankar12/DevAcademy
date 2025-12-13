import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    role: {
        type: String,
        enum: ["student", "instructor", "admin"],
        default: "student"
    },
    enrolledCourses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course"
        }
    ],
    photoUrl: {
        type: String,
        default: "https://github.com/shadcn.png"
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    reject: {
        type: Boolean,
        default: false
    },

    approvedAt: { type: Date },
    rejectedAt: { type: Date },

    certificates: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Certificate"
        }
    ],

    resetAttempts: {
        type: Number,
        default: 0,
    },
    resetLastAttempt: {
        type: Date,
    },

    resetPasswordToken: String,
    resetPasswordExpires: Date,

    notificationPreferences: {
        newCourse: { type: Boolean, default: true },     // all new courses
        followedInstructor: { type: Boolean, default: true },
        weeklyDigest: { type: Boolean, default: true },
        noMails: { type: Boolean, default: false }
    },

     followingInstructors: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],



}, { timestamps: true });

export const User = mongoose.model("User", userSchema);