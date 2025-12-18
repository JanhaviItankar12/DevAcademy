import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Search, Users, Mail, Calendar, ArrowLeft, Award, TrendingUp } from 'lucide-react';
import { useGetEnrolledStudentForCourseQuery } from '@/features/api/courseApi';
import { useParams } from 'react-router-dom';
import LoadingSpinner from '@/components/LoadingSpinner';



export default function CourseStudentsView() {
  const params = useParams();
  const courseId = params.courseId;
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 6;

  const { data, isLoading, isError } = useGetEnrolledStudentForCourseQuery(courseId);

  const enrolledStudents = data?.students || [];

  // Filter students based on search term
  const filteredStudents = enrolledStudents.filter(each =>
    each.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    each.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);

  // Reset to page 1 when search changes
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get status badge color and text based on progress
  const getStatusBadge = (progress) => {
    if (progress === 100) {
      return { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', text: 'Completed', icon: Award };
    } else if (progress > 0) {
      return { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', text: 'In Progress', icon: TrendingUp };
    } else {
      return { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', text: 'Enrolled', icon: Users };
    }
  };

  const Pagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className='flex justify-center items-center gap-2 mt-6'>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`p-2 rounded-lg border transition-colors ${currentPage === 1
              ? 'border-gray-200 text-gray-400 cursor-not-allowed'
              : 'border-purple-300 hover:bg-purple-50 text-purple-600'
            }`}
        >
          <ChevronLeft className='h-4 w-4' />
        </button>

        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index + 1}
            onClick={() => handlePageChange(index + 1)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentPage === index + 1
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                : 'border border-purple-300 hover:bg-purple-50 text-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'
              }`}
          >
            {index + 1}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-lg border transition-colors ${currentPage === totalPages
              ? 'border-gray-200 text-gray-400 cursor-not-allowed'
              : 'border-purple-300 hover:bg-purple-50 text-purple-600'
            }`}
        >
          <ChevronRight className='h-4 w-4' />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen mt-3 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => window.history.back()}
          className="mb-6 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-2 cursor-pointer transition-colors text-lg font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Course Details
        </button>

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-purple-100 dark:border-gray-700 p-8 mb-6">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Enrolled Students</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 ml-16">
            View and manage all students enrolled in this course
          </p>
        </div>

        {/* Students List Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-purple-100 dark:border-gray-700 p-6">
          {/* Search and Count */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Total Students
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {filteredStudents.length} {filteredStudents.length === 1 ? 'student' : 'students'}
                </p>
              </div>
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <LoadingSpinner />
          ) : currentStudents.length > 0 ? (
            <>
              {/* Students Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentStudents.map(each => {
                  const statusBadge = getStatusBadge(each.progress);
                  const StatusIcon = statusBadge.icon;

                  return (
                    <div
                      key={each.studentId}
                      className="border border-purple-100 dark:border-gray-700 rounded-xl p-5 hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-600 transition-all bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-800 dark:to-gray-700/50"
                    >
                      {/* Header with Name and Status */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {/* Avatar with Photo or Initial */}
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 overflow-hidden">
                            {each.photoUrl ? (
                              <img
                                src={each.photoUrl}
                                alt={each.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span>{each.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                              {each.name}
                            </h3>
                            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${statusBadge.color} mt-1`}>
                              <StatusIcon className="w-3 h-3" />
                              {statusBadge.text}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Student Details */}
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                            <Mail className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <span className="truncate">{each.email}</span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span>
                            Enrolled {new Date(each.enrolledAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        {each.progress > 0 && (
                          <div className="pt-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                Progress
                              </span>
                              <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                                {each.progress}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${each.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              <Pagination />
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {searchTerm ? 'No students found' : 'No students enrolled yet'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm
                  ? 'Try adjusting your search terms'
                  : 'Students will appear here once they enroll in this course'}
              </p>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {filteredStudents.length > 0 && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-purple-100 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-lg text-gray-500 dark:text-gray-400">Total Enrolled</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {enrolledStudents.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-purple-100 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Award className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-lg text-gray-500 dark:text-gray-400">Completed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {enrolledStudents.filter(s => s.progress === 100).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-purple-100 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-lg text-gray-500 dark:text-gray-400">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {enrolledStudents.filter(s => s.progress > 0 && s.progress < 100).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}