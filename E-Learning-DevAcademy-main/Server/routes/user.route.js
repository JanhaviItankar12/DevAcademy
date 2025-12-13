import express from "express";
import { analytics, getCompletedCourses, getCurrentUser, getUserProfile, logout, register, studentDashboardData, updateProfile } from "../controller/user.controller.js";
import { login } from "../controller/user.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import upload from "../utils/multer.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import { createMessage, getadminData } from "../controller/admin.controller.js";
import { downloadCertificate, issueCertificate } from "../controller/certificate.controller.js";


const router=express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/profile").get(isAuthenticated, getUserProfile);
router.route("/profile/update").put(isAuthenticated, upload.single("profilePhoto"), updateProfile);

// get logged in user
router.route("/user").get(isAuthenticated,getCurrentUser);

//admin route
router.route("/admin").get(isAuthenticated,adminMiddleware,getadminData);

//student route
router.route("/student").get(isAuthenticated,studentDashboardData);
router.route("/student/analytics").get(isAuthenticated,analytics);
router.route("/student/gen-certificate/:courseId").post(isAuthenticated,issueCertificate);
router.route("/student/get-completed-courses").get(isAuthenticated,getCompletedCourses);
router.route("/student/download-certificate/:certificateId").get(isAuthenticated,downloadCertificate);



//user can send message to admin for inquiry
router.route("/message").post(createMessage);
export default router;

