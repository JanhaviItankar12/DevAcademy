import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateCertificate = async (
  username,
  courseTitle,
  certificateId,
  creatorName = "DevAcademy Team"
) => {
  return new Promise(async (resolve, reject) => {
    try {
    
     const dirPath = path.join(
  process.cwd(),
  "Server",
  "uploads",
  "certificates"
);




      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      const filePath = path.join(dirPath, `${certificateId}.pdf`);

      // Convert SVG to PNG for PDF compatibility
      const logoSvgPath = path.join(__dirname, "public", "logo.svg");
      const logoPngPath = path.join(dirPath, "temp-logo.png");

      let logoExists = false;
      if (fs.existsSync(logoSvgPath)) {
        try {
          await sharp(logoSvgPath)
            .resize(100, 100)
            .png()
            .toFile(logoPngPath);
          logoExists = true;
        } catch (err) {
          console.error("Error converting SVG to PNG:", err);
        }
      }

      const doc = new PDFDocument({
        layout: "landscape",
        size: "A4",
        margin: 0
      });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;

      // Clean white background
      doc.rect(0, 0, pageWidth, pageHeight).fill("#FFFFFF");

      // Subtle corner accents
      doc.opacity(0.08);
      doc.circle(0, 0, 120).fill("#7C3AED");
      doc.circle(pageWidth, 0, 120).fill("#3B82F6");
      doc.circle(0, pageHeight, 120).fill("#3B82F6");
      doc.circle(pageWidth, pageHeight, 120).fill("#7C3AED");
      doc.opacity(1);

      // Main border - elegant and minimal
      doc.roundedRect(40, 40, pageWidth - 80, pageHeight - 80, 8)
        .lineWidth(3)
        .stroke("#7C3AED");

      // Inner border - subtle accent
      doc.roundedRect(50, 50, pageWidth - 100, pageHeight - 100, 6)
        .lineWidth(1)
        .stroke("#D8B4FE");

      // Logo - centered at top
      if (logoExists && fs.existsSync(logoPngPath)) {
        doc.image(logoPngPath, pageWidth / 2 - 35, 75, { width: 70, height: 70 });
      }

      // Company name
      doc.fontSize(16)
        .fillColor("#7C3AED")
        .font("Helvetica-Bold")
        .text("DevAcademy", 0, 160, { align: "center", width: pageWidth });

      // Subtle divider line
      doc.moveTo(pageWidth / 2 - 80, 180)
        .lineTo(pageWidth / 2 + 80, 180)
        .lineWidth(1)
        .strokeOpacity(0.2)
        .stroke("#7C3AED");
      doc.strokeOpacity(1);

      // Title
      doc.fontSize(36)
        .fillColor("#1F2937")
        .font("Helvetica-Bold")
        .text("Certificate of Completion", 0, 200, { align: "center", width: pageWidth });

      // Subtitle
      doc.fontSize(14)
        .fillColor("#6B7280")
        .font("Helvetica")
        .text("This is to certify that", 0, 260, { align: "center", width: pageWidth });

      // Student name - elegant underline
      doc.fontSize(28)
        .fillColor("#1F2937")
        .font("Helvetica-Bold")
        .text(username, 0, 290, { align: "center", width: pageWidth });

      // Underline for name
      doc.moveTo(pageWidth / 2 - 180, 325)
        .lineTo(pageWidth / 2 + 180, 325)
        .lineWidth(1.5)
        .stroke("#7C3AED");

      // Completion text
      doc.fontSize(14)
        .fillColor("#6B7280")
        .font("Helvetica")
        .text("has successfully completed the course", 0, 350, { align: "center", width: pageWidth });

      // Course name
      doc.fontSize(20)
        .fillColor("#3B82F6")
        .font("Helvetica-Bold")
        .text(courseTitle, 0, 380, { align: "center", width: pageWidth });

      // Underline for course
      doc.moveTo(pageWidth / 2 - 200, 408)
        .lineTo(pageWidth / 2 + 200, 408)
        .lineWidth(1)
        .strokeOpacity(0.3)
        .stroke("#3B82F6");
      doc.strokeOpacity(1);

      // Bottom section
      const bottomY = 470;

      // Date - left side
      doc.fontSize(10)
        .fillColor("#9CA3AF")
        .font("Helvetica")
        .text("Date of Completion", 90, bottomY - 5);

      const currentDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      doc.fontSize(11)
        .fillColor("#374151")
        .font("Helvetica-Bold")
        .text(currentDate, 90, bottomY + 10);

      // Signature section - right side
      const signX = pageWidth - 270;

      // Signature image
      const signPath = path.join(__dirname, "public", "sign.png");
      if (fs.existsSync(signPath)) {
        doc.image(signPath, signX + 15, bottomY - 30, { width: 130, height: 40 });
      }

      // Signature line
      doc.moveTo(signX, bottomY + 15)
        .lineTo(signX + 160, bottomY + 15)
        .lineWidth(1)
        .stroke("#D1D5DB");

      // Admin name
      doc.fontSize(12)
        .fillColor("#1F2937")
        .font("Helvetica-Bold")
        .text(creatorName, signX, bottomY + 23, { width: 160, align: "center" });

      // Admin title
      doc.fontSize(9)
        .fillColor("#6B7280")
        .font("Helvetica")
        .text("Program Director", signX, bottomY + 38, { width: 160, align: "center" });

      // Certificate ID - bottom center, very subtle
      doc.fontSize(8)
        .fillColor("#D1D5DB")
        .font("Helvetica")
        .text(`Certificate ID: ${certificateId}`, 0, pageHeight - 35, {
          align: "center",
          width: pageWidth
        });

      // End PDF
      doc.end();

      stream.on("finish", () => {
        // Clean up temporary PNG file
        if (logoExists && fs.existsSync(logoPngPath)) {
          try {
            fs.unlinkSync(logoPngPath);
          } catch (err) {
            console.error("Error deleting temp logo:", err);
          }
        }
        resolve(filePath);
      });

      stream.on("error", reject);

    } catch (err) {
      reject(err);
    }
  });
};