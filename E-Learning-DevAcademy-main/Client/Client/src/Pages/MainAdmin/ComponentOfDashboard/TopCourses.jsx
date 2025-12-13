import LoadingSpinner from "@/components/LoadingSpinner";
import { useTopCoursesQuery } from "@/features/api/courseApi";
import React from "react";
import { TrendingUp, Star, Users } from "lucide-react";

const TopCourses = () => {
  const { data, isLoading, isError, refetch } = useTopCoursesQuery();

  if (isLoading) {
    return <LoadingSpinner/>
  }
  if (isError) return <p>Failed to load top courses</p>;

  return (
    <div className="bg-white  rounded-2xl shadow-lg border border-gray-100 overflow-hidden mt-7">
      
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Top Selling Courses</h2>
            <p className="text-lg text-gray-600 mt-0.5">Best performing courses this month</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
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
              <tr key={index} className="hover:bg-purple-50 transition-colors">
                {/* Rank */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 text-lg rounded-lg flex items-center justify-center font-bold  ${
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
                  <div className="inline-flex items-center text-lg gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium ">
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

      {/* Empty State */}
      {(!data?.topCourses || data?.topCourses.length === 0) && (
        <div className="text-center py-12">
          <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-lg">No course data available</p>
        </div>
      )}

      {/* Footer Summary */}
      {data?.topCourses && data?.topCourses.length > 0 && (
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 text-lg">
              Showing <span className="font-semibold text-lg text-gray-900">{data?.topCourses.length}</span> courses
            </span>
            <span className="text-gray-600 text-lg">
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
