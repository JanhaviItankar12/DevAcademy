import LoadingSpinner from '@/components/LoadingSpinner';
import { useGetAdminDashboardQuery } from '@/features/api/courseApi';
import React from 'react'

const TopInstructor = () => {
  const { data, isLoading, isError, refetch } = useGetAdminDashboardQuery();
   
  
     if (isLoading) {
    return <LoadingSpinner/>
    }
    if (isError) return <p>Failed to load instructor courses</p>;
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-10">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Top Instructors</h2>
                <p className="text-lg text-gray-500 mt-1">Highest earning instructors</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-lg font-semibold text-gray-600 uppercase">Instructor</th>
                      <th className="px-6 py-3 text-left text-lg font-semibold text-gray-600 uppercase">Students</th>
                      <th className="px-6 py-3 text-left text-lg font-semibold text-gray-600 uppercase">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data?.data?.topInstructors.map((instructor, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900 text-lg">{instructor.name}</p>
                            <p className="text-lg text-gray-500">{instructor.totalCourses} courses</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-gray-900 text-lg">{instructor.totalEnrolledStudents}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-green-600 text-lg">{instructor.revenue}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
  )
}

export default TopInstructor