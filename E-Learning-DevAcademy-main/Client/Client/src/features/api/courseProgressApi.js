import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const COURSE_PROGRESS_API="https://devacademy-ssuf.onrender.com/api/v1/progress"
export const courseProgressApi = createApi({
    reducerPath: "courseProgressApi",
    tagTypes:["CourseProgress"],
    baseQuery:fetchBaseQuery({
        baseUrl: COURSE_PROGRESS_API,
        credentials: "include"
    }),
    endpoints: (builder) => ({
        getCourseProgress:builder.query({
            query:(courseId)=>({
               url:`/${courseId}`,  
               method:"GET"
            })
        }),
        updateLectureProgress:builder.mutation({
            query:({courseId,lectureId,body})=>({
                url:`/${courseId}/lecture/${lectureId}/view`,
                method:"POST",
                body
            }),
            invalidatesTags:["CourseProgress"]
        }),
        completeCourse:builder.mutation({
            query:(courseId)=>({
                url:`/${courseId}/complete`,
                method:"POST"
            })
        }),
        incompleteCourse:builder.mutation({
            query:(courseId)=>({
                url:`/${courseId}/incomplete`,
                method:"POST"
            })
        })

    }),
    keepUnusedDataFor: 0,                 //  disable caching
    refetchOnMountOrArgChange: true,    
});

export const {
    useGetCourseProgressQuery,
    useUpdateLectureProgressMutation,
    useCompleteCourseMutation,
    useIncompleteCourseMutation
}
=courseProgressApi;