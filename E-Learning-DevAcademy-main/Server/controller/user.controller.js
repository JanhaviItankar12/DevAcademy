import { User } from "../models/user.model.js"
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import { deleteMedia, uploadMedia } from "../utils/cloudinary.js";
import { Course } from "../models/course.model.js";
import { Certificate } from "../models/certificate.model.js";
import { CourseProgress } from "../models/courseProgress.model.js";
import { sendForgotPasswordEmail, sendReplyEmail } from "../utils/sendEmail.js";
import { generateResetToken } from "../utils/generateResetToken.js";




// Helper function for email validation
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

//register
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const newErrors = {};

    // Name validation
    if (!name || name.trim() === "") {
      newErrors.name = "Name is required";
    } else if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email validation
    if (!email || email.trim() === "") {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!password || password === "") {
      newErrors.password = "Password is required";
    } else {
      // Strong password for signup
      if (password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      } else if (!/[A-Z]/.test(password)) {
        newErrors.password = "Password must contain at least one uppercase letter";
      } else if (!/[a-z]/.test(password)) {
        newErrors.password = "Password must contain at least one lowercase letter";
      } else if (!/[0-9]/.test(password)) {
        newErrors.password = "Password must contain at least one number";
      } else if (!/[^A-Za-z0-9]/.test(password)) {
        newErrors.password = "Password must contain at least one special character";
      }
    }

    // Role validation
    const allowedRoles = ["student", "instructor"];
    if (!role || !allowedRoles.includes(role)) {
      newErrors.role = "Invalid role selected";
    }

    // Return errors if any
    if (Object.keys(newErrors).length > 0) {
      return res.status(400).json({ success: false, errors: newErrors });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const USER = new User({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role,
      isApproved: role === "instructor" ? false : true, // auto approve students
    });

    await USER.save();

    if (role === "instructor") {
      return res.status(201).json({
        success: true,
        message: "Signup successful! Waiting for admin approval.",
      });
    }

    return res.status(201).json({
      success: true,
      message: "User registered successfully!",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to register",
    });
  }
};


// LOGIN
// ---------------------------
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const newErrors = {};

    // Email validation
    if (!email || email.trim() === "") {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation (basic for login)
    if (!password || password === "") {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Role validation
    const allowedRoles = ["student", "instructor", "admin"];
    if (!role || !allowedRoles.includes(role)) {
      newErrors.role = "Invalid role selected";
    }

    // Return validation errors
    if (Object.keys(newErrors).length > 0) {
      return res.status(400).json({ success: false, errors: newErrors });
    }

    // Find user
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
    if (!user) {
      return res.status(400).json({ success: false, message: "Incorrect email" });
    }

    // Password match
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ success: false, message: "Incorrect password" });
    }

    // Role must match
    if (user.role !== role) {
      return res.status(403).json({
        success: false,
        message: "Please select the correct role to login",
      });
    }

    // Instructor rejected
    if (role === "instructor" && user.reject) {
      return res.status(403).json({
        success: false,
        message: "Your account is rejected by admin",
      });
    }

    // Instructor approval pending
    if (role === "instructor" && !user.isApproved) {
      return res.status(403).json({
        success: false,
        message: "Your account is still pending for admin approval",
      });
    }

    // Generate token
    generateToken(res, user, `Welcome back ${user.name}`);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to login" });
  }
};


export const logout = async (_, res) => {
  try {
    return res.status(200).cookie("token", "", { maxAge: 0 }).json({
      message: "Logged out Successfully",
      success: true

    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to Logout"
    });
  }
}


//forogt-password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body.email;

    

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });


    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    if (user.resetLastAttempt && now - user.resetLastAttempt < oneHour) {

      if (user.resetAttempts >= 3) {
        return res.status(429).json({
          message:
            "Too many reset password requests. Please try again after 1 hour.",
        });
      }
    } else {

      user.resetAttempts = 0;
    }


    user.resetAttempts += 1;
    user.resetLastAttempt = now;
    await user.save();


    const token = generateResetToken(user._id);

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    


    const resetLink = `${process.env.frontend_url}/reset-password/${token}`;
    await sendForgotPasswordEmail(email, resetLink);

    return res.json({ message: "Reset link sent to email" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};


export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

   

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    // Strong password validation (allows ANY special character)
    const strongPasswordRegex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

    if (!strongPasswordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long and contain uppercase, lowercase, number, and a special character.",
      });
    }


    // FIXED FIELD NAMES
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.status(200).json({
      message: "Password reset successful. Please login again.",
    });

  } catch (error) {
    console.log("Reset Password Error: ", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};




export const getUserProfile = async (req, res) => {
  try {
    const userId = req.id;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Profile Not Found"
      });

    }
    return res.status(200).json({
      success: true,
      user
    })

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to Load User"
    });
  }
}


export const updateProfile = async (req, res) => {
  try {
    const userId = req.id;
    const { name } = req.body;
    const profilePhoto = req.file;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found"
      });

    }

    const updatedData = {};
    if (name) updatedData.name = name;

    if (profilePhoto) {
      const cloudResponse = await uploadMedia(profilePhoto.path);
      updatedData.photoUrl = cloudResponse.secure_url;

      //extract public id of old image from url if it exist
      if (user.photoUrl) {
        const publicId = user.photoUrl.split("/").pop().split(".")[0]  //extract public id
        await deleteMedia(publicId);
      }
    }



    //upload new photourl
    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true }).select("-password");
    return res.status(200).json({
      success: true,
      user: updatedUser,
      message: "Profile updated Successfully"
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to Update Profile"
    });
  }
}


//get logged in user
export const getCurrentUser = async (req, res) => {
  try {
    return res.status(201).json(
      req.user,
    )
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to fetch current user data"
    });
  }
}


export const studentDashboardData = async (req, res) => {
  try {
    const userId = req.id;

    //  Get user with enrolled courses & certificates
    const user = await User.findById(userId)
      .select("name email photoUrl enrolledCourses certificates")
      .populate({
        path: "enrolledCourses",
        populate: [
          { path: "creator", select: "name" },
          { path: "lectures", select: "_id" }
        ]
      })
      .populate({
        path: "certificates",
        populate: {
          path: "course",
          select: "courseTitle category"
        }
      });

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    //  Get all course progress for user
    const courseProgressList = await CourseProgress.find({ userId });

    //  Build progress map
    const progressMap = {};
    courseProgressList.forEach(cp => {
      const completedLectures = cp.lectureProgress.filter(lp => lp.viewed).length;

      progressMap[cp.courseId.toString()] = {
        completedLectures,
        completed: cp.completed === true
      };
    });

    let enrolledCourses = [];
    let completedCourses = [];
    let totalLecturesAll = 0;
    let completedLecturesAll = 0;

    // Process each enrolled course
    user.enrolledCourses.forEach(course => {
      const courseId = course._id.toString();

      const totalLectures = Array.isArray(course.lectures)
        ? course.lectures.length
        : 0;

      const progressData = progressMap[courseId] || {
        completedLectures: 0,
        completed: false
      };

      const completedCount = progressData.completedLectures;

      const progress = totalLectures > 0
        ? Math.min(
            100,
            Math.round((completedCount / totalLectures) * 100)
          )
        : 0;

      totalLecturesAll += totalLectures;
      completedLecturesAll += completedCount;

      const courseData = {
        _id: course._id,
        courseTitle: course.courseTitle,
        subTitle: course.subTitle,
        category: course.category,
        courseLevel: course.courseLevel,
        coursePrice: course.coursePrice,
        courseThumbnail: course.courseThumbnail || "",
        totalLectures,
        completedLectures: completedCount,
        progress,
        creator: {
          name: course.creator?.name || "Instructor"
        }
      };

      // FINAL & CORRECT COMPLETION CHECK
      if (progressData.completed) {
        completedCourses.push(courseData);
      } else {
        enrolledCourses.push(courseData);
      }
    });

    //  Overall progress (lecture-based)
    const totalProgress =
      totalLecturesAll > 0
        ? Math.round((completedLecturesAll / totalLecturesAll) * 100)
        : 0;

    // Response
    return res.status(200).json({
      success: true,
      data: {
        name: user.name,
        email: user.email,
        photoUrl: user.photoUrl,

        enrolledCourses,
        completedCourses,

        certificates: user.certificates,

        stats: {
          totalEnrolled: enrolledCourses.length + completedCourses.length,
          totalCompleted: completedCourses.length,
          totalCertificates: user.certificates.length,
          totalProgress
        }
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to fetch student dashboard data"
    });
  }
};





//get analytics for student 
export const analytics = async (req, res) => {
  try {
    const userId = req.id;  // from auth middleware
    const { range } = req.query; // week | month | year

    //  Build time filter
    const now = new Date();
    let sinceDate = new Date();

    switch (range) {
      case "week":
        sinceDate.setDate(now.getDate() - 7);
        break;
      case "month":
        sinceDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        sinceDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        sinceDate.setFullYear(now.getFullYear() - 5); // default large range
    }

    //  Fetch Completed Courses within range
    const completedCourses = await Course.find({
      completions: {
        $elemMatch: {
          student: userId,
          completedAt: { $gte: sinceDate }
        }
      }
    })
      .select("courseTitle category completions")
      .populate("creator", "name");

    // Format to include only the matching completion
    const formattedCompleted = completedCourses.map(course => {
      const completion = course.completions.find(
        c => c.student.toString() === userId
      );
      return {
        courseId: course._id,
        courseTitle: course.courseTitle,
        category: course.category,
        completedAt: completion?.completedAt || null,
        creator: course.creator?.name || "Unknown",

        //add completion date

      };
    });

    //  Fetch Certificates within range
    const user = await User.findById(userId)
      .select("certificates")
      .populate({
        path: "certificates",
        populate: { path: "course", select: "courseTitle" }
      });

    const formattedCertificates = user.certificates
      .filter(c => c.issuedAt >= sinceDate)
      .map(c => ({
        certificateId: c._id,
        courseTitle: c.course?.courseTitle || "",
        issuedAt: c.issuedAt,
      }));

    // Final Response
    return res.status(200).json({
      success: true,
      data: {

        completedCourses: formattedCompleted,
        certificates: formattedCertificates
      }
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to fetch analytics data",
    });
  }
};


//get completed courses
export const getCompletedCourses = async (req, res) => {
  try {
    const userId = req.id;

    //  Get user with enrolled courses & certificates
    const user = await User.findById(userId)
      .select("enrolledCourses certificates")
      .populate({
        path: "enrolledCourses",
        populate: [
          { path: "creator", select: "name" },
          { path: "lectures", select: "_id" }
        ]
      })
      .populate({
        path: "certificates",
        populate: {
          path: "course",
          select: "courseTitle category courseThumbnail"
        }
      });

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    //  Get all course progress for user
    const progressList = await CourseProgress.find({ userId });

    //  Build progress map
    const progressMap = {};
    progressList.forEach(cp => {
      const viewedCount = cp.lectureProgress.filter(lp => lp.viewed).length;

      progressMap[cp.courseId.toString()] = {
        viewedCount,
        completed: cp.completed === true
      };
    });

    let completedCourses = [];

    //  Loop through enrolled courses
    user.enrolledCourses.forEach(course => {
      const courseId = course._id.toString();

      const totalLectures = Array.isArray(course.lectures)
        ? course.lectures.length
        : 0;

      const progressData = progressMap[courseId];

      // SCHEMA-CORRECT COMPLETION CHECK
      if (!progressData || !progressData.completed) return;

      const completedCount = progressData.viewedCount;

      //  Find certificate for this course (if exists)
      const certificate = user.certificates.find(
        cert => cert.course?._id?.toString() === courseId
      );

      completedCourses.push({
        courseId: course._id,
        courseTitle: course.courseTitle,
        category: course.category,
        creator: course.creator?.name || "Instructor",
        courseThumbnail: course.courseThumbnail || "",

        totalLectures,
        completedLectures: completedCount,

        completedAt: certificate?.issuedAt || null,
        formattedCompletedAt: certificate?.issuedAt
          ? new Date(certificate.issuedAt).toLocaleDateString("en-GB")
          : null,

        certificate: certificate
          ? {
              certificateId: certificate.certificateId,
              issuedAt: certificate.issuedAt,
              formattedIssuedAt: new Date(certificate.issuedAt).toLocaleDateString("en-GB"),
              courseTitle: certificate.course?.courseTitle,
              category: certificate.course?.category,
              courseThumbnail: certificate.course?.courseThumbnail
            }
          : null
      });
    });

    // Response
    return res.status(200).json({
      success: true,
      data: completedCourses
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to fetch completed courses"
    });
  }
};


//all instructor
export const allInstructors = async (req, res) => {
  try {
    const instructors = await User.aggregate([
      { $match: { role: "instructor" } }, // Only instructors
      {
        $lookup: {
          from: "courses",          
          localField: "_id",
          foreignField: "creator",
          as: "courses"
        }
      },
      {
        $addFields: {
          totalCourses: { $size: "$courses" },
          totalStudents: {
            $sum: { $map: { input: "$courses", as: "c", in: { $size: "$$c.enrolledStudents" } } }
          },
          avgRating: {
            $avg: {
              $map: {
                input: "$courses",
                as: "c",
                in: {
                  $cond: [
                    { $gt: [{ $size: "$$c.reviews" }, 0] },
                    { $avg: "$$c.reviews.rating" },
                    null
                  ]
                }
              }
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          photoUrl: 1,
          totalStudents: 1,
          totalCourses: 1,
          avgRating: 1
        }
      }
    ]);

    return res.status(200).json({
      success: true,
      count: instructors.length,
      instructors
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch instructors"
    });
  }
};




// Follow or Unfollow an instructor
export const toggleFollowInstructor = async (req, res) => {
  try {
    const studentId = req.id; 
    const { instructorId } = req.params;

    if (!instructorId) {
      return res.status(400).json({ success: false, message: "Instructor ID is required" });
    }

    const student = await User.findById(studentId);

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const isFollowing = student.followingInstructors?.includes(instructorId);

    if (isFollowing) {
      
      student.followingInstructors = student.followingInstructors.filter(
        id => id.toString() !== instructorId
      );
    } else {
     
      student.followingInstructors = [...(student.followingInstructors || []), instructorId];
    }

    await student.save();

    return res.status(200).json({
      success: true,
      message: isFollowing ? "Instructor unfollowed" : "Instructor followed",
      followingInstructors: student.followingInstructors
    });

  } catch (error) {
    console.error("Toggle follow error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


export const updateNotificationPreferences = async (req, res) => {
  try {
    const userId = req.id;
    const { notificationPreferences } = req.body;

    

    let preferences = {};

    // CASE 1 — if no object or empty object {}
    if (!notificationPreferences || Object.keys(notificationPreferences).length === 0) {
      preferences = {
        newCourse: true,
        weeklyDigest: true,
        followedInstructor: true,
        noMails: false,
      };
    } else {
      // CASE 2 — update based on object
      preferences = {
        newCourse: notificationPreferences.newCourse || false,
        weeklyDigest: notificationPreferences.weeklyDigest || false,
        followedInstructor: notificationPreferences.followedInstructor || false,
        noMails: notificationPreferences.noMails || false,
      };
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { notificationPreferences: preferences },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Preferences updated successfully",
      preferences: updatedUser.notificationPreferences,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};





