import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userLoggedIn, userLoggedOut } from "../authSlice";


const user_api = `${BACKEND_URL}/api/v1/user/`;


export const authApi = createApi({
    reducerPath: "authApi",
    baseQuery: fetchBaseQuery({
        baseUrl: user_api,
        credentials: 'include',

    }),
    endpoints: (builder) => ({
        //for register
        registerUser: builder.mutation({
            query: (inputData) => ({
                url: "register",
                method: "POST",
                body: inputData
            })
        }),
        //for login
        loginUser: builder.mutation({
            query: (inputData) => ({
                url: "login",
                method: "POST",
                body: inputData
            }),
            async onQueryStarted(_, { queryFulfilled, dispatch }) {
                try {
                    const result = await queryFulfilled;
                    dispatch(userLoggedIn({ user: result.data.user }));

                } catch (error) {
                    console.log(error);
                }
            }
        }),

        forgotPassword:builder.mutation({
            query:(email)=>({
              url:"/forgot-password",
              method:'POST',
              body:{email}
            })
        }),

        resetPassword:builder.mutation({
            query:({token,password})=>({
               url:`reset-password/${token}`,
               method:'POST',
               body:{password}
            })
        }),

        //goggle login
        googleLogin:builder.mutation({
            query:({credential,role})=>({
              url:"/google-login",
              method:'POST',
              body:{credential,role}
            })
        }),


        //logout user
        loggedOutUser: builder.mutation({
            query: () => ({
                url: "logout",
                method: "GET",
            }),
            async onQueryStarted(_, { queryFulfilled, dispatch }) {
                try {

                    dispatch(userLoggedOut());
                } catch (error) {
                    console.log(error);
                }
            }

        }),
        //load user
        loadUser: builder.query({
            query: () => ({
                url: "profile",
                method: "GET",

            }),

            async onQueryStarted(_, { queryFulfilled, dispatch }) {
                try {
                    const result = await queryFulfilled;
                    dispatch(userLoggedIn({ user: result.data.user }));
                } catch (error) {
                    console.log(error);
                }
            }
        }),
        //updateUser
        updateUser: builder.mutation({
            query: (formData) => ({
                url: "profile/update",
                method: "PUT",
                body: formData
            }),

        }),

        // get logged in user
        getCurrentUser: builder.query({
            query: () => ({
                url: "/user",
                method: 'GET'
            })
        }),

        //get admin data
        getAdminData: builder.query({
            query: () => ({
                url: "/admin",
                method: 'GET'
            })
        }),

        //student dashboard
        studDashboard: builder.query({
            query: () => ({
                url: "/student",
                method: 'GET'
            })
        }),

        //student analytics
        analytics: builder.query({
            query: () => ({
                url: "/student/analytics",
                method: 'GET'
            })
        }),

        generateCertificate: builder.mutation({
            query: (courseId) => ({
                url: `/student/gen-certificate/${courseId}`,
                method: 'POST'
            })
        }),

        //get completed courses
        getCompletedCourses: builder.query({
            query: () => ({
                url: "/student/get-completed-courses",
                method: 'GET'
            })
        }),

        //get download certificate
        downloadCertificate: builder.query({
            query: (certificateId) => ({
                url: `/student/download-certificate/${certificateId}`,
                method: 'GET',
                responseHandler: (response) => response.blob(), // <-- Important
            }),
        }),

        //all instructors
        allInstructors:builder.query({
          query:()=>({
            url:"/student/instructors",
            method:'GET'
          })
        }),

        //follow instructors
        followInstructors:builder.mutation({
           query:(instructorId)=>({
            url:`/student/follow/${instructorId}`,
            method:'POST'
           })
        }),


        //user can send message to admin for inquiry
        createMessage: builder.mutation({
            query: (messageData) => ({
                url: "message",
                method: "POST",
                body: messageData
            })
        }),

        //get messages 
        getMessages:builder.query({
            query:()=>({
                url:"/admin/get-messages",
                method:'GET'
            })
        }),

        //delete-message
        deleteMessage:builder.mutation({
            query:(messageId)=>({
                url:`/admin/delete-message/${messageId}`,
                method:'DELETE'
            })
        }),

        markAsRead:builder.mutation({
            query:({messageId,replyMessage})=>({
                url:`/admin/mark-as-read/${messageId}`,
                method:'POST',
                body:{replyMessage}
            })
        }),

        //update-notify-preferences
        updatePreference:builder.mutation({
            query:(notificationPreferences)=>({
                url:"/setting/update-notify-prefernce",
                method:"POST",
                body:{notificationPreferences}
            })
        })




    }),
    keepUnusedDataFor: 0,
    refetchOnMountOrArgChange: true //refetch on navigation
})

export const {
    useRegisterUserMutation,
    useLoginUserMutation,
    useLoadUserQuery,
    useUpdateUserMutation,
    useLoggedOutUserMutation,
    useForgotPasswordMutation,
    useResetPasswordMutation,
    useGoogleLoginMutation,
    useGetCurrentUserQuery,
    useGetAdminDataQuery,
    useStudDashboardQuery,
    useAnalyticsQuery,
    useGenerateCertificateMutation,
    useGetCompletedCoursesQuery,
    useDownloadCertificateQuery,
    useCreateMessageMutation,
    useAllInstructorsQuery,
    useFollowInstructorsMutation,
    useGetMessagesQuery,
    useDeleteMessageMutation,
    useMarkAsReadMutation,
    useUpdatePreferenceMutation

} = authApi;

