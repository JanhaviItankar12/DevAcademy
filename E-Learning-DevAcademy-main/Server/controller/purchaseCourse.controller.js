import Razorpay from 'razorpay';
import crypto from 'crypto';
import { CoursePurchase } from '../models/purchaseCourse.model.js';
import { Lecture } from '../models/lecture.model.js';
import { User } from '../models/user.model.js';
import { Course } from '../models/course.model.js';
import jwt from "jsonwebtoken";


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_SECRET_KEY
});

//create order on razorpay
export const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount * 100,  //amt in paise
      currency: "INR",
      receipt: "receipt_order_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);
    return res.status(200).json(order);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to create order"
    });
  }
}

//verify payment signature
export const verifyOrder = async (req, res) => {
  try {
    const userId = req.id;
    const { courseId } = req.params;
    const { response, amount } = req.body;

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = response;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
      .update(sign.toString())
      .digest("hex");

    if (expectedSign.trim() === razorpay_signature.trim()) {

      //store in db
      await CoursePurchase.create({
        courseId,
        userId,
        amount,
        status: "completed",
        paymentId: razorpay_payment_id
      });


      const purchase = await CoursePurchase.findOne({
        courseId,
        userId
      }).populate("courseId");


      if (!purchase) {
        return res.status(404).json({ message: "Purchase not found" });
      }

      //set all lectures granted of course-set isPreviewFree is true
      if (purchase.courseId && purchase.courseId.lectures.length > 0) {
        await Lecture.updateMany(
          { _id: { $in: purchase.courseId.lectures } },
          { $set: { isPreviewFree: true } }
        )
      }
      await purchase.save();

      //update User enrolledCourses
      await User.findByIdAndUpdate(
        purchase.userId,
        { $addToSet: { enrolledCourses: purchase.courseId._id } }, //Add course id to enrolledCourses
        { new: true }
      );

      // update course to add user id to enrolledStudents
      await Course.findByIdAndUpdate(
        purchase.courseId._id,
        {
          $addToSet: {
            enrolledStudents: {
              student: purchase.userId,
              enrolledAt: new Date()
            }
          }
        }, //add userid to enrolledStudents
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: "Payment verified and course grant access",
      });

    } else {
      return res.status(400).json({
        success: false,
        message: "Payment not verified",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify order"
    });
  }

}

export const getCourseDetailWithPurchaseStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    let userId = null;

    // Read token
    const token = req.cookies.token;
    if (token) {
      const decoded = jwt.verify(token, process.env.secret_key);
      userId = decoded.userId;
    }

    // Fetch course with ALL lecture titles + isPreviewFree
    const course = await Course.findById(courseId)
      .populate({ path: "creator" })
      .populate({
        path: "lectures",
        select: "lectureTitle isPreviewFree videoUrl",  // include videoUrl
      });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Find preview lecture
    const previewLecture = course.lectures.find(l => l.isPreviewFree) || null;

    let purchased = false;
    if (userId) {
      const purchasedDoc = await CoursePurchase.findOne({ userId, courseId });
      purchased = !!purchasedDoc;
    }

    return res.status(200).json({
      course,
      purchased,
      previewLecture, // <-- send only preview lecture details
      previewVideoUrl: previewLecture?.videoUrl || null // <-- send only videoUrl
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to get CourseDetail with Purchase Status"
    });
  }
};


export const getAllPurchasedCourses = async (_, res) => {
  try {
    const purchasedCourses = await CoursePurchase.find({ status: "completed" }).populate("courseId");

    if (!purchasedCourses) {
      return res.status(404).json({
        message: "Purchased Courses not found"
      })
    }

    return res.status(200).json({
      purchasedCourses
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to get All purchase Courses."
    });
  }
}

