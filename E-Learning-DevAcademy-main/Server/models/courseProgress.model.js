import mongoose from 'mongoose';

const lectureProgressSchema = new mongoose.Schema({
  lectureId: { type: String, required: true },
  watchedTime: { type: Number, default: 0 }, // seconds
  videoLength: { type: Number, default: 0 },  // seconds
  viewed: { type: Boolean, default: false }
});


const courseProgressSchema=new mongoose.Schema({
    userId:{
        type:String
    },
    courseId:{
        type:String
    },
    completed:{
        type:Boolean
       
    },
    lectureProgress:[
        lectureProgressSchema
    ]
});

export const CourseProgress = mongoose.model("CourseProgress", courseProgressSchema);
