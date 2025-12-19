import React, { useState } from 'react';
import { DollarSign, Users, BookOpen, TrendingUp, Star, IndianRupee, Menu, X } from 'lucide-react';
import { useGetAllCoursesByInstructorQuery, useGetInstructorDashboardQuery, useGetRecentTransactionsQuery } from '@/features/api/courseApi';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '@/components/LoadingSpinner';

const Dashboard = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('month');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data, isLoading, isError } = useGetInstructorDashboardQuery(timeRange);
  const { data: courseData, isLoading: courseLoading, isError: courseError } = useGetAllCoursesByInstructorQuery();
  const { data: recentTransactionsData, isLoading: recentLoading, isError: recentError } = useGetRecentTransactionsQuery();

  const stats = {
    totalRevenue: data?.totalRevenue || 0,
    totalStudents: data?.totalStudents || 0,
    totalCourses: data?.totalCourses || 0,
    avgRating: Number((Number(data?.averageRating) || 0).toFixed(1)),
    revenueGrowth: data?.revenuAgragateGrowth || 0,
    studentGrowth: data?.studentAgregateGrowth || 0
  };

  const courses = courseData?.courseData || [];
  const recentTransactions = recentTransactionsData?.transactions || [];

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-blue-600';
    if (rating >= 3.5) return 'text-yellow-600';
    if (rating >= 3.0) return 'text-orange-600';
    return 'text-red-600';
  };

  const getRatingStarColor = (rating) => {
    if (rating >= 4.5) return 'text-green-500 fill-green-500';
    if (rating >= 4.0) return 'text-blue-500 fill-blue-500';
    if (rating >= 3.5) return 'text-yellow-500 fill-yellow-500';
    if (rating >= 3.0) return 'text-orange-500 fill-orange-500';
    return 'text-red-500 fill-red-500';
  };

  const handleViewCourse = (courseId) => {
    navigate(`/instructor/${courseId}/viewCourse`);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Mobile Toggle Menu
  const MobileToggleMenu = () => (
    <div className="lg:hidden fixed bottom-6 right-6 z-50">
      <div className="flex flex-col items-end gap-2">
        {isMobileMenuOpen && (
          <div className="bg-white rounded-xl shadow-xl border p-3 mb-3 animate-slideUp">
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-2 rounded-lg text-base font-medium flex items-center gap-2 text-gray-700 hover:bg-gray-100"
              >
                <TrendingUp size={18} />
                Quick Stats
              </button>
              <button
                onClick={() => {
                  document.getElementById('courses-section')?.scrollIntoView({ behavior: 'smooth' });
                  setIsMobileMenuOpen(false);
                }}
                className="px-4 py-2 rounded-lg text-base font-medium flex items-center gap-2 text-gray-700 hover:bg-gray-100"
              >
                <BookOpen size={18} />
                View Courses
              </button>
              <button
                onClick={() => {
                  document.getElementById('transactions-section')?.scrollIntoView({ behavior: 'smooth' });
                  setIsMobileMenuOpen(false);
                }}
                className="px-4 py-2 rounded-lg text-base font-medium flex items-center gap-2 text-gray-700 hover:bg-gray-100"
              >
                <IndianRupee size={18} />
                Transactions
              </button>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:opacity-90 transition-opacity"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 px-3 sm:px-4 md:px-6 lg:px-8 pt-16 lg:pt-5">
      {/* Mobile Toggle Menu */}
      <MobileToggleMenu />

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm  mb-6">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Instructor Dashboard</h1>
              <p className="text-gray-600 text-sm sm:text-base mt-1">
                Welcome back, {courseData?.instructorName || 'Instructor'}!
              </p>
            </div>
            <div className="w-full sm:w-auto">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base bg-white"
              >
                <option value="week">Last 7 days</option>
                <option value="month">Last 30 days</option>
                <option value="year">Last year</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Total Revenue */}
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm  hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-lg sm:text-base font-medium">Total Revenue</p>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                  ₹{stats.totalRevenue.toLocaleString()}
                </h3>
              </div>
              <div className="bg-green-50 p-2 sm:p-3 rounded-lg">
                <IndianRupee className="text-green-600 w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>

          {/* Total Students */}
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm  hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-lg sm:text-base font-medium">Total Students</p>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                  {stats.totalStudents.toLocaleString()}
                </h3>
              </div>
              <div className="bg-blue-50 p-2 sm:p-3 rounded-lg">
                <Users className="text-blue-600 w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>

          {/* Total Courses */}
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm  hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-lg sm:text-base font-medium">Total Courses</p>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                  {stats.totalCourses}
                </h3>
                <p className="text-gray-500 text-xs sm:text-sm mt-1">All courses</p>
              </div>
              <div className="bg-purple-50 p-2 sm:p-3 rounded-lg">
                <BookOpen className="text-purple-600 w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>

          {/* Average Rating */}
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm  hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-lg sm:text-base font-medium">Average Rating</p>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                  {stats.avgRating}
                </h3>
                <p className="text-gray-500 text-xs sm:text-sm mt-1">Across all courses</p>
              </div>
              <div className="bg-yellow-50 p-2 sm:p-3 rounded-lg">
                <Star className="text-yellow-600 w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Courses Section */}
        <div id="courses-section" className="bg-white rounded-xl shadow-sm  mb-6 sm:mb-8">
          <div className="p-4 sm:p-6 ">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Your Courses</h2>
              {courses.length > 5 && (
                <button
                  onClick={() => navigate('/instructor/viewAllCourses')}
                  className="text-purple-600 hover:text-purple-700 font-medium  cursor-pointer text-sm sm:text-base self-end sm:self-center px-3 py-1.5 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  View All ({courses.length} courses)
                </button>
              )}
            </div>
          </div>

          {courses.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="text-gray-400 w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <p className="text-gray-700 text-base sm:text-lg font-medium">No courses available yet</p>
              <p className="text-gray-500 text-sm sm:text-base mt-1">Start creating your first course to see it here</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full min-w-full">
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
                  <tbody className="divide-y divide-gray-200">
                    {courses.slice(0, 5).map(course => (
                      <tr key={course._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-9 sm:w-16 sm:h-12 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={course.thumbnail}
                                alt={course.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-gray-900 text-lg sm:text-base truncate max-w-[200px]">
                                {course.title}
                              </div>
                              <div className="text-sm text-gray-500 mt-0.5 truncate">
                                {course.category || 'General'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Users size={16} className="text-gray-400" />
                            <span className="font-medium text-lg text-gray-700">{course.students || 0}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-lg text-green-600">
                            ₹{(course.revenue || 0).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              <Star size={16} className={getRatingStarColor(course.rating || 0)} />
                            </div>
                            <span className={`font-medium text-lg ${getRatingColor(course.rating || 0)}`}>
                              {Number(course.rating || 0).toFixed(1)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex  text-sm items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full  font-medium">
                            <TrendingUp size={12} />
                            {course.recentSales || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center  px-3 py-1 rounded-full text-sm font-medium ${course.isPublished
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                            }`}>
                            {course.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleViewCourse(course.id)}
                            className="text-purple-600 cursor-pointer hover:text-purple-700 font-medium text-sm px-3 py-1.5 hover:bg-purple-50 rounded-lg transition-colors"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tablet View (640px - 1024px) */}
              <div className="hidden md:block lg:hidden overflow-x-auto">
                <table className="w-full min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Students</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {courses.slice(0, 5).map(course => (
                      <tr key={course._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-9 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={course.thumbnail}
                                alt={course.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-gray-900 text-sm truncate max-w-[150px]">
                                {course.title}
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                                <span className={`font-medium ${getRatingColor(course.rating || 0)}`}>
                                  {Number(course.rating || 0).toFixed(1)}
                                </span>
                                <span className="text-gray-400">•</span>
                                <span className="inline-flex items-center gap-1">
                                  <TrendingUp size={10} />
                                  {course.recentSales || 0}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Users size={14} className="text-gray-400" />
                            <span className="font-medium text-sm">{course.students || 0}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-green-600 text-sm">
                            ₹{(course.revenue || 0).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${course.isPublished
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                            }`}>
                            {course.isPublished ? 'Live' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleViewCourse(course.id)}
                            className="text-purple-600 hover:text-purple-700 font-medium text-xs px-2 py-1 hover:bg-purple-50 rounded transition-colors"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards (< 640px) */}
              <div className="md:hidden space-y-3 p-4">
                {courses.slice(0, 5).map(course => (
                  <div key={course._id} className="bg-gray-50 rounded-lg p-4  ">
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full  object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-lg line-clamp-2 mb-2">{course.title}</h3>

                        {/* Stats Row */}
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <div className="flex items-center gap-1">
                            <Users size={12} className="text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">{course.students || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star size={12} className={getRatingStarColor(course.rating || 0)} />
                            <span className={`text-sm font-medium ${getRatingColor(course.rating || 0)}`}>
                              {Number(course.rating || 0).toFixed(1)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp size={12} className="text-blue-500" />
                            <span className="text-sm font-medium text-blue-600">{course.recentSales || 0}</span>
                          </div>
                        </div>

                        {/* Revenue and Status Row */}
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-semibold text-green-600 text-lg">
                              ₹{(course.revenue || 0).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm px-2 py-1 rounded-full ${course.isPublished
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                              }`}>
                              {course.isPublished ? 'Published' : 'Draft'}
                            </span>
                            <button
                              onClick={() => handleViewCourse(course.id)}
                              className="text-purple-600 text-sm cursor-pointer font-medium px-2 py-1 hover:bg-purple-50 rounded"
                            >
                              View
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Transactions Section */}
        <div id="transactions-section" className="bg-white rounded-xl shadow-sm ">
          <div className="p-4 sm:p-6 ">
            <h2 className="text-xl sm:text-xl lg:text-2xl font-bold text-gray-900">Recent Transactions</h2>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="text-gray-400 w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <p className="text-gray-700 text-base sm:text-lg font-medium">No recent transactions</p>
              <p className="text-gray-500 text-sm sm:text-sm mt-1">Transactions will appear here when students enroll</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Course</th>
                      <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Student</th>
                      <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentTransactions.slice(0, 10).map((transaction, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{transaction.enrolledAt}</td>
                        <td className="px-6 py-4 font-medium text-gray-900 truncate max-w-xs">
                          {transaction.courseTitle}
                        </td>
                        <td className="px-6 py-4 text-gray-600 truncate max-w-[150px]">
                          {transaction.studentName}
                        </td>
                        <td className="px-6 py-4 font-semibold text-green-600 whitespace-nowrap">
                          ₹{transaction.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tablet View (640px - 1024px) */}
              <div className="hidden md:block lg:hidden overflow-x-auto">
                <table className="w-full min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentTransactions.slice(0, 8).map((transaction, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-600 text-sm">{transaction.enrolledAt}</td>
                        <td className="px-4 py-3">
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 text-sm truncate max-w-[200px]">
                              {transaction.courseTitle}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5 truncate">
                              {transaction.studentName}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-green-600 text-sm whitespace-nowrap">
                          ₹{transaction.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards (< 640px) */}
              <div className="md:hidden space-y-3 p-4">
                {recentTransactions.slice(0, 5).map((transaction, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="space-y-2">
                      {/* Top Row: Date and Amount */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {transaction.enrolledAt}
                        </span>
                        <span className="font-bold text-green-600 text-lg">
                          ₹{transaction.amount.toLocaleString()}
                        </span>
                      </div>

                      {/* Course Title */}
                      <div className="font-medium text-gray-900 text-lg line-clamp-2">
                        {transaction.courseTitle}
                      </div>

                      {/* Student Info */}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users size={12} className="text-gray-400" />
                        <span className="truncate">{transaction.studentName}</span>
                      </div>

                      {/* Status Badge */}
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                        <span className="text-sm text-gray-500">
                          Transaction #{idx + 1}
                        </span>
                        <span className="text-sm px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                          Completed
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;