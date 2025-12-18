import React from 'react';
import { ArrowLeft, Edit, Users, DollarSign, Star, BookOpen, Calendar, TrendingUp, Loader2, IndianRupee } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetCourseInfoQuery } from '@/features/api/courseApi';
import LoadingSpinner from '@/components/LoadingSpinner';

const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();



  const { data, isLoading, isError } = useGetCourseInfoQuery(courseId);

  const course = data?.course;



  const handleEdit = () => {
    navigate(`/instructor/course/${courseId}`);
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <LoadingSpinner />
    );
  }

  if (isError || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl mb-4">Failed to load course details</p>
          <button
            onClick={handleBack}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalStudents = course.enrolledStudents?.length || 0;
  const totalRevenue = totalStudents * (course.coursePrice || 0);
  const totalReviews = course.reviews?.length || 0;
  const averageRating = totalReviews > 0
    ? (course.reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews).toFixed(1)
    : 0;
  const totalLectures = course.lectures?.length || 0;

  // Calculate recent sales (enrollments in last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentSales = course.enrolledStudents?.filter(
    enrollment => new Date(enrollment.enrolledAt) >= thirtyDaysAgo
  ).length || 0;

  return (
    <div className="min-h-screen bg-gray-50 mt-5">
      {/* Header */}
      <div className="bg-white ">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">Course Details</h1>
            </div>
            <button
              onClick={handleEdit}
              className="flex cursor-pointer items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Edit size={18} />
              Edit Course
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Course Header Card */}
        <div className="bg-white rounded-xl shadow-sm  mb-6 overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/3">
              <img
                src={course.courseThumbnail || 'https://via.placeholder.com/800x600?text=No+Image'}
                alt={course.courseTitle}
                className="w-full h-64 md:max-h-96 object-contain bg-gray-50"
              />
            </div>
            <div className="md:w-2/3 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{course.courseTitle}</h2>
                  {course.subTitle && (
                    <p className="text-lg text-gray-600 mb-4">{course.subTitle}</p>
                  )}
                </div>
                <span className={`ml-4 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${course.isPublished
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                  }`}>
                  {course.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium text-gray-900">{course.category || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Level</p>
                  <p className="font-medium text-gray-900">{course.courseLevel || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="font-semibold text-green-600 text-xl">₹{(course.coursePrice || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Lectures</p>
                  <p className="font-medium text-gray-900">{totalLectures}</p>
                </div>
              </div>

              <div className="flex gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar size={16} />
                  Created: {new Date(course.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={16} />
                  Updated: {new Date(course.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Total Students */}
          <div className="bg-white p-6 rounded-xl shadow-sm ">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Students</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">{totalStudents.toLocaleString()}</h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white p-6 rounded-xl shadow-sm ">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">₹{totalRevenue.toLocaleString()}</h3>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <IndianRupee className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          {/* Average Rating */}
          <div className="bg-white p-6 rounded-xl shadow-sm ">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium">Average Rating</p>
                <div className="flex items-center gap-2 mt-2">
                  <h3 className="text-3xl font-bold text-gray-900">{averageRating}</h3>
                  <Star className="text-yellow-500 fill-yellow-500" size={24} />
                </div>
                <p className="text-sm text-gray-500 mt-1">{totalReviews} reviews</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Star className="text-yellow-600" size={24} />
              </div>
            </div>
          </div>

          {/* Recent Sales */}
          <div className="bg-white p-6 rounded-xl shadow-sm ">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium">Recent Sales</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">{recentSales}</h3>
                <p className="text-sm text-gray-500 mt-1">Last 30 days</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <TrendingUp className="text-purple-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Description and Content Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Description */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm  p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Course Description</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: course.description }}>

            </p>
          </div>

          {/* Course Content Info */}
          <div className="bg-white rounded-xl shadow-sm  p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Course Content</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <BookOpen className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Lectures</p>
                    <p className="font-semibold text-gray-900">{totalLectures}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Users className="text-purple-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Enrolled Students</p>
                    <p className="font-semibold text-gray-900">{totalStudents}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-100 p-2 rounded-lg">
                    <Star className="text-yellow-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Reviews</p>
                    <p className="font-semibold text-gray-900">{totalReviews}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;