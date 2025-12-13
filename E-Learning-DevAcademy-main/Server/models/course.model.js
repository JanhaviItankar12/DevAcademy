import mongoose from 'mongoose';

const courseSchema=new mongoose.Schema({
    courseTitle:{
        type:String,
        required:true
    },
    subTitle:{
        type:String
    },
    description:{
        type:String,
        
    },
    category:{
        type:String,
        required:true
    },
    courseLevel:{
        type:String,
        enum:["Beginner","Medium","Advance"]
    },
    coursePrice:{
        type:Number,
        default:0
    },
    courseThumbnail:{
        type:String,
        
    },
    enrolledStudents:[
        {
            student:{type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            },
            enrolledAt: { type: Date, default: Date.now },
        }
    ],
    lectures:[
        {
           type:mongoose.Schema.Types.ObjectId,
            ref:'Lecture' ,
            
        }
    ],
    reviews:[
        {
           student:{type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
           },
           rating:{type:Number,
            required:true,
            min:1,
            max:5
           },
           comment:{
             type:String,
             required:true
           },
           createdAt:{type:Date,default:Date.now}
        },
    ],
    completions:[
        {
            student:{type:mongoose.Schema.Types.ObjectId,
                ref:'User'
            },
            completedAt:{type:Date,default:Date.now},
        }
    ],
    creator:{
        type:mongoose.Schema.Types.ObjectId,
            ref:'User' 
    },
    isPublished:{
        type:Boolean,
        default:false
    }

},{timestamps:true}) ;


export const Course=mongoose.model("Course",courseSchema);