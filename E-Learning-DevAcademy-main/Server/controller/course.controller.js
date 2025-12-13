import moment from 'moment';
import mongoose from "mongoose";
import { Course } from "../models/course.model.js";
import { deleteMedia, deleteVideo, uploadMedia } from "../utils/cloudinary.js";
import { removeLecture } from "./lecture.controller.js";
import { Lecture } from "../models/lecture.model.js";
import { CourseProgress } from '../models/courseProgress.model.js';
import { User } from '../models/user.model.js';
import { sendInstructorPublishEmail, sendWeeklyDigestEmail } from '../utils/sendEmail.js';


export const createCourse = async (req, res) => {
    try {
        const { courseTitle, category } = req.body;
        if (!courseTitle || !category) {
            return res.status(400).json({
                message: "Couse title and category are required"

            })
        }

        if (courseTitle.trim().length < 3) {
            return res.status(400).json({
                message: "Course title must be at least 3 characters long"
            })
        };

        const course = await Course.create({
            courseTitle,
            category,
            creator: req.id
        })
        return res.status(201).json({
            course,
            message: "Course Created"

        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to create course"

        })
    }
}

export const getAllCreatorCourses = async (req, res) => {
    try {
        const userId = req.id;
        const courses = await Course.find({ creator: userId });
        if (!courses) {
            return res.status(404).json({
                message: "Course not found",
                courses: []

            })
        }
        return res.status(200).json({
            courses,

        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to load courses"

        })
    }
}

export const editCourse = async (req, res) => {
    try {
        const courseId = req.params.courseId;

        const userId = req.id;
        const { courseTitle, subTitle, description, coursePrice, courseLevel, category } = req.body;
        const thumbnail = req.file;

        let course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                message: "Course not found!"

            })
        }

        if (course.creator.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "You are not authorized to delete this course" });
        }
        let courseThumbnail;
        if (thumbnail) {
            if (course.courseThumbnail) {
                const publicId = course.courseThumbnail.split("/").pop().split(".")[0];
                await deleteMedia(publicId);  //delete old image
            }
            //upload thumbnail on cloudinary
            courseThumbnail = await uploadMedia(thumbnail.path);
        }

        const updateData = { courseTitle, subTitle, description, coursePrice, courseLevel, category, courseThumbnail: courseThumbnail?.secure_url };
        course = await Course.findByIdAndUpdate(courseId, updateData, { new: true });
        return res.status(200).json({
            course,
            message: "Course updated successfully."
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to edit course"

        })
    }
};

//get enrolled course of user
export const getEnrolledCourseOfUser = async (req, res) => {
    try {
        const userId = req.id;
        console.log(userId)
        const courses = await Course.find({ "enrolledStudents.student": new mongoose.Types.ObjectId(userId) }).populate({ path: "creator", select: "name photoUrl" });

        return res.status(200).json({
            courses,
            message: "Fetched enrolled courses successfully"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to fetch enrolled courses"
        });
    }
}


export const getCourseById = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const course = await Course.findById(courseId).populate({ path: "creator lectures", select: "name lectureTitle videoUrl" });

        if (!course) {
            return res.status(404).json({
                message: "Course not found!"

            });
        }
        return res.status(200).json({
            course

        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to get course by id"

        })
    }
};

//publish and unpublish course logic
export const togglePublishCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { publish } = req.query;

        const course = await Course.findById(courseId)
            .populate("lectures")
            .populate("creator"); // IMPORTANT

        if (!course) {
            return res.status(404).json({ message: "Course not found!" });
        }

        // VALIDATIONS...
        if (publish === "true") {
            const isEmpty = (value) =>
                value === undefined || value === null || value.toString().trim() === "";

            const missingFields = [];

            if (isEmpty(course.courseTitle)) missingFields.push("courseTitle");
            if (isEmpty(course.subTitle)) missingFields.push("subTitle");
            if (isEmpty(course.description)) missingFields.push("description");
            if (isEmpty(course.coursePrice)) missingFields.push("coursePrice");
            if (isEmpty(course.courseLevel)) missingFields.push("courseLevel");
            if (isEmpty(course.category)) missingFields.push("category");
            if (isEmpty(course.courseThumbnail)) missingFields.push("courseThumbnail");

            const lecturesMissingVideo = course.lectures
                .filter((lecture) => isEmpty(lecture.videoUrl))
                .map((lecture) => lecture.lectureTitle || lecture._id);

            if (missingFields.length > 0 || lecturesMissingVideo.length > 0) {
                return res.status(400).json({
                    message: "Cannot publish course. Required fields or lecture videos missing.",
                    missingCourseFields: missingFields,
                    lecturesMissingVideo,
                });
            }
        }

        if (publish === "true") {
            course.isPublished = true;
            course.publishedAt = new Date(); //  Set publish date
        } else {
            course.isPublished = false;
            course.publishedAt = null; // Optional: reset if unpublished
        }

        await course.save();

        //  SEND EMAIL NOTIFICATIONS
        
        if (publish === "true") {
            const instructorId = course.creator._id;

            //  Users who LIKE getting "New Course" emails
            const newCourseUsers = await User.find({
                "notificationPreferences.newCourse": true,
            });

            //  Users who FOLLOW this instructor + prefer instructorPublish mails
            const instructorFollowers = await User.find({
                followingInstructors: instructorId,
                "notificationPreferences.followedInstructor": true,
            });

            const usersToEmail = [...newCourseUsers, ...instructorFollowers];

            // Remove duplicate emails
            const uniqueUsers = Array.from(new Set(usersToEmail.map((u) => u.email)));

            if (uniqueUsers.length > 0) {
                await sendInstructorPublishEmail(uniqueUsers, course.creator.name, course.courseTitle, course._id);

            }
        }

        return res.status(200).json({
            message: `Course is ${course.isPublished ? "Published" : "Unpublished"}`,
            course,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to update status of course",
        });
    }
};







export const removeCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.id;
        const userRole = req.user.role;
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                message: "Course not found!"
            })
        }

        if (userRole !== "admin" && course.creator.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "You are not authorized to delete this course" });
        }

        //step 1:delete all referenced lectures
        const lectures = await Lecture.find({ _id: { $in: course.lectures } });
        for (const lecture of lectures) {
            if (lecture.publicId) {
                await deleteVideo(lecture.publicId); // delete video from Cloudinary
            }
            await Lecture.findByIdAndDelete(lecture._id); // delete lecture from DB
        }

        //step 2:delete course
        await Course.findByIdAndDelete(courseId);

        return res.status(200).json({
            message: "Course deleted Successfully",
            success: true
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to remove course"

        })
    }
}

export const getPublishedCourses = async (req, res) => {
    try {
        const courses = await Course.find({ isPublished: true })
            .populate({ path: "creator", select: "name" })
            .select("-__v");

        let enrolledCourseIds = [];

        

        if (req.id) {
            const user = await User.findById(req.id).select("enrolledCourses");
            enrolledCourseIds = user?.enrolledCourses.map(id => id.toString()) || [];
        }

        

        const formattedCourses = courses.map(course => {
            const reviewCount = course.reviews.length;
            const rating =
                reviewCount > 0
                    ? course.reviews.reduce((s, r) => s + r.rating, 0) / reviewCount
                    : 0;

            return {
                id: course._id,
                courseTitle: course.courseTitle,
                coursePrice: course.coursePrice,
                courseLevel: course.courseLevel,
                courseThumbnail: course.courseThumbnail,
                lectures: course.lectures.length,
                rating: Number(rating.toFixed(1)),
                reviewCount,
                isPurchased: enrolledCourseIds.includes(course._id.toString()),
                creator: {
                    name: course.creator?.name,
                    photoUrl: course.creator?.photoUrl
                },
                enrolledStudents:course.enrolledStudents.length,
                category:course.category
            };
        });

        

        res.status(200).json({ courses: formattedCourses });

    } catch (error) {
        res.status(500).json({ message: "Failed to get courses" });
    }
};


export const getPublishedCourseForHome = async (req, res) => {
    try {
        const courses = await Course.find({ isPublished: true })
            .populate({ path: "creator", select: "name photoUrl" })
            .select("-__v");

        if (!courses || courses.length === 0) {
            return res.status(404).json({ message: "Courses not found" });
        }

        // Function to get top 2 courses per level sorted by rating
        const getTopRated = (level) => {
            return courses
                .filter(c => c.courseLevel === level)
                .map(c => {
                    const reviewCount = c.reviews.length;
                    const rating =
                        reviewCount > 0
                            ? c.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
                            : 0;
                    return { course: c, rating };
                })
                .sort((a, b) => b.rating - a.rating) // highest rating first
                .slice(0, 2)
                .map(item => item.course);
        };

        const beginner = getTopRated("Beginner");
        const medium = getTopRated("Medium");
        const advance = getTopRated("Advance");

        const selectedCourses = [...beginner, ...medium, ...advance];


        let enrolledCourseIds = [];

        // If user is logged in
        if (req.id) {
            const user = await User.findById(req.id).select("enrolledCourses");
            if (user) {
                enrolledCourseIds = user.enrolledCourses.map(id => id.toString());
            }
        }

        // Format course for frontend
        const formatCourse = (course) => {
            const reviewCount = course.reviews.length;
            const rating =
                reviewCount > 0
                    ? course.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
                    : 0;

            // Check if this user has enrolled in this course
            const isPurchased = enrolledCourseIds.includes(course._id.toString());

            return {
                id: course._id,
                courseTitle: course.courseTitle,
                subTitle: course.subTitle,
                category: course.category,
                courseLevel: course.courseLevel,
                coursePrice: course.coursePrice,
                courseThumbnail: course.courseThumbnail,
                
                enrolledStudents: course.enrolledStudents.length,
                lectures: course.lectures.length,

                rating: Number(rating.toFixed(1)),
                reviewCount,
                isPurchased, // Key field
                isPublished: course.isPublished,
                creator: {
                    name: course.creator?.name,
                    photoUrl: course.creator?.photoUrl,
                }
            };
        };

        return res.status(200).json({
            courses: selectedCourses.map(formatCourse)
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to fetch courses for home"
        });
    }
};



//send data for hero section
export const getDataforHeroSection = async (req, res) => {
    try {
        // Total students
        let totalStudents = await User.countDocuments({ role: "student" });

        // Total instructors
        let totalInstructors = await User.countDocuments({ role: "instructor" });

        // Total published courses
        let totalPublishedCourses = await Course.countDocuments({ isPublished: true });

        // Calculate completion rate across all courses
        const courses = await Course.find({ isPublished: true }).select(
            "enrolledStudents completions"
        );

        let totalEnrolled = 0;
        let totalCompleted = 0;

        courses.forEach(course => {
            const enrolledCount = course.enrolledStudents?.length || 0;
            const completedCount = course.completions?.length || 0;

            totalEnrolled += enrolledCount;
            totalCompleted += completedCount;
        });

        const completionRate =
            totalEnrolled > 0
                ? Number(((totalCompleted / totalEnrolled) * 100).toFixed(1))
                : 0;

        // Calculate average rating
        const ratingAgg = await Course.aggregate([
            { $match: { isPublished: true } },
            { $unwind: "$reviews" },
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: "$reviews.rating" },
                    totalReviews: { $sum: 1 }
                }
            }
        ]);

        let overallRating = 0;
        if (ratingAgg.length > 0) {
            overallRating = Number(ratingAgg[0].avgRating.toFixed(1));
        }

        // Subtract 1 if needed
        totalStudents -= 1;
        totalInstructors -= 1;
        totalPublishedCourses -= 1;

        return res.status(200).json({
            totalStudents,
            totalInstructors,
            totalPublishedCourses,
            completionRate,
            overallRating
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to fetch data for hero section",
        });
    }
};



//send reviews for cta section
export const getreviews = async (req, res) => {
    try {
        const courses = await Course.find({ isPublished: true })
            .populate({
                path: "reviews.student",
                select: "name photoUrl"
            })
            .select("courseTitle reviews");

        let allReviews = [];

        // Collect all reviews with formatted structure
        courses.forEach(course => {
            course.reviews.forEach(review => {
                allReviews.push({
                    student: review.student?.name || "Unknown",
                    rating: review.rating,
                    comment: review.comment,
                    course: course.courseTitle,
                    photoUrl: review.student?.photoUrl || null
                });
            });
        });

        // Sort by highest rating first
        allReviews.sort((a, b) => b.rating - a.rating);

        // Take top 3 reviews
        const top3 = allReviews.slice(0, 3);

        return res.status(200).json({
            reviews: top3
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to fetch reviews",
        });
    }
};






export const searchCourse = async (req, res) => {
    try {
        let { query = "", categories = [], sortByPrice = "" } = req.query;



        // fix:convert categories to array if it's string
        if (typeof categories === "string" && categories.length > 0) {
            categories = categories.split(",");
        }
        // create a search query
        const searchCriteria = {
            isPublished: true,
            $or: [
                { courseTitle: { $regex: query, $options: "i" } },
                { subTitle: { $regex: query, $options: "i" } },
                { category: { $regex: query, $options: "i" } }

            ]
        };



        // if categories are selected
        if (categories.length > 0) {
            categories = categories.map(cat => cat.toLowerCase());
            searchCriteria.category = { $in: categories };
        }

        // if sort by price is selected
        const sortOptions = {};
        if (sortByPrice === "low") {
            sortOptions.coursePrice = 1; // ascending order
        }

        if (sortByPrice === "high") {
            sortOptions.coursePrice = -1; // descending order
        }

        let courses = await Course.find(searchCriteria).populate({ path: "creator", select: "name photoUrl" }).sort(sortOptions);

        return res.status(200).json({
            courses: courses || [],
            success: true,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to search courses"
        })
    }
}

// course Analytics
export const getCourseAnalytics = async (req, res) => {
    try {
        const { courseId } = req.params;
        const selectedyear = parseInt(req.query.year) || new Date().getFullYear();

        const course = await Course.findById(courseId)
            .populate("enrolledStudents.student", "name")
            .populate("completions.student", "name")
            .populate("reviews.student", "name")
            .populate("lectures");  //get full lectures

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }




        //filter data
        const filteredEnrollments = course.enrolledStudents.filter(e => new Date(e.enrolledAt).getFullYear() === selectedyear);


        const filteredCompletions = course.completions.filter(c => new Date(c.completedAt).getFullYear() === selectedyear);

        const filteredReviews = course.reviews.filter(r => new Date(r.createdAt).getFullYear() === selectedyear);

        const filterLectureEngagement = course.lectures.filter(l => new Date(l.createdAt).getFullYear() === selectedyear);



        // overview
        const reviw = course.reviews;
        const totalRevenue = filteredEnrollments.length * course.coursePrice;
        const totalStudents = filteredEnrollments.length;
        const avgRating =
            filteredReviews.length > 0
                ? (
                    filteredReviews.reduce((sum, r) => sum + r.rating, 0) / filteredReviews.length
                ).toFixed(1)
                : 0;

        const completionRate =
            totalStudents > 0
                ? Math.round((filteredCompletions.length / totalStudents) * 100)
                : 0;


        //lecture engagement
        const lectureEngagement =

            filterLectureEngagement.length > 0
                ? (filterLectureEngagement.map(lec => {
                    const totalViews = Array.isArray(lec.views) ? lec.views.length : 0;

                    let avgWatchTime = 0;

                    if (Array.isArray(lec.avgTime) && lec.avgTime.length > 0) {
                        avgWatchTime = lec.avgTime[lec.avgTime.length - 1].time;
                    }

                    let avgDropOff = 0;
                    if (Array.isArray(lec.dropOff) && lec.dropOff.length > 0) {
                        avgDropOff = lec.dropOff.reduce((sum, d) => sum + d.percent, 0) / lec.dropOff.length;
                        avgDropOff = Number(avgDropOff.toFixed(2));
                    }
                    return {
                        title: lec.lectureTitle,
                        views: totalViews,
                        avgTime: avgWatchTime,
                        dropOff: avgDropOff
                    }
                })) :
                0;




        //build monthly data dynamically
        const months = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];

        // count enrollements per month
        const enrollmentsByMonth = {};
        filteredEnrollments.forEach((enroll) => {
            const month = months[new Date(enroll.enrolledAt).getMonth()];
            enrollmentsByMonth[month] = (enrollmentsByMonth[month] || 0) + 1;
        });


        // Count completions per month
        const completionsByMonth = {};
        filteredCompletions.forEach((comp) => {
            const month = months[new Date(comp.completedAt).getMonth()];
            completionsByMonth[month] = (completionsByMonth[month] || 0) + 1;
        });

        // construct final monthlyData
        const monthlyData = months.map((m) => ({
            month: m,
            enrollments: enrollmentsByMonth[m] || 0,
            completions: completionsByMonth[m] || 0,
            revenue: (enrollmentsByMonth[m] || 0) * course.coursePrice,
        }));

        //recent activity
        const recentActivity = [
            ...filteredEnrollments.slice(-3).map((s) => ({
                type: "enrollment",
                student: s.student?.name || "Student",
                time: moment(s.enrolledAt).fromNow()
            })),
            ...filteredCompletions.slice(-2).map((c) => ({
                type: "completion",
                student: c.student?.name || "Student",
                time: moment(c.completedAt).fromNow()
            })),
            ...filteredReviews.slice(-2).map((r) => ({
                type: "review",
                student: r.student?.name || "Student",
                rating: r.rating,
                time: moment(r.createdAt).fromNow()
            })),
        ];

        return res.status(201).json({
            overview: {
                totalRevenue,
                totalStudents,
                averageRating: avgRating,
                completionRate,
            },
            monthlyData,
            lectureEngagement,
            recentActivity,
            reviw: filteredReviews
        });

    } catch (error) {
        console.error("Error to get course analytics:", error);
        return res.status(500).json({ message: "Server error" });
    }
}


//reviews section

export const addReviews = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.id;
        const { rating, comment } = req.body;

        if (!rating || !comment || !courseId) {
            return res.status(400).json({
                message: "All Fields are Reuired"
            })
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        //check if user already reviwed this course
        const alreadyReviewed = course.reviews.find(
            (r) => r.student.toString() === userId.toString()
        );

        if (alreadyReviewed) {
            return res.status(400).json({ message: "You already reviewed this course" });
        }

        course.reviews.push({
            student: userId,
            rating,
            comment,
        });

        await course.save();
        const newReview = course.reviews[course.reviews.length - 1];
        res.status(201).json({
            message: "Review added Successfully",
            review: newReview
        });

    } catch (error) {
        console.error("Error adding review:", error);
        return res.status(500).json({ message: "Server error" });
    }
}


export const updateReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const { courseId, reviewId } = req.params;
        const userId = req.id;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const review = course.reviews.id(reviewId);
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        if (review.student.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Not authorized to update this review" });
        }

        review.rating = rating || review.rating;
        review.comment = comment || review.comment;

        await course.save();
        res.json({ message: "Review updated successfully", reviews: course.reviews });

    } catch (error) {
        console.error("Error updating review:", error);
        res.status(500).json({ message: "Server error" });
    }
}

export const deleteReview = async (req, res) => {
    try {
        const { courseId, reviewId } = req.params;
        const userId = req.id;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const review = course.reviews.id(reviewId);
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        if (review.student.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Not authorized to delete this review" });
        }

        course.reviews.pull(reviewId);
        await course.save();
        return res.json({ message: "Review deleted successfully", reviews: course.reviews });
    } catch (error) {
        console.error("Error deleting review:", error);
        return res.status(500).json({ message: "Server error" });
    }
}


// fetch all reviews of user 
export const getAllReviews = async (req, res) => {
    try {
        const { courseId } = req.params;

        const course = await Course.findById(courseId).populate({
            path: "reviews.student",
            select: "name photoUrl"
        });
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }


        return res.status(201).json({
            message: "Reviews Fetched Successfully",
            reviews: course.reviews
        })

    } catch (error) {
        console.error("Error fetching review:", error);
        return res.status(500).json({ message: "Server error" });
    }
}


//fetch all enrolledStudent for particular course
export const getEnrolledStudentsForCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const course = await Course.findById(courseId).populate({ path: "enrolledStudents.student", select: "name email photoUrl" });

        if (!course) {
            return res.status(400).json({
                message: "Course not found"
            });
        }

        const progressRecords = await CourseProgress.find({ courseId });

        const enrolledStudents = course.enrolledStudents.map((item) => {
            const student = item.student;
            const enrolledAt = item.enrolledAt;
            const progress = progressRecords.find(
                (p) => p.userId.toString() === student._id.toString()
            );

            let progressPercent = 0;

            if (progress) {
                if (progress.completed) {
                    progressPercent = 100;
                } else if (progress.lectureProgress && progress.lectureProgress.length > 0) {
                    // Calculate based on lectureProgress
                    const completedLectures = progress.lectureProgress.filter(l => l.completed).length;
                    const totalLectures = progress.lectureProgress.length;
                    progressPercent = Math.floor((completedLectures / totalLectures) * 100);
                }
            }

            return {
                studentId: student._id,
                name: student.name,
                email: student.email,
                photoUrl: student.photoUrl,
                progress: progressPercent,
                enrolledAt
            }
        })
        return res.status(200).json({
            message: "All Enrolled Students fetched Successfully",
            students: enrolledStudents
        })
    } catch (error) {
        console.error("Error fetching enrolledStudents for particular course:", error);
        return res.status(500).json({ message: "Server error" });
    }
}



// dashboard for instructor
export const dashboard = async (req, res) => {
    try {
        const userId = req.id;
        const { range } = req.query;

        const days = range === "week" ? 7 : range === "month" ? 30 : 365;
        const sinceDate = new Date();
        sinceDate.setDate(sinceDate.getDate() - days);

        const courses = await Course.find({ creator: userId }).populate("enrolledStudents.student");

        const totalCourses = courses.length;
        let totalStudents = 0;
        let totalRevenue = 0;

        let monthlyStudents = {};
        let monthlyRevenue = {};

        // NEW: Daily tracking for trend charts
        let dailyData = {}; // { "2025-11-09": { students: 0, revenue: 0, enrollments: 0 } }

        courses.forEach(course => {
            course.enrolledStudents.forEach(es => {
                if (es.enrolledAt && es.enrolledAt >= sinceDate) {
                    totalStudents++;
                    totalRevenue += course.coursePrice;

                    const monthKey = `${es.enrolledAt.getFullYear()}-${es.enrolledAt.getMonth() + 1}`;
                    monthlyStudents[monthKey] = (monthlyStudents[monthKey] || 0) + 1;
                    monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + course.coursePrice;

                    // NEW: Track daily data
                    const dateKey = es.enrolledAt.toISOString().split('T')[0]; // "2025-11-09"
                    if (!dailyData[dateKey]) {
                        dailyData[dateKey] = { students: 0, revenue: 0, enrollments: 0 };
                    }
                    dailyData[dateKey].enrollments++;
                    dailyData[dateKey].revenue += course.coursePrice;
                }
            });
        });

        // NEW: Convert daily data to cumulative trend array
        let trendData = [];
        let cumulativeStudents = 0;
        let cumulativeRevenue = 0;

        for (let i = days; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateKey = date.toISOString().split('T')[0];
            const dayData = dailyData[dateKey] || { enrollments: 0, revenue: 0 };

            cumulativeStudents += dayData.enrollments;
            cumulativeRevenue += dayData.revenue;

            trendData.push({
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                revenue: cumulativeRevenue,
                students: cumulativeStudents,
                enrollments: dayData.enrollments
            });
        }

        let totalRatings = 0;
        let ratingCount = 0;
        courses.forEach(course => {
            course.reviews.forEach(review => {
                if (review.createdAt && review.createdAt >= sinceDate) {
                    totalRatings += review.rating;
                    ratingCount++;
                }
            });
        });

        const averageRating = ratingCount > 0 ? (totalRatings / ratingCount).toFixed(1) : 0;

        const sortedMonths = Object.keys(monthlyRevenue).sort();
        let revenueGrowth = [];
        let studentGrowth = [];

        sortedMonths.forEach((month, index) => {
            if (index === 0) {
                revenueGrowth.push({ month, growth: 0, revenue: monthlyRevenue[month] });
                studentGrowth.push({ month, growth: 0, students: monthlyStudents[month] });
            } else {
                const prevMonth = sortedMonths[index - 1];
                const revGrowth =
                    ((monthlyRevenue[month] - monthlyRevenue[prevMonth]) / monthlyRevenue[prevMonth]) * 100 || 0;
                const studGrowth =
                    ((monthlyStudents[month] - monthlyStudents[prevMonth]) / monthlyStudents[prevMonth]) * 100 || 0;

                revenueGrowth.push({ month, growth: revGrowth.toFixed(2), revenue: monthlyRevenue[month] });
                studentGrowth.push({ month, growth: studGrowth.toFixed(2), students: monthlyStudents[month] });
            }
        });

        let revenuAgragateGrowth = 0;
        let studentAgregateGrowth = 0;

        if (revenueGrowth.length >= 2) {
            const firstRev = revenueGrowth[0].revenue || 0;
            const lastRev = revenueGrowth[revenueGrowth.length - 1].revenue || 0;
            if (firstRev > 0) {
                revenuAgragateGrowth = Number((((lastRev - firstRev) / firstRev) * 100).toFixed(2));
            }
        }

        if (studentGrowth.length >= 2) {
            const firstStud = studentGrowth[0].students || 0;
            const lastStud = studentGrowth[studentGrowth.length - 1].students || 0;
            if (firstStud > 0) {
                studentAgregateGrowth = Number((((lastStud - firstStud) / firstStud) * 100).toFixed(2));
            }
        }



        return res.status(200).json({
            totalCourses,
            totalStudents,
            totalRevenue,
            averageRating,
            revenuAgragateGrowth,
            studentAgregateGrowth,
            trendData,
        });
    } catch (error) {
        console.error("Error fetching dashboard details:", error);
        return res.status(500).json({ message: "Server error" });
    }
};


//all course created by instructor 
export const getAllCoursesByInstructor = async (req, res) => {
    try {
        const userId = req.id;

        //instructor name
        const instructor = await User.findById(userId).select("name");
        const courses = await Course.find({ creator: userId }).populate({ path: "creator", select: "name " });


        //if course not found
        if (!courses) {
            return res.status(404).json({
                message: "Courses not found or you have'nt created courses yet."
            });
        }
        //completion rate for each course,student enrolled ,revenue generated ,recentSales,rating
        let courseData = courses.map(course => {
            const totalEnrollments = course.enrolledStudents.length;
            const totalCompletions = course.completions.length;
            const completionRate = totalEnrollments > 0 ? Math.round((totalCompletions / totalEnrollments) * 100) : 0;
            const revenueGenerated = totalEnrollments * course.coursePrice;
            const averageRating = course.reviews.length > 0
                ? (course.reviews.reduce((sum, r) => sum + r.rating, 0) / course.reviews.length).toFixed(1)
                : 0;
            return {
                id: course._id,
                title: course.courseTitle,
                thumbnail: course.courseThumbnail,
                students: totalEnrollments,
                completion: completionRate,
                revenue: revenueGenerated,
                rating: averageRating,
                reviews: course.reviews.length,
                recentSales: totalEnrollments > 0 ? Math.min(totalEnrollments, 5) : 0,
                isPublished: course.isPublished,

            };
        });


        return res.status(200).json({
            courseData,
            instructorName: instructor.name,
            message: "Courses fetched Successfully"
        });
    } catch (error) {
        console.error("Error fetching courses by instructor:", error);
        return res.status(500).json({ message: "Server error" });
    }
}


//recent transactions


export const getRecentTransactions = async (req, res) => {
    try {
        const userId = req.id;

        // Define the time range: last 5 days
        const days = 5;
        const sinceDate = new Date();
        sinceDate.setDate(sinceDate.getDate() - days);

        const courses = await Course.find({ creator: userId }).populate(
            "enrolledStudents.student",
            "name"
        );

        if (!courses || courses.length === 0) {
            return res.status(404).json({
                message: "No courses found — you haven't created any yet.",
            });
        }

        let transactions = [];

        for (const course of courses) {
            for (const enrollment of course.enrolledStudents) {
                // Filter by last 5 days
                if (enrollment.enrolledAt && enrollment.enrolledAt >= sinceDate) {
                    transactions.push({
                        courseTitle: course.courseTitle,
                        studentName: enrollment.student?.name,
                        enrolledAt: enrollment.enrolledAt,
                        amount: course.coursePrice,
                    });
                }
            }
        }

        // Sort transactions by date descending (newest first)
        transactions.sort((a, b) => b.enrolledAt - a.enrolledAt);

        // Take only the 5 most recent
        transactions = transactions.slice(0, 5);

        // Reverse for ascending order (oldest first)
        transactions = transactions.reverse();

        // Format dates with moment
        transactions = transactions.map((tx) => ({
            ...tx,
            enrolledAt: moment(tx.enrolledAt).fromNow(),
        }));

        return res.status(200).json({
            transactions,
            message: "Recent transactions fetched successfully",
        });
    } catch (error) {
        console.error("Error fetching recent transactions:", error);
        return res.status(500).json({ message: "Server error" });
    }
};


//get course info 
export const getCourseInfo = async (req, res) => {
    try {
        const { courseId } = req.params;

        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        return res.status(200).json({
            course,
            message: "Course info fetched successfully"
        });
    } catch (error) {
        console.error("Error fetching Course info:", error);
        return res.status(500).json({ message: "Server error" });
    }
}


//send weekly digest
export const sendWeeklyDigest = async () => {
    try {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const courses = await Course.find({
            isPublished: true,
            publishedAt: { $gte: oneWeekAgo },
        }).populate("creator");

        if (!courses.length) return;

        const users = await User.find({
            "notificationPreferences.weeklyDigest": true
        });

        await sendWeeklyDigestEmail(users, courses);

    } catch (err) {
        console.error("Error in sending weekly digest:", err);
    }
};











