import BuyCourseButton from '@/components/BuyCourseButton'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useGetCourseDetailWithPurchaseStatusQuery, useGetReviewsQuery } from '@/features/api/courseApi'
import { AvatarImage } from '@radix-ui/react-avatar'
import { BadgeInfo, Lock, PlayCircle, Star, ChevronLeft, ChevronRight, VideoOff, Eye } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import ReactPlayer from 'react-player'
import { useNavigate, useParams } from 'react-router-dom'

const CourseDetail = () => {
    const params = useParams();
    const courseId = params.courseId;
    const navigate = useNavigate();

    const { data, isLoading, isError } = useGetCourseDetailWithPurchaseStatusQuery(courseId);
    const { data: reviewData } = useGetReviewsQuery(courseId);

    const [purchased, setPurchased] = useState(false);
    const [currentLecturePage, setCurrentLecturePage] = useState(1);
    const [currentReviewPage, setCurrentReviewPage] = useState(1);
    const lecturesPerPage = 5;
    const reviewsPerPage = 5;

    useEffect(() => {
        if (data?.purchased) {
            setPurchased(data.purchased);
        }
    }, [data]);

    if (isLoading) return (
        <LoadingSpinner />
    );
    if (isError) return <p className='text-red-500 text-center mt-20'>Failed to load course detail.</p>;
    if (!data?.course) return <p className='text-red-500 text-center mt-20'>Course not found.</p>;

    const { course } = data;
    const reviews = reviewData?.reviews || [];

    // Calculate average rating
    const averageRating = reviews.length > 0
        ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length
        : 0;

    const handleContinueCourse = () => {
        if (purchased) {
            navigate(`/course-progress/${courseId}`);
        }
    };




    // Pagination logic for lectures
    const totalLecturePages = Math.ceil(course.lectures.length / lecturesPerPage);
    const indexOfLastLecture = currentLecturePage * lecturesPerPage;
    const indexOfFirstLecture = indexOfLastLecture - lecturesPerPage;
    const currentLectures = course.lectures.slice(indexOfFirstLecture, indexOfLastLecture);

    // Pagination logic for reviews
    const totalReviewPages = Math.ceil(reviews.length / reviewsPerPage);
    const indexOfLastReview = currentReviewPage * reviewsPerPage;
    const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
    const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);

    const renderStars = (rating) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={16}
                        className={`${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                ))}
            </div>
        );
    };

    const Pagination = ({ currentPage, totalPages, onPageChange }) => {
        if (totalPages <= 1) return null;

        return (
            <div className='flex justify-center items-center gap-2 mt-6'>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className='border-purple-300 hover:bg-purple-50 cursor-pointer'
                >
                    <ChevronLeft className='h-4 w-4' />
                </Button>

                {[...Array(totalPages)].map((_, index) => (
                    <Button
                        key={index + 1}
                        variant={currentPage === index + 1 ? "default" : "outline"}
                        size="sm"
                        onClick={() => onPageChange(index + 1)}
                        className={currentPage === index + 1
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                            : 'border-purple-300 hover:bg-purple-50 cursor-pointer'}
                    >
                        {index + 1}
                    </Button>
                ))}

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className='border-purple-300 hover:bg-purple-50 cursor-pointer'
                >
                    <ChevronRight className='h-4 w-4' />
                </Button>
            </div>
        );
    };

    return (
        <div className='min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:to-gray-800'>
            {/* Header Section */}
            <div className='bg-gradient-to-r from-purple-600 to-blue-600 text-white'>
                <div className='max-w-7xl mx-auto py-12 px-4 md:px-8 pt-28'>
                    <h1 className='font-bold text-3xl md:text-4xl mb-3'>{course?.courseTitle}</h1>
                    <p className='text-lg md:text-xl mb-4 text-purple-100'>{course?.subTitle}</p>

                    <div className='flex flex-wrap items-center gap-4 text-sm md:text-base'>
                        <div className='flex items-center gap-2'>
                            <span className='text-purple-200'>Created by</span>
                            <span className='font-semibold text-white'>{course?.creator.name}</span>
                        </div>

                        <div className='flex items-center gap-2'>
                            {renderStars(averageRating)}
                            <span className='text-purple-100'>
                                {averageRating.toFixed(1)} ({reviews.length} reviews)
                            </span>
                        </div>

                        <div className='flex items-center gap-2'>
                            <BadgeInfo size={16} className='text-purple-200' />
                            <span className='text-purple-100'>
                                Updated {new Date(course?.createdAt).toLocaleDateString()}
                            </span>
                        </div>

                        <div className='flex items-center gap-2'>
                            <span className='text-purple-100'>
                                {course?.enrolledStudents.length} students enrolled
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Section */}
            <div className='max-w-7xl mx-auto px-4 md:px-8 py-8'>
                <div className='flex flex-col lg:flex-row gap-8'>
                    {/* Left Side - Description and Course Content */}
                    <div className='flex-1 lg:w-2/3 space-y-6'>
                        {/* Description */}
                        <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-purple-100 dark:border-gray-700 p-6'>
                            <h2 className='font-bold text-2xl mb-4 text-gray-900 dark:text-white'>Description</h2>
                            <p className='text-base text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line'>
                                {course?.description}
                            </p>
                        </div>

                        {/* Course Content */}
                        <Card className='border-purple-100 dark:border-gray-700'>
                            <CardHeader>
                                <CardTitle className='text-2xl text-gray-900 dark:text-white'>Course Content</CardTitle>
                                <CardDescription className='text-base'>
                                    {course.lectures.length} lectures in total
                                </CardDescription>
                            </CardHeader>
                            <CardContent className='space-y-2'>
                                {currentLectures.map((lecture, index) => (
                                    <div
                                        key={index}
                                        className='flex items-center gap-3 p-3 hover:bg-purple-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors border border-gray-100 dark:border-gray-700'
                                    >
                                        <div className='w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center'>
                                            <span className='text-purple-600 dark:text-purple-400'>
                                                {purchased ? <PlayCircle size={18} /> : <Lock size={18} />}
                                            </span>
                                        </div>
                                        <div className='flex-1'>
                                            <p className='text-sm text-gray-500 dark:text-gray-400'>
                                                Lecture {indexOfFirstLecture + index + 1}
                                            </p>
                                            <p className='font-medium text-gray-900 dark:text-white'>
                                                {lecture.lectureTitle}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                <Pagination
                                    currentPage={currentLecturePage}
                                    totalPages={totalLecturePages}
                                    onPageChange={setCurrentLecturePage}
                                />
                            </CardContent>
                        </Card>

                        {/* Reviews Section */}
                        <Card className='border-purple-100 dark:border-gray-700'>
                            <CardHeader>
                                <CardTitle className='text-2xl text-gray-900 dark:text-white'>Student Reviews</CardTitle>
                                <CardDescription className='text-base'>
                                    {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className='space-y-4'>
                                {currentReviews.length > 0 ? (
                                    <>
                                        {currentReviews.map((review, index) => (
                                            <div
                                                key={index}
                                                className='border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-purple-50/50 dark:hover:bg-gray-700/50 transition-colors'
                                            >
                                                <div className='flex items-start gap-3'>
                                                    {/* User Avatar */}
                                                    <div className='w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold overflow-hidden flex-shrink-0'>
                                                        {review.student?.photoUrl ? (
                                                            <img
                                                                src={review.student.photoUrl}
                                                                alt={review.student?.name || 'User'}
                                                                className='w-full h-full object-cover'
                                                            />
                                                        ) : (
                                                            <span className='text-lg'>
                                                                {review.student?.name?.charAt(0)?.toUpperCase() || 'U'}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className='flex-1'>
                                                        <div className='flex items-center justify-between mb-2'>
                                                            <h4 className='font-semibold text-gray-900 dark:text-white'>
                                                                {review.student?.name || 'Anonymous User'}
                                                            </h4>
                                                            <span className='text-sm text-gray-500 dark:text-gray-400'>
                                                                {new Date(review.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>

                                                        {/* Star Rating */}
                                                        <div className='flex items-center gap-2 mb-2'>
                                                            {renderStars(review.rating || 0)}
                                                            <span className='text-sm text-gray-600 dark:text-gray-400'>
                                                                ({review.rating}/5)
                                                            </span>
                                                        </div>

                                                        {/* Review Comment */}
                                                        {review.comment && (
                                                            <p className='text-gray-700 dark:text-gray-300 leading-relaxed'>
                                                                {review.comment}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        <Pagination
                                            currentPage={currentReviewPage}
                                            totalPages={totalReviewPages}
                                            onPageChange={setCurrentReviewPage}
                                        />
                                    </>
                                ) : (
                                    <div className='text-center py-12'>
                                        <div className='w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-4'>
                                            <Star className='w-8 h-8 text-purple-600 dark:text-purple-400' />
                                        </div>
                                        <p className='text-gray-500 dark:text-gray-400'>
                                            No reviews yet. Be the first to review this course!
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Side - Video Player and Purchase Card */}
                    <div className='lg:w-1/3'>
                        <div className='sticky top-24'>
                            <Card className='border-purple-100 dark:border-gray-700 overflow-hidden'>
                                <CardContent className='p-0'>
                                    {/* Fixed Video Container */}
                                    <div className='relative w-full bg-black' style={{ height: '250px' }}>
                                        {data?.previewVideoUrl ? (
                                            <ReactPlayer
                                                width="100%"
                                                height="100%"
                                                url={data.previewVideoUrl}
                                                controls={true}
                                                style={{ position: 'absolute', top: 0, left: 0 }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-white p-4">
                                                <div className="mb-4">
                                                    <VideoOff size={48} className="text-gray-400" />
                                                </div>
                                                <h3 className="text-lg font-semibold mb-2">No Preview Available</h3>
                                                <p className="text-sm text-gray-300 text-center">
                                                    This course doesn't have a preview video. Purchase to access all lectures.
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className='p-6 space-y-4'>
                                        <div>
                                            <p className='text-sm text-gray-500 dark:text-gray-400 mb-1'>
                                                {data?.previewVideoUrl ? 'Preview Lecture' : 'Course Preview'}
                                            </p>
                                            <h3 className='font-semibold text-gray-900 dark:text-white line-clamp-2'>
                                                {data?.previewLecture?.lectureTitle || 'No Preview Lecture Available'}
                                            </h3>
                                        </div>

                                        <Separator />

                                        <div>
                                            <p className='text-sm text-gray-500 dark:text-gray-400 mb-2'>
                                                Course Price
                                            </p>
                                            <div className='flex items-baseline gap-2'>
                                                <span className='text-3xl font-bold text-gray-900 dark:text-white'>
                                                    ₹{course.coursePrice}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>

                                <CardFooter className='p-6 pt-0'>
                                    {purchased ? (
                                        <Button
                                            onClick={handleContinueCourse}
                                            className='w-full cursor-pointer bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg py-6'
                                        >
                                            Continue Course
                                        </Button>
                                    ) : (
                                        <BuyCourseButton
                                            amount={course.coursePrice}
                                            courseId={course._id}
                                            onPaymentSuccess={() => setPurchased(true)}
                                            className={'cursor-pointer'}
                                        />
                                    )}
                                </CardFooter>
                            </Card>

                            {/* Course Info Card */}
                            <Card className='mt-4 border-purple-100 dark:border-gray-700'>
                                <CardContent className='p-6'>
                                    <h3 className='font-semibold text-lg mb-4 text-gray-900 dark:text-white'>
                                        This course includes:
                                    </h3>
                                    <div className='space-y-3 text-sm'>
                                        <div className='flex items-center gap-3 text-gray-700 dark:text-gray-300'>
                                            <PlayCircle size={20} className='text-purple-600' />
                                            <span>{course.lectures.length} lectures</span>
                                        </div>
                                        {data?.previewVideoUrl && (
                                            <div className='flex items-center gap-3 text-gray-700 dark:text-gray-300'>
                                                <Eye size={20} className='text-purple-600' />
                                                <span>Free preview lecture</span>
                                            </div>
                                        )}
                                        <div className='flex items-center gap-3 text-gray-700 dark:text-gray-300'>
                                            <Star size={20} className='text-purple-600' />
                                            <span>{reviews.length} student reviews</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default CourseDetail;