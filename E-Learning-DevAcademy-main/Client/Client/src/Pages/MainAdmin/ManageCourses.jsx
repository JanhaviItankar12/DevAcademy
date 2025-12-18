import React, { useEffect, useState } from 'react';
import { Search, Trash2, Eye, Users, BookOpen, Star, Video, Award, ChevronLeft, ChevronRight, X,ChevronDown, TrendingUp, Loader2, Menu, Filter } from 'lucide-react';
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

  const { data, isLoading, isError, refetch } = useManageCoursesQuery();
  const [removeCourse, { isLoading: isDeleting }] = useRemoveCourseMutation();

  const courses = data?.courses || [];

  const categories = [...new Set(courses.map(c => c.category).filter(Boolean))];
  const levels = [...new Set(courses.map(c => c.courseLevel).filter(Boolean))];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.courseTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.subTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.creator?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'published' && course.isPublished) ||
      (filterStatus === 'unpublished' && !course.isPublished);
    const matchesCategory = filterCategory === 'all' || course.category === filterCategory;
    const matchesLevel = filterLevel === 'all' || course.courseLevel === filterLevel;
    return matchesSearch && matchesStatus && matchesCategory && matchesLevel;
  });

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCourses = filteredCourses.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterCategory, filterLevel]);

  const handleDelete = async (courseId) => {
    setDeleteLoading(true);
    try {
      const result = await removeCourse(courseId);
      if (result.data?.success) {
        toast.success(result.data.message || 'Course deleted successfully');
        await refetch();
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

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 text-lg font-semibold mb-2">Failed to load courses</p>
          <p className="text-gray-600">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6 mt-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
            Manage All Courses
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-600">
            View and manage all courses across the platform
          </p>
        </div>

        {/* Stats Cards - Mobile Optimized */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8">
          {[
            { title: "Total Courses", value: stats.total, icon: BookOpen, color: "blue" },
            { title: "Published", value: stats.published, icon: Award, color: "green" },
            { title: "Unpublished", value: stats.unpublished, icon: BookOpen, color: "orange" },
            { title: "Total Students", value: stats.totalStudents, icon: Users, color: "purple" },
            { title: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, icon: TrendingUp, color: "emerald" }
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-1">{stat.title}</p>
                  <p className={`text-lg sm:text-xl md:text-2xl font-bold text-${stat.color}-600`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`bg-${stat.color}-100 p-2 sm:p-3 rounded-full`}>
                  <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-black" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Filter Toggle */}
        <div className="md:hidden mb-3">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">
              {showMobileFilters ? 'Hide Filters' : 'Show Filters'} 
              <span className="ml-2 text-gray-500">
                ({filteredCourses.length} courses)
              </span>
            </span>
          </button>
        </div>

        {/* Filters Section */}
        <div className={`bg-white rounded-lg shadow mb-4 sm:mb-6 ${showMobileFilters ? 'block' : 'hidden md:block'}`}>
          <div className="p-3 sm:p-4 md:p-6">
            <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 md:grid-cols-4 gap-3">
              {/* Search */}
              <div className="relative md:col-span-2 sm:col-span-2">
                <Search className="absolute left-3 top-3 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base appearance-none cursor-pointer bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="unpublished">Unpublished</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base appearance-none cursor-pointer bg-white"
                  disabled={categories.length === 0}
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Level Filter - Full width on mobile, inline on desktop */}
            <div className="mt-3">
              <div className="relative">
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base appearance-none cursor-pointer bg-white"
                  disabled={levels.length === 0}
                >
                  <option value="all">All Levels</option>
                  {levels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-3 sm:mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold">{startIndex + 1}-{Math.min(endIndex, filteredCourses.length)}</span> of{' '}
              <span className="font-semibold">{filteredCourses.length}</span> courses
            </p>
            <div className="flex items-center gap-2">
              {(filterStatus !== 'all' || filterCategory !== 'all' || filterLevel !== 'all') && (
                <button
                  onClick={() => {
                    setFilterStatus('all');
                    setFilterCategory('all');
                    setFilterLevel('all');
                    setSearchTerm('');
                  }}
                  className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Courses List */}
        <div className="md:hidden space-y-3">
          {currentCourses.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium mb-1">No courses found</p>
              <p className="text-gray-400 text-sm">
                {searchTerm ? 'Try a different search' : 'No courses match the selected filters'}
              </p>
            </div>
          ) : (
            currentCourses.map((course) => (
              <div key={course._id} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                {/* Course Header */}
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {course.courseThumbnail && (
                      <img
                        src={course.courseThumbnail}
                        alt={course.courseTitle}
                        className="w-16 h-12 object-cover rounded flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
                        {course.courseTitle}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <span className="bg-gray-100 px-2 py-0.5 rounded">{course.category || 'General'}</span>
                        <span>•</span>
                        <span>{course.courseLevel}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold text-gray-900">
                          ₹{course.coursePrice?.toLocaleString() || '0'}
                        </div>
                        <div className={`px-2 py-0.5 text-xs font-medium rounded-full ${course.isPublished
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                          }`}>
                          {course.isPublished ? 'Published' : 'Draft'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Course Footer with Actions */}
                <div className="border-t border-gray-200 p-3 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{course.stats?.totalStudents || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Video className="w-3 h-3" />
                        <span>{course.stats?.totalLectures || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500" />
                        <span>{course.stats?.averageRating || 0}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedCourse(course)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowDeleteModal(course)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                        title="Delete Course"
                        disabled={deleteLoading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    By: {course.creator?.name || 'Unknown'} • Created: {formatDate(course.createdAt)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Courses Table */}
        <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
          {currentCourses.length === 0 ? (
            <div className="p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No courses found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 lg:px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                        Creator
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                        Stats
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentCourses.map((course) => (
                      <tr key={course._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 lg:px-6 py-4">
                          <div className="flex items-center">
                            {course.courseThumbnail && (
                              <img
                                src={course.courseThumbnail}
                                alt={course.courseTitle}
                                className="w-12 h-9 lg:w-16 lg:h-12 object-cover rounded mr-3 flex-shrink-0"
                              />
                            )}
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {course.courseTitle}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                                <span>{course.category || 'General'}</span>
                                <span>•</span>
                                <span>{course.courseLevel}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {course.creator?.name || 'N/A'}
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4">
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-center gap-2">
                              <Users className="w-3 h-3" />
                              <span>{course.stats?.totalStudents || 0} students</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Video className="w-3 h-3" />
                              <span>{course.stats?.totalLectures || 0} lectures</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Star className="w-3 h-3 text-yellow-500" />
                              <span>{course.stats?.averageRating || 0} ({course.stats?.totalReviews || 0})</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            ₹{course.coursePrice?.toLocaleString() || '0'}
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${course.isPublished
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                              }`}
                          >
                            {course.isPublished ? 'Published' : 'Unpublished'}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedCourse(course)}
                              className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded cursor-pointer"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4 lg:w-5 lg:h-5" />
                            </button>
                            <button
                              onClick={() => setShowDeleteModal(course)}
                              className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Delete Course"
                              disabled={deleteLoading}
                            >
                              <Trash2 className="w-4 h-4 lg:w-5 lg:h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-gray-50 px-4 lg:px-6 py-4 flex flex-col lg:flex-row items-center justify-between border-t border-gray-200 gap-4">
                  <div className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages} • {filteredCourses.length} courses
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>

                    <div className="flex gap-1">
                      {[...Array(totalPages)].map((_, idx) => {
                        const pageNum = idx + 1;
                        if (
                          pageNum === 1 ||
                          pageNum === totalPages ||
                          (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`px-3 py-1 rounded-lg text-sm font-medium ${currentPage === pageNum
                                  ? 'bg-blue-500 text-white'
                                  : 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                                } cursor-pointer`}
                            >
                              {pageNum}
                            </button>
                          );
                        } else if (
                          pageNum === currentPage - 2 ||
                          pageNum === currentPage + 2
                        ) {
                          return <span key={pageNum} className="px-2 py-1">...</span>;
                        }
                        return null;
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Course Detail Modal - Responsive */}
        {selectedCourse && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50"
            onClick={() => setSelectedCourse(null)}
          >
            <div
              className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white px-4 sm:px-6 py-4 border-b flex justify-between items-center">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Course Details</h2>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">{selectedCourse.courseTitle}</p>
                </div>
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-4 sm:p-6">
                {selectedCourse.courseThumbnail && (
                  <div className="w-full h-40 sm:h-48 rounded-lg overflow-hidden mb-4 sm:mb-6">
                    <img
                      src={selectedCourse.courseThumbnail}
                      alt={selectedCourse.courseTitle}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="space-y-4 sm:space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1">Course Title</label>
                      <p className="text-sm sm:text-base font-semibold text-gray-900">{selectedCourse.courseTitle}</p>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1">Price</label>
                      <p className="text-sm sm:text-base font-bold text-gray-900">
                        ₹{selectedCourse.coursePrice?.toLocaleString() || '0'}
                      </p>
                    </div>
                  </div>

                  {/* Course Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1">Category</label>
                      <p className="text-sm sm:text-base text-gray-900">{selectedCourse.category || 'General'}</p>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1">Level</label>
                      <p className="text-sm sm:text-base text-gray-900">{selectedCourse.courseLevel}</p>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1">Status</label>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${selectedCourse.isPublished
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                        }`}>
                        {selectedCourse.isPublished ? 'Published' : 'Unpublished'}
                      </span>
                    </div>
                  </div>

                  {/* Creator Info */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1">Creator</label>
                    <p className="text-sm sm:text-base text-gray-900">{selectedCourse.creator?.name || 'N/A'}</p>
                  </div>

                  {/* Statistics */}
                  <div className="border-t pt-4 sm:pt-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Statistics</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        { label: 'Students', value: selectedCourse.stats?.totalStudents || 0, color: 'blue' },
                        { label: 'Lectures', value: selectedCourse.stats?.totalLectures || 0, color: 'purple' },
                        { label: 'Avg Rating', value: selectedCourse.stats?.averageRating || 0, color: 'yellow' },
                        { label: 'Reviews', value: selectedCourse.stats?.totalReviews || 0, color: 'green' },
                        { label: 'Completions', value: selectedCourse.stats?.completionCount || 0, color: 'indigo' },
                        { label: 'Revenue', value: `₹${((selectedCourse.stats?.totalStudents || 0) * selectedCourse.coursePrice).toLocaleString()}`, color: 'emerald' }
                      ].map((stat, idx) => (
                        <div key={idx} className={`bg-${stat.color}-50 p-3 rounded-lg`}>
                          <p className="text-xs text-gray-600 mb-1">{stat.label}</p>
                          <p className={`text-base sm:text-lg font-bold text-${stat.color}-600`}>
                            {stat.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 sm:mt-8 flex gap-3">
                  <button
                    onClick={() => setSelectedCourse(null)}
                    className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg transition-colors text-sm sm:text-base cursor-pointer"
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
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base cursor-pointer"
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
                    className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base cursor-pointer"
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