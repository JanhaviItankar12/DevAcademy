import React, { useState } from 'react';
import { DollarSign, Users, BookOpen, TrendingUp, TrendingDown, Star, IndianRupee } from 'lucide-react';
import { useGetAllCoursesByInstructorQuery, useGetInstructorDashboardQuery, useGetRecentTransactionsQuery } from '@/features/api/courseApi';
import { useNavigate, } from 'react-router-dom';
import LoadingSpinner from '@/components/LoadingSpinner';

const Dashboard = () => {

  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('month');
  const [showAllCourses, setShowAllCourses] = useState(false);



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
  console.log(courses);
  const recentTransactions = recentTransactionsData?.transactions || [];

  // Display only 5 courses unless "View More" is clicked
  const displayedCourses = showAllCourses ? courses : courses.slice(0, 5);

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

  const handleViewCourse = (courseId) => {
    // Navigate to course details page
    navigate(`/instructor/${courseId}/viewCourse`);

  }

  if (isLoading) {
    return (
      <LoadingSpinner />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Instructor Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {courseData?.instructorName}!</p>
            </div>
            <div className="flex gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="week">Last 7 days</option>
                <option value="month">Last 30 days</option>
                <option value="year">Last year</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-lg font-medium">Total Revenue</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">₹{stats.totalRevenue.toLocaleString()}</h3>

              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <IndianRupee className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          {/* Total Students */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-lg font-medium">Total Students</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats.totalStudents.toLocaleString()}</h3>

              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          {/* Total Courses */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-lg font-medium">Total Courses</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats.totalCourses}</h3>
                <p className="text-gray-500 text-sm mt-2">All courses</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <BookOpen className="text-purple-600" size={24} />
              </div>
            </div>
          </div>

          {/* Average Rating */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-lg font-medium">Average Rating</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats.avgRating}</h3>
                <p className="text-gray-500 text-sm mt-2">Across all courses</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Star className="text-yellow-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Courses Table */}
        <div className="bg-white rounded-xl shadow-sm border mb-8">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Your Courses</h2>
              {courses.length > 5 && (
                <button
                  onClick={() => navigate('/instructor/viewAllCourses')}
                  className="text-blue-600 cursor-pointer hover:text-blue-700 font-medium"
                >
                  {`View More (${courses.length - 5} more)`}
                </button>
              )}
            </div>
          </div>
          {courses.length === 0 ? (
            <div className="p-12 text-center">
              <BookOpen className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-500 text-lg">No courses available yet</p>
              <p className="text-gray-400 text-sm mt-2">Start creating your first course to see it here</p>
            </div>
          ) : (
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
                  {displayedCourses.map(course => (
                    <tr key={course._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-12 bg-gray-100 flex items-center justify-center rounded overflow-hidden">
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              className="w-full h-full object-contain"
                            />
                          </div>

                          <div>
                            <div className="font-medium text-gray-900 text-lg">{course.title}</div>
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
                        <div className="font-semibold text-green-600">₹{(course.revenue || 0).toLocaleString()}</div>
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
                        <span className={`inline-flex px-2 py-1 rounded-full text-sm font-medium ${course.isPublished
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                          }`}>
                          {course.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => handleViewCourse(course.id)} className="text-blue-600 cursor-pointer hover:text-blue-700 font-medium text-sm">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
          </div>
          {recentTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <DollarSign className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-500 text-lg">No recent transactions</p>
              <p className="text-gray-400 text-sm mt-2">Transactions will appear here when students enroll in your courses</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">Course</th>
                    <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentTransactions.map((transaction, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-600">
                        {transaction.enrolledAt}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">{transaction.courseTitle}</td>
                      <td className="px-6 py-4 text-gray-600">{transaction.studentName}</td>
                      <td className="px-6 py-4 font-semibold text-green-600">₹{transaction.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;