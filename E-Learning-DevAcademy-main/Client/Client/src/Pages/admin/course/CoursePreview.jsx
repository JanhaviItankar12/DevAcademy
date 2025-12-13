import React, { useState } from 'react';
import { ArrowLeft, BadgeInfo, PlayCircle, Lock, Edit, Settings, Eye, BarChart3, Users } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import {  useGetCourseDetailWithPurchaseStatusQuery } from '@/features/api/courseApi';
import LoadingSpinner from '@/components/LoadingSpinner';
import ReactPlayer from 'react-player';


const CoursePreview = () => {
    const navigate = useNavigate();
    const params = useParams();
    const courseId = params.courseId;
    
   
    const {data: courseData,isLoading,isError,refetch} = useGetCourseDetailWithPurchaseStatusQuery(courseId);
    
    const course = courseData?.course;



   
   
    
    const [currentLecturePage, setCurrentLecturePage] = useState(1);
    const lecturesPerPage = 5;

    const handleViewAnalytics = () => {
        navigate(`/instructor/course/${courseId}/preview/analytics`);
    };

    const handleEnrolledStudent = () => {
        navigate(`/instructor/course/${courseId}/preview/enrolled`);
    };

    if (isLoading || !course) {
        return <LoadingSpinner />;
    }

    if (!course) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <p className='text-gray-500'>Course not found</p>
            </div>
        );
    }

    // Pagination logic for lectures
    const lectures = course?.lectures || [];
    const totalLecturePages = Math.ceil(lectures.length / lecturesPerPage);
    const indexOfLastLecture = currentLecturePage * lecturesPerPage;
    const indexOfFirstLecture = indexOfLastLecture - lecturesPerPage;
    const currentLectures = lectures.slice(indexOfFirstLecture, indexOfLastLecture);

    const Pagination = ({ currentPage, totalPages, onPageChange }) => {
        if (totalPages <= 1) return null;

        return (
            <div className='flex justify-center items-center gap-2 mt-6'>
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg border transition-colors ${
                        currentPage === 1
                            ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                            : 'border-purple-300 hover:bg-purple-50 text-purple-600'
                    }`}
                >
                    <ChevronLeft className='h-4 w-4' />
                </button>
                
                {[...Array(totalPages)].map((_, index) => (
                    <button
                        key={index + 1}
                        onClick={() => onPageChange(index + 1)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            currentPage === index + 1
                                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                                : 'border border-purple-300 hover:bg-purple-50 text-gray-700'
                        }`}
                    >
                        {index + 1}
                    </button>
                ))}
                
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg border transition-colors ${
                        currentPage === totalPages
                            ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                            : 'border-purple-300 hover:bg-purple-50 text-purple-600'
                    }`}
                >
                    <ChevronRight className='h-4 w-4' />
                </button>
            </div>
        );
    };

    return (
        <div className='min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:to-gray-800'>
            {/* Instructor Header */}
            <div className='bg-white dark:bg-gray-800 border-b border-purple-100 dark:border-gray-700 shadow-sm fixed top-16 left-0 right-0 z-10'>
                <div className='max-w-7xl mx-auto px-4 md:px-8 py-4'>
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-4'>
                            <button 
                                onClick={() => navigate(-1)}
                                className='p-2 cursor-pointer hover:bg-purple-50 dark:hover:bg-gray-700 rounded-lg transition-colors'
                            >
                                <ArrowLeft className='h-5 w-5 text-purple-600 dark:text-purple-400' />
                            </button>
                            <div>
                                <h1 className='text-lg font-semibold text-gray-900 dark:text-white'>Course Preview</h1>
                                <p className='text-sm text-gray-500 dark:text-gray-400'>This is how students see your course</p>
                            </div>
                        </div>
                        <div className='flex items-center gap-2'>
                            <button 
                                onClick={handleViewAnalytics}
                                className='flex cursor-pointer items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-colors'
                            >
                                <BarChart3 className='h-4 w-4' />
                                <span className='hidden sm:inline'>Analytics</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Course Content */}
            <div className='pt-32 pb-8'>
                {/* Header Section */}
                <div className='bg-gradient-to-r from-purple-600 to-blue-600 text-white'>
                    <div className='max-w-7xl mx-auto py-12 px-4 md:px-8'>
                        <h1 className='font-bold text-3xl md:text-4xl mb-3'>{course?.courseTitle}</h1>
                        <p className='text-lg md:text-xl mb-4 text-purple-100'>{course?.subTitle}</p>
                        
                        <div className='flex flex-wrap items-center gap-4 text-sm md:text-base'>
                            <div className='flex items-center gap-2'>
                                <span className='text-purple-200'>Created by</span>
                                <span className='font-semibold text-white'>{course?.creator?.name}</span>
                            </div>
                            
                            <div className='flex items-center gap-2'>
                                <BadgeInfo size={16} className='text-purple-200' />
                                <span className='text-purple-100'>
                                    Updated {new Date(course?.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            
                            <div className='flex items-center gap-2'>
                                <span className='text-purple-100'>
                                    {course?.enrolledStudents?.length || 0} students enrolled
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Section */}
                <div className='max-w-7xl mx-auto px-4 md:px-8 py-8'>
                    <div className='flex flex-col lg:flex-row gap-8'>
                        {/* Left Side */}
                        <div className='flex-1 lg:w-2/3 space-y-6'>
                            {/* Description */}
                            <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-purple-100 dark:border-gray-700 p-6'>
                                <h2 className='font-bold text-2xl mb-4 text-gray-900 dark:text-white'>Description</h2>
                                <p className='text-base text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line'>
                                    {course?.description}
                                </p>
                            </div>

                            {/* Course Content */}
                            <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-purple-100 dark:border-gray-700 overflow-hidden'>
                                <div className='p-6 border-b border-gray-200 dark:border-gray-700'>
                                    <h3 className='text-2xl font-bold text-gray-900 dark:text-white'>Course Content</h3>
                                    <p className='text-base text-gray-500 dark:text-gray-400 mt-1'>
                                        {lectures.length} lectures in total
                                    </p>
                                </div>
                                <div className='p-6 space-y-2'>
                                    {currentLectures.map((lecture, index) => (
                                        <div 
                                            key={index} 
                                            className='flex items-center gap-3 p-3 hover:bg-purple-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors border border-gray-100 dark:border-gray-700'
                                        >
                                            <div className='w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center'>
                                                <PlayCircle size={18} className='text-purple-600 dark:text-purple-400' />
                                            </div>
                                            <div className='flex-1'>
                                                <p className='text-sm text-gray-500 dark:text-gray-400'>
                                                    Lecture {indexOfFirstLecture + index + 1}
                                                </p>
                                                <p className='font-medium text-gray-900 dark:text-white'>
                                                    {lecture?.lectureTitle}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    <Pagination 
                                        currentPage={currentLecturePage}
                                        totalPages={totalLecturePages}
                                        onPageChange={setCurrentLecturePage}
                                    />
                                </div>
                            </div>

                            {/* Instructor Stats Card */}
                            <div className='bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-200 dark:border-purple-700 p-6'>
                                <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>Instructor Overview</h3>
                                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                                    <div className='text-center p-4 bg-white dark:bg-gray-800 rounded-lg'>
                                        <div className='text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent'>
                                            {course?.enrolledStudents?.length || 0}
                                        </div>
                                        <div className='text-sm text-gray-600 dark:text-gray-400 mt-1'>Total Students</div>
                                    </div>
                                    <div className='text-center p-4 bg-white dark:bg-gray-800 rounded-lg'>
                                        <div className='text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent'>
                                            ₹{course?.coursePrice || 0}
                                        </div>
                                        <div className='text-sm text-gray-600 dark:text-gray-400 mt-1'>Course Price</div>
                                    </div>
                                    <div className='text-center p-4 bg-white dark:bg-gray-800 rounded-lg'>
                                        <div className='text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent'>
                                            {lectures.length}
                                        </div>
                                        <div className='text-sm text-gray-600 dark:text-gray-400 mt-1'>Total Lectures</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Video Player and Actions */}
                        <div className='lg:w-1/3'>
                            <div className='sticky top-32'>
                                <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-purple-100 dark:border-gray-700 overflow-hidden'>
                                    {/* Fixed Video Container */}
                                    <div className='relative w-full bg-black' style={{ height: '250px' }}>
                                        {courseData?.previewVideoUrl ? (
                                            <ReactPlayer 
                                                width="100%"
                                                height="100%"
                                                url={courseData?.previewVideoUrl}
                                                controls={true}
                                                style={{ position: 'absolute', top: 0, left: 0 }}
                                            />
                                        ) : (
                                            <div className='flex items-center justify-center h-full'>
                                                <div className='text-gray-400 text-center'>
                                                    <PlayCircle className='h-12 w-12 mx-auto mb-2' />
                                                    <p className='text-sm'>No preview video</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className='p-6 space-y-4'>
                                        <div>
                                            <p className='text-sm text-gray-500 dark:text-gray-400 mb-1'>
                                                Preview Lecture
                                            </p>
                                            <h3 className='font-semibold text-gray-900 dark:text-white line-clamp-2'>
                                                {courseData?.previewLecture?.lectureTitle || course?.courseTitle}
                                            </h3>
                                        </div>

                                        <div className='h-px bg-gray-200 dark:bg-gray-600'></div>
                                        
                                        <div>
                                            <p className='text-sm text-gray-500 dark:text-gray-400 mb-2'>
                                                Course Price
                                            </p>
                                            <div className='flex items-baseline gap-2'>
                                                <span className='text-3xl font-bold text-gray-900 dark:text-white'>
                                                    ₹{course?.coursePrice || 0}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Action Buttons */}
                                    <div className='p-6 pt-0 space-y-3'>
                                        <button 
                                            onClick={handleViewAnalytics}
                                            className='w-full cursor-pointer bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2'
                                        >
                                            <BarChart3 className='h-4 w-4' />
                                            View Analytics
                                        </button>
                                        
                                        <button 
                                            onClick={handleEnrolledStudent}
                                            className='w-full cursor-pointer border-2 border-purple-300 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2'
                                        >
                                            <Users className='h-4 w-4' />
                                            View Students
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoursePreview;