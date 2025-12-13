import { Course } from "../models/course.model.js";
import { CourseProgress } from "../models/courseProgress.model.js";

export const getCourseProgress = async (req, res) => {
    try {
        const {courseId} = req.params;
        const userId=req.id;

        // step1:fetch the user course progress
        let courseProgress=await CourseProgress.findOne({courseId,userId}).populate("courseId");
        const courseDetails=await Course.findById(courseId).populate("lectures").populate("reviews.student","name email photoUrl");

        if(!courseDetails){
            return res.status(404).json({ message: "Course not found" });
        }

        // step-2: if no progress found,return courseDetails with an empty progress
        if(!courseProgress){
            return res.status(200).json({
                data:{
                    courseDetails,
                    progress:[],
                    completed:false
                }
            })
        }

        // step-3: if progress found,return courseDetails with progress
        return res.status(200).json({
            data:{
                courseDetails,
                progress:courseProgress.lectureProgress,
                completed:courseProgress.completed,

            }
        });

    } catch (error) {
        console.error("Error fetching course progress:", error);
        res.status(500).json({ message: "Internal server error" });
        
    }


}



export const updateLectureProgress = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    const userId = req.id;
    let { watchedTime = 0, dropOffTime = 0, videoLength = 0 } = req.body;

    watchedTime = Number(watchedTime) || 0;
    dropOffTime = Number(dropOffTime) || 0;
    videoLength = Number(videoLength) || 0;

    // fetch or create course progress
    let courseProgress = await CourseProgress.findOne({ courseId, userId });
    if (!courseProgress) {
      courseProgress = await CourseProgress.create({
        userId,
        courseId,
        completed: false,
        lectureProgress: []
      });
    }

    // find lecture progress index
    const lectureIndex = courseProgress.lectureProgress.findIndex(
      (lp) => lp.lectureId.toString() === lectureId.toString()
    );

    const percentWatched = videoLength > 0 ? (dropOffTime / videoLength) * 100 : 0;

    if (lectureIndex !== -1) {
      // update times only if new watchedTime is greater
      const lp = courseProgress.lectureProgress[lectureIndex];
      if (watchedTime > (lp.watchedTime || 0)) lp.watchedTime = watchedTime;
      if (videoLength > (lp.videoLength || 0)) lp.videoLength = videoLength;

      // mark viewed only if percent >= 90
      if (percentWatched >= 90) lp.viewed = true;
    } else {
      courseProgress.lectureProgress.push({
        lectureId,
        watchedTime,
        videoLength,
        viewed: percentWatched >= 90
      });
    }

    // Save lecture analytics to course. (preserve your existing analytics logic)
    const course = await Course.findById(courseId).populate("lectures");
    const lecture = course?.lectures?.find((lec) => lec._id.toString() === lectureId.toString());

    if (lecture) {
      // push view
      lecture.views.push({ count: 1, createdAt: new Date() });

      if (watchedTime) {
        lecture.avgTime.push({ time: Number(watchedTime), createdAt: new Date() });
      }

      if (dropOffTime && videoLength) {
        const percentage = Number(((dropOffTime / videoLength) * 100).toFixed(2));
        lecture.dropOff.push({ percent: percentage, createdAt: new Date() });
      }

      await lecture.save();
    }

    // check if all lectures are viewed
    const viewedCount = courseProgress.lectureProgress.filter((lp) => lp.viewed).length;
    if (course.lectures && course.lectures.length === viewedCount) {
      courseProgress.completed = true;

      const alreadyCompleted = course.completions?.some(
        (c) => c.student.toString() === userId.toString()
      );

      if (!alreadyCompleted) {
        course.completions.push({ student: userId, completedAt: new Date() });
      }

      await course.save();
    }

    await courseProgress.save();

    return res.status(200).json({ message: "Lecture progress updated successfully" });
  } catch (error) {
    console.log("Error updating lecture progress:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};



export const markAsCompleted = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.id;

        const courseProgress = await CourseProgress.findOne({ courseId, userId });
        if (!courseProgress) {
            return res.status(404).json({ message: "You have to complete the course" });
        }

        // check if all lectures are viewed
        const course = await Course.findById(courseId);
        const totalLectures = course.lectures.length;
        const viewedLectures = courseProgress.lectureProgress.filter((lecture) => lecture.viewed).length;

        if (viewedLectures < totalLectures) {
            return res.status(400).json({ message: "You must complete all lectures before marking the course as completed." });
        }

        // Mark course progress as completed
        courseProgress.completed = true;
        await courseProgress.save();

        // Push a completion record to the course
        course.completions.push({ student: userId, completedAt: new Date() });
        await course.save();

        return res.status(200).json({ message: "Course marked as completed successfully" });
    } catch (error) {
        console.error("Error marking course as completed:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};



export const markAsInCompleted = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.id;

        const courseProgress = await CourseProgress.findOne({ courseId, userId });
        if (!courseProgress) {
            return res.status(404).json({ message: "Course progress not found" });
        }

        // Reset lecture progress
        courseProgress.lectureProgress.forEach((lectureProgress) => {
            lectureProgress.viewed = false;
        });
        courseProgress.completed = false;
        await courseProgress.save();

        // Remove the student's completion record from the course
        const course = await Course.findById(courseId);
        course.completions = course.completions.filter(
            (completion) => completion.student.toString() !== userId
        );
        await course.save();

        return res.status(200).json({ message: "Course marked as Incompleted successfully" });
    } catch (error) {
        console.error("Error marking course as incomplete:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};



//count completed course count

export const  CourseCompletedCount=async(req,res)=>{
  const {courseId}= req.params;
  const completedCount=await CourseProgress.countDocuments({
    courseId:courseId,
    completed:true
});
}





