import mongoose from "mongoose";
import { Course } from "../models/course.model.js";
import { User } from "../models/user.model.js";
import { Message } from "../models/message.model.js";
import { Certificate } from "../models/certificate.model.js";
import { sendInstructorApprovalEmail, sendInstructorRejectionEmail, sendReplyEmail } from "../utils/sendEmail.js";


const generateDateLabels = (range) => {
  const labels = [];
  const today = new Date();

  if (range === "year") {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months;
  }

  // For month → last 30 days
  if (range === "month") {
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      labels.push(`${d.getDate()} ${d.toLocaleString("en-US", { month: "short" })}`);
    }
    return labels;
  }

  // For week → last 7 days
  if (range === "week") {
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      labels.push(`${d.getDate()} ${d.toLocaleString("en-US", { month: "short" })}`);
    }
    return labels;
  }
};

const formatLabel = (date, range) => {
  if (range === "year") {
    return date.toLocaleString("en-US", { month: "short" }); // Jan, Feb...
  }

  // Month/Week → show day + month (3 Dec)
  return `${date.getDate()} ${date.toLocaleString("en-US", { month: "short" })}`;
};


const generateRevenueData = (courses, range) => {
  const labels = generateDateLabels(range);
  const revenueMap = {};

  labels.forEach(l => (revenueMap[l] = 0));

  courses.forEach(course => {
    const price = course.coursePrice;

    if (Array.isArray(course.enrolledStudents)) {
      course.enrolledStudents.forEach(stu => {
        const date = new Date(stu.enrolledAt);
        const label = formatLabel(date, range);

        if (revenueMap[label] !== undefined) {
          revenueMap[label] += price;
        }
      });
    }
  });

  return labels.map(label => ({
    date: label,
    revenue: revenueMap[label]
  }));
}


export const adminDashboard = async (req, res) => {
  try {

    const { range } = req.query;

    // Validate range parameter
    if (!['week', 'month', 'year'].includes(range)) {
      return res.status(400).json({ error: 'Invalid range parameter' });
    }


    const courses = await Course.find();

    const chartData = generateRevenueData(courses, range);
    const Revenue = chartData.reduce((sum, item) => sum + item.revenue, 0);


    const totalCourses = courses.length;
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalInstructors = await User.countDocuments({ role: "instructor" });
    const totalRevenue = courses.reduce((acc, course) => acc + (course.enrolledStudents.length * course.coursePrice), 0);
    const completions = courses.reduce((acc, course) => acc + course.completions.length, 0);

    //calculate completion rate among all courses
    const completionRate = totalCourses > 0 ? (completions / courses.reduce((acc, course) => acc + course.enrolledStudents.length, 0)) * 100 : 0;

    //active courses and inactive courses
    const activeCourses = await Course.countDocuments({ isPublished: true });
    const inactiveCourses = await Course.countDocuments({ isPublished: false });

    //platofrm growth in term revenue and students in cuurent  month than last month
    const currentDate = new Date();
    const lastMonthDate = new Date();
    lastMonthDate.setMonth(currentDate.getMonth() - 1);
    const revenueThisMonth = await Course.aggregate([
      {
        $unwind: "$enrolledStudents"
      },
      {
        $match: {
          "enrolledStudents.enrolledAt": {
            $gte: lastMonthDate,
            $lt: currentDate
          }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$coursePrice" }
        }
      }
    ]);

    const revenueLastMonth = await Course.aggregate([
      {
        $unwind: "$enrolledStudents"
      },
      {
        $match: {
          "enrolledStudents.enrolledAt": {
            $gte: new Date(lastMonthDate.getFullYear(), lastMonthDate.getMonth() - 1, 1),
            $lt: lastMonthDate
          }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$coursePrice" }
        }
      }
    ]);

    const studentsThisMonth = await User.countDocuments({
      role: "student",
      createdAt: {
        $gte: lastMonthDate,
        $lt: currentDate
      }
    });

    const studentsLastMonth = await User.countDocuments({
      role: "student",
      createdAt: {
        $gte: new Date(lastMonthDate.getFullYear(), lastMonthDate.getMonth() - 1, 1),
        $lt: lastMonthDate
      }
    });

    const calculateGrowth = (current, last) => {
      if (last === 0) { return current > 0 ? 100 : 0; } let growth = ((current - last) / last) * 100; // limit 0–100 range
      growth = Math.min(Math.max(growth, 0), 100); return growth.toFixed(2);
    };

    const studentGrowth = calculateGrowth(studentsThisMonth, studentsLastMonth);

    const revenueGrowth = calculateGrowth(
      revenueThisMonth[0]?.totalRevenue || 0,
      revenueLastMonth[0]?.totalRevenue || 0
    );

  









    //top selling courses  on the basis of their enrolled students
    const topSellingCourses = await Course.find().sort({ enrolledStudents: -1 }).limit(5)
      .lean();


    //send topsellingCourses coursetitle and enrolled students count and revenue
    const topCourses = topSellingCourses.map(course => {
      const enrolled = Array.isArray(course.enrolledStudents) ? course.enrolledStudents : [];
      const reviews = Array.isArray(course.reviews) ? course.reviews : [];

      const totalReviews = reviews.length;
      const avgRating = totalReviews > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1) : "0.0";
      return {
        courseTitle: course.courseTitle,
        enrolledStudents: enrolled.length,
        revenue: enrolled.length * (course.coursePrice || 0),
        rating: avgRating,
        enrolledStudents: enrolled,
        completions: Array.isArray(course.completions) ? course.completions : [],
        courseThumbnail:course.courseThumbnail
      }

    });

  



    //top courses by completion category
    const completionCategories = topCourses.map(course => {


      //calculate percentage
      const totalEnrollments = Array.isArray(course.enrolledStudents) ? course.enrolledStudents.length : 0;
      const completionRate = Array.isArray(course.completions) ? course.completions.length : 0;
      const uncompletionRate = totalEnrollments - completionRate;

      // calculate percentages
      const completedRate = totalEnrollments > 0 ? (completionRate / totalEnrollments) * 100 : 0;
      const uncompletedRate = totalEnrollments > 0 ? (uncompletionRate / totalEnrollments) * 100 : 0;

      return {
        category: course.courseTitle,
        completed: parseFloat(completedRate.toFixed(1)),
        uncompleted: parseFloat(uncompletedRate.toFixed(1))
      };
    });


    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28); // last 4 weeks

    function getISOWeek(date) {
      const temp = new Date(date.getTime());
      temp.setHours(0, 0, 0, 0);
      temp.setDate(temp.getDate() + 3 - ((temp.getDay() + 6) % 7));
      const week1 = new Date(temp.getFullYear(), 0, 4);
      return 1 + Math.round(((temp - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
    }

    function getISOWeekYear(date) {
      const temp = new Date(date.getTime());
      temp.setDate(temp.getDate() + 3 - ((temp.getDay() + 6) % 7));
      return temp.getFullYear();
    }

    // Last 4 ISO weeks
    const weeks = [];
    for (let i = 3; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i * 7);
      weeks.push({
        week: getISOWeek(d),
        year: getISOWeekYear(d),
        label: `Week ${i + 1}`
      });
    }

    // Pipeline same...
    const pipeline = [
      { $match: { createdAt: { $gte: fourWeeksAgo } } },
      {
        $project: {
          role: 1,
          isoWeek: { $isoWeek: "$createdAt" },
          isoYear: { $isoWeekYear: "$createdAt" }
        }
      },
      {
        $group: {
          _id: { role: "$role", week: "$isoWeek", year: "$isoYear" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.week": 1 } }
    ];

    const result = await User.aggregate(pipeline);

    // Initialize trends
    const studentTrends = weeks.map(w => ({ week: w.label, count: 0 }));
    const instructorTrends = weeks.map(w => ({ week: w.label, count: 0 }));

    // Fill counts
    result.forEach(item => {
      const weekIndex = weeks.findIndex(
        w => w.week === item._id.week && w.year === item._id.year
      );

      if (weekIndex !== -1) {
        if (item._id.role === "student")
          studentTrends[weekIndex].count = item.count;

        if (item._id.role === "instructor")
          instructorTrends[weekIndex].count = item.count;
      }
    });

    const enrollmentData = studentTrends.map((s, index) => ({
      week: s.week,
      students: s.count,
      instructors: instructorTrends[index].count
    }));




    const usageData = {
      active: totalCourses > 0 ? parseFloat(((activeCourses / totalCourses) * 100).toFixed(1)) : 0,
      inactive: totalCourses > 0 ? parseFloat(((inactiveCourses / totalCourses) * 100).toFixed(1)) : 0
    };

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const studentThisMonth = await User.countDocuments({
      role: "student",
      createdAt: { $gte: startOfMonth }
    });

    const instructorsThisMonth = await User.countDocuments({
      role: "instructor",
      createdAt: { $gte: startOfMonth }
    });


    // Total certificates
    const certificatesCount = await Certificate.countDocuments();

    // Certificates issued in current month
    const now = new Date();
    const startOfmonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const certificatesThisMonth = await Certificate.countDocuments({
      createdAt: { $gte: startOfmonth, $lt: endOfMonth }
    });














    return res.status(200).json({
      message: "Admin Dashboard Data Fetched Successfully",
      success: true,
      data: {
        totalCourses,
        totalStudents,
        totalInstructors,
        totalRevenue,
        activeCourses,
        inactiveCourses,
        revenueGrowth: Math.round(revenueGrowth * 100) / 100,
        studentGrowth: Math.round(studentGrowth * 100) / 100,
        chartData,
        Revenue,

       
        completionCategories,
        enrollmentData,
        completionRate: Math.round(completionRate * 100) / 100,
        usageData,
        studentThisMonth,
        instructorsThisMonth,
        totalCertificates: certificatesCount,
        certificatesThisMonth
      }
    });



  } catch (error) {
    console.error("❌ Error in adminDashboard:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,

    });
  }
}

export const topCourses = async (req, res) => {
  try {
    const topCourses = await Course.aggregate([
      {
        $addFields: {
          enrolledCount: { $size: { $ifNull: ["$enrolledStudents", []] } },
          reviewCount: { $size: { $ifNull: ["$reviews", []] } }
        }
      },
      {
        $addFields: {
          rating: {
            $cond: [
              { $gt: ["$reviewCount", 0] },
              { $round: [{ $avg: "$reviews.rating" }, 1] },
              0
            ]
          }
        }
      },
      {
        $sort: { enrolledCount: -1 }
      },
      {
        $limit: 5
      },
      {
        $project: {
          courseTitle: 1,
          enrolledCount: 1,
          revenue: {
            $multiply: ["$enrolledCount", { $ifNull: ["$coursePrice", 0] }]
          },
          rating: 1,
          completions: { $ifNull: ["$completions", []] },
          courseThumbnail: 1
        }
      }
    ]);

    return res.status(200).json({
      success: true,
      message: "Top courses fetched",
      topCourses
    });

  } catch (error) {
    console.error("❌ Error in fetching top courses:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};



export const topInstructors=async(req,res)=>{
  try {

     //top instructor on the basis of their course sales
    const topInstructors = await User.aggregate([
      {
        $match: { role: "instructor" }
      },

      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "creator", // <–– FIXED
          as: "courses"
        }
      },

      {
        $project: {
          name: 1,
          email: 1,
          photoUrl:1,

          // Total courses created
          totalCourses: {
            $size: { $ifNull: ["$courses", []] }
          },

          // Total enrolled students across all courses
          totalEnrolledStudents: {
            $sum: {
              $map: {
                input: { $ifNull: ["$courses", []] },
                as: "course",
                in: {
                  $size: { $ifNull: ["$$course.enrolledStudents", []] }
                }
              }
            }
          },

          // Revenue = sum(enrolledStudents * price)
          revenue: {
            $sum: {
              $map: {
                input: { $ifNull: ["$courses", []] },
                as: "course",
                in: {
                  $multiply: [
                    {
                      $size: { $ifNull: ["$$course.enrolledStudents", []] }
                    },
                    {
                      $ifNull: ["$$course.coursePrice", 0]
                    }
                  ]
                }
              }
            }
          }
        }
      },

      { $sort: { totalEnrolledStudents: -1 } },
      { $limit: 5 }
    ]);

    return res.status(200).json({
      message:"Top instructors data fetched successfully",
      topInstructors
    });


    
  } catch (error) {
    console.error("❌ Error in adminData:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,

    });
  }
}


export const getadminData = async (req, res) => {
  try {
    const userId = req.id;

    const admin = await User.findById(userId);

    if (!admin) {
      return res.status(404).json({
        message: "admin not found!",
        success: false
      })
    }

    return res.status(200).json({
      admin
    });


  } catch (error) {
    console.error("❌ Error in adminData:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,

    });
  }
}


//mange all users and instructor
export const manageUser = async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .select("name email createdAt photoUrl");

    const instructors = await User.find({ role: "instructor" })
      .select("name email createdAt isApproved reject photoUrl");

    const approvedInstructors = instructors.filter(u => u.isApproved === true && u.reject === false);
    const rejectedInstructors = instructors.filter(u => u.reject === true);
    const unapprovedInstructors = instructors.filter(u => u.isApproved === false && u.reject === false);

    return res.status(200).json({
      success: true,
      message: "User data fetched successfully",

      students,
      instructors: {
        approved: approvedInstructors,
        rejected: rejectedInstructors,
        pending: unapprovedInstructors
      }
    });

  } catch (error) {
    console.error("❌ Error in fetching all user data:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,

    });
  }
}


//approve instructors
export const approveInstructor = async (req, res) => {
  try {
    const { instructorId } = req.params;

    const user = await User.findByIdAndUpdate(
      instructorId,
      { isApproved: true, reject: false, approvedAt: Date.now() },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Send email
    await sendInstructorApprovalEmail(user.email, user.name);

    return res.status(200).json({
      success: true,
      message: "Instructor approved successfully"
    });

  } catch (error) {
    console.error("Approve error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};



export const rejectInstructor = async (req, res) => {
  try {
    const { instructorId } = req.params;

    const user = await User.findByIdAndUpdate(
      instructorId,
      { reject: true, isApproved: false, rejectedAt: Date.now() },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await sendInstructorRejectionEmail(user.email,user.name);

    return res.status(200).json({
      success: true,
      message: "Instructor rejected successfully",
      user
    });

  } catch (error) {
    console.error("Reject error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


//mange courses
export const manageCourses = async (req, res) => {
  try {
    const courses = await Course.find({})
      .populate("creator", "name email")
      .populate("enrolledStudents.student", "name email")
      .populate("reviews.student", "name");

    const formatted = courses.map(c => ({
      _id: c._id,
      courseTitle: c.courseTitle,
      subTitle: c.subTitle,
      category: c.category,
      courseLevel: c.courseLevel,
      coursePrice: c.coursePrice,
      courseThumbnail: c.courseThumbnail,
      creator: c.creator,
      isPublished: c.isPublished,
      createdAt: c.createdAt,

      stats: {
        totalStudents: c.enrolledStudents.length,
        totalLectures: c.lectures.length,
        totalReviews: c.reviews.length,
        averageRating:
          c.reviews.length > 0
            ? (c.reviews.reduce((acc, r) => acc + r.rating, 0) / c.reviews.length).toFixed(1) : 0,

      }
    }));

    return res.status(200).json({
      success: true,
      courses: formatted
    });

  } catch (error) {
    console.error("Error in fetching courses...:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}


//user send a message to admin
export const createMessage = async (req, res) => {
  try {
    const { name, email, category, subject, message } = req.body;

    // 1. Required field validation
    if (!name || !email || !category || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // 2. Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
      });
    }

    // 3. Category validation
    const allowedCategories = ["general", "technical", "instructor", "feedback"];
    if (!allowedCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category",
      });
    }

    //  4. Length validation (prevents spam / garbage input)
    if (name.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 2 characters",
      });
    }

    if (subject.length < 5) {
      return res.status(400).json({
        success: false,
        message: "Subject must be at least 5 characters",
      });
    }

    if (message.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Message must be at least 10 characters",
      });
    }

    // 🔹 5. Create message
    const newMessage = await Message.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      category,
      subject: subject.trim(),
      message: message.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: newMessage,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

//delete message
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const deletedMessage = await Message.findByIdAndDelete(messageId);

    if (!deletedMessage) {
      return res.status(404).json({
        success: false,
        message: "Message not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully"
    });

  } catch (error) {
    console.error("Delete Message Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

// Mark message as read
export const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { replyMessage } = req.body;

    // find message first
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

     if (replyMessage.length < 5) {
      return res.status(400).json({
        success: false,
        message: "Subject must be at least 5 characters",
      });
    }
    

    // mark as read
    const updated = await Message.findByIdAndUpdate(
      messageId,
      { isRead: true },
      { new: true }
    );

    // send reply email
    await sendReplyEmail(message.email, message.name, replyMessage);

    return res.status(200).json({
      success: true,
      message: "Message marked as read & reply email sent",
      data: updated,
    });

  } catch (error) {
    console.error("markAsRead Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};




