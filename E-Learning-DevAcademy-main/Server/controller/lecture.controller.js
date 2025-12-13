import { Course } from "../models/course.model.js";
import { Lecture } from "../models/lecture.model.js";
import { deleteVideo } from "../utils/cloudinary.js";




export const createLecture = async (req, res) => {
    try {
        const { lectureTitle } = req.body;
        const { courseId } = req.params;

        if (!lectureTitle || !courseId) {
            return res.status(400).json({
                success: false,
                message: "Lecture title and courseId are required"
            });
        }

        if(lectureTitle.trim().length <3){
            return res.status(400).json({
                success: false,
                message: "Lecture title must be at least 3 characters long"
            });
        }

        // Fetch course from DB
        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        // Check required fields in course
        const requiredFields = [
            "courseTitle",
            "subTitle",
            "description",
            "coursePrice",
            "courseLevel",
            "category",
            "courseThumbnail"
        ];

        const missingFields = requiredFields.filter(
            field => !course[field] || course[field].toString().trim() === ""
        );

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Cannot add lecture. Required course fields missing.",
                missingFields
            });
        }

        // Create lecture
        const lecture = await Lecture.create({ lectureTitle });

        // Add lecture to course using DB update
        course.lectures.push(lecture._id);
        await course.save();

        return res.status(201).json({
            lecture,
            message: "Lecture created successfully."
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to create lecture"
        });
    }
};


export const getCourseLecture = async (req, res) => {
    try {
        const { courseId } = req.params;
        const course = await Course.findById(courseId).populate("lectures");
        if (!course) {
            return res.status(404).json({
                message: "Course not found"
            });
        }
        return res.status(200).json({
            lectures: course.lectures
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to get all lectures of this course"
        });
    }
}

export const editLecture = async (req, res) => {
    try {
        const { lectureTitle, videoInfo, isPreviewFree } = req.body;
        const { courseId, lectureId } = req.params;
        const lecture = await Lecture.findById(lectureId);

        

        if (!lecture) {
            return res.status(404).json({
                message: "Lecture not found!"
            })
        }

        //update lecture
        if (lectureTitle) lecture.lectureTitle = lectureTitle;
        if (videoInfo?.videoUrl) lecture.videoUrl = videoInfo.videoUrl;
        if (videoInfo?.publicId) lecture.publicId = videoInfo.publicId;
        lecture.isPreviewFree = isPreviewFree;

        await lecture.save();

        //ensure the course still has  lecture id if was not already added
        const course = await Course.findById(courseId);
        if (course && !course.lectures.includes(lecture._id)) {
            course.lectures.push(lecture._id);
            await course.save();
        }
        return res.status(200).json({
            lecture,
            message: "Lecture updated successfully"
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to edit lecture "
        });
    }
}


export const removeLecture = async (req, res) => {
    try {
        const { lectureId } = req.params;

        // 1️⃣ Find the lecture first (without deleting)
        const lecture = await Lecture.findById(lectureId);
        if (!lecture) {
            return res.status(404).json({
                success: false,
                message: "Lecture not found!"
            });
        }

        // 2️⃣ Find the course containing this lecture and populate lectures
        const course = await Course.findOne({ lectures: lectureId }).populate("lectures");
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found for this lecture!"
            });
        }

        // 3️⃣ Check if course is published and only 1 lecture exists
        // Only count actual existing lectures
        const actualLecturesCount = course.lectures.filter(l => l).length;

        if (course.isPublished && actualLecturesCount === 1) {
            return res.status(400).json({
                success: false,
                message: "Cannot remove the only lecture of a published course."
            });
        }

      

        // 5️⃣ Delete lecture from Cloudinary if publicId exists
        if (lecture.publicId) {
            await deleteVideo(lecture.publicId);
        }

        // 6️⃣ Delete lecture from DB
        await Lecture.findByIdAndDelete(lectureId);

        // 7️⃣ Remove lectureId from course lectures array safely
        await Course.updateOne(
            { _id: course._id },
            { $pull: { lectures: lectureId } }
        );

        return res.status(200).json({
            success: true,
            message: "Lecture removed successfully"
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to remove lecture"
        });
    }
};



export const getLectureById = async (req, res) => {
    try {
        const { lectureId } = req.params;
        const lecture = await Lecture.findById(lectureId);
        if (!lecture) {
            return res.status(404).json({
                success: false,
                message: "Lecture not found!"
            });
        }
        return res.status(200).json({
            lecture,
            success: true
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to get lecture by its id"
        });
    }
}

