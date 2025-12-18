import React from 'react'
import { Button } from './ui/button'
import { useCreateOrderMutation, useVerifyOrderMutation } from '@/features/api/courseApi'
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';


const BuyCourseButton = ({ courseId, amount, onPaymentSuccess }) => {
  const [createOrder] = useCreateOrderMutation();
  const [verifyOrder] = useVerifyOrderMutation();

  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);

  const isInstructor = user?.role === "instructor";

  const handlePayment = async () => {
    if (isInstructor) {
      toast.error("Please switch to a Student account to purchase courses.");
      return;
    }

    if (!token) {
      toast.error("Please login to purchase the course.");
      navigate("/login");
      return;
    }

    try {
      const order = await createOrder({ courseId, amount }).unwrap();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_API_KEY,
        amount: order.amount,
        currency: order.currency,
        name: "DevAcademy",
        description: "Course Purchase",
        order_id: order.id,

        handler: async (response) => {
          const verifyRes = await verifyOrder({
            courseId,
            amount,
            response,
          }).unwrap();

          if (verifyRes.success) {
            toast.success("Payment Successful 🎉");
            onPaymentSuccess?.();
          } else {
            toast.error("Payment Failed!");
          }
        },

        prefill: {
          name: user?.name,
          email: user?.email,
        },

        theme: {
          color: "#2D79F3",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);

      if (error?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } else {
        toast.error("Something went wrong during payment.");
      }
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={isInstructor}
      className={`w-full cursor-pointer ${isInstructor
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-blue-500 hover:bg-blue-600"
        }`}
    >
      {isInstructor ? "Instructor cannot purchase courses" : "Purchase Course"}
    </Button>
  );
};




export default BuyCourseButton