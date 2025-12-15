import LoadingSpinner from '@/components/LoadingSpinner';
import { useTopInstructorsQuery } from '@/features/api/courseApi';
import { Star, Users, BookOpen, Mail, TrendingUp } from 'lucide-react';
import React from 'react'

const TopInstructor = () => {
  const { data, isLoading, isError, refetch } = useTopInstructorsQuery();


  if (isLoading) {
    return <LoadingSpinner />
  }

  if (isError) return <p className="text-red-500 text-lg p-6">Failed to load instructor data</p>;

  // Format revenue to currency
  // Format revenue to Indian Rupees
  const formatRevenue = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };


  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mt-7">
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 lg:p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-purple-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl lg:text-2xl font-bold text-gray-900">Top Instructors</h2>
            <p className="text-lg lg:text-lg text-gray-600 mt-0.5">Best performing Instructors this month</p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden">
        <div className="min-w-full divide-y divide-gray-100">
          {data?.topInstructors.map((instructor, index) => (
            <div key={index} className="hover:bg-purple-50/50 transition-colors duration-200">
              <div className="px-6 py-5">
                <div className="flex items-start gap-4">
                  {/* Instructor Avatar */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      {instructor.photoUrl ? (
                        <img
                          src={instructor.photoUrl}
                          alt={instructor.name}
                          className="w-16 h-16 rounded-xl object-cover border-2 border-purple-100"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center border-2 border-purple-100">
                          <span className="text-2xl font-bold text-purple-600">
                            {instructor.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      {index < 3 && (
                        <div className={`absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${index === 0
                            ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                            : index === 1
                              ? 'bg-gray-100 text-gray-700 border border-gray-200'
                              : 'bg-orange-100 text-orange-700 border border-orange-200'
                          }`}>
                          #{index + 1}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Instructor Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          {instructor.name}
                          {index < 3 && (
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          )}
                        </h3>

                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <BookOpen className="w-4 h-4" />
                            <span>{instructor.totalCourses} course{instructor.totalCourses !== 1 ? 's' : ''}</span>
                          </div>

                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Users className="w-4 h-4" />
                            <span>{instructor.totalEnrolledStudents} student{instructor.totalEnrolledStudents !== 1 ? 's' : ''}</span>
                          </div>
                        </div>

                        {instructor.email && (
                          <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                            <Mail className="w-4 h-4" />
                            <span className="truncate">{instructor.email}</span>
                          </div>
                        )}
                      </div>

                      {/* Revenue */}
                      <div className="text-right">
                        <div className="text-xl font-bold text-green-600">
                          {formatRevenue(instructor.revenue)}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">Total Revenue</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer with stats summary */}
      {data?.topInstructors.length > 0 && (
        <div className="px-6 py-4 bg-gradient-to-r from-purple-50/50 to-white border-t border-gray-100">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {data.topInstructors.length}
              </div>
              <div className="text-sm text-gray-600">Total Instructors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {data.topInstructors.reduce((sum, inst) => sum + inst.totalEnrolledStudents, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Students</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatRevenue(data.topInstructors.reduce((sum, inst) => sum + inst.revenue, 0))}
              </div>
              <div className="text-sm text-gray-600">Combined Revenue</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TopInstructor