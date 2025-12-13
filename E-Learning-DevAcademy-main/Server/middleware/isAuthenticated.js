import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const isAuthenticated= async(req,res,next)=>{
     try {
        const token=req.cookies.token;
        
        if(!token){
            return res.status(401).json({
                message:"User not Authenticated",
                success:false
            })

        }
        const decode= await jwt.verify(token,process.env.secret_key);
        if(!decode){
            return res.status(401).json({
                message:"Invalid Token",
                success:false
            })
        }

        req.user=await User.findById(decode.userId).select("-password")
        
        req.id=decode.userId;
        next();

     } catch (error) {
        return res.status(500).json({
            message:"Internal Server Error",
            success:false,
            error:error.message
        });
        
     } 
}

export default isAuthenticated;