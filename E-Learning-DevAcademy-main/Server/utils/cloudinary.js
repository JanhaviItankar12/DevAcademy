import {v2 as cloudinary} from "cloudinary";
import dotenv from "dotenv";

dotenv.config({});

cloudinary.config({
    cloud_name:process.env.cloud_name,
    api_secret:process.env.api_secret,
    api_key:process.env.api_key
});

export const uploadMedia=async(file)=>{
    try{
      const  uploadResponse=await cloudinary.uploader.upload(file,{
        resource_type:"auto"
      });
      return uploadResponse;
    }
    catch(error){
       console.log(error);
    }
}

export const deleteMedia=async(publicId)=>{
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.log(error);
    }
}

export const deleteVideo=async (publicId) => {
    try {
       await cloudinary.uploader.destroy(publicId,{
        resource_type:"video"
       }); 
    } catch (error) {
        console.log(error);
    }
}


