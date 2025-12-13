import LoadingSpinner from "@/components/LoadingSpinner";
import { useGetAdminDashboardQuery } from "@/features/api/courseApi";
import React from "react";

const TopCourses = () => {
  const { data, isLoading, isError, refetch } = useGetAdminDashboardQuery();
  
  console.log(data);

   if (isLoading) {
    return <LoadingSpinner/>
    }
  if (isError) return <p>Failed to load top courses</p>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-10">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">Top Selling Courses</h2>
        <p className="text-lg text-gray-500 mt-1">Best performing courses this month</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-lg font-semibold text-gray-600 uppercase">Course</th>
              <th className="px-6 py-3 text-left text-lg font-semibold text-gray-600 uppercase">Sales</th>
              <th className="px-6 py-3 text-left text-lg font-semibold text-gray-600 uppercase">Revenue</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {data?.data?.topCourses?.map((course, index) => (
              <tr key={index} className="hover:bg-gray-50">
                {/* Course Info */}
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900 text-lg">{course.courseTitle}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-sm ${i < Math.floor(course.rating) ? "text-yellow-400" : "text-gray-300"}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-lg text-gray-500">{course.rating}</span>
                    </div>
                  </div>
                </td>

                {/* Sales */}
                <td className="px-6 py-4">
                  <span className="font-semibold text-gray-900 text-lg">
                    {/* Use length if enrolledStudents is an array */}
                    {Array.isArray(course.enrolledStudents) ? course.enrolledStudents.length : course.enrolledStudents}
                  </span>
                </td>

                {/* Revenue */}
                <td className="px-6 py-4">
                  <span className="font-semibold text-green-600 text-lg">
                    ₹ {course.revenue || 0}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopCourses;
