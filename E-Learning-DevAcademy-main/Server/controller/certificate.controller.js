
import { Certificate } from "../models/certificate.model.js";
import { Course } from "../models/course.model.js";
import { User } from "../models/user.model.js";
import { generateCertificate } from "../utils/generateCertificate.js";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";


export const issueCertificate = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    // 1. Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found!",
      });
    }

    // 2. Check if user has completed the course
    const completed = course.completions.some(
      (c) => c.student.toString() === userId.toString()
    );

    if (!completed) {
      return res.status(400).json({
        success: false,
        message: "You cannot receive a certificate — course not completed!",
      });
    }

    // 3. Check if certificate already exists
    const existing = await Certificate.findOne({
      user: userId,
      course: courseId,
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        message: "Certificate already issued!",
        certificate: existing,
      });
    }

    // 4. Generate unique ID
    const certificateId = uuidv4();

    // 5. Generate PDF Certificate
    const pdfPath = await generateCertificate(
      req.user.name,
      course.courseTitle,
      certificateId,
      course.creator?.name || "Instructor"
    );

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/certificates/${certificateId}.pdf`;

    // 6. Save certificate in DB
    const certificate = await Certificate.create({
      user: userId,
      course: courseId,
      certificateId,
      url: fileUrl,
    });

    await User.findByIdAndUpdate(userId, {
      $push: { certificates: certificate._id },
    });

    return res.status(201).json({
      success: true,
      message: "Certificate issued successfully!",
      certificate: {
    certificateId: certificate.certificateId
  }
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error while issuing certificate!",
    });
  }
};


//download certificate
export const downloadCertificate = async (req, res) => {
  try {
    const userId = req.id;
    const { certificateId } = req.params;

    const user = await User.findById(userId)
      .populate({
        path: "certificates",
        select: "certificateId course issuedAt"
      })
      .select("certificates");

    if (!user) return res.status(404).json({ message: "User not found!" });

    const certificate = user.certificates.find(
      cert => cert.certificateId?.toString().trim() === certificateId.toString().trim()
    );

    if (!certificate) return res.status(404).json({ message: "Certificate not found!" });
const filePath = path.join(
  process.cwd(),
  "Server",
  "uploads",
  "certificates",
  `${certificateId}.pdf`
);

    

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Certificate file not found on server!" });
    }

    res.setHeader("Content-Disposition", `attachment; filename=${certificateId}.pdf`);
    res.setHeader("Content-Type", "application/pdf");

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to download certificate." });
  }
};


