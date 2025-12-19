import LoadingSpinner from "@/components/LoadingSpinner";
import { useTopCoursesQuery } from "@/features/api/courseApi";
import React from "react";
import { TrendingUp, Star, Users, ChevronDown } from "lucide-react";
import { useState } from 'react';

const TopCourses = () => {
  const { data, isLoading, isError, refetch } = useTopCoursesQuery();
  const [showDetails, setShowDetails] = useState({});

  // Toggle function for mobile view
  const toggleCourseDetails = (index) => {
    setShowDetails(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  if (isLoading) {
    return <LoadingSpinner />
  }
  if (isError) return <p className="text-red-500 text-center p-4">Failed to load top courses</p>;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mt-4 md:mt-7 mx-2 md:mx-4 lg:mx-0">

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 md:p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Top Selling Courses</h2>
            <p className="text-sm md:text-base text-gray-600 mt-0.5">Best performing courses this month on the basis of sale</p>
          </div>
        </div>
      </div>

      {/* Tablet & Desktop Table - Hidden on mobile */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 md:px-6 py-3 md:py-4 text-left text-sm md:text-base font-semibold text-gray-700 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-4 md:px-6 py-3 md:py-4 text-left text-sm md:text-base font-semibold text-gray-700 uppercase tracking-wider">
                Course
              </th>
              <th className="px-4 md:px-6 py-3 md:py-4 text-left text-sm md:text-base font-semibold text-gray-700 uppercase tracking-wider">
                Rating
              </th>
              <th className="px-4 md:px-6 py-3 md:py-4 text-left text-sm md:text-base font-semibold text-gray-700 uppercase tracking-wider">
                Students
              </th>
              <th className="px-4 md:px-6 py-3 md:py-4 text-left text-sm md:text-base font-semibold text-gray-700 uppercase tracking-wider">
                Revenue
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {data?.topCourses?.map((course, index) => (
              <tr key={`desktop-${index}`} className="hover:bg-purple-50 transition-colors">
                {/* Rank */}
                <td className="px-4 md:px-6 py-3 md:py-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 md:w-9 md:h-9 rounded-lg flex items-center justify-center font-bold text-sm md:text-base ${index === 0 ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                        index === 1 ? 'bg-gray-100 text-gray-700 border border-gray-200' :
                          index === 2 ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                            'bg-purple-100 text-purple-700 border border-purple-200'
                      }`}>
                      #{index + 1}
                    </div>
                    {index < 3 && (
                      <Star className={`w-4 h-4 md:w-5 md:h-5 fill-current ${index === 0 ? 'text-yellow-500' :
                          index === 1 ? 'text-gray-400' :
                            'text-orange-500'
                        }`} />
                    )}
                  </div>
                </td>

                {/* Course Info */}
                <td className="px-4 md:px-6 py-3 md:py-4">
                  <div className="flex items-center gap-2 md:gap-3">
                    <img
                      src={course.courseThumbnail || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400"}
                      alt={course.courseTitle}
                      className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-lg object-cover ring-2 ring-purple-100"
                      loading="lazy"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm md:text-base lg:text-lg line-clamp-1 md:line-clamp-2">
                        {course.courseTitle}
                      </p>
                      <p className="text-xs md:text-sm text-gray-500 mt-0.5">{course.category || 'General'}</p>
                    </div>
                  </div>
                </td>

                {/* Rating */}
                <td className="px-4 md:px-6 py-3 md:py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 md:w-4 md:h-4 ${i < Math.floor(course.rating)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300 fill-gray-300"
                            }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm md:text-base font-semibold text-gray-700">
                      {course.rating}
                    </span>
                  </div>
                </td>

                {/* Students */}
                <td className="px-4 md:px-6 py-3 md:py-4">
                  <div className="inline-flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-blue-50 text-blue-700 font-medium text-sm md:text-base border border-blue-200">
                    <Users className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="hidden md:inline">{course.enrolledCount || 0} students</span>
                    <span className="md:hidden">{course.enrolledCount || 0}</span>
                  </div>
                </td>

                {/* Revenue */}
                <td className="px-4 md:px-6 py-3 md:py-4">
                  <span className="font-bold text-green-600 text-sm md:text-base lg:text-lg">
                    ₹{(course.revenue || 0).toLocaleString()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards - Only visible on mobile */}
      <div className="md:hidden">
        {data?.topCourses?.map((course, index) => (
          <div
            key={`mobile-${index}`}
            className={`border-b border-gray-200 ${index === 0 ? 'border-t-0' : ''
              } ${showDetails[index] ? 'bg-gray-50' : ''}`}
          >
            <div
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleCourseDetails(index)}
            >
              <div className="flex items-start gap-3">
                {/* Rank Badge */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold flex-shrink-0 ${index === 0 ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                    index === 1 ? 'bg-gray-100 text-gray-700 border border-gray-200' :
                      index === 2 ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                        'bg-purple-100 text-purple-700 border border-purple-200'
                  }`}>
                  #{index + 1}
                </div>

                {/* Course Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-base line-clamp-2 mb-1">
                        {course.courseTitle}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {course.category || 'General'}
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-xs font-medium text-gray-700">{course.rating}</span>
                        </div>
                      </div>
                    </div>

                    {/* Toggle Icon and Revenue */}
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-bold text-green-600 text-base">
                        ₹{(course.revenue || 0).toLocaleString('en-IN', {
                          notation: 'compact',
                          maximumFractionDigits: 1
                        })}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showDetails[index] ? 'rotate-180' : ''
                          }`}
                      />
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-blue-600" />
                      <span className="text-xs text-gray-600">
                        {course.enrolledCount || 0} students
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Expandable Details */}
            {showDetails[index] && (
              <div className="px-4 pb-4 animate-slideDown">
                <div className="pl-13 pr-4 space-y-3">
                  {/* Course Thumbnail */}
                  <div className="mt-2">
                    <img
                      src={course.courseThumbnail || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400"}
                      alt={course.courseTitle}
                      className="w-full h-48 rounded-lg object-cover"
                      loading="lazy"
                    />
                  </div>

                  {/* Detailed Stats */}
                  <div className="grid grid-cols-2 gap-3 bg-white rounded-lg p-3 border border-gray-200">
                    <div className="text-center">
                      <div className="text-sm text-gray-500 mb-1">Rating</div>
                      <div className="flex items-center justify-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-bold text-gray-900">{course.rating}</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-500 mb-1">Students</div>
                      <div className="font-bold text-gray-900">{course.enrolledCount || 0}</div>
                    </div>
                  </div>

                  {/* Full Revenue */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="text-sm text-green-700 mb-1">Total Revenue</div>
                    <div className="font-bold text-green-700 text-lg">
                      ₹{(course.revenue || 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {(!data?.topCourses || data?.topCourses.length === 0) && (
        <div className="text-center py-12 md:py-16">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 md:w-10 md:h-10 text-gray-400" />
          </div>
          <p className="text-gray-500 text-base md:text-lg font-medium mb-2">No course data available</p>
          <p className="text-gray-400 text-sm">Check back later for top performing courses</p>
        </div>
      )}

      {/* Footer Summary */}
      {data?.topCourses && data?.topCourses.length > 0 && (
        <div className="bg-gray-50 px-4 md:px-6 py-3 md:py-4 border-t border-gray-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-0">
            <div className="text-center md:text-left">
              <span className="text-gray-600 text-sm md:text-base">
                Showing <span className="font-semibold text-gray-900">{data?.topCourses.length}</span> courses
              </span>
            </div>
            <div className="text-center md:text-left">
              <span className="text-gray-600 text-sm md:text-base">
                Total Revenue: <span className="font-bold text-green-600 text-base md:text-lg">
                  ₹{data?.topCourses.reduce((sum, c) => sum + (c.revenue || 0), 0).toLocaleString()}
                </span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopCourses;
