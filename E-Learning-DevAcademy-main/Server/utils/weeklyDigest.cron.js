import cron from "node-cron";
import { sendWeeklyDigest } from "../controller/course.controller.js";


// Run every Monday at 8 AM
cron.schedule(
  "0 8 * * 1",
  async () => {
    console.log("📧 Weekly digest running...");
    await sendWeeklyDigest();
  },
  {
    timezone: "Asia/Kolkata"
  }
);

