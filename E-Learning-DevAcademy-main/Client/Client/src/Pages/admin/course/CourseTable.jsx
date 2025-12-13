import { Button } from '@/components/ui/button'
import React, { useState } from 'react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useNavigate } from 'react-router-dom'
import { useGetCreatorCoursesQuery } from '@/features/api/courseApi'
import { Edit, Plus, BookOpen, DollarSign, FileText, IndianRupee, ChevronLeft, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import LoadingSpinner from '@/components/LoadingSpinner'

const ITEMS_PER_PAGE = 10;

const CourseTable = () => {
  const { data, isLoading } = useGetCreatorCoursesQuery();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Pagination calculations
  const totalCourses = data?.courses?.length || 0;
  const totalPages = Math.ceil(totalCourses / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentCourses = data?.courses?.slice(startIndex, endIndex) || [];

  // Pagination handlers
  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show current page with context
      if (currentPage <= 3) {
        // Near the start
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        // In the middle
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className='space-y-6 mt-10'>
      {/* Header Section */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>My Courses</h1>
          <p className='text-gray-600 dark:text-gray-400 mt-1'>
            Manage and edit your courses
          </p>
        </div>

        {data?.courses?.length > 0 &&
        <Button 
          onClick={() => navigate('create')}
          className='bg-gradient-to-r cursor-pointer from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-md'
        >
          <Plus className='mr-2 h-4 w-4' />
          Create Course
        </Button>
        }
      </div>

      {/* Table Card */}
      <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden'>
        {data?.courses?.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow className='bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-50 dark:hover:bg-gray-900/50'>
                  <TableHead className='font-semibold text-gray-700 dark:text-gray-300'>
                    <div className='flex items-center gap-2'>
                      <BookOpen className='h-4 w-4' />
                      Course Title
                    </div>
                  </TableHead>
                  <TableHead className='font-semibold text-gray-700 dark:text-gray-300'>
                    <div className='flex items-center gap-2'>
                      <IndianRupee className='h-4 w-4' />
                      Price
                    </div>
                  </TableHead>
                  <TableHead className='font-semibold text-gray-700 dark:text-gray-300'>
                    <div className='flex items-center gap-2'>
                      <FileText className='h-4 w-4' />
                      Status
                    </div>
                  </TableHead>
                  <TableHead className='text-right font-semibold text-gray-700 dark:text-gray-300'>
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentCourses.map((course, index) => (
                  <TableRow 
                    key={course._id}
                    className='hover:bg-purple-50/50 dark:hover:bg-gray-700/50 transition-colors'
                  >
                    <TableCell className='font-medium text-gray-900 dark:text-white'>
                      <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center flex-shrink-0'>
                          <span className='text-purple-600 dark:text-purple-400 font-bold text-sm'>
                            {startIndex + index + 1}
                          </span>
                        </div>
                        <span className='line-clamp-1'>{course.courseTitle}</span>
                      </div>
                    </TableCell>
                    <TableCell className='text-gray-700 dark:text-gray-300'>
                      <span className='font-semibold'>₹{course?.coursePrice || "0"}</span>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={`${
                          course.isPublished 
                            ? 'bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}
                      >
                        {course.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-right'>
                      <Button 
                        size='sm' 
                        onClick={() => navigate(`${course._id}`)}
                        variant='ghost'
                        className='hover:bg-purple-100 cursor-pointer dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400'
                      >
                        <Edit className='h-4 w-4' />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className='flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700'>
                <div className='text-sm text-gray-600 dark:text-gray-400'>
                  Showing <span className='font-semibold text-gray-900 dark:text-white'>{startIndex + 1}</span> to{' '}
                  <span className='font-semibold text-gray-900 dark:text-white'>{Math.min(endIndex, totalCourses)}</span> of{' '}
                  <span className='font-semibold text-gray-900 dark:text-white'>{totalCourses}</span> courses
                </div>

                <div className='flex items-center gap-2'>
                  {/* Previous Button */}
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className='cursor-pointer'
                  >
                    <ChevronLeft className='h-4 w-4' />
                  </Button>

                  {/* Page Numbers */}
                  <div className='flex items-center gap-1'>
                    {getPageNumbers().map((page, index) => (
                      page === '...' ? (
                        <span key={`ellipsis-${index}`} className='px-2 text-gray-500'>
                          ...
                        </span>
                      ) : (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          size='sm'
                          onClick={() => goToPage(page)}
                          className={`cursor-pointer min-w-[36px] ${
                            currentPage === page
                              ? 'bg-purple-600 hover:bg-purple-700 text-white'
                              : ''
                          }`}
                        >
                          {page}
                        </Button>
                      )
                    ))}
                  </div>

                  {/* Next Button */}
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className='cursor-pointer'
                  >
                    <ChevronRight className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className='flex flex-col items-center justify-center py-16 px-4'>
            <div className='w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center mb-4'>
              <BookOpen className='h-10 w-10 text-purple-600 dark:text-purple-400' />
            </div>
            <h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>
              No courses yet
            </h3>
            <p className='text-gray-600 dark:text-gray-400 text-center mb-6 max-w-sm'>
              Start creating your first course and share your knowledge with students
            </p>
            <Button 
              onClick={() => navigate('create')}
              className='bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
            >
              <Plus className='mr-2 h-4 w-4' />
              Create Your First Course
            </Button>
          </div>
        )}
      </div>

      {/* Footer Info */}
      {data?.courses?.length > 0 && (
        <div className='flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 px-2'>
          <p>Total Courses: <span className='font-semibold text-purple-600 dark:text-purple-400'>{data.courses.length}</span></p>
          <p className='text-xs'>Click edit to manage your course details</p>
        </div>
      )}
    </div>
  )
}

export default CourseTable