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
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
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
    <div className='space-y-4 md:space-y-6 mt-6 md:mt-10'>
      {/* Header Section */}
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4'>
        <div className='mt-4'>
          <h1 className='text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white'>My Courses</h1>
          <p className='text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 mt-0.5 md:mt-1'>
            Manage and edit your courses
          </p>
        </div>

        {data?.courses?.length > 0 &&
          <Button
            onClick={() => navigate('create')}
            className='bg-gradient-to-r cursor-pointer from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-md text-sm md:text-base px-3 md:px-4 py-2 md:py-2'
          >
            <Plus className='mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4' />
            <span className='hidden sm:inline'>Create Course</span>
            <span className='sm:hidden'>Create</span>
          </Button>
        }
      </div>

      {/* Table Card */}
      <div className='bg-white dark:bg-gray-800 rounded-lg md:rounded-xl shadow-sm overflow-hidden'>
        {data?.courses?.length > 0 ? (
          <>
            {/* Mobile View - Cards */}
            <div className='md:hidden space-y-3 p-4'>
              {currentCourses.map((course, index) => (
                <div
                  key={course._id}
                  className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow'
                >
                  <div className='flex items-start justify-between mb-3'>
                    <div className='flex items-start gap-3'>
                      <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center flex-shrink-0'>
                        <span className='text-purple-600 dark:text-purple-400 font-bold text-sm'>
                          {startIndex + index + 1}
                        </span>
                      </div>
                      <div className='flex-1 min-w-0'>
                        <h3 className='font-medium text-gray-900 dark:text-white text-sm line-clamp-2'>
                          {course.courseTitle}
                        </h3>
                        <div className='flex items-center gap-2 mt-1'>
                          <span className='font-semibold text-gray-700 dark:text-gray-300 text-sm'>
                            ₹{course?.coursePrice || "0"}
                          </span>
                          <Badge
                            className={`text-xs px-2 py-0.5 ${course.isPublished
                                ? 'bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400'
                              }`}
                          >
                            {course.isPublished ? "Published" : "Draft"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button
                      size='sm'
                      onClick={() => navigate(`${course._id}`)}
                      variant='ghost'
                      className='hover:bg-purple-100 cursor-pointer dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400 p-1.5'
                    >
                      <Edit className='h-3.5 w-3.5' />
                    </Button>
                  </div>
                  <div className='flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-2'>
                    <span>Course #{course._id?.slice(-6)}</span>
                    <span>Click edit to manage</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View - Table */}
            <div className='hidden md:block'>
              <Table>
                <TableHeader>
                  <TableRow className='bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-50 dark:hover:bg-gray-900/50'>
                    <TableHead className='font-semibold text-gray-700 dark:text-gray-300 pl-6'>
                      <div className='flex items-center gap-2'>
                        <BookOpen className='h-4 w-4' />
                        <span>Course Title</span>
                      </div>
                    </TableHead>
                    <TableHead className='font-semibold text-gray-700 dark:text-gray-300'>
                      <div className='flex items-center gap-2'>
                        <IndianRupee className='h-4 w-4' />
                        <span>Price</span>
                      </div>
                    </TableHead>
                    <TableHead className='font-semibold text-gray-700 dark:text-gray-300'>
                      <div className='flex items-center gap-2'>
                        <FileText className='h-4 w-4' />
                        <span>Status</span>
                      </div>
                    </TableHead>
                    <TableHead className='text-right font-semibold text-gray-700 dark:text-gray-300 pr-6'>
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
                      <TableCell className='font-medium text-gray-900 dark:text-white pl-6'>
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
                          className={`${course.isPublished
                              ? 'bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400'
                            }`}
                        >
                          {course.isPublished ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-right pr-6'>
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
            </div>

            {/* Pagination Controls - Mobile */}
            {totalPages > 1 && (
              <>
                <div className='md:hidden border-t border-gray-200 dark:border-gray-700 p-4'>
                  <div className='flex flex-col items-center gap-4'>
                    <div className='text-xs text-gray-600 dark:text-gray-400 text-center'>
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
                        className='cursor-pointer p-1.5'
                      >
                        <ChevronLeft className='h-3.5 w-3.5' />
                      </Button>

                      {/* Current Page Indicator */}
                      <div className='flex items-center gap-1'>
                        <span className='text-sm text-gray-700 dark:text-gray-300 font-medium'>
                          Page {currentPage} of {totalPages}
                        </span>
                      </div>

                      {/* Next Button */}
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                        className='cursor-pointer p-1.5'
                      >
                        <ChevronRight className='h-3.5 w-3.5' />
                      </Button>
                    </div>

                    {/* Page Numbers for Mobile */}
                    {totalPages <= 5 && (
                      <div className='flex items-center gap-1'>
                        {getPageNumbers().map((page, index) => (
                          page === '...' ? (
                            <span key={`ellipsis-${index}`} className='px-1 text-gray-500'>
                              ...
                            </span>
                          ) : (
                            <Button
                              key={page}
                              variant={currentPage === page ? 'default' : 'outline'}
                              size='sm'
                              onClick={() => goToPage(page)}
                              className={`cursor-pointer min-w-[32px] h-8 text-xs ${currentPage === page
                                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                  : ''
                                }`}
                            >
                              {page}
                            </Button>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Pagination Controls - Desktop */}
                <div className='hidden md:flex items-center justify-between px-4 lg:px-6 py-4 border-t border-gray-200 dark:border-gray-700'>
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
                      <span className='hidden sm:inline ml-1'>Previous</span>
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
                            className={`cursor-pointer min-w-[36px] ${currentPage === page
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
                      <span className='hidden sm:inline mr-1'>Next</span>
                      <ChevronRight className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <div className='flex flex-col items-center justify-center py-8 md:py-16 px-4'>
            <div className='w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center mb-3 md:mb-4'>
              <BookOpen className='h-8 w-8 md:h-10 md:w-10 text-purple-600 dark:text-purple-400' />
            </div>
            <h3 className='text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-1 md:mb-2 text-center'>
              No courses yet
            </h3>
            <p className='text-gray-600 dark:text-gray-400 text-center mb-4 md:mb-6 max-w-sm text-sm md:text-base'>
              Start creating your first course and share your knowledge with students
            </p>
            <Button
              onClick={() => navigate('create')}
              className='bg-gradient-to-r from-purple-600 cursor-pointer to-blue-600 hover:from-purple-700 hover:to-blue-700 text-sm md:text-base px-4 md:px-6 py-2 md:py-2.5'
            >
              <Plus className='mr-2 h-3.5 w-3.5 md:h-4 md:w-4' />
              Create Your First Course
            </Button>
          </div>
        )}
      </div>

      {/* Footer Info */}
      {data?.courses?.length > 0 && (
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm text-gray-600 dark:text-gray-400 px-2 gap-2'>
          <p className='text-sm'>
            Total Courses: <span className='font-semibold text-purple-600 dark:text-purple-400'>{data.courses.length}</span>
          </p>
          <p className='text-xs text-gray-500 dark:text-gray-500 text-center sm:text-right'>
            {totalPages > 1 ? `Page ${currentPage} of ${totalPages}` : 'Click edit to manage your course details'}
          </p>
        </div>
      )}
    </div>
  )
}

export default CourseTable