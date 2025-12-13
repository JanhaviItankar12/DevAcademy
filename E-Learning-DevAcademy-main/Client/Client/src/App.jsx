import { useEffect, useState } from 'react'

import './App.css'
import { Login } from './Pages/Login'

import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import MainLayout from './layout/MainLayout'


import Profile from './Pages/student/Profile'
import Sidebar from './Pages/admin/Sidebar'

import CourseTable from './Pages/admin/course/CourseTable'
import AddCourse from './Pages/admin/course/AddCourse'
import EditCourse from './Pages/admin/course/EditCourse'
import CreateLecture from './Pages/admin/lecture/CreateLecture'
import EditLecture from './Pages/admin/lecture/EditLecture'
import CourseDetail from './Pages/student/CourseDetail'
import CourseProgress from './Pages/student/CourseProgress'


// protection route
import ProtectedRoute from './components/ProtectedRoute'
import { useDispatch } from 'react-redux'
import { userLoggedIn } from './features/authSlice'
import CoursePreview from './Pages/admin/course/CoursePreview'
import CourseAnalytics from './Pages/admin/course/CourseAnalytics'
import CourseStudentsView from './Pages/admin/course/CourseStudentsView'
import Dashboard from './Pages/admin/course/Dashboard'
import CourseDetails from './Pages/admin/course/CourseDetails'
import AllCourse from './Pages/admin/course/AllCourse'
import MainAnalytics from './Pages/admin/course/MainAnalytics'
import AdminDashboard from './Pages/MainAdmin/Dashbaord'
import TopCourses from './Pages/MainAdmin/ComponentOfDashboard/TopCourses'
import TopInstructor from './Pages/MainAdmin/ComponentOfDashboard/TopInstructor'
import MangageUser from './Pages/MainAdmin/ManageUser'
import ManageCourses from './Pages/MainAdmin/ManageCourses'

import StudDashboard from './Pages/student/Dashboard/StudDashbord'
import Analytics from './Pages/student/Dashboard/Analytics'
import CompletedCourses from './Pages/student/Dashboard/CompletedCourses'
import HomePage from './Pages/student/Home/HomePage'
import Courses from './Pages/student/Home/Courses'
import AboutUs from './Pages/student/Home/Company/AboutUs'
import ContactUs from './Pages/student/Home/Company/ContactUs'
import TermsOfService from './Pages/student/Home/Company/TermsOfService'
import PrivacyPolicy from './Pages/student/Home/Company/PrivacyPolicy'






const appRouter=createBrowserRouter([
  {
    path:"/",
    element:<MainLayout/>,
    children:[
      {
      path:"/",
      element:
      <>
      <HomePage/>
      
      </>
      },
      {
       path:"about-us",
       element:<AboutUs/>
      },
       {
       path:"contact",
       element:<ContactUs/>
      },
       {
       path:"terms-and-conditions",
       element:<TermsOfService/>
      },
       {
       path:"privacy-policy",
       element:<PrivacyPolicy/>
      },

      {
       path:"courses",
       element:<Courses/>
      },
      
      {
        path:"course-detail/:courseId",
        element:<CourseDetail/>
      },
      {
        path:"course-progress/:courseId",
        element:(
        <ProtectedRoute allowedRoles={['student']}>
          <CourseProgress />
        </ProtectedRoute>
        )
      },
     {
      path:"login",
      element:<Login/>
     },
    
     {
      path:"profile",
      element:(
      <ProtectedRoute allowedRoles={['student','instructor']}>
          <Profile/>
      </ProtectedRoute>
      )
     },
     

     {
      path:"student",
      element:(
        <ProtectedRoute allowedRoles={['student']}>
          <Sidebar/>
        </ProtectedRoute>
      ),
      children:[
        {
          path:"dashboard",
          element:<StudDashboard/>
        },
        {
          path:"analytics",
          element:<Analytics/>
        },
        {
          path:"completed-courses",
          element:<CompletedCourses/>
        }
      ]
     },

     //instructor routes start from here
     {
      path:"instructor",
      element:(
        <ProtectedRoute allowedRoles={['instructor']}>
            <Sidebar/>
        </ProtectedRoute>
        ),
      children:[
        {
          path:"dashboard",
          element:<Dashboard/>
        },
        {
          path:":courseId/viewCourse",
          element:<CourseDetails/>
        },
        {
          path:":viewAllCourses" ,
          element:<AllCourse/>
        },
        //analytics route
        {
           path:"analytics",
           element:<MainAnalytics/>
        },
        {
          path:"course",
          element:<CourseTable/>
        },
         {
          path:"course/create",
          element:<AddCourse/>
        },
        {
          path:"course/:courseId",
          element:<EditCourse/>
        },
        {
          path:"course/:courseId/preview",
          element:<CoursePreview/>
        },
        {
          path:"course/:courseId/preview/analytics",
          element:<CourseAnalytics/>
        },
        {
          path:"course/:courseId/preview/enrolled",
          element:<CourseStudentsView/>
        },
        {
          path:"course/:courseId/lecture",
          element:<CreateLecture/>
        },
        {
          path:"course/:courseId/lecture/:lectureId",
          element:<EditLecture/>
        },
      ]
     },

     //admin routes
     {
      path:"admin",
      element:(
        <ProtectedRoute allowedRoles={['admin']}>
            <Sidebar/>
        </ProtectedRoute>
        ),
      children:[
        {
          path:"dashboard",
          element:<AdminDashboard/>
        },
        {
         path:"topcourses",
         element:<TopCourses/>
        },
        {
          path:"topinstructor",
          element:<TopInstructor/>
        },
        {
          path:"manageUser",
          element:<MangageUser/>
        },
        {
          path:"manageCourses",
          element:<ManageCourses/>
        }
        
      ]
     }
    ]
  }
])
function App() {

  const dispatch=useDispatch();

  useEffect(()=>{
    const token=localStorage.getItem("token");
    const user=localStorage.getItem("user");

    if(token && user){
      dispatch(userLoggedIn({
        token,
        user:JSON.parse(user)
      }));
    }
  },[dispatch]);

  return (
    <main>
      <RouterProvider router={appRouter}/>
    </main>
  )
}

export default App
