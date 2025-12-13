import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    CheckCircle,
    CheckCircle2,
    CirclePlay,
    Star,
    MessageSquare,
    Edit,
    Trash2,
    Plus,
    Download,
    ChevronUp,
    ChevronLeft,
    ChevronRight,
    XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useCompleteCourseMutation, useGetCourseProgressQuery, useIncompleteCourseMutation, useUpdateLectureProgressMutation } from '@/features/api/courseProgressApi';
import { useAddReviewsMutation, useDeleteReviewsMutation, useUpdateReviewsMutation } from '@/features/api/courseApi';
import { useGenerateCertificateMutation, useGetCurrentUserQuery } from '@/features/api/authApi';
import LoadingSpinner from '@/components/LoadingSpinner';

const CourseProgress = () => {
    const params = useParams();
    const courseId = params.courseId;

    const { data, isLoading, isError, refetch } = useGetCourseProgressQuery(courseId);
    const { data: currentUserData } = useGetCurrentUserQuery();

    // Existing mutations...
    const [updateLectureProgress] = useUpdateLectureProgressMutation();
    // Update your mutation hooks to include loading states
    const [completeCourse, {
        data: markAsCompletedData,
        isSuccess: completedSuccess,
        error: completedError,
        isLoading: isMarkingComplete // Add this
    }] = useCompleteCourseMutation();

    const [incompleteCourse, {
        data: markAsInCompletedData,
        isSuccess: inCompletedSuccess,
        isLoading: isMarkingIncomplete // Add this
    }] = useIncompleteCourseMutation();

    // Review mutations...
    const [addReview, { isLoading: isAddingReview }] = useAddReviewsMutation();
    const [updateReview, { isLoading: isUpdatingReview }] = useUpdateReviewsMutation();
    const [deleteReview, { isLoading: isDeletingReview }] = useDeleteReviewsMutation();

    // Generate certificate mutation...
    const [generateCertificate, { isLoading: isGeneratingCertificate }] = useGenerateCertificateMutation();

    // Existing state...
    const [currentLecture, setCurrentLecture] = useState(null);
    const videoRef = useRef(null);

    // Review state...
    const [showAddReview, setShowAddReview] = useState(false);
    const [newRating, setNewRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [newComment, setNewComment] = useState('');
    const [editingReview, setEditingReview] = useState(null);
    const [editRating, setEditRating] = useState(0);
    const [editComment, setEditComment] = useState('');

    const [lastTime, setLastTime] = useState(0);
const autoSaveInterval = useRef(null);


    // Certificate state...
    const [showCertificateOptions, setShowCertificateOptions] = useState(false);
    const [certificateUrl, setCertificateUrl] = useState('');

    // Sidebar collapse state...
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // Pagination state for lectures
    const [currentPage, setCurrentPage] = useState(1);
    const [lecturesPerPage] = useState(10); // Show 10 lectures per page

    // Get current user
    const currentUser = currentUserData || {};
    const currentUserId = currentUser._id;

    // Set initial lecture when data loads
    useEffect(() => {
        if (data?.data?.courseDetails?.lectures?.length && !currentLecture) {
            setCurrentLecture(data.data.courseDetails.lectures[0]);
        }
    }, [data, currentLecture]);

    // Reset to first page when lectures data changes
    useEffect(() => {
        setCurrentPage(1);
    }, [data?.data?.courseDetails?.lectures]);

    // Handle course completion status changes...
    useEffect(() => {
        if (completedSuccess) {
            toast.success(markAsCompletedData?.message || "Course marked as completed!");
            refetch();
        }
        if (completedError) {
            toast.error(completedError?.data?.message ||
                completedError?.error ||
                "Please complete all lectures before marking the course as completed.");
        }
        if (inCompletedSuccess) {
            toast.success(markAsInCompletedData?.message || "Course marked as incomplete!");
            refetch();
        }
    }, [completedSuccess, completedError, inCompletedSuccess, markAsCompletedData, markAsInCompletedData, refetch]);

    // Reset review form when user changes...
    useEffect(() => {
        setShowAddReview(false);
        setEditingReview(null);
    }, [currentUserId]);


useEffect(() => {
  const video = videoRef.current;
  if (!video) return;

  const startAutoSave = () => {
    stopAutoSave();
    autoSaveInterval.current = setInterval(() => {
      // Call update progress but not marking ended
      handleLectureProgress(currentLecture._id, false);
    }, 30000); // every 30s
  };

  const stopAutoSave = () => {
    if (autoSaveInterval.current) {
      clearInterval(autoSaveInterval.current);
      autoSaveInterval.current = null;
    }
  };

  video.addEventListener('play', startAutoSave);
  video.addEventListener('pause', stopAutoSave);
  video.addEventListener('ended', stopAutoSave);

  return () => {
    stopAutoSave();
    video.removeEventListener('play', startAutoSave);
    video.removeEventListener('pause', stopAutoSave);
    video.removeEventListener('ended', stopAutoSave);
  };
}, [currentLecture]);

    // Loading and error states...
    if (isLoading) return <LoadingSpinner />;
    if (isError) return <div className="flex justify-center items-center h-64"><p>Failed to fetch course details</p></div>;

    // Check if we have valid data...
    if (!data?.data?.courseDetails) return <div className="flex justify-center items-center h-64"><p>No course details found.</p></div>;

    const { courseDetails, progress = [], completed } = data.data;
    const { courseTitle, lectures = [], reviews = [] } = courseDetails;

    if (!lectures.length) return <div className="flex justify-center items-center h-64"><p>No lectures found for this course.</p></div>;

    // Calculate average rating and total ratings from reviews...
    const totalRatings = reviews.length;
    const averageRating = totalRatings > 0
        ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / totalRatings
        : 0;

    // Get current user's review...
    const currentUserReview = reviews.find(review => review.student?._id === currentUserId);

    // Check if a lecture is completed...
    const isLectureCompleted = (lectureId) => {
        return progress.some((prog) => prog.lectureId === lectureId && prog.viewed);
    };

    // Calculate completion percentage...
    const completedLecturesCount = lectures.filter(lecture => isLectureCompleted(lecture._id)).length;
    const completionPercentage = (completedLecturesCount / lectures.length) * 100;

    // Pagination calculations
    const totalLectures = lectures.length;
    const totalPages = Math.ceil(totalLectures / lecturesPerPage);

    // Get current lectures for pagination
    const indexOfLastLecture = currentPage * lecturesPerPage;
    const indexOfFirstLecture = indexOfLastLecture - lecturesPerPage;
    const currentLectures = lectures.slice(indexOfFirstLecture, indexOfLastLecture);

    // Handle page change
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        // Scroll to top of lectures list when page changes
        const sidebar = document.querySelector('.lectures-sidebar');
        if (sidebar) {
            sidebar.scrollTop = 0;
        }
    };

    // Handle next page
    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    // Handle previous page
    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // Handle lecture progress update...
   const handleLectureProgress = async (lectureId, ended = false) => {
  if (!videoRef.current) return;

  const video = videoRef.current;
  const watchedTime = Math.floor(video.currentTime);      // seconds watched right now
  const videoLength = Math.floor(video.duration || 0);    // total seconds (avoid NaN)
  const dropOffTime = ended ? videoLength : watchedTime; // when ended -> full length

  try {
    await updateLectureProgress({
      courseId,
      lectureId,
      body: { watchedTime, dropOffTime, videoLength }
    }).unwrap();
    refetch();
  } catch (error) {
    console.error('Error updating lecture progress:', error);
    toast.error('Failed to update lecture progress');
  }
};


    // Handle selecting a specific lecture...
    const handleSelectLecture = (lecture) => {
        setCurrentLecture(lecture);
        if (videoRef.current) {
            videoRef.current.currentTime = 0;
        }
    };

    // Handle course completion...
    const handleCompleteCourse = async () => {
        try {
            await completeCourse(courseId);
        } catch (error) {
            console.error('Error completing course:', error);
            toast.error('Failed to mark course as completed');
        }
    };

    // Handle course incompletion...
    const handleInCompleteCourse = async () => {
        try {
            await incompleteCourse(courseId);
        } catch (error) {
            console.error('Error marking course as incomplete:', error);
            toast.error('Failed to mark course as incomplete');
        }
    };

    // Handle adding new review...
    const handleAddReview = async () => {
        if (newRating === 0) {
            toast.error('Please select a rating');
            return;
        }
        if (!newComment.trim()) {
            toast.error('Please add a comment');
            return;
        }

        try {
            await addReview({
                courseId,
                rating: newRating,
                comment: newComment
            }).unwrap();

            setNewRating(0);
            setNewComment('');
            setShowAddReview(false);
            toast.success('Review added successfully!');
            await refetch();
        } catch (error) {
            console.error('Error adding review:', error);
            toast.error(error.data?.message || 'Failed to add review');
        }
    };

    // Handle editing review...
    const handleUpdateReview = async (reviewId) => {
        if (editRating === 0) {
            toast.error('Please select a rating');
            return;
        }
        if (!editComment.trim()) {
            toast.error('Please add a comment');
            return;
        }

        try {
            await updateReview({
                courseId,
                reviewId,
                rating: editRating,
                comment: editComment
            }).unwrap();

            setEditingReview(null);
            setEditRating(0);
            setEditComment('');
            toast.success('Review updated successfully!');
            refetch();
        } catch (error) {
            console.error('Error updating review:', error);
            toast.error(error.data?.message || 'Failed to update review');
        }
    };

    // Handle deleting review...
    const handleDeleteReview = async (reviewId) => {
        try {
            await deleteReview({
                courseId,
                reviewId
            }).unwrap();
            toast.success('Review deleted successfully!');
            refetch();
        } catch (error) {
            console.error('Error deleting review:', error);
            toast.error(error.data?.message || 'Failed to delete review');
        }
    };

    // Start editing review...
    const startEditReview = (review) => {
        setEditingReview(review._id);
        setEditRating(review.rating);
        setEditComment(review.comment);
    };

    // Cancel editing...
    const cancelEdit = () => {
        setEditingReview(null);
        setEditRating(0);
        setEditComment('');
    };

    // Cancel adding review...
    const cancelAddReview = () => {
        setShowAddReview(false);
        setNewRating(0);
        setNewComment('');
    };

    const handleTimeUpdate = (e) => {
  const currentTime = e.target.currentTime;

  // Prevent forward skip more than 2 seconds
  if (currentTime > lastTime + 2) {
    e.target.currentTime = lastTime;
    toast.error("Skipping ahead is not allowed!");
    return;
  }

  setLastTime(currentTime);
};

// If user tries to seek (click progress bar)
const handleSeeking = (e) => {
  const video = videoRef.current;
  if (!video) return;

  if (video.currentTime > lastTime + 2) {
    video.currentTime = lastTime;
    toast.error("Seeking is disabled for this lecture");
  }
};


    // Handle certificate generation and download...
    const handleGenerateCertificate = async () => {
        try {
            const response = await generateCertificate(courseId).unwrap();

            if (response?.success && response?.certificate?.url) {
                setCertificateUrl(response.certificate.url);
                setShowCertificateOptions(true);
                toast.success("Certificate generated successfully!");
            } else {
                toast.error("Failed to generate certificate");
            }
        } catch (error) {
            console.error('Error generating certificate:', error);
            toast.error(error.data?.message || 'Failed to generate certificate');
        }
    };

    // Handle certificate download...
    const handleDownloadCertificate = () => {
        if (!certificateUrl) return;

        const link = document.createElement('a');
        link.href = certificateUrl;
        const fileName = `${courseTitle.replace(/\s+/g, '_')}_Certificate_${Date.now()}.pdf`;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShowCertificateOptions(false);
        toast.success("Certificate download started!");
    };

    // Handle view certificate in new tab...
    const handleViewCertificate = () => {
        if (!certificateUrl) return;
        window.open(certificateUrl, '_blank');
    };

    // Render star rating...
    const renderStars = (rating, interactive = false, size = 20, onStarClick = null, onHover = null, onLeave = null) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={size}
                        className={`${star <= (interactive ? (hoverRating || rating) : rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                            } ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
                        onClick={interactive && onStarClick ? () => onStarClick(star) : undefined}
                        onMouseEnter={interactive && onHover ? () => onHover(star) : undefined}
                        onMouseLeave={interactive && onLeave ? onLeave : undefined}
                    />
                ))}
            </div>
        );
    };

    // Render pagination controls
    const renderPagination = () => {
        if (totalPages <= 1) return null;

        return (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        Showing {indexOfFirstLecture + 1}-{Math.min(indexOfLastLecture, totalLectures)} of {totalLectures} lectures
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className="h-8 w-8 p-0 cursor-pointer"
                        >
                            <ChevronLeft size={16} />
                        </Button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNumber;
                                if (totalPages <= 5) {
                                    pageNumber = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNumber = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNumber = totalPages - 4 + i;
                                } else {
                                    pageNumber = currentPage - 2 + i;
                                }

                                return (
                                    <Button
                                        key={pageNumber}
                                        variant={currentPage === pageNumber ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handlePageChange(pageNumber)}
                                        className={`h-8 w-8 p-0 cursor-pointer ${currentPage === pageNumber ? 'bg-gradient-to-r from-purple-600 to-blue-600' : ''}`}
                                    >
                                        {pageNumber}
                                    </Button>
                                );
                            })}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className="h-8 w-8 p-0 cursor-pointer"
                        >
                            <ChevronRight size={16} />
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className='min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:to-gray-800'>
            {/* Certificate Options Dialog... */}
            <Dialog open={showCertificateOptions} onOpenChange={setShowCertificateOptions}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Certificate Generated Successfully!</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <Download className="w-8 h-8 text-green-600" />
                            </div>
                            <p className="text-center text-gray-600">
                                Your certificate is ready. Choose an option below:
                            </p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Button onClick={handleDownloadCertificate} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 cursor-pointer">
                                <Download className="w-4 h-4 mr-2" />
                                Download Certificate
                            </Button>
                            <Button onClick={handleViewCertificate} variant="outline" className="w-full cursor-pointer">
                                View in Browser
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <div className='max-w-7xl mx-auto p-4 pt-24'>
                
                {/* Course Header... */}
                <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-purple-100 dark:border-gray-700 p-6 mb-6'>
                    <div className='flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4'>
                        <div className='flex-1'>
                            <h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>{courseTitle}</h1>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    {renderStars(averageRating)}
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        {averageRating.toFixed(1)} ({totalRatings} {totalRatings === 1 ? 'review' : 'reviews'})
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        {completedLecturesCount}/{lectures.length} lectures completed
                                    </span>
                                </div>
                            </div>
                            {/* Progress Bar */}
                            <div className="mt-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Course Progress</span>
                                    <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                                        {Math.round(completionPercentage)}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                    <div
                                        className="bg-gradient-to-r from-purple-600 to-blue-600 h-2.5 rounded-full transition-all duration-500"
                                        style={{ width: `${completionPercentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {completed ? (
                                // When course is marked as completed
                                <Button
                                    variant="outline"
                                    onClick={handleInCompleteCourse}
                                    disabled={isMarkingIncomplete} // Add loading state for incomplete operation
                                    className={`flex items-center cursor-pointer ${isMarkingIncomplete ? 'opacity-70' : ''}`}
                                >
                                    {isMarkingIncomplete ? (
                                        <div className="flex items-center">
                                            <LoadingSpinner size={16} className="mr-2" />
                                            Updating...
                                        </div>
                                    ) : (
                                        <>
                                            <XCircle className='h-4 w-4 mr-2' /> {/* Changed icon to XCircle for "incomplete" */}
                                            <span>Mark as Incomplete</span>
                                        </>
                                    )}
                                </Button>
                            ) : (
                                // When course is NOT marked as completed
                                <Button
                                    variant="default"
                                    onClick={handleCompleteCourse}
                                    disabled={isMarkingComplete || completionPercentage < 100} // Disable if not all lectures completed
                                    className={`bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 cursor-pointer ${(isMarkingComplete || completionPercentage < 100) ? 'opacity-70' : ''}`}
                                    title={completionPercentage < 100 ? "Complete all lectures first" : ""}
                                >
                                    {isMarkingComplete ? (
                                        <div className="flex items-center">
                                            <LoadingSpinner size={16} className="mr-2" />
                                            Marking...
                                        </div>
                                    ) : (
                                        "Mark as Completed"
                                    )}
                                </Button>
                            )}

                            {completed && (
                                <Button
                                    onClick={handleGenerateCertificate}
                                    disabled={isGeneratingCertificate}
                                    className='bg-gradient-to-r cursor-pointer from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                                >
                                    {isGeneratingCertificate ? (
                                        <div className="flex items-center">
                                            <LoadingSpinner size={16} className="mr-2" />
                                            Generating...
                                        </div>
                                    ) : (
                                        <div className="flex items-center">
                                            <Download className="h-4 w-4 mr-2" />
                                            Certificate
                                        </div>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className='flex flex-col lg:flex-row gap-6'>
                    {/* Video Section... */}
                    <div className='flex-1 lg:w-2/3'>
                        {currentLecture && (
                            <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-purple-100 dark:border-gray-700 overflow-hidden mb-6'>
                                <div className="aspect-video bg-black">
                                   <video
  ref={videoRef}
  src={currentLecture.videoUrl}
  controls
  className="w-full h-full"
  onTimeUpdate={handleTimeUpdate}
  onSeeking={handleSeeking}
  onPause={() => handleLectureProgress(currentLecture._id)}
  onEnded={() => handleLectureProgress(currentLecture._id, true)}
  onError={(e) => {
    console.error('Video loading error:', e);
    toast.error('Failed to load video');
  }}
/>

                                </div>
                                <div className='p-6'>
                                    <h3 className='text-xl font-bold text-gray-900 dark:text-white'>
                                        Lecture {lectures.findIndex((lecture) => lecture._id === currentLecture._id) + 1}: {currentLecture.lectureTitle}
                                    </h3>
                                </div>
                            </div>
                        )}

                        {/* Reviews Section... */}
                        <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-purple-100 dark:border-gray-700 p-6'>
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="text-xl font-bold text-gray-900 dark:text-white">Reviews & Ratings</h4>
                                {!currentUserReview && !showAddReview && (
                                    <Button
                                        onClick={() => setShowAddReview(true)}
                                        size="sm"
                                        disabled={isAddingReview}
                                        className=' cursor-pointer bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                                    >
                                        <Plus size={16} className="mr-2" />
                                        Add Review
                                    </Button>
                                )}
                            </div>

                            {/* Add Review Form... */}
                            {showAddReview && (
                                <div className="mb-6 p-4 border-2 border-purple-200 dark:border-purple-800 rounded-lg">
                                    <h5 className="font-semibold mb-4 text-gray-900 dark:text-white">Write a Review</h5>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">Rating</label>
                                            {renderStars(newRating, true, 24, setNewRating, setHoverRating, () => setHoverRating(0))}
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300">Comment</label>
                                            <Textarea
                                                placeholder="Share your experience with this course..."
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                rows={3}
                                                className="resize-none"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={handleAddReview}
                                                size="sm"
                                                disabled={isAddingReview}
                                                className=' cursor-pointer bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                                            >
                                                {isAddingReview ? 'Submitting...' : 'Submit Review'}
                                            </Button>
                                            <Button variant="outline" onClick={cancelAddReview} size="sm" disabled={isAddingReview}
                                                className={'cursor-pointer'}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Reviews List... */}
                            <div className="space-y-4">
                                {reviews.map((review) => (
                                    <div key={review._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                        {editingReview === review._id ? (
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="text-sm font-medium mb-2 block">Rating</label>
                                                    {renderStars(editRating, true, 20, setEditRating, setHoverRating, () => setHoverRating(0))}
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium mb-2 block">Comment</label>
                                                    <Textarea
                                                        value={editComment}
                                                        onChange={(e) => setEditComment(e.target.value)}
                                                        rows={3}
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleUpdateReview(review._id)}
                                                        disabled={isUpdatingReview}
                                                        className='bg-gradient-to-r cursor-pointer from-purple-600 to-blue-600'
                                                    >
                                                        {isUpdatingReview ? 'Updating...' : 'Update'}
                                                    </Button>
                                                    <Button size="sm" variant="outline" onClick={cancelEdit} disabled={isUpdatingReview}
                                                        className={'cursor-pointer'}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="w-10 h-10">
                                                            <AvatarImage src={review.student?.photoUrl} />
                                                            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                                                                {review.student?.name?.charAt(0) || 'U'}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-medium text-gray-900 dark:text-white">{review.student?.name || 'Anonymous'}</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                {renderStars(review.rating, false, 16)}
                                                                <span className="text-xs text-gray-500">
                                                                    {new Date(review.createdAt).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {review.student?._id === currentUserId && (
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => startEditReview(review)}
                                                                disabled={isDeletingReview}
                                                                className={'cursor-pointer'}
                                                            >
                                                                <Edit size={14} />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDeleteReview(review._id)}
                                                                disabled={isDeletingReview}
                                                                className={'cursor-pointer'}
                                                            >
                                                                <Trash2 size={14} />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
                                            </>
                                        )}
                                    </div>
                                ))}

                                {reviews.length === 0 && !showAddReview && (
                                    <div className="text-center py-12">
                                        <MessageSquare size={48} className="mx-auto text-gray-400 mb-3" />
                                        <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Lecture Sidebar with Pagination */}
                    <div className='lg:w-1/3'>
                        <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-purple-100 dark:border-gray-700 sticky top-24'>
                            <div className='p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between'>
                                <div className="flex items-center gap-2">
                                    <h2 className='font-bold text-lg text-gray-900 dark:text-white'>Course Content</h2>
                                    {totalPages > 1 && (
                                        <Badge variant="secondary" className="text-xs">
                                            Page {currentPage}/{totalPages}
                                        </Badge>
                                    )}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                                    className="lg:hidden cursor-pointer"
                                >
                                    {isSidebarCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                                </Button>
                            </div>

                            <div className={`lectures-sidebar overflow-y-auto ${isSidebarCollapsed ? 'max-h-0 lg:max-h-[calc(100vh-250px)]' : 'max-h-96 lg:max-h-[calc(100vh-250px)]'} transition-all duration-300`}>
                                <div className='p-2'>
                                    {currentLectures.map((lecture, index) => {
                                        const actualIndex = lectures.findIndex(l => l._id === lecture._id);
                                        return (
                                            <div
                                                key={lecture._id}
                                                onClick={() => handleSelectLecture(lecture)}
                                                className={`p-3 mb-2 rounded-lg cursor-pointer transition-all ${lecture._id === currentLecture?._id
                                                        ? 'bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 border-2 border-purple-300 dark:border-purple-700'
                                                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-gray-200 dark:border-gray-700'
                                                    }`}
                                            >
                                                <div className='flex items-center gap-3'>
                                                    <div className='flex-shrink-0'>
                                                        {isLectureCompleted(lecture._id) ? (
                                                            <div className='w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center'>
                                                                <CheckCircle2 size={18} className='text-green-600 dark:text-green-400' />
                                                            </div>
                                                        ) : (
                                                            <div className='w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center'>
                                                                <CirclePlay size={18} className='text-gray-500' />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className='flex-1 min-w-0'>
                                                        <p className='text-xs text-gray-500 dark:text-gray-400 mb-1'>
                                                            Lecture {actualIndex + 1}
                                                        </p>
                                                        <p className='font-medium text-sm text-gray-900 dark:text-white truncate'>
                                                            {lecture.lectureTitle}
                                                        </p>
                                                    </div>
                                                    {isLectureCompleted(lecture._id) && (
                                                        <Badge variant='outline' className='bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs border-green-200 dark:border-green-800'>
                                                            Done
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Pagination Controls */}
                            {renderPagination()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseProgress;