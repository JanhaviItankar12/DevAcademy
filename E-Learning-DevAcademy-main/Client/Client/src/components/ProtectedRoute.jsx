import React from 'react'
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner';

const ProtectedRoute = ({children, allowedRoles}) => {
    const {isAuthenticated,user}=useSelector((state)=>state.auth);
   
    const location=useLocation();

  if(!isAuthenticated){
    return <Navigate to="/login" state={{from:location}} replace/>
  }

  if(allowedRoles && !allowedRoles.includes(user?.role)){
    toast.error("You don't have permission to access this page");
    return <Navigate to={'/'} replace/>
  }

  return children;
}

export default ProtectedRoute;