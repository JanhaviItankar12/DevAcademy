import { User } from "../models/user.model.js"
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import { deleteMedia, uploadMedia } from "../utils/cloudinary.js";
import { Course } from "../models/course.model.js";
import {Certificate} from "../models/certificate.model.js";




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

    const user = await User.findById(userId)
      .select("name email photoUrl enrolledCourses certificates")
      .populate({
        path: "enrolledCourses",
        populate: [
          { path: "creator", select: "name" },
          { path: "lectures", select: "_id" },
          { path: "completions", select: "student" }
        ]
      })
      .populate({
        path: "certificates",
        populate: { path: "course", select: "courseTitle category" }
      });

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    let enrolledCourses = [];
    let completedCourses = [];
    let totalLecturesAll = 0;
    let completedLecturesAll = 0;

    user.enrolledCourses.forEach(course => {
      const totalLectures = course.lectures.length;

      const completedCount = course.completions.filter(
        c => c.student.toString() === userId
      ).length;

      const progress = totalLectures
        ? Math.round((completedCount / totalLectures) * 100)
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
        creator: { name: course.creator?.name || "Instructor" },
       
      };

      if (completedCount === totalLectures && totalLectures > 0) {
        completedCourses.push(courseData);
      } else {
        enrolledCourses.push(courseData);
      }
    });

    // Total progress = based on lectures
    const totalProgress =
      totalLecturesAll > 0
        ? Math.round((completedLecturesAll / totalLecturesAll) * 100)
        : 0;

    return res.status(200).json({
      success: true,
      data: {
        name: user.name,
        email: user.email,
        photoUrl: user.photoUrl,

        // The structure your frontend expects:
        enrolledCourses,        // NOT completed
        
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
    console.log(error);
    return res.status(500).json({
      message: "Failed to fetch student dashboard data",
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

    const user = await User.findById(userId)
      .select("enrolledCourses certificates")
      .populate({
        path: "enrolledCourses",
        populate: [
          { path: "creator", select: "name" },
          { path: "lectures", select: "_id" },
          { path: "completions", select: "student completedAt" }
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

    let completedCourses = [];

    user.enrolledCourses.forEach(course => {
      const totalLectures = course.lectures.length;

      // How many lectures this user completed?
      const completedCount = course.completions.filter(
        c => c.student.toString() === userId
      ).length;

      // Only add fully completed courses
      if (totalLectures > 0 && completedCount === totalLectures) {
        const completion = course.completions.find(
          c => c.student.toString() === userId
        );

        const certificate = user.certificates.find(
          cert => cert.course?._id?.toString() === course._id.toString()
        );

        completedCourses.push({
          courseId: course._id,
          courseTitle: course.courseTitle,
          category: course.category,
          creator: course.creator?.name || "Instructor",
          courseThumbnail: course.courseThumbnail || "",
          completedAt: completion?.completedAt || null,
          formattedCompletedAt: completion?.completedAt
            ? new Date(completion.completedAt).toLocaleDateString("en-GB")
            : null,

          certificate: certificate
            ? {
                certificateId: certificate.certificateId,
                issuedAt: certificate.issuedAt,
                formattedIssuedAt: new Date(certificate.issuedAt).toLocaleDateString("en-GB"),
                courseTitle: certificate.course?.courseTitle,
                category: certificate.course?.category
              }
            : null
        });
      }
    });

    return res.status(200).json({
      success: true,
      data: completedCourses
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to fetch completed courses",
    });
  }
};


