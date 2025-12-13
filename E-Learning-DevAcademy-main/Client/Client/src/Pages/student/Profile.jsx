import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BookOpen, Edit, Eye, GraduationCap, Loader2, Plus, Save, Users, ChevronLeft, ChevronRight } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import Course from './Course'
import { useLoadUserQuery, useUpdateUserMutation } from '@/features/api/authApi'
import { toast } from 'sonner'
import { useGetCreatorCoursesQuery, useGetEnrolledCourseOfUserQuery } from '@/features/api/courseApi'
import { useNavigate } from 'react-router-dom'
import LoadingSpinner from '@/components/LoadingSpinner'

const Profile = () => {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [profilePhoto, setProfilePhoto] = useState("");
    const [photoUrl, setPhotoUrl] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const coursesPerPage = 6;

    const { data, isLoading, refetch } = useLoadUserQuery();
    const [updateUser, { data: updateUserdata, isLoading: updateUserisLoading, isError, isSuccess }] = useUpdateUserMutation();
    const { data: courseEnrolledData } = useGetEnrolledCourseOfUserQuery();
    const { data: createdCoursesData } = useGetCreatorCoursesQuery();

    useEffect(() => {
        if (data?.user?.name) {
            setName(data.user.name);
        }
    }, [data]);

    useEffect(() => {
        if (data?.user?.photoUrl) {
            setPhotoUrl(data.user.photoUrl);
        }
    }, [data]);

    useEffect(() => {
        refetch();
    }, [])

    useEffect(() => {
        if (isSuccess) {
            refetch();
            toast.success(updateUserdata?.message || "Profile Updated Successfully");
        }
        if (isError) {
            toast.error("Failed to Update UserProfile");
        }
    }, [isSuccess, isError, updateUserdata]);

    const onChangeHandler = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setProfilePhoto(file);
            setPhotoUrl(URL.createObjectURL(file));
        }
    };

    const updateUserHandler = async () => {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("profilePhoto", profilePhoto);

        try {
            const res = await updateUser(formData).unwrap();
            setPhotoUrl(res.user.photoUrl);
            setName(res.user.name);
            toast.success(res.message || "Profile updated successfully");
        } catch (error) {
            toast.error("Failed to update profile");
        }
    }

    // Loading state
    if (isLoading || !data?.user) {
        return (
            <LoadingSpinner />
        );
    }

    const user = data.user;

    // Pagination logic
    const courses = user.role === "student"
        ? courseEnrolledData?.courses || []
        : createdCoursesData?.courses || [];

    const totalPages = Math.ceil(courses.length / coursesPerPage);
    const indexOfLastCourse = currentPage * coursesPerPage;
    const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
    const currentCourses = courses.slice(indexOfFirstCourse, indexOfLastCourse);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    console.log("User Profile Photo URL:", user);

    return (
        <div className='min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:to-gray-800 py-12'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                {/* Header */}
                <div className='text-center mb-8 mt-8'>
                    <h1 className='text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2'>
                        My Profile
                    </h1>
                    <p className='text-lg text-gray-600 dark:text-gray-300'>
                        Manage your account and view your {user.role === "student" ? "learning" : "teaching"} journey
                    </p>
                </div>

                {/* Profile Card */}
                <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 border border-purple-100 dark:border-gray-700'>
                    <div className='flex flex-col lg:flex-row items-center lg:items-start gap-8'>
                        {/* Avatar Section */}
                        <div className='flex flex-col items-center'>
                            <div className='relative group'>
                                <Avatar className="h-32 w-32 mb-4 ring-4 ring-purple-500 ring-offset-4 ring-offset-white dark:ring-offset-gray-800 transition-transform group-hover:scale-105">
                                    <AvatarImage src={photoUrl || user?.photoUrl} />
                                    <AvatarFallback className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-blue-600 text-white">
                                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className='absolute inset-0 rounded-full bg-black opacity-0 group-hover:bg-opacity-10 transition-all duration-300'></div>
                            </div>
                            <div className={`px-4 py-2 rounded-full text-sm font-semibold mt-3 ${user.role === 'instructor'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                }`}>
                                {user.role.toUpperCase()}
                            </div>
                        </div>

                        {/* User Info Section */}
                        <div className='flex-1 space-y-6'>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                <div className='space-y-2'>
                                    <label className='text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide'>
                                        Full Name
                                    </label>
                                    <p className='text-xl font-semibold text-gray-900 dark:text-white'>{user.name}</p>
                                </div>
                                <div className='space-y-2'>
                                    <label className='text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide'>
                                        Email Address
                                    </label>
                                    <p className='text-xl font-semibold text-gray-900 dark:text-white'>{user.email}</p>
                                </div>
                            </div>

                            {/* Stats Cards */}
                            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8'>
                                <div className='bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white'>
                                    <div className='text-2xl font-bold'>
                                        {courses.length}
                                    </div>
                                    <div className='text-purple-100 text-sm'>
                                        {user.role === 'student' ? 'Enrolled Courses' : 'Created Courses'}
                                    </div>
                                </div>
                            </div>

                            {/* Edit Profile Button */}
                            <div className='pt-4'>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button size='lg' className='bg-gradient-to-r cursor-pointer from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1'>
                                            <Edit className='mr-2 h-4 w-4' />
                                            Edit Profile
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className='sm:max-w-md'>
                                        <DialogHeader>
                                            <DialogTitle className='text-2xl font-bold text-gray-900 dark:text-white'>
                                                Edit Profile
                                            </DialogTitle>
                                            <DialogDescription className='text-gray-600 dark:text-gray-300'>
                                                Update your profile information and photo
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className='grid gap-6 py-4'>
                                            <div className='space-y-2'>
                                                <Label className='text-sm font-medium'>Full Name</Label>
                                                <Input
                                                    type="text"
                                                    placeholder='Enter your full name'
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className='h-11'
                                                />
                                            </div>
                                            <div className='space-y-2'>
                                                <Label className='text-sm font-medium'>Profile Photo</Label>
                                                <Input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={onChangeHandler}
                                                    className='h-11'
                                                />
                                                <p className='text-xs text-gray-500'>Upload a new profile photo (JPG, PNG)</p>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button
                                                disabled={updateUserisLoading}
                                                onClick={updateUserHandler}
                                                className='w-full cursor-pointer bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                                            >
                                                {updateUserisLoading ? (
                                                    <>
                                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                                        Saving Changes...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className='mr-2 h-4 w-4' />
                                                        Save Changes
                                                    </>
                                                )}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Courses Section */}
                <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-purple-100 dark:border-gray-700'>
                    {user.role === "student" ? (
                        <>
                            <div className='flex items-center mb-6'>
                                <BookOpen className='h-6 w-6 text-purple-600 mr-3' />
                                <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
                                    Your Enrolled Courses
                                </h2>
                            </div>
                            {courses.length > 0 ? (
                                <>
                                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                                        {currentCourses.map((course) => (
                                            <div key={course._id} className='group'>
                                                <Course course={course} />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className='flex justify-center items-center gap-2 mt-8'>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className='border-purple-300 hover:bg-purple-50'
                                            >
                                                <ChevronLeft className='h-4 w-4' />
                                            </Button>

                                            {[...Array(totalPages)].map((_, index) => (
                                                <Button
                                                    key={index + 1}
                                                    variant={currentPage === index + 1 ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => handlePageChange(index + 1)}
                                                    className={currentPage === index + 1
                                                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                                                        : 'border-purple-300 cursor-pointer hover:bg-purple-50'}
                                                >
                                                    {index + 1}
                                                </Button>
                                            ))}

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                                className='border-purple-300 cursor-pointer hover:bg-purple-50'
                                            >
                                                <ChevronRight className='h-4 w-4' />
                                            </Button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className='text-center py-12'>
                                    <BookOpen className='h-16 w-16 text-gray-400 mx-auto mb-4' />
                                    <h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>
                                        No Enrolled Courses Yet
                                    </h3>
                                    <p className='text-gray-600 dark:text-gray-300 mb-6'>
                                        Start your learning journey by enrolling in courses
                                    </p>
                                    <Button onClick={() => navigate(`/course/search?query`)} className='bg-gradient-to-r cursor-pointer from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'>
                                        Browse Courses
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div className='flex items-center mb-6'>
                                <GraduationCap className='h-6 w-6 text-purple-600 mr-3' />
                                <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
                                    Your Created Courses
                                </h2>
                            </div>
                            {courses.length > 0 ? (
                                <>
                                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                                        {currentCourses.map((course) => (
                                            <div key={course._id} className='group'>
                                                <div className='bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-purple-200 dark:border-gray-600 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-2'>
                                                    <div className="relative w-full aspect-[16/9] bg-white flex items-center justify-center">
                                                        <img
                                                            src={course.courseThumbnail}
                                                            alt={course.courseTitle}
                                                            className="w-full h-full object-contain p-2"
                                                        />
                                                    </div>

                                                    <div className='p-6'>
                                                        <h3 className='font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2'>
                                                            {course.courseTitle}
                                                        </h3>
                                                        <p className='text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2'>
                                                            {course.subTitle || 'Course description goes here...'}
                                                        </p>
                                                        <div className='flex items-center justify-between'>
                                                            <span className='text-2xl font-bold text-purple-600 dark:text-purple-400'>
                                                                ₹ {course.coursePrice || '0'}
                                                            </span>
                                                            <div className='flex items-center text-sm text-gray-500'>
                                                                <Users className='h-4 w-4 mr-1' />
                                                                {course.enrolledStudents?.length || 0} students
                                                            </div>
                                                        </div>
                                                        <div className='mt-4 flex gap-2'>
                                                            <Button size='sm' variant='outline' className='flex-1 cursor-pointer border-purple-300 hover:bg-purple-50' onClick={() => navigate(`/instructor/course/${course._id}`)}>
                                                                <Edit className='h-4 w-4 mr-1' />
                                                                Edit
                                                            </Button>
                                                            <Button size='sm' className='flex-1 cursor-pointer bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700' onClick={() => navigate(`/instructor/course/${course._id}/preview`)}>
                                                                <Eye className='h-4 w-4 mr-1' />
                                                                View
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className='flex justify-center items-center gap-2 mt-8'>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className='border-purple-300 cursor-pointer hover:bg-purple-50'
                                            >
                                                <ChevronLeft className='h-4 w-4' />
                                            </Button>

                                            {[...Array(totalPages)].map((_, index) => (
                                                <Button
                                                    key={index + 1}
                                                    variant={currentPage === index + 1 ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => handlePageChange(index + 1)}
                                                    className={currentPage === index + 1
                                                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                                                        : 'border-purple-300 cursor-pointer hover:bg-purple-50'}
                                                >
                                                    {index + 1}
                                                </Button>
                                            ))}

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                                className='border-purple-300 cursor-pointer hover:bg-purple-50'
                                            >
                                                <ChevronRight className='h-4 w-4' />
                                            </Button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className='text-center py-12'>
                                    <GraduationCap className='h-16 w-16 text-gray-400 mx-auto mb-4' />
                                    <h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>
                                        No Courses Created Yet
                                    </h3>
                                    <p className='text-gray-600 dark:text-gray-300 mb-6'>
                                        Share your knowledge by creating your first course
                                    </p>
                                    <Button className='bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700' onClick={() => navigate("/instructor/course/create")}>
                                        <Plus className='h-4 w-4 mr-2 cursor-pointer' />
                                        Create Course
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;