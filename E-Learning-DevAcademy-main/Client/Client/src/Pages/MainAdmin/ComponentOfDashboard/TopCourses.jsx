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
    return <LoadingSpinner/>
  }
  if (isError) return <p>Failed to load top courses</p>;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mt-7 mx-4 lg:mx-0">
      
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 lg:p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-purple-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl lg:text-2xl font-bold text-gray-900">Top Selling Courses</h2>
            <p className="text-lg lg:text-lg text-gray-600 mt-0.5">Best performing courses this month</p>
          </div>
        </div>
      </div>

      {/* Desktop Table - Hidden on mobile */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-lg font-semibold text-gray-700 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-4 text-left text-lg font-semibold text-gray-700 uppercase tracking-wider">
                Course
              </th>
              <th className="px-6 py-4 text-left text-lg font-semibold text-gray-700 uppercase tracking-wider">
                Rating
              </th>
              <th className="px-6 py-4 text-left text-lg font-semibold text-gray-700 uppercase tracking-wider">
                Sales
              </th>
              <th className="px-6 py-4 text-left text-lg font-semibold text-gray-700 uppercase tracking-wider">
                Revenue
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {data?.topCourses?.map((course, index) => (
              <tr key={`desktop-${index}`} className="hover:bg-purple-50 transition-colors">
                {/* Rank */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 text-lg rounded-lg flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-100 text-gray-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {index + 1}
                    </div>
                    {index < 3 && (
                      <Star className={`w-4 h-4 fill-current ${
                        index === 0 ? 'text-yellow-600' :
                        index === 1 ? 'text-gray-500' :
                        'text-orange-600'
                      }`} />
                    )}
                  </div>
                </td>

                {/* Course Info */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={course.courseThumbnail || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800"} 
                      alt={course.courseTitle}
                      className="w-16 h-16 rounded-lg object-cover object-top ring-2 ring-purple-100"
                    />
                    <div>
                      <p className="font-semibold text-lg text-gray-900 line-clamp-1">{course.courseTitle}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{course.category || 'General'}</p>
                    </div>
                  </div>
                </td>

                {/* Rating */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(course.rating) 
                              ? "text-yellow-400 fill-yellow-400" 
                              : "text-gray-300 fill-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-lg font-semibold text-gray-700">{course.rating}</span>
                  </div>
                </td>

                {/* Sales */}
                <td className="px-6 py-4">
                  <div className="inline-flex items-center text-lg gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                    <Users className="w-4 h-4" />
                    {Array.isArray(course.enrolledCount) 
                      ? course.enrolledCount 
                      : course.enrolledCount} students
                  </div>
                </td>

                {/* Revenue */}
                <td className="px-6 py-4">
                  <span className="font-bold text-green-600 text-lg">
                    ₹{(course.revenue || 0).toLocaleString()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards - Only visible on mobile */}
      <div className="lg:hidden space-y-3 p-4">
        {data?.topCourses?.map((course, index) => (
          <div 
            key={`mobile-${index}`} 
            className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden"
          >
            <div 
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleCourseDetails(index)}
            >
              <div className="flex items-center justify-between">
                {/* Rank and Course Info */}
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-yellow-100 text-yellow-700' :
                    index === 1 ? 'bg-gray-100 text-gray-700' :
                    index === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-lg text-gray-900 truncate">{course.courseTitle}</p>
                    <p className="text-sm text-gray-500">{course.category || 'General'}</p>
                  </div>
                </div>

                {/* Toggle Icon */}
                <div className="ml-2">
                  <ChevronDown 
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                      showDetails[index] ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Expandable Details */}
            {showDetails[index] && (
              <div className="border-t border-gray-200 p-4 bg-gray-50 animate-slideDown">
                <div className="space-y-3">
                  {/* Course Thumbnail */}
                  <div className="flex justify-center">
                    <img 
                      src={course.courseThumbnail || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800"} 
                      alt={course.courseTitle}
                      className="w-full max-w-xs h-40 rounded-lg object-cover object-top"
                    />
                  </div>

                  {/* Rating */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium">Rating</span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(course.rating) 
                                ? "text-yellow-400 fill-yellow-400" 
                                : "text-gray-300 fill-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-semibold text-gray-700">{course.rating}</span>
                    </div>
                  </div>

                  {/* Sales */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium">Sales</span>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                      <Users className="w-4 h-4" />
                      {Array.isArray(course.enrolledCount) 
                        ? course.enrolledCount 
                        : course.enrolledCount} students
                    </div>
                  </div>

                  {/* Revenue */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium">Revenue</span>
                    <span className="font-bold text-green-600 text-lg">
                      ₹{(course.revenue || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {(!data?.topCourses || data?.topCourses.length === 0) && (
        <div className="text-center py-12">
          <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-lg">No course data available</p>
        </div>
      )}

      {/* Footer Summary */}
      {data?.topCourses && data?.topCourses.length > 0 && (
        <div className="bg-gray-50 px-4 lg:px-6 py-4 border-t border-gray-200">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-3 lg:gap-0 text-sm">
            <span className="text-gray-600 text-base lg:text-lg text-center lg:text-left">
              Showing <span className="font-semibold text-gray-900">{data?.topCourses.length}</span> courses
            </span>
            <span className="text-gray-600 text-base lg:text-lg text-center lg:text-left">
              Total Revenue: <span className="font-bold text-green-600">
                ₹{data?.topCourses.reduce((sum, c) => sum + (c.revenue || 0), 0).toLocaleString()}
              </span>
            </span>
          </div> 
        </div>
      )}
    </div>
  );
};

export default TopCourses;
