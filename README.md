🎓 DevAcademy

DevAcademy is a full-stack EdTech platform built using the MERN stack, focused on real-world workflows like instructor onboarding, secure payments, email notifications, analytics, and certification.

🌐 Live Website: [https://devacademy-silk.vercel.app]
📂 GitHub: This repository

You can explore admin portal through this credentials
devacademy122025@gmail.com
credential-devAcademy@#25

🚀 Features

Role-based access: Admin | Instructor | Student

Instructor signup with admin approval / rejection

Student login (Email + Google OAuth)

Razorpay payments (course access after payment)

Email notifications using Brevo

Notification preferences (new courses, followed instructors, weekly digest)

Inquiry & support system (guest + logged-in users)

Course & revenue analytics dashboards

Certificate generation after 100% course completion

Secure password reset with rate limiting & IP protection

Media management with Cloudinary

🛠 Tech Stack

MERN | ShadCn UI | MongoDB | Brevo | Razorpay | Cloudinary | Google OAuth

## 🏗 System Architecture

Client (React + ShadCn UI)
        ↓
Express.js REST API
        ↓
MongoDB Database
        ↓
External Services:
- Razorpay (Payments)
- Brevo (Emails)
- Cloudinary (Media Storage)
- Google OAuth (Authentication)

## 🗄 Database Design

- User Schema (Role-based: Admin | Instructor | Student)
- Course Schema (Modules, Progress Tracking)
- Payment Schema (Transaction ID, Status Verification)
- Certificate Schema (Auto-generated on completion)
- Notification Preferences Schema


## 🔐 Security Features

- JWT-based authentication
- Bcrypt password hashing
- Secure password reset with rate limiting
- IP-based request protection
- Payment verification via Razorpay signature validation
- Role-based route protection (Admin / Instructor / Student)

## 🌍 Deployment

- Frontend deployed on Vercel
- Backend hosted on Render.
- Environment variables secured
- Production build optimization

  ## 📸 Screenshots

### 🏠 Homepage
![Homepage](E-Learning-DevAcademy-main/Client/Client/public/Screenshots/HomePage.png)


### 🏠 Course_Details
![Course Details](Screenshots/CourseDetailsPage.png)
![Course Video](Screenshots/Course_Video_page.png)
![Certificate](Screenshots/Certificate.png)

### 📊Student Dashboard
![Dashboard](Screenshots/student_dashboard.png)
![Analytics](Screenshots/student_analytics.png)

### 📊Instructor Dashboard
![Dashboard](Screenshots/instructor_dashboard.png)
![Analytics](Screenshots/instructor_analytics.png)

### 📊Admin Dashboard
![Dashboard](Screenshots/AdminDashboard.png)
![Top Selling Courses](Screenshots/TopSelling_Courses.png)



⭐ Feedback & suggestions are welcome!
