import express from "express";

import isAuthenticated from "../middleware/isAuthenticated.js";
import { addReviews, createCourse, dashboard, deleteReview, editCourse, getAllCoursesByInstructor, getAllCreatorCourses, getAllReviews, getCourseAnalytics, getCourseById, getCourseInfo, getDataforHeroSection, getEnrolledCourseOfUser, getEnrolledStudentsForCourse, getPublishedCourseForHome, getPublishedCourses, getRecentTransactions, getreviews, removeCourse, searchCourse, togglePublishCourse, updateReview } from "../controller/course.controller.js";
import { createLecture, editLecture, getCourseLecture, getLectureById, removeLecture } from "../controller/lecture.controller.js";
import upload from "../utils/multer.js";
import { createOrder, getAllPurchasedCourses, getCourseDetailWithPurchaseStatus, verifyOrder } from "../controller/purchaseCourse.controller.js";
import { instructorMiddleware } from "../middleware/instructorMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import { adminDashboard, approveInstructor, getMessages, manageCourses, manageUser, rejectInstructor, topCourses, topInstructors } from "../controller/admin.controller.js";
import { optionalAuth } from "../middleware/optionalAuth.js";

const router=express.Router();

router.route("/").post(isAuthenticated,createCourse);

// public route
router.route("/search").get(isAuthenticated,searchCourse)
router.route("/published-courses").get(optionalAuth,getPublishedCourses);
router.route("/get-published-courses-on-level").get(optionalAuth,getPublishedCourseForHome);
router.route("/getData-for-hero-section").get(getDataforHeroSection);
router.route("/reviews").get(getreviews);
router.route("/").get(isAuthenticated,getAllCreatorCourses);

// private route
// route for  getting user enrolled courses
router.route("/getEnrolledCourse").get(isAuthenticated,getEnrolledCourseOfUser);

router.route("/:courseId").put(isAuthenticated,instructorMiddleware,upload.single("courseThumbnail"),editCourse);
router.route("/:courseId").get(isAuthenticated,getCourseById);
router.route("/:courseId").delete(isAuthenticated,removeCourse);



//lectures
router.route("/:courseId/lecture").post(isAuthenticated,instructorMiddleware,createLecture);
router.route("/:courseId/lecture").get(isAuthenticated,getCourseLecture);
router.route("/:courseId/lecture/:lectureId").post(isAuthenticated,instructorMiddleware,editLecture);
router.route("/lecture/:lectureId").delete(isAuthenticated,instructorMiddleware,removeLecture);
router.route("/lecture/:lectureId").get(isAuthenticated,getLectureById);


//published and unpublished course
router.route("/:courseId").patch(isAuthenticated,instructorMiddleware,togglePublishCourse);

//purchase course
router.route("/:courseId/purchase").post(isAuthenticated,createOrder);
router.route("/:courseId/purchase/verify").post(isAuthenticated,verifyOrder);

// it must visible to all users
router.route("/:courseId/detail-with-status").get(getCourseDetailWithPurchaseStatus);
router.route("/:courseId/reviews").get(getAllReviews);


router.route("/:courseId/allPurchasedCourse").get(isAuthenticated,getAllPurchasedCourses);


// course analytics
router.route("/:courseId/analytics").get(isAuthenticated,instructorMiddleware,getCourseAnalytics);

//course enrolledStudent
router.route("/:courseId/enrolled").get(isAuthenticated,instructorMiddleware,getEnrolledStudentsForCourse);


//reviews section
router.route("/:courseId/review").post(isAuthenticated,addReviews);
router.route("/:courseId/review/:reviewId").put(isAuthenticated,updateReview);
router.route("/:courseId/review/:reviewId").delete(isAuthenticated,deleteReview);

//instructor-dashboard route
router.route("/instructor/dashboard").get(isAuthenticated,instructorMiddleware,dashboard);
router.route("/instructor/courses").get(isAuthenticated,instructorMiddleware,getAllCoursesByInstructor);
router.route("/instructor/recentTransactions").get(isAuthenticated,instructorMiddleware,getRecentTransactions);
router.route("/instructor/course/:courseId").get(isAuthenticated,instructorMiddleware,getCourseInfo);

//admin dashboard routes
router.route("/admin/dashboard").get(isAuthenticated,adminMiddleware,adminDashboard);
router.route("/admin/manageUser").get(isAuthenticated,adminMiddleware,manageUser);
router.route("/admin/approve/:instructorId").put(isAuthenticated,adminMiddleware,approveInstructor);
router.route("/admin/reject/:instructorId").put(isAuthenticated,adminMiddleware,rejectInstructor);
router.route("/admin/manageCourses").get(isAuthenticated,adminMiddleware,manageCourses);
router.route("/admin/top-courses").get(isAuthenticated,adminMiddleware,topCourses);
router.route("/admin/top-instructors").get(isAuthenticated,adminMiddleware,topInstructors);


export default router;

