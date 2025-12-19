import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BookOpen, Edit, Eye, GraduationCap, Loader2, Plus, Save, Users, ChevronLeft, ChevronRight, Bell } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import Course from './Course'
import { useLoadUserQuery, useUpdatePreferenceMutation, useUpdateUserMutation } from '@/features/api/authApi'
import { toast } from 'sonner'
import { useGetCreatorCoursesQuery, useGetEnrolledCourseOfUserQuery } from '@/features/api/courseApi'
import { useNavigate } from 'react-router-dom'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Switch } from '@/components/ui/switch'

const Profile = () => {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [profilePhoto, setProfilePhoto] = useState("");
    const [photoUrl, setPhotoUrl] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const coursesPerPage = 6;

    // Notification preferences state
    const [notificationPreferences, setNotificationPreferences] = useState({
        newCourse: true,
        followedInstructor: true,
        weeklyDigest: true,
        noMails: false
    });

    const { data, isLoading, refetch } = useLoadUserQuery();
    const [updateUser, { data: updateUserdata, isLoading: updateUserisLoading, isError, isSuccess }] = useUpdateUserMutation();
    const { data: courseEnrolledData, isLoading: isEnrolledCoursesLoading } = useGetEnrolledCourseOfUserQuery();
    const { data: createdCoursesData, isLoading: isCreatedCoursesLoading } = useGetCreatorCoursesQuery();
    const [updatePreference, { isLoading: isUpdatingPreferences }] = useUpdatePreferenceMutation();

    useEffect(() => {
        if (data?.user?.name) {
            setName(data.user.name);
        }
        if (data?.user?.photoUrl) {
            setPhotoUrl(data.user.photoUrl);
        }
        if (data?.user?.notificationPreferences) {
            setNotificationPreferences(data.user.notificationPreferences);
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

    const handlePreferenceChange = (key) => {
        if (key === 'noMails') {
            // If noMails is enabled, disable all other options
            setNotificationPreferences(prev => ({
                newCourse: false,
                followedInstructor: false,
                weeklyDigest: false,
                noMails: !prev.noMails
            }));
        } else {
            // If enabling any other option, disable noMails
            setNotificationPreferences(prev => ({
                ...prev,
                [key]: !prev[key],
                noMails: false
            }));
        }
    };

    const saveNotificationPreferences = async () => {
        try {
            const res = await updatePreference(notificationPreferences).unwrap();
            toast.success(res.message || "Notification preferences updated");
            refetch();
        } catch (error) {
            toast.error("Failed to update notification preferences");
        }
    };

    // Main loading state
    if (isLoading || !data?.user) {
        return (
            <div className='min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center'>
                <LoadingSpinner size="large" text="Loading your profile..." />
            </div>
        );
    }

    const user = data.user;

    // Check if courses data is still loading
    const isCoursesLoading = user.role === "student" 
        ? isEnrolledCoursesLoading 
        : isCreatedCoursesLoading;

    // Get courses data with fallback
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

                {/* Profile Card - Same as before... */}
                <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 border border-purple-100 dark:border-gray-700'>
                    {/* ... Keep all the profile card code exactly as you had it ... */}
                    {/* Avatar Section */}
                    <div className='flex flex-col lg:flex-row items-center lg:items-start gap-8'>
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

                            {/* Edit Profile & Notification Buttons */}
                            <div className='flex flex-wrap gap-3 pt-4'>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button size='lg' className='bg-gradient-to-r cursor-pointer from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300'>
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

                                {/* Notification Preferences Button - Only for Students */}
                                {user.role === "student" && (
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="lg"
                                                className='border-purple-300 cursor-pointer hover:bg-purple-50 hover:border-purple-400'
                                            >
                                                <Bell className='mr-2 h-4 w-4' />
                                                Notification Settings
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className='sm:max-w-lg'>
                                            <DialogHeader>
                                                <DialogTitle className='text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2'>
                                                    <Bell className='h-6 w-6 text-purple-600' />
                                                    Notification Preferences
                                                </DialogTitle>
                                                <DialogDescription className='text-gray-600 dark:text-gray-300'>
                                                    Manage your email notification settings
                                                </DialogDescription>
                                            </DialogHeader>

                                            <div className='py-4 space-y-6'>
                                                <div className='space-y-4'>
                                                    <div className='flex items-center justify-between'>
                                                        <div className='flex-1'>
                                                            <h3 className='font-medium text-gray-900 dark:text-white'>New Courses</h3>
                                                            <p className='text-sm text-gray-500 dark:text-gray-400'>
                                                                Get notified about new courses added to the platform
                                                            </p>
                                                        </div>
                                                        <Switch
                                                            checked={notificationPreferences.newCourse}
                                                            onCheckedChange={() => handlePreferenceChange('newCourse')}
                                                            disabled={notificationPreferences.noMails}
                                                            className='data-[state=checked]:bg-purple-600'
                                                        />
                                                    </div>

                                                    <div className='flex items-center justify-between'>
                                                        <div className='flex-1'>
                                                            <h3 className='font-medium text-gray-900 dark:text-white'>Followed Instructors</h3>
                                                            <p className='text-sm text-gray-500 dark:text-gray-400'>
                                                                Updates from instructors you follow
                                                            </p>
                                                        </div>
                                                        <Switch
                                                            checked={notificationPreferences.followedInstructor}
                                                            onCheckedChange={() => handlePreferenceChange('followedInstructor')}
                                                            disabled={notificationPreferences.noMails}
                                                            className='data-[state=checked]:bg-purple-600'
                                                        />
                                                    </div>

                                                    <div className='flex items-center justify-between'>
                                                        <div className='flex-1'>
                                                            <h3 className='font-medium text-gray-900 dark:text-white'>Weekly Digest</h3>
                                                            <p className='text-sm text-gray-500 dark:text-gray-400'>
                                                                Weekly summary of your learning activities
                                                            </p>
                                                        </div>
                                                        <Switch
                                                            checked={notificationPreferences.weeklyDigest}
                                                            onCheckedChange={() => handlePreferenceChange('weeklyDigest')}
                                                            disabled={notificationPreferences.noMails}
                                                            className='data-[state=checked]:bg-purple-600'
                                                        />
                                                    </div>

                                                    <div className='pt-4 border-t border-gray-200 dark:border-gray-700'>
                                                        <div className='flex items-center justify-between'>
                                                            <div className='flex-1'>
                                                                <h3 className='font-medium text-gray-900 dark:text-white'>Unsubscribe from all</h3>
                                                                <p className='text-sm text-gray-500 dark:text-gray-400'>
                                                                    Stop all email notifications from the platform
                                                                </p>
                                                            </div>
                                                            <Switch
                                                                checked={notificationPreferences.noMails}
                                                                onCheckedChange={() => handlePreferenceChange('noMails')}
                                                                className='data-[state=checked]:bg-red-600'
                                                            />
                                                        </div>
                                                        {notificationPreferences.noMails && (
                                                            <p className='text-sm text-red-500 mt-2'>
                                                                All email notifications are currently disabled
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className='bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg'>
                                                    <h4 className='font-medium text-purple-700 dark:text-purple-300 mb-2 flex items-center gap-2'>
                                                        <Bell className='h-4 w-4' />
                                                        Current Settings
                                                    </h4>
                                                    <div className='text-sm text-purple-600 dark:text-purple-400 space-y-1'>
                                                        <p>• New Courses: {notificationPreferences.newCourse ? 'Enabled' : 'Disabled'}</p>
                                                        <p>• Followed Instructors: {notificationPreferences.followedInstructor ? 'Enabled' : 'Disabled'}</p>
                                                        <p>• Weekly Digest: {notificationPreferences.weeklyDigest ? 'Enabled' : 'Disabled'}</p>
                                                        <p>• Email Status: {notificationPreferences.noMails ? 'All disabled' : 'Active'}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <DialogFooter>
                                                <Button
                                                    onClick={saveNotificationPreferences}
                                                    disabled={isUpdatingPreferences}
                                                    className='w-full cursor-pointer bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                                                >
                                                    {isUpdatingPreferences ? (
                                                        <>
                                                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                                            Saving...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Save className='mr-2 h-4 w-4' />
                                                            Save Preferences
                                                        </>
                                                    )}
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                )}

                                {/* Instructor-specific buttons */}
                                {user.role === "instructor" && (
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={() => navigate("/instructor/course/create")}
                                        className='border-purple-300 cursor-pointer hover:bg-purple-50 hover:border-purple-400'
                                    >
                                        <Plus className='mr-2 h-4 w-4' />
                                        Create Course
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Courses Section */}
                <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-purple-100 dark:border-gray-700'>
                    {/* Show loader while courses are loading */}
                    {isCoursesLoading ? (
                        <div className='py-16 text-center'>
                            <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4'></div>
                            <h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>
                                Loading {user.role === "student" ? "Enrolled" : "Created"} Courses...
                            </h3>
                            <p className='text-gray-600 dark:text-gray-300'>
                                Please wait while we fetch your course information
                            </p>
                        </div>
                    ) : (
                        <>
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
                                            <Button onClick={() => navigate(`/courses`)} className='bg-gradient-to-r cursor-pointer from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'>
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
                                                    <div key={course._id} className='group h-full'>
                                                        <div className='bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-purple-200 dark:border-gray-600 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-2 flex flex-col h-[500px]'>
                                                            <div className="relative w-full h-48 flex-shrink-0 bg-white flex items-center justify-center">
                                                                <img
                                                                    src={course.courseThumbnail}
                                                                    alt={course.courseTitle}
                                                                    className="w-full h-full object-contain p-2"
                                                                />
                                                            </div>

                                                            <div className='p-6 flex flex-col flex-grow'>
                                                                <div className='min-h-[3.5rem] mb-2'>
                                                                    <h3 className='font-bold text-lg text-gray-900 dark:text-white line-clamp-2'>
                                                                        {course.courseTitle}
                                                                    </h3>
                                                                </div>

                                                                <div className='min-h-[2.8rem] mb-4 flex-grow'>
                                                                    <p className='text-gray-600 dark:text-gray-300 text-sm line-clamp-2'>
                                                                        {course.subTitle || 'Course description goes here...'}
                                                                    </p>
                                                                </div>

                                                                <div className='mt-auto'>
                                                                    <div className='flex items-center justify-between mb-4'>
                                                                        <span className='text-2xl font-bold text-purple-600 dark:text-purple-400'>
                                                                            ₹ {course.coursePrice || '0'}
                                                                        </span>
                                                                        <div className='flex items-center text-sm text-gray-500'>
                                                                            <Users className='h-4 w-4 mr-1' />
                                                                            {course.enrolledStudents?.length || 0} students
                                                                        </div>
                                                                    </div>
                                                                    <div className='flex gap-2'>
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
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;