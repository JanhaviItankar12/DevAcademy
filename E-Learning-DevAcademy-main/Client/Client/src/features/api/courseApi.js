import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";


const course_api = `${import.meta.env.VITE_BACKEND_URL}/api/v1/course/`;

export const courseApi = createApi({
  reducerPath: 'courseApi',
  tagTypes: ['Refetch_Creator_Course', "Refetch_Lecture"],
  baseQuery: fetchBaseQuery({
    baseUrl: course_api,
    credentials: "include"
  }),
  endpoints: (builder) => ({
    createCourse: builder.mutation({
      query: ({ courseTitle, category }) => ({
        url: "",
        method: "POST",
        body: { courseTitle, category }
      }),
      invalidatesTags: ['Refetch_Creator_Course']
    }),
    getCreatorCourses: builder.query({
      query: () => ({
        url: "",
        method: "GET"
      }),
      providesTags: ['Refetch_Creator_Course']
    }),
    editCourse: builder.mutation({
      query: ({ formData, courseId }) => ({
        url: `/${courseId}`,
        method: "PUT",
        body: formData
      }),
      invalidatesTags: ['Refetch_Creator_Course']
    }),

    // get enrolled course by user
    getEnrolledCourseOfUser:builder.query({
       query:()=>({
        url:"/getEnrolledCourse",
        method:"GET"
       })
    }),

    getCourseById: builder.query({
      query: (courseId) => ({
        url: `/${courseId}`,
        method: "GET"
      }),
      providesTags: ['Refetch_Creator_Course']
    }),

    //create lectures
    createLecture: builder.mutation({
      query: ({ lectureTitle, courseId }) => ({
        url: `/${courseId}/lecture`,
        method: "POST",
        body: { lectureTitle }
      })
    }),

    getCourseLecture: builder.query({
      query: (courseId) => ({
        url: `/${courseId}/lecture`,
        method: "GET",
      }),
      providesTags: ['Refetch_Lecture']
    }),

    editLecture: builder.mutation({
      query: ({ lectureTitle, videoInfo, isPreviewFree, courseId, lectureId }) => ({
        url: `/${courseId}/lecture/${lectureId}`,
        method: "POST",
        body: { lectureTitle, videoInfo, isPreviewFree }
      })
    }),
    removeLecture: builder.mutation({
      query: (lectureId) => ({
        url: `/lecture/${lectureId}`,
        method: "DELETE"
      }),
      invalidatesTags: ['Refetch_Lecture']
    }),
    getLectureById: builder.query({
      query: (lectureId) => ({
        url: `/lecture/${lectureId}`,
        method: "GET"
      })
    }),

  

    //publish and unpublish course
    togglePublishCourse: builder.mutation({
      query: ({ courseId, query }) => ({
        url: `/${courseId}?publish=${query}`,
        method: "PATCH"
      }),
      invalidatesTags: ['Refetch_Creator_Course']
    }),

    removeCourse: builder.mutation({
      query: (courseId) => ({
        url: `/${courseId}`,
        method: "DELETE"
      }),
      invalidatesTags: ['Refetch_Creator_Course']
    }),

    getPublishedCourses: builder.query({
      query: () => ({
        url: "/published-courses",
        method: "GET"
      })
    }),

    getpublishedcourseonlevel: builder.query({
      query: () => ({
        url: "/get-published-courses-on-level",
        method: "GET"
      })
    }),

    getDataforHeroSection: builder.query({
      query: () => ({
        url: "/getData-for-hero-section",
        method: "GET"
      })
    }),

    //course purchase--
    createOrder: builder.mutation({
      query: ({ courseId, amount }) => ({
        url: `/${courseId}/purchase`,
        method: "POST",
        body: { amount }
      })
    }),

    //verify order
    verifyOrder: builder.mutation({
      query: ({ courseId, response, amount }) => ({
        url: `/${courseId}/purchase/verify`,
        method: "POST",
        body: { response, amount }
      })
    }),

    //course detail with status
    getCourseDetailWithPurchaseStatus: builder.query({
      query: (courseId) => ({
        url: `/${courseId}/detail-with-status`,
        method: "GET",
      }),
    }),


    //get all purchased courses
    getAllPurchasedCourses: builder.query({
      query: ( courseId ) => ({
        url: `/${courseId}/allPurchasedCourse`,
        method: "Get"
      })
    }),

    //get reviews
    getReviewsforHome:builder.query({
      query:()=>({
        url:"/reviews",
        method:'GET'
      })
    }),

    // get search courses
    getsearchCourseQuery: builder.query({
      query:({searchQuery,categories,sortByPrice})=>{
        // build query String
        let queryString=`/search?query=${encodeURIComponent( searchQuery)}`
        
        // append categories if provided
        if(categories && categories.length>0){
            const categoriesString=categories.map(category=>encodeURIComponent(category)).join(",");    
            queryString+=`&categories=${categoriesString}`;
          }

          // append sortByPrice if provided
          if(sortByPrice){
            queryString+=`&sortByPrice=${encodeURIComponent(sortByPrice)}`;
          }

          return{
            url:queryString,
            method:"GET"
          }
        
      }

      
    }),

    getCourseAnalytics:builder.query({
      query:({courseId,selectedyear})=>({
         url:`/${courseId}/analytics?year=${selectedyear}`,
         method:"GET"
      })
    }),

    getEnrolledStudentForCourse:builder.query({
      query:(courseId)=>({
         url:`/${courseId}/enrolled`,
         method:"GET"
      })
    }),

    //reviews section
    addReviews:builder.mutation({
      query:({courseId,rating,comment})=>({
        url:`/${courseId}/review`,
        method:'POST',
        body:{rating,comment}
      })
    }),

    updateReviews:builder.mutation({
       query:({courseId,reviewId,rating,comment})=>({
         url:`/${courseId}/review/${reviewId}`,
         method:'PUT',
         body:{rating,comment}
       })
    }),

    deleteReviews:builder.mutation({
      query:({courseId,reviewId})=>({
        url:`/${courseId}/review/${reviewId}`,
        method:'DELETE',
       
      })
    }),

    getReviews:builder.query({
       query:(courseId)=>({
         url:`/${courseId}/reviews`,
         method:'GET'
       })
    }),

     //instructor dashbord
      getInstructorDashboard: builder.query({
            query: (timeRange = "month") => ({
                url: `/instructor/dashboard?range=${timeRange}`,
                method: "GET",
            })
     }),

     //get all course created by instructor
     getAllCoursesByInstructor: builder.query({
          query: () => ({
            url: `/instructor/courses`,
            method: "GET",
          }),
          providesTags: ['Refetch_Creator_Course']
     }),

     //get recent transactions
     getRecentTransactions: builder.query({
        query: () => ({
          url: `/instructor/recentTransactions`,
          method: "GET",
        }),
        providesTags: ['Refetch_Creator_Course']
    }),

    //get course info for instructor
    getCourseInfo: builder.query({
      query: (courseId) => ({
        url: `/instructor/course/${courseId}`,
        method: "GET",
      }),
      providesTags: ['Refetch_Creator_Course']
    }),

    //admin  endpoints
    getAdminDashboard: builder.query({
      query: (timeRange = "month") => ({
        url: `/admin/dashboard?range=${timeRange}`,
        method: "GET",
      })
    }),

    manageUser:builder.query({
       query:()=>({
        url:"/admin/manageUser",
        method:'GET'
       })
    }),
    
    approveUser:builder.mutation({
      query:(instructorId)=>({
        url:`/admin/approve/${instructorId}`,
        method:'PUT'
      })
    }),

    rejectUser:builder.mutation({
      query:(instructorId)=>({
        url:`/admin/reject/${instructorId}`,
        method:'PUT'
      })
    }),

    manageCourses:builder.query({
      query:()=>({
        url:"/admin/manageCourses",
        method:'GET'
      })
    }),

    topCourses:builder.query({
      query:()=>({
        url:"/admin/top-courses",
        method:'GET'
      })
    }),

    topInstructors:builder.query({
      query:()=>({
        url:"/admin/top-instructors",
        method:'GET'
      })
    }),



  }),
  keepUnusedDataFor: 0,                 // disable caching
  refetchOnMountOrArgChange: true,    

});

export const {
  useCreateCourseMutation,
  useGetCreatorCoursesQuery,
  useEditCourseMutation,
  useGetEnrolledCourseOfUserQuery,
  useGetCourseByIdQuery,
  useCreateLectureMutation,
  useGetCourseLectureQuery,
  useEditLectureMutation,
  useRemoveLectureMutation,
  useGetLectureByIdQuery,
  useTogglePublishCourseMutation,
  useRemoveCourseMutation,
  useGetPublishedCoursesQuery,
  useGetpublishedcourseonlevelQuery,
  useGetDataforHeroSectionQuery,
  useGetReviewsforHomeQuery,
  useCreateOrderMutation,
  useVerifyOrderMutation,
  useGetAllPurchasedCoursesQuery,
  useGetCourseDetailWithPurchaseStatusQuery,
  useGetsearchCourseQueryQuery,
  useGetCourseAnalyticsQuery,
  useAddReviewsMutation,
  useUpdateReviewsMutation,
  useDeleteReviewsMutation,
  useGetReviewsQuery,
  useGetEnrolledStudentForCourseQuery,
  useGetInstructorDashboardQuery,
  useGetAllCoursesByInstructorQuery,
  useGetRecentTransactionsQuery,
  useGetCourseInfoQuery,
  useGetAdminDashboardQuery,
  useManageUserQuery,
  useApproveUserMutation,
  useRejectUserMutation,
  useManageCoursesQuery,
  useTopCoursesQuery,
  useTopInstructorsQuery
  
} = courseApi

