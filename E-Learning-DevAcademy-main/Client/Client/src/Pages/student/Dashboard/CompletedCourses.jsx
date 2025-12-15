import React, { useState, useMemo, useEffect } from 'react';

import { 
  BookOpen, 
  Clock, 
  Award, 
  Filter, 
  Search, 
  Calendar, 
  User, 
  Star, 
  ChevronLeft, 
  ChevronRight,
  Download,
  Share2,
  TrendingUp,
  Loader2
} from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useDownloadCertificateQuery, useGetCompletedCoursesQuery } from '@/features/api/authApi';

const CompletedCourses = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const itemsPerPage = 5; // Pagination of 5 per page

  const { data, isLoading, isError } = useGetCompletedCoursesQuery();
  
  const courses = data?.data || [];

  // Filter courses based on search
  const filteredCourses = useMemo(() => {
    if (!search.trim()) return courses;
    
    const searchTerm = search.toLowerCase();
    return courses.filter(course => 
      course.courseTitle?.toLowerCase().includes(searchTerm) ||
      course.category?.toLowerCase().includes(searchTerm) ||
      course.creator?.toLowerCase().includes(searchTerm)
    );
  }, [courses, search]);

  // Calculate pagination
  const totalItems = filteredCourses.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCourses = filteredCourses.slice(startIndex, endIndex);

  // Handle pagination
  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Reset page when search changes
  React.useEffect(() => {
    setPage(1);
  }, [search]);

  // Course Card Component
 const CourseCard = ({ course }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
   const [downloading, setDownloading] = useState(false);

 const { data: blobData, refetch } = useDownloadCertificateQuery(course.certificate?.certificateId, {
  skip: !course.certificate?.certificateId,
});
  
  
  
  // Generate a consistent color based on course category or ID
  const getCourseColor = () => {
    if (!course.category && !course.courseId) {
      return 'from-purple-500 to-blue-500'; // Default gradient
    }

    const seed = (course.category || course.courseId || '').toString();
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }

    const gradients = [
      'from-purple-500 to-pink-500',
      'from-blue-500 to-cyan-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-red-500',
      'from-indigo-500 to-purple-500',
      'from-teal-500 to-green-500',
      'from-rose-500 to-pink-500',
      'from-violet-500 to-purple-500',
      'from-amber-500 to-yellow-500',
      'from-sky-500 to-blue-500',
      'from-fuchsia-500 to-purple-500',
      'from-lime-500 to-green-500',
    ];

    const index = Math.abs(hash) % gradients.length;
    return gradients[index];
  };

  const gradientClass = getCourseColor();

const handleDownload = async () => {
  if (!course.certificate?.certificateId) return;

  try {
    setDownloading(true); // Start loader
    const blob = await refetch().unwrap();

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `certificate_${course.certificate.certificateId}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Failed to download certificate', err);
  } finally {
    setDownloading(false); // Stop loader
  }
};

const handleShare = async () => {
  if (!course.certificate?.certificateId) return;

  try {
    // First, get the certificate file URL
    const blob = await refetch().unwrap();
    const url = window.URL.createObjectURL(blob);

    // Use Web Share API if available
    if (navigator.share) {
      await navigator.share({
        title: `Certificate: ${course.courseTitle}`,
        text: `Check out my certificate for ${course.courseTitle}!`,
        files: [
          new File([blob], `certificate_${course.certificate.certificateId}.pdf`, { type: 'application/pdf' })
        ],
      });
    } else {
      // Fallback: copy URL to clipboard
      await navigator.clipboard.writeText(url);
      alert('Certificate URL copied to clipboard!');
    }

    // Release memory
    window.URL.revokeObjectURL(url);

  } catch (err) {
    console.error('Failed to share certificate', err);
    alert('Sharing failed. You can try downloading it instead.');
  }
};


  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Course Thumbnail */}
      <div className={`relative h-48 ${!course.courseThumbnail || imageError ? `bg-gradient-to-r ${gradientClass}` : ''}`}>
        {course.courseThumbnail && !imageError ? (
          <>
            {imageLoading && (
              <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-r ${gradientClass}`}>
                <div className="animate-pulse">
                  <BookOpen size={32} className="text-white opacity-60" />
                </div>
              </div>
            )}
            <img 
              src={course.courseThumbnail} 
              alt={course.courseTitle}
              className={`w-full h-full object-cover ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageError(true);
                setImageLoading(false);
              }}
              loading="lazy"
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen size={48} className="text-white opacity-80" />
          </div>
        )}
        
        {/* Completion Badge */}
        <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
          COMPLETED
        </div>
        
        {/* Category Tag */}
        {course.category && (
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-semibold px-3 py-1 rounded-full">
            {course.category}
          </div>
        )}
      </div>

      {/* Course Content */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold text-gray-800 line-clamp-1">
              {course.courseTitle}
            </h3>
            {course.category && (
              <p className="text-sm text-gray-500 mt-1">
                Category: {course.category}
              </p>
            )}
          </div>
        </div>

        {/* Course Info */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User size={14} />
            <span>Instructor: {course.creator || 'N/A'}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar size={14} />
            <span>Completed: {
              course.formattedCompletedAt || 
              (course.completedAt ? new Date(course.completedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              }) : 'N/A')
            }</span>
          </div>
          
          {course.certificate && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Award size={14} className="text-yellow-500" />
              <span>Certificate: {course.certificate.certificateId}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
          {course.certificate ? (
            <>
              <button
  onClick={handleDownload}
  className="flex-1 bg-blue-50 cursor-pointer hover:bg-blue-100 text-blue-600 font-semibold py-2 px-4 rounded-lg text-sm transition-colors duration-200 flex items-center justify-center gap-2"
  disabled={downloading}
>
  {downloading ? (
    <Loader2 size={16} className="animate-spin" />
  ) : (
    <>
      <Download size={16} />
      Download Certificate
    </>
  )}
</button>

              <button  onClick={handleShare} className="p-2 text-gray-400 cursor-pointer hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                <Share2 size={18} />
              </button>
            </>
          ) : (
            <button className="flex-1 bg-gray-100 text-gray-500 font-semibold py-2 px-4 rounded-lg text-sm cursor-not-allowed">
              No Certificate Available
            </button>
          )}
        </div>
      </div>
    </div>
  );
};



  // Loading State
  if (isLoading) {
    return (
    <LoadingSpinner/>
    );
  }

  // Error State
  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <Award className="text-red-500" size={24} />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Failed to Load Courses
            </h2>
            <p className="text-gray-500 mb-6">
              Unable to load your completed courses. Please try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 mt-5">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Completed Courses
              </h1>
              <p className="text-gray-500 mt-2">
                Track all the courses you've successfully completed
              </p>
            </div>
            
            {/* Stats Card */}
            <div className="bg-gradient-to-r bg-white rounded-xl p-5 text-black">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-3 rounded-lg">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <p className="text-sm opacity-90">Total Completed</p>
                  <p className="text-2xl font-bold">{courses.length} Courses</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search courses by title, category, or instructor..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Filter Button (Optional) */}
              <button className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                <Filter size={18} />
                <span className="font-medium">Filter</span>
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing{' '}
            <span className="font-semibold">
              {filteredCourses.length > 0 ? startIndex + 1 : 0}-
              {Math.min(endIndex, filteredCourses.length)}
            </span>{' '}
            of{' '}
            <span className="font-semibold">{filteredCourses.length}</span> courses
            {search && (
              <span>
                {' '}matching "<span className="font-semibold">{search}</span>"
              </span>
            )}
          </p>
        </div>

        {/* Courses Grid */}
        {paginatedCourses.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedCourses.map((course) => (
                <CourseCard key={course.courseId || course._id} course={course} />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-8 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                Page {page} of {totalPages || 1}
              </div>
              
              <div className="flex items-center gap-2">
                {/* Previous Button */}
                <button
                  onClick={handlePrevPage}
                  disabled={page === 1}
                  className={`flex cursor-pointer items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                    page === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <ChevronLeft size={18} />
                  <span className="font-medium">Previous</span>
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = idx + 1;
                    } else if (page <= 3) {
                      pageNum = idx + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + idx;
                    } else {
                      pageNum = page - 2 + idx;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => {
                          setPage(pageNum);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`w-10 h-10 cursor-pointer rounded-lg transition-colors duration-200 font-medium ${
                          page === pageNum
                            ? 'bg-purple-600 text-white'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {/* Next Button */}
                <button
                  onClick={handleNextPage}
                  disabled={page === totalPages || totalPages === 0}
                  className={`flex items-center cursor-pointer gap-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                    page === totalPages || totalPages === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="font-medium">Next</span>
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Items per page selector */}
              <div className="text-sm text-gray-500">
                {itemsPerPage} per page
              </div>
            </div>
          </>
        ) : (
          // Empty State
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
              <BookOpen size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {courses.length === 0 
                ? "No Completed Courses" 
                : "No Courses Found"}
            </h3>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
              {courses.length === 0
                ? "You haven't completed any courses yet. Start learning to build your completed courses list!"
                : `No courses found matching "${search}". Try a different search term.`}
            </p>
            {search && courses.length > 0 && (
              <button
                onClick={() => setSearch('')}
                className="px-6 py-2 cursor-pointer bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompletedCourses;