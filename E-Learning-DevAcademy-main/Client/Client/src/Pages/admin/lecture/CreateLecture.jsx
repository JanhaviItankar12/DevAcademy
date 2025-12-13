import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateLectureMutation, useGetCourseLectureQuery } from '@/features/api/courseApi'
import { Loader2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Lecture from './Lecture'
import { toast } from 'sonner'

const CreateLecture = () => {
    const navigate = useNavigate();
    const params = useParams();
    const courseId = params.courseId;

    const [lectureTitle, setLectureTitle] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const lecturesPerPage = 6;

    const [createLecture, { data, isLoading, isSuccess, isError, error }] = useCreateLectureMutation();

    const { data: lectureData, isLoading: lectureLoading, error: lectureError, refetch } = useGetCourseLectureQuery(courseId);

    const createLectureHandler = async () => {
        await createLecture({ lectureTitle, courseId });
    }

    useEffect(() => {
        if (isSuccess) {
            refetch();
            toast.success(data?.message || "Lecture created successfully");
            setLectureTitle(""); // Clear input after success
        }
        if (isError) {
            console.log(error?.data?.message);
            toast.error(error?.data?.message || "Failed to create lecture");
        }
    }, [isSuccess, isError, error]);

    // Calculate pagination
    const lectures = lectureData?.lectures || [];
    const totalLectures = lectures.length;
    const totalPages = Math.ceil(totalLectures / lecturesPerPage);
    
    // Calculate the lectures to show on current page
    const indexOfLastLecture = currentPage * lecturesPerPage;
    const indexOfFirstLecture = indexOfLastLecture - lecturesPerPage;
    const currentLectures = lectures.slice(indexOfFirstLecture, indexOfLastLecture);

    // Handle page change
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
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

    // Generate page numbers
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxVisiblePages = 5;
        
        if (totalPages <= maxVisiblePages) {
            // Show all pages if total pages are less than or equal to maxVisiblePages
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            // Show ellipsis and limited pages
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pageNumbers.push(i);
                }
                pageNumbers.push('...');
                pageNumbers.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pageNumbers.push(1);
                pageNumbers.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pageNumbers.push(i);
                }
            } else {
                pageNumbers.push(1);
                pageNumbers.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pageNumbers.push(i);
                }
                pageNumbers.push('...');
                pageNumbers.push(totalPages);
            }
        }
        
        return pageNumbers;
    };

    return (
        <div className='flex-1 mx-10 mt-10'>
            <div className='mb-4'>
                <h1 className='font-bold text-2xl'>Let's add lectures, add some basic details for your new lecture</h1>
                <p className='text-lg'>Easily expand your learning platform by adding more lectures.</p>
                <div className='space-y-8 mt-8'>
                    <div className='space-y-2'>
                        <Label>Title</Label>
                        <Input 
                            type={'text'} 
                            value={lectureTitle} 
                            name='lectureTitle' 
                            onChange={(e) => setLectureTitle(e.target.value)} 
                            placeholder='Your Lecture Title' 
                        />
                    </div>

                    <div className='flex items-center gap-4'>
                        <Button 
                            variant={'outline'} 
                            onClick={() => navigate(`/instructor/course/${courseId}`)} 
                            className={'cursor-pointer'}
                        >
                            Back to Course
                        </Button>
                        <Button 
                            disabled={isLoading || !lectureTitle.trim()} 
                            onClick={createLectureHandler} 
                            className={'cursor-pointer'}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please Wait...
                                </>
                            ) : "Create Lecture"}
                        </Button>
                    </div>

                    {/* All lectures data */}
                    <div className='mt-10'>
                        {lectureLoading ? (
                            <p>Loading Lectures...</p>
                        ) : lectureError ? (
                            <p>Failed to load lectures</p>
                        ) : lectures.length === 0 ? (
                            <p>No lectures available...</p>
                        ) : (
                            <>
                                {/* Lectures List */}
                                <div className='space-y-4'>
                                    {currentLectures.map((lecture, index) => (
                                        <Lecture 
                                            key={lecture._id} 
                                            lecture={lecture} 
                                            index={index + indexOfFirstLecture} 
                                        />
                                    ))}
                                </div>
                                
                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className='flex justify-center items-center space-x-2 mt-8'>
                                        {/* Previous Button */}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handlePrevPage}
                                            disabled={currentPage === 1}
                                            className="cursor-pointer"
                                        >
                                            Previous
                                        </Button>
                                        
                                        {/* Page Numbers */}
                                        {getPageNumbers().map((pageNumber, index) => (
                                            pageNumber === '...' ? (
                                                <span key={`ellipsis-${index}`} className="px-2">
                                                    ...
                                                </span>
                                            ) : (
                                                <Button
                                                    key={pageNumber}
                                                    variant={currentPage === pageNumber ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => handlePageChange(pageNumber)}
                                                    className="cursor-pointer"
                                                >
                                                    {pageNumber}
                                                </Button>
                                            )
                                        ))}
                                        
                                        {/* Next Button */}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleNextPage}
                                            disabled={currentPage === totalPages}
                                            className="cursor-pointer"
                                        >
                                            Next
                                        </Button>
                                    </div>
                                )}
                                
                                {/* Pagination Info */}
                                <div className="text-center mt-4 text-sm text-gray-600">
                                    Showing {indexOfFirstLecture + 1} to {Math.min(indexOfLastLecture, totalLectures)} of {totalLectures} lectures
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CreateLecture
