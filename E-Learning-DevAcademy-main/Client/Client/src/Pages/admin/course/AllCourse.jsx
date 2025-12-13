import React, { useState } from 'react';
import { Users, Star, TrendingUp, BookOpen, Search, Filter, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useGetAllCoursesByInstructorQuery } from '@/features/api/courseApi';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '@/components/LoadingSpinner';


const AllCourse = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 5;
  const navigate = useNavigate();
  
  const { data: courseData, isLoading, isError } = useGetAllCoursesByInstructorQuery();

  const courses = courseData?.courseData || [];

  // Filter courses based on search and status
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'published' && course.isPublished) ||
                         (filterStatus === 'draft' && !course.isPublished);
    return matchesSearch && matchesStatus;
  });

  const handleViewCourse = (courseId) => {
    navigate(`/instructor/${courseId}/viewCourse`);
  }

  // Sort courses
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch(sortBy) {
      case 'students':
        return (b.students || 0) - (a.students || 0);
      case 'revenue':
        return (b.revenue || 0) - (a.revenue || 0);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'recent':
      default:
        return 0;
    }
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedCourses.length / coursesPerPage);
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = sortedCourses.slice(indexOfFirstCourse, indexOfLastCourse);

  // Reset to page 1 when filters change
  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (value) => {
    setFilterStatus(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  // Helper function to get rating color based on value
  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-blue-600';
    if (rating >= 3.5) return 'text-yellow-600';
    if (rating >= 3.0) return 'text-orange-600';
    return 'text-red-600';
  };

  // Helper function to get rating star color
  const getRatingStarColor = (rating) => {
    if (rating >= 4.5) return 'text-green-500 fill-green-500';
    if (rating >= 4.0) return 'text-blue-500 fill-blue-500';
    if (rating >= 3.5) return 'text-yellow-500 fill-yellow-500';
    if (rating >= 3.0) return 'text-orange-500 fill-orange-500';
    return 'text-red-500 fill-red-500';
  };

  if (isLoading) {
    return (
     <LoadingSpinner/>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">Error loading courses</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button 
              onClick={() => window.history.back()}
              className="p-2 hover:bg-gray-100 cursor-pointer rounded-lg transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">All Courses</h1>
              <p className="text-gray-600 mt-1">{courses.length} total courses</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="recent">Most Recent</option>
              <option value="students">Most Students</option>
              <option value="revenue">Highest Revenue</option>
              <option value="rating">Highest Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* Courses Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {sortedCourses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <BookOpen className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-500 text-lg">
              {searchQuery || filterStatus !== 'all' 
                ? 'No courses found matching your filters' 
                : 'No courses available yet'}
            </p>
            {(searchQuery || filterStatus !== 'all') && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setFilterStatus('all');
                  setCurrentPage(1);
                }}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">Course</th>
                      <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">Students</th>
                      <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                      <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                      <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">Recent Sales</th>
                      <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentCourses.map(course => (
                      <tr key={course.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={course.thumbnail} 
                              alt={course.title} 
                              className="w-16 h-12 rounded object-cover" 
                            />
                            <div>
                              <div className="font-medium text-lg text-gray-900">{course.title}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Users size={16} className="text-gray-400" />
                            <span className="font-medium">{course.students || 0}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-green-600">
                            ₹{(course.revenue || 0).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <Star size={16} className={getRatingStarColor(course.rating || 0)} />
                            <span className={`font-medium ${getRatingColor(course.rating || 0)}`}>
                              {Number(course.rating || 0).toFixed(1)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            <TrendingUp size={14} />
                            {course.recentSales || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 rounded-full text-sm font-medium ${
                            course.isPublished 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {course.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => handleViewCourse(course.id)}
                            className="text-blue-600 cursor-pointer hover:text-blue-700 font-medium text-sm"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {indexOfFirstCourse + 1} to {Math.min(indexOfLastCourse, sortedCourses.length)} of {sortedCourses.length} courses
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`flex items-center cursor-pointer gap-1 px-3 py-2 rounded-lg border ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNumber = index + 1;
                      // Show first page, last page, current page, and pages around current
                      if (
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => setCurrentPage(pageNumber)}
                            className={`px-3 py-2 rounded-lg ${
                              currentPage === pageNumber
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 cursor-pointer hover:bg-gray-50 border'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      } else if (
                        pageNumber === currentPage - 2 ||
                        pageNumber === currentPage + 2
                      ) {
                        return <span key={pageNumber} className="px-2">...</span>;
                      }
                      return null;
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`flex items-center cursor-pointer gap-1 px-3 py-2 rounded-lg border ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AllCourse;