import mongoose  from "mongoose";

const connectDB=async()=>{
    try {
        await mongoose.connect(process.env.mongo_url);
        console.log("mongoDB connected");
    } catch (error) {
       console.log("error occured: ",error) ;
    }
}

export default connectDB;