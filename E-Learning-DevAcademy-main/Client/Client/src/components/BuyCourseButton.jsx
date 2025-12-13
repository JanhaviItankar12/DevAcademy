import React from 'react'
import { Button } from './ui/button'
import { useCreateOrderMutation, useVerifyOrderMutation } from '@/features/api/courseApi'
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';


const BuyCourseButton = ({courseId,amount,onPaymentSuccess}) => {
   const [createOrder,{}] =useCreateOrderMutation();
   const [verifyOrder,{}]=useVerifyOrderMutation();

   const navigate=useNavigate();
   
   const token=useSelector((state)=>state.auth.token);
   
   
   const handlePayment=async()=>{
    
     if (!token) {
       alert("Please login to purchase the course.");
       navigate("/login");
       return;
     }
      
    try {
       const order=await createOrder({courseId,amount});
       const orderData=order.data;
       
      const options={
        key:"rzp_test_yFnMdlPgXudtkV",
        amount:orderData.amount,
        currency:orderData.currency,
        name:"DevAcademy",
        description:"Course Purchase",
        order_id:orderData.id,
        display_amount:orderData.amount,
         display_currency: "INR",
        handler:async (response) => {
           const verifyRes=await verifyOrder({courseId,amount,response});
           
           if(verifyRes?.data.success){
            toast.success("Payment Done.");
            onPaymentSuccess?.();
           }
           else{
            toast.error("Payment Failed!");
           }
        },
        prefill:{
          name:"Janhavi Itankar",
          email:"itankarjanvi@gmail.com"
        },
        theme:{
          color:"#2D79F3"
        },
       };
      
      const rzp = new window.Razorpay(options);  //open the razorpay page for payment
      rzp.open(); 
    } catch (error) {
      console.error("Payment error:", error);

      // check if unauthorized
      if(error?.error?.status===401){
        alert("Session Expired.Please login again.");
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }
      alert("Something went wrong during payment.");
    }
    }
  return (
   <Button className={'w-full bg-blue-500 cursor-pointer'} onClick={handlePayment}>Purchase Course</Button>
  )
}

export default BuyCourseButton