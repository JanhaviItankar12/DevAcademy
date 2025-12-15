import SibApiV3Sdk from "sib-api-v3-sdk";

// Initialize Brevo client
const brevo = SibApiV3Sdk.ApiClient.instance;

// Set API key
const apiKey = brevo.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;

// Create transactional email instance
const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();


export const sendForgotPasswordEmail = async (email, resetLink) => {
  try {
    const sender = {
      email: "devacademy122025@gmail.com",
      name: "DevAcademy",
    };

    const receivers = [{ email }];

    await tranEmailApi.sendTransacEmail({
      sender,
      to: receivers,
      subject: "Reset Your DevAcademy Password",
      htmlContent: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f6f7fb;">
        <div style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.08);">

          <!-- Logo -->
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://res.cloudinary.com/dvy92o8cz/image/upload/v1765536514/vruqbwokxg9x5y0rloux.png"
                 alt="DevAcademy Logo"
                 style="width: 120px; height: auto;" />
          </div>

          <!-- Title -->
          <h2 style="color: #333; text-align: center;">Reset Your Password</h2>

          <!-- Message -->
          <p style="font-size: 15px; color: #555;">
            We received a request to reset your password for your <strong>DevAcademy</strong> account.
            If you initiated this request, click the button below to reset your password.
          </p>

          <!-- Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}"
              style="background-color: #6a5acd; color: white; padding: 12px 22px; border-radius: 6px; text-decoration: none; font-weight: bold;">
              Reset Password
            </a>
          </div>

         

          <!-- Note -->
          <p style="font-size: 13px; color: #888; margin-top: 30px;">
            If you did not request a password reset, you can safely ignore this email.
            This link will expire in <strong>10 minutes</strong>.
          </p>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">

          <p style="font-size: 12px; text-align: center; color: #999;">
            © ${new Date().getFullYear()} DevAcademy • All Rights Reserved
          </p>

        </div>
      </div>
      `,
    });

    console.log("Forgot-password email sent!");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};


//message reply to user from admin
export const sendReplyEmail = async (email, name, replyMessage) => {
  try {
    const sender = {
      email: "devacademy122025@gmail.com",
      name: "DevAcademy Support",
    };

    const receivers = [{ email }];

    await tranEmailApi.sendTransacEmail({
      sender,
      to: receivers,
      subject: "Response to Your Message – DevAcademy",
      htmlContent: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f6f7fb;">
        <div style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.08);">

          <!-- Logo -->
         <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://res.cloudinary.com/dvy92o8cz/image/upload/v1765536514/vruqbwokxg9x5y0rloux.png"
                 alt="DevAcademy Logo"
                 style="width: 120px; height: auto;" />
          </div>
          <!-- Title -->
          <h2 style="color: #333; text-align: center;">We’ve Replied to Your Message</h2>

          <!-- Greeting -->
          <p style="font-size: 15px; color: #555;">
            Hello <strong>${name}</strong>,
          </p>

          <!-- Message -->
          <p style="font-size: 15px; color: #555;">
            Thank you for contacting <strong>DevAcademy Support</strong>. Below is our response to your query:
          </p>

          <!-- Reply Box -->
          <div style="padding: 15px; background: #faf8ff; border-left: 4px solid #6a5acd; margin: 20px 0; border-radius: 6px;">
            <p style="font-size: 15px; color: #444; margin: 0;">
              ${replyMessage}
            </p>
          </div>

          <p style="font-size: 14px; color: #666;">
            If you have any further questions, feel free to reply to this email.  
            We're always here to help!
          </p>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">

          <p style="font-size: 12px; text-align: center; color: #999;">
            © ${new Date().getFullYear()} DevAcademy • All Rights Reserved
          </p>

        </div>
      </div>
      `,
    });

    console.log("Reply email sent!");
  } catch (error) {
    console.error("Error sending reply email:", error);
  }
};


export const sendInstructorPublishEmail = async (emails, instructorName, courseTitle, courseId) => {
  try {
    const sender = {
      email: "devacademy122025@gmail.com",
      name: "DevAcademy",
    };

    const receivers = emails.map((email) => ({ email }));

    const courseLink = `${process.env.frontend_url}/course-detail/${courseId}`;

    await tranEmailApi.sendTransacEmail({
      sender,
      to: receivers,
      subject: `${instructorName} just published a new course!`,
      htmlContent: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f6f7fb;">
        <div style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.08);">

          <!-- Logo -->
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://res.cloudinary.com/dvy92o8cz/image/upload/v1765536514/vruqbwokxg9x5y0rloux.png"
                 alt="DevAcademy Logo"
                 style="width: 120px; height: auto;" />
          </div>

          <!-- Title -->
          <h2 style="color: #333; text-align: center;">New Course Published 🎉</h2>

          <!-- Message -->
          <p style="font-size: 15px; color: #555;">
            <strong>${instructorName}</strong> just published a brand new course on <strong>DevAcademy</strong>.
          </p>

          <p style="font-size: 15px; color: #555;">
            <strong>Course:</strong> ${courseTitle}
          </p>

          <!-- Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${courseLink}"
              style="background-color: #6a5acd; color: white; padding: 12px 22px; border-radius: 6px; text-decoration: none; font-weight: bold;">
              View Course
            </a>
          </div>

          <!-- Note -->
          <p style="font-size: 13px; color: #888; margin-top: 30px;">
            You are receiving this email because you follow <strong>${instructorName}</strong> or enabled
            “New Course” notifications.
          </p>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">

          <p style="font-size: 12px; text-align: center; color: #999;">
            © ${new Date().getFullYear()} DevAcademy • All Rights Reserved
          </p>

        </div>
      </div>
      `,
    });

    console.log("Instructor publish email sent!");
  } catch (error) {
    console.error("Error sending instructor publish email:", error);
  }
};




export const sendWeeklyDigestEmail = async (users, courses) => {
  try {
    if (!users.length || !courses.length) return;

    const sender = {
      email: "devacademy122025@gmail.com",
      name: "DevAcademy",
    };

    const receivers = users.map((user) => ({ email: user.email }));

    // Build HTML list of courses
    const courseListHtml = courses
      .map(
        (course) => `
        <li style="margin-bottom: 15px;">
          <strong>${course.courseTitle}</strong> by ${course.creator.name}<br/>
          <a href="${process.env.frontend_url}/course-detail/${course._id}" 
             style="color: #6a5acd; text-decoration: none; font-weight: bold;">View Course</a>
        </li>
      `
      )
      .join("");

    await tranEmailApi.sendTransacEmail({
      sender,
      to: receivers,
      subject: "Weekly Digest: New Courses on DevAcademy 🎓",
      htmlContent: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f6f7fb;">
        <div style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.08);">

          <!-- Logo -->
         <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://res.cloudinary.com/dvy92o8cz/image/upload/v1765536514/vruqbwokxg9x5y0rloux.png"
                 alt="DevAcademy Logo"
                 style="width: 120px; height: auto;" />
          </div>

          <!-- Title -->
          <h2 style="color: #333; text-align: center;">Weekly Digest 📚</h2>

          <p style="font-size: 15px; color: #555;">
            Here’s a roundup of all courses published this week on <strong>DevAcademy</strong>:
          </p>

          <ul style="padding-left: 20px; margin-top: 20px; color: #555;">
            ${courseListHtml}
          </ul>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">

          <p style="font-size: 12px; text-align: center; color: #999;">
            You are receiving this email because you subscribed to weekly course updates.<br/>
            © ${new Date().getFullYear()} DevAcademy • All Rights Reserved
          </p>

        </div>
      </div>
      `,
    });

    console.log("Weekly Digest email sent!");
  } catch (error) {
    console.error("Error sending weekly digest email:", error);
  }
};



export const sendInstructorApprovalEmail = async (email, name) => {
  try {
    const sender = {
      email: "devacademy122025@gmail.com",
      name: "DevAcademy",
    };

    const receivers = [{ email }];

    await tranEmailApi.sendTransacEmail({
      sender,
      to: receivers,
      subject: "Your Instructor Account has been Approved ✅",
      htmlContent: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f6f7fb;">
        <div style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.08);">

         <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://res.cloudinary.com/dvy92o8cz/image/upload/v1765536514/vruqbwokxg9x5y0rloux.png"
                 alt="DevAcademy Logo"
                 style="width: 120px; height: auto;" />
          </div>

          <h2 style="color: #333; text-align: center;">Instructor Approved!</h2>

          <p style="font-size: 15px; color: #555;">
            Congratulations <strong>${name}</strong>! Your instructor account has been approved by the admin.
            You can now create and publish courses on <strong>DevAcademy</strong>.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.frontend_url}"
               style="background-color: #6a5acd; color: white; padding: 12px 22px; border-radius: 6px; text-decoration: none; font-weight: bold;">
              Go to Dashboard
            </a>
          </div>

          <p style="font-size: 12px; text-align: center; color: #999;">
            © ${new Date().getFullYear()} DevAcademy • All Rights Reserved
          </p>

        </div>
      </div>
      `
    });

    console.log("Instructor approval email sent to", email);
  } catch (err) {
    console.error("Error sending instructor approval email:", err);
  }
};

export const sendInstructorRejectionEmail = async (email, name, reason = "") => {
  try {
    const sender = {
      email: "devacademy122025@gmail.com",
      name: "DevAcademy",
    };

    const receivers = [{ email }];

    await tranEmailApi.sendTransacEmail({
      sender,
      to: receivers,
      subject: "Instructor Application Update ❌",
      htmlContent: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f6f7fb;">
        <div style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.08);">

          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://res.cloudinary.com/dvy92o8cz/image/upload/v1765536514/vruqbwokxg9x5y0rloux.png"
                 alt="DevAcademy Logo"
                 style="width: 120px; height: auto;" />
          </div>

          <h2 style="color: #e63946; text-align: center;">Application Not Approved</h2>

          <p style="font-size: 15px; color: #555;">
            Hello <strong>${name}</strong>,
          </p>

          <p style="font-size: 15px; color: #555;">
            Thank you for applying to become an instructor on <strong>DevAcademy</strong>.
            After careful review, we regret to inform you that your application was not approved at this time.
          </p>

          ${
            reason
              ? `<div style="background:#fff3f3; padding:15px; border-left:4px solid #e63946; margin:20px 0;">
                   <p style="margin:0; font-size:14px; color:#444;">
                     <strong>Reason:</strong> ${reason}
                   </p>
                 </div>`
              : ""
          }

          <p style="font-size: 15px; color: #555;">
            Don’t worry — you can improve your profile and apply again in the future.
            We appreciate your interest in being part of our instructor community.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.frontend_url}"
               style="background-color: #6a5acd; color: white; padding: 12px 22px; border-radius: 6px; text-decoration: none; font-weight: bold;">
              Visit DevAcademy
            </a>
          </div>

          <p style="font-size: 12px; text-align: center; color: #999;">
            © ${new Date().getFullYear()} DevAcademy • All Rights Reserved
          </p>

        </div>
      </div>
      `
    });

    console.log("Instructor rejection email sent to", email);
  } catch (err) {
    console.error("Error sending instructor rejection email:", err);
  }
};



export const sendCourseDeletedByAdminEmail = async (
  emails,
  instructorName,
  courseTitle,
  reason = "Policy or administrative reasons"
) => {
  try {
    const sender = {
      email: "devacademy122025@gmail.com",
      name: "DevAcademy",
    };

    const receivers = emails.map((email) => ({ email }));

    await tranEmailApi.sendTransacEmail({
      sender,
      to: receivers,
      subject: `Your course has been removed by Admin`,
      htmlContent: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f6f7fb;">
        <div style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.08);">

          <!-- Logo -->
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://res.cloudinary.com/dvy92o8cz/image/upload/v1765536514/vruqbwokxg9x5y0rloux.png"
                 alt="DevAcademy Logo"
                 style="width: 120px; height: auto;" />
          </div>

          <!-- Title -->
          <h2 style="color: #d9534f; text-align: center;">
            Course Removed ⚠️
          </h2>

          <!-- Message -->
          <p style="font-size: 15px; color: #555;">
            Hello <strong>${instructorName}</strong>,
          </p>

          <p style="font-size: 15px; color: #555;">
            We regret to inform you that your course listed below has been
            <strong>removed by the DevAcademy Admin</strong>.
          </p>

          <p style="font-size: 15px; color: #555;">
            <strong>Course Title:</strong> ${courseTitle}
          </p>

          <!-- Reason -->
          <div style="background: #fff4f4; padding: 15px; border-left: 4px solid #d9534f; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #b52b27;">
              <strong>Reason:</strong> ${reason}
            </p>
          </div>

          <!-- Note -->
          <p style="font-size: 14px; color: #666;">
            If you believe this action was taken in error or you’d like more clarification,
            please contact our support team.
          </p>

        

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">

          <p style="font-size: 12px; text-align: center; color: #999;">
            © ${new Date().getFullYear()} DevAcademy • All Rights Reserved
          </p>

        </div>
      </div>
      `,
    });

    console.log("Course deletion email sent to instructor!");
  } catch (error) {
    console.error("Error sending course deletion email:", error);
  }
};





