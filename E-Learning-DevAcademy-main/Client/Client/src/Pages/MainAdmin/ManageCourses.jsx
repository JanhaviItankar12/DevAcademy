import React, { useState } from 'react';
import { Search, Trash2, Eye, Users, BookOpen, Star, Video, Award, ChevronLeft, ChevronRight, X, TrendingUp, Loader2, Menu, Filter } from 'lucide-react';
import { useManageCoursesQuery, useRemoveCourseMutation } from '@/features/api/courseApi';
import LoadingSpinner from '@/components/LoadingSpinner';
import { toast } from 'sonner';

export default function ManageCourses() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const itemsPerPage = 10;

  // Fetch courses with automatic refetching
  const { data, isLoading, isError, refetch } = useManageCoursesQuery();
  const [removeCourse, { isLoading: isDeleting }] = useRemoveCourseMutation();

  const courses = data?.courses || [];

  // Get unique categories and levels
  const categories = [...new Set(courses.map(c => c.category))];
  const levels = [...new Set(courses.map(c => c.courseLevel))];

  // Filter courses
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.subTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.creator?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'published' && course.isPublished) ||
      (filterStatus === 'unpublished' && !course.isPublished);
    const matchesCategory = filterCategory === 'all' || course.category === filterCategory;
    const matchesLevel = filterLevel === 'all' || course.courseLevel === filterLevel;
    return matchesSearch && matchesStatus && matchesCategory && matchesLevel;
  });

  // Pagination
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCourses = filteredCourses.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterCategory, filterLevel]);

  const handleDelete = async (courseId) => {
    setDeleteLoading(true);
    try {
      // Call the mutation
      const result = await removeCourse(courseId);

      if (result.data?.success) {
        toast.success(result.data.message || 'Course deleted successfully');

        // Force refetch the data
        await refetch();

        // Also check if we need to adjust pagination
        if (currentCourses.length === 1 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        }
      } else {
        toast.error(result.error?.data?.message || result.error?.message || 'Failed to delete course');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete course');
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStats = () => {
    return {
      total: courses.length,
      published: courses.filter(c => c.isPublished).length,
      unpublished: courses.filter(c => !c.isPublished).length,
      totalStudents: courses.reduce((sum, c) => sum + (c.stats?.totalStudents || 0), 0),
      totalRevenue: courses.reduce((sum, c) => sum + (c.coursePrice * (c.stats?.totalStudents || 0)), 0)
    };
  };

  const stats = getStats();

  // Loading state
  if (isLoading) {
    return (
      <LoadingSpinner />
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 text-lg font-semibold mb-2">Failed to load courses</p>
          <p className="text-gray-600">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 mt-5">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Manage All Courses
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            View and manage all courses across the platform
          </p>
        </div>

        {/* Stats Cards - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm sm:text-lg text-gray-600 mb-1">Total Courses</p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.total}</p>
              </div>
              <div className="bg-blue-100 p-2 sm:p-3 rounded-full">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm sm:text-lg text-gray-600 mb-1">Published</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-600">{stats.published}</p>
              </div>
              <div className="bg-green-100 p-2 sm:p-3 rounded-full">
                <Award className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm sm:text-lg text-gray-600 mb-1">Unpublished</p>
                <p className="text-2xl sm:text-3xl font-bold text-orange-600">{stats.unpublished}</p>
              </div>
              <div className="bg-orange-100 p-2 sm:p-3 rounded-full">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm sm:text-lg text-gray-600 mb-1">Total Students</p>
                <p className="text-2xl sm:text-3xl font-bold text-purple-600">{stats.totalStudents}</p>
              </div>
              <div className="bg-purple-100 p-2 sm:p-3 rounded-full">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm sm:text-lg text-gray-600 mb-1">Total Revenue</p>
                <p className="text-xl sm:text-2xl font-bold text-emerald-600">₹{stats.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="bg-emerald-100 p-2 sm:p-3 rounded-full">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-4 h-4" />
            {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        {/* Filters */}
        <div className={`bg-white rounded-lg shadow p-4 sm:p-6 mb-6 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative lg:col-span-1 md:col-span-2">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="unpublished">Unpublished</option>
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            >
              <option value="all">All Levels</option>
              {levels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Courses Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {currentCourses.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-base sm:text-lg">No courses found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 sm:px-6 sm:py-3 text-left text-sm sm:text-lg font-medium text-gray-500 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-4 py-3 sm:px-6 sm:py-3 text-left text-sm sm:text-lg font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Creator
                      </th>
                      <th className="px-4 py-3 sm:px-6 sm:py-3 text-left text-sm sm:text-lg font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                        Stats
                      </th>
                      <th className="px-4 py-3 sm:px-6 sm:py-3 text-left text-sm sm:text-lg font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-4 py-3 sm:px-6 sm:py-3 text-left text-sm sm:text-lg font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                        Status
                      </th>
                      <th className="px-4 py-3 sm:px-6 sm:py-3 text-left text-sm sm:text-lg font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentCourses.map((course) => (
                      <tr key={course._id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 sm:px-6 sm:py-4">
                          <div className="flex items-center">
                            {course.courseThumbnail && (
                              <img
                                src={course.courseThumbnail}
                                alt={course.courseTitle}
                                className="w-12 h-9 sm:w-16 sm:h-12 object-cover rounded mr-3"
                              />
                            )}
                            <div className="min-w-0">
                              <div className="text-sm sm:text-lg font-medium text-gray-900 truncate">
                                {course.courseTitle}
                              </div>
                              <div className="text-xs text-gray-500">
                                {course.category} • {course.courseLevel}
                              </div>
                              {/* Mobile-only creator info */}
                              <div className="md:hidden text-xs text-gray-600 mt-1">
                                By: {course.creator?.name || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 sm:px-6 sm:py-4 whitespace-nowrap hidden md:table-cell">
                          <div className="text-sm sm:text-lg text-gray-900">
                            {course.creator?.name || 'N/A'}
                          </div>
                        </td>
                        <td className="px-4 py-4 sm:px-6 sm:py-4 hidden lg:table-cell">
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-center">
                              <Users className="w-3 h-3 mr-1" />
                              {course.stats?.totalStudents || 0} students
                            </div>
                            <div className="flex items-center">
                              <Video className="w-3 h-3 mr-1" />
                              {course.stats?.totalLectures || 0} lectures
                            </div>
                            <div className="flex items-center">
                              <Star className="w-3 h-3 mr-1 text-yellow-500" />
                              {course.stats?.averageRating || 0} ({course.stats?.totalReviews || 0})
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 sm:px-6 sm:py-4 whitespace-nowrap">
                          <div className="text-sm sm:text-lg font-semibold text-gray-900">
                            ₹{course.coursePrice.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-4 py-4 sm:px-6 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                          <span
                            className={`px-2 py-1 sm:px-3 sm:py-1 inline-flex text-xs sm:text-lg leading-4 sm:leading-5 font-semibold rounded-full ${course.isPublished
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                              }`}
                          >
                            {course.isPublished ? 'Published' : 'Unpublished'}
                          </span>
                        </td>
                        <td className="px-4 py-4 sm:px-6 sm:py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedCourse(course)}
                              className="text-blue-600 cursor-pointer hover:text-blue-900 p-1"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                            <button
                              onClick={() => setShowDeleteModal(course)}
                              className="text-red-600 cursor-pointer hover:text-red-900 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Delete Course"
                              disabled={deleteLoading}
                            >
                              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination - Responsive */}
              {totalPages > 1 && (
                <div className="bg-gray-50 px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 gap-4">
                  <div className="text-xs sm:text-sm text-gray-700">
                    Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(endIndex, filteredCourses.length)}</span> of{' '}
                    <span className="font-medium">{filteredCourses.length}</span> results
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Page buttons */}
                    <div className="flex gap-1 order-2 sm:order-1">
                      {[...Array(Math.min(totalPages, 3))].map((_, idx) => {
                        let pageNum;
                        if (totalPages <= 3) {
                          pageNum = idx + 1;
                        } else if (currentPage <= 2) {
                          pageNum = idx + 1;
                        } else if (currentPage >= totalPages - 1) {
                          pageNum = totalPages - 2 + idx;
                        } else {
                          pageNum = currentPage - 1 + idx;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-1 text-xs sm:text-sm rounded-lg font-medium ${currentPage === pageNum
                                ? 'bg-blue-500 text-white'
                                : 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    {/* Navigation buttons */}
                    <div className="flex gap-2 order-1 sm:order-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Previous</span>
                      </button>

                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Course Detail Modal - Responsive */}
        {selectedCourse && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50"
            onClick={() => setSelectedCourse(null)}
          >
            <div
              className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white px-4 sm:px-6 py-4 border-b flex justify-between items-center">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Course Details
                </h2>
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              <div className="p-4 sm:p-6">
                {selectedCourse.courseThumbnail && (
                  <div className="w-full h-32 sm:h-48 rounded-lg overflow-hidden mb-4 sm:mb-6 bg-gray-100">
                    <img
                      src={selectedCourse.courseThumbnail}
                      alt={selectedCourse.courseTitle}
                      className="w-full h-full object-cover"
                      onError={(e) => (e.currentTarget.src = "https://github.com/shadcn.png")}
                    />
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-gray-500">Course Title</label>
                    <p className="text-base sm:text-lg text-gray-900 font-semibold">{selectedCourse.courseTitle}</p>
                  </div>

                  {selectedCourse.subTitle && (
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-500">Subtitle</label>
                      <p className="text-sm sm:text-base text-gray-900">{selectedCourse.subTitle}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-500">Category</label>
                      <p className="text-sm sm:text-base text-gray-900">{selectedCourse.category}</p>
                    </div>

                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-500">Level</label>
                      <p className="text-sm sm:text-base text-gray-900">{selectedCourse.courseLevel}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-500">Price</label>
                      <p className="text-sm sm:text-base font-semibold text-gray-900">₹{selectedCourse.coursePrice.toLocaleString()}</p>
                    </div>

                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-500">Creator</label>
                      <p className="text-sm sm:text-base text-gray-900">{selectedCourse.creator?.name || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-500">Status</label>
                      <p className="text-sm sm:text-base text-gray-900 capitalize">
                        {selectedCourse.isPublished ? 'Published' : 'Unpublished'}
                      </p>
                    </div>

                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-500">Created</label>
                      <p className="text-sm sm:text-base text-gray-900">{formatDate(selectedCourse.createdAt)}</p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Statistics</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600">Students</p>
                        <p className="text-lg sm:text-xl font-bold text-blue-600">
                          {selectedCourse.stats?.totalStudents || 0}
                        </p>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600">Lectures</p>
                        <p className="text-lg sm:text-xl font-bold text-purple-600">
                          {selectedCourse.stats?.totalLectures || 0}
                        </p>
                      </div>
                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600">Avg Rating</p>
                        <p className="text-lg sm:text-xl font-bold text-yellow-600">
                          {selectedCourse.stats?.averageRating || 0}
                        </p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600">Reviews</p>
                        <p className="text-lg sm:text-xl font-bold text-green-600">
                          {selectedCourse.stats?.totalReviews || 0}
                        </p>
                      </div>
                      <div className="bg-indigo-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600">Completions</p>
                        <p className="text-lg sm:text-xl font-bold text-indigo-600">
                          {selectedCourse.stats?.completionCount || 0}
                        </p>
                      </div>
                      <div className="bg-emerald-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600">Revenue</p>
                        <p className="text-lg sm:text-xl font-bold text-emerald-600">
                          ₹{((selectedCourse.stats?.totalStudents || 0) * selectedCourse.coursePrice).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setSelectedCourse(null)}
                    className="flex-1 border border-gray-300 cursor-pointer hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg transition-colors text-sm sm:text-base"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal - Responsive */}
        {showDeleteModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => !deleteLoading && setShowDeleteModal(null)}
          >
            <div
              className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 sm:p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-red-100 p-2 sm:p-3 rounded-full mr-3 sm:mr-4">
                    <Trash2 className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    Delete Course
                  </h2>
                </div>

                <p className="text-sm sm:text-base text-gray-600 mb-2">
                  Are you sure you want to delete "<strong>{showDeleteModal.courseTitle}</strong>"?
                </p>
                <p className="text-xs sm:text-sm text-gray-500 mb-6">
                  This will affect {showDeleteModal.stats?.totalStudents || 0} enrolled students. This action cannot be undone.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => handleDelete(showDeleteModal._id)}
                    disabled={deleteLoading}
                    className="flex-1 bg-red-500 cursor-pointer hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    {deleteLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      'Delete Course'
                    )}
                  </button>
                  <button
                    onClick={() => !deleteLoading && setShowDeleteModal(null)}
                    disabled={deleteLoading}
                    className="flex-1 border cursor-pointer border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}