import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Search, Menu, X, ChevronLeft, ChevronRight, 
  BookOpen, Award, TrendingUp, GraduationCap 
} from 'lucide-react';
import { useStudDashboardQuery } from '@/features/api/authApi';
import LoadingSpinner from '@/components/LoadingSpinner';


const StudDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [coursesPage, setCoursesPage] = useState(1);
  const [certificatesPage, setCertificatesPage] = useState(1);
  const navigate = useNavigate();

  const { data: studentData, isLoading, isError } = useStudDashboardQuery();

  const ITEMS_PER_PAGE = 6;

  const safeStudentData = studentData?.data || {
    name: "Student",
    email: "",
    photoUrl: "",
    enrolledCourses: [],
    certificates: [],
    stats: {
      totalEnrolled: 0,
      totalCompleted: 0,
      totalCertificates: 0,
      totalProgress: 0
    }
  };

  // Filter courses based on search query
  const filteredCourses = useMemo(() => {
    const courses = safeStudentData?.enrolledCourses || [];
    if (!searchQuery.trim()) return courses;
    
    const query = searchQuery.toLowerCase();
    return courses.filter(course => 
      course.courseTitle?.toLowerCase().includes(query) ||
      course.subTitle?.toLowerCase().includes(query) ||
      course.category?.toLowerCase().includes(query) ||
      course.creator?.name?.toLowerCase().includes(query)
    );
  }, [safeStudentData?.enrolledCourses, searchQuery]);

  // Filter certificates based on search query
  const filteredCertificates = useMemo(() => {
    const certificates = safeStudentData?.certificates || [];
    if (!searchQuery.trim()) return certificates;
    
    const query = searchQuery.toLowerCase();
    return certificates.filter(cert => 
      cert.course?.courseTitle?.toLowerCase().includes(query) ||
      cert.course?.category?.toLowerCase().includes(query) ||
      cert.certificateId?.toLowerCase().includes(query)
    );
  }, [safeStudentData?.certificates, searchQuery]);

  // Pagination logic for courses (now using filteredCourses)
  const paginatedCourses = useMemo(() => {
    const startIndex = (coursesPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredCourses.slice(startIndex, endIndex);
  }, [filteredCourses, coursesPage]);

  const totalCoursesPages = Math.ceil((filteredCourses.length || 0) / ITEMS_PER_PAGE);

  // Pagination logic for certificates (now using filteredCertificates)
  const paginatedCertificates = useMemo(() => {
    const startIndex = (certificatesPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredCertificates.slice(startIndex, endIndex);
  }, [filteredCertificates, certificatesPage]);

  const totalCertificatesPages = Math.ceil((filteredCertificates.length || 0) / ITEMS_PER_PAGE);

  // Reset pagination when search changes
  useEffect(() => {
    setCoursesPage(1);
    setCertificatesPage(1);
  }, [searchQuery]);

  const stats = safeStudentData?.stats || {
    totalEnrolled: 0,
    totalCompleted: 0,
    totalCertificates: 0,
    totalProgress: 0
  };

  const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const pages = [];
      const showEllipsis = totalPages > 7;

      if (!showEllipsis) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) pages.push(i);
          pages.push('...');
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(1);
          pages.push('...');
          for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
        } else {
          pages.push(1);
          pages.push('...');
          for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
          pages.push('...');
          pages.push(totalPages);
        }
      }

      return pages;
    };

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={20} className="text-gray-600" />
        </button>

        {getPageNumbers().map((page, index) => (
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500">...</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          )
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={20} className="text-gray-600" />
        </button>
      </div>
    );
  };

  const EmptyState = ({ icon: Icon, title, description, actionText, onAction }) => (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="bg-gray-100 p-6 rounded-full mb-4">
        <Icon size={48} className="text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 text-center mb-6 max-w-md">{description}</p>
      {actionText && onAction && (
        <button 
          onClick={onAction}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors font-medium"
        >
          {actionText}
        </button>
      )}
    </div>
  );

  const StatCard = ({ icon: Icon, label, value, color, bgColor }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-2">{label}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <Icon size={24} className={color} />
        </div>
      </div>
    </div>
  );

  const handleClick = (courseId) => {
    navigate(`/course-progress/${courseId}`);
  }

  const CourseCard = ({ course }) => {
    const safeProgress = Math.min(Math.max(course.progress || 0, 0), 100);
    
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleClick(course._id)}>
        <img 
          src={course.courseThumbnail || '/placeholder-course.jpg'} 
          alt={course.courseTitle}
          className="w-full h-48 object-cover"
        />
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
              course.courseLevel === 'Beginner' ? 'bg-green-100 text-green-700' :
              course.courseLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {course.courseLevel}
            </span>
            <span className="text-xs text-gray-500">{course.category}</span>
          </div>
          
          <h3 className="font-semibold text-lg mb-2 text-gray-800 line-clamp-2">{course.courseTitle}</h3>
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.subTitle}</p>
          
          <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
            <GraduationCap size={16} />
            <span>{course.creator?.name || 'Unknown Instructor'}</span>
          </div>
          
          {course.hasCertificate && (
            <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2">
                <Award size={16} className="text-blue-600" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-blue-900">Certificate Earned</p>
                  <p className="text-xs text-blue-600">ID: {course.certificateId}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="mb-5">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium text-blue-600">{safeProgress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${safeProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {course.completedLectures || 0} of {course.totalLectures || 0} lectures completed
            </p>
          </div>
          
          <button className="w-full cursor-pointer bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
            {safeProgress === 100 ? 'Review Course' : 'Continue Learning'}
          </button>
        </div>
      </div>
    );
  };

  const CertificateCard = ({ cert }) => (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-100 hover:border-blue-200 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="bg-blue-600 p-3 rounded-lg">
          <Award size={24} className="text-white" />
        </div>
        <span className="text-xs font-mono bg-white px-3 py-1 rounded-full text-gray-600 border border-gray-200">
          {cert.certificateId}
        </span>
      </div>
      
      <h3 className="font-semibold text-lg mb-2 text-gray-800">{cert.course?.courseTitle || 'Certificate'}</h3>
      <p className="text-sm text-gray-600 mb-4">{cert.course?.category || 'Course'}</p>
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          Issued: {new Date(cert.issuedAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );

  if (isLoading) {
    return <LoadingSpinner/>
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-800 text-lg font-semibold mb-2">Failed to load dashboard</p>
          <p className="text-gray-600 mb-4">Please try refreshing the page</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <div className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-600 hover:text-gray-800"
            >
              <Menu size={24} />
            </button>
            
            <div className="flex-1 max-w-xl mx-4 lg:mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search courses, certificates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-lg font-medium text-gray-800">{safeStudentData?.name}</p>
                <p className="text-sm text-gray-500">{safeStudentData?.email}</p>
              </div>
              <div className="relative">
                <img 
                  src={safeStudentData?.photoUrl} 
                  alt={safeStudentData?.name}
                  className="w-10 h-10 rounded-full border-2 border-blue-500 object-cover"
                  onError={(e) => {
                    e.target.src = '/default-avatar.png';
                  }}
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
            </div>
          </div>
        </header>
        
        <main className="p-6 lg:p-8">
          {searchQuery && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-blue-800">
                Showing results for "<span className="font-semibold">{searchQuery}</span>"
                {activeTab === 'overview' && (
                  <span className="ml-2 text-sm">
                    ({filteredCourses.length} courses, {filteredCertificates.length} certificates)
                  </span>
                )}
                {activeTab === 'courses' && (
                  <span className="ml-2 text-sm">
                    ({filteredCourses.length} courses found)
                  </span>
                )}
                {activeTab === 'certificates' && (
                  <span className="ml-2 text-sm">
                    ({filteredCertificates.length} certificates found)
                  </span>
                )}
              </p>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Welcome back, {safeStudentData?.name}!
                </h2>
                <p className="text-gray-600 text-lg">Continue your learning journey</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  icon={BookOpen} 
                  label="Enrolled Courses" 
                  value={stats.totalEnrolled || 0}
                  color="text-blue-600"
                  bgColor="bg-blue-50"
                />
                <StatCard 
                  icon={Award} 
                  label="Completed Courses" 
                  value={stats.totalCompleted || 0}
                  color="text-green-600"
                  bgColor="bg-green-50"
                />
                <StatCard 
                  icon={Award} 
                  label="Certificates" 
                  value={stats.totalCertificates || 0}
                  color="text-purple-600"
                  bgColor="bg-purple-50"
                />
                <StatCard 
                  icon={TrendingUp} 
                  label="Avg Progress" 
                  value={`${Math.min(stats.totalProgress || 0, 100)}%`}
                  color="text-orange-600"
                  bgColor="bg-orange-50"
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Continue Learning</h3>
                  {filteredCourses.length > ITEMS_PER_PAGE && (
                    <button 
                      onClick={() => setActiveTab('courses')}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View All →
                    </button>
                  )}
                </div>
                
                {filteredCourses.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {paginatedCourses.map(course => (
                        <CourseCard key={course._id} course={course} />
                      ))}
                    </div>
                    <Pagination 
                      currentPage={coursesPage}
                      totalPages={totalCoursesPages}
                      onPageChange={setCoursesPage}
                    />
                  </>
                ) : searchQuery ? (
                  <div className="bg-white rounded-xl border-2 border-dashed border-gray-200">
                    <EmptyState 
                      icon={Search}
                      title="No Matching Courses Found"
                      description={`No courses found matching "${searchQuery}". Try a different search term.`}
                      actionText="Clear Search"
                      onAction={() => setSearchQuery('')}
                    />
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border-2 border-dashed border-gray-200">
                    <EmptyState 
                      icon={BookOpen}
                      title="No Enrolled Courses"
                      description="You haven't enrolled in any courses yet. Start your learning journey by browsing our course catalog."
                      actionText="Browse Courses"
                      onAction={() => window.location.href = '/courses'}
                    />
                  </div>
                )}
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Recent Certificates</h3>
                  {filteredCertificates.length > ITEMS_PER_PAGE && (
                    <button 
                      onClick={() => setActiveTab('certificates')}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View All →
                    </button>
                  )}
                </div>
                
                {filteredCertificates.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {paginatedCertificates.map(cert => (
                        <CertificateCard key={cert._id} cert={cert} />
                      ))}
                    </div>
                    <Pagination 
                      currentPage={certificatesPage}
                      totalPages={totalCertificatesPages}
                      onPageChange={setCertificatesPage}
                    />
                  </>
                ) : searchQuery ? (
                  <div className="bg-white rounded-xl border-2 border-dashed border-gray-200">
                    <EmptyState 
                      icon={Search}
                      title="No Matching Certificates Found"
                      description={`No certificates found matching "${searchQuery}". Try a different search term.`}
                      actionText="Clear Search"
                      onAction={() => setSearchQuery('')}
                    />
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border-2 border-dashed border-gray-200">
                    <EmptyState 
                      icon={Award}
                      title="No Certificates Yet"
                      description="Complete courses to earn certificates and showcase your achievements."
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'courses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">My Courses</h2>
                  <p className="text-gray-600">All your enrolled courses</p>
                </div>
                {filteredCourses.length > 0 && (
                  <select className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white">
                    <option>All Courses</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                  </select>
                )}
              </div>
              
              {filteredCourses.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {paginatedCourses.map(course => (
                      <CourseCard key={course._id} course={course} />
                    ))}
                  </div>
                  <Pagination 
                    currentPage={coursesPage}
                    totalPages={totalCoursesPages}
                    onPageChange={setCoursesPage}
                  />
                </>
              ) : searchQuery ? (
                <div className="bg-white rounded-xl border-2 border-dashed border-gray-200">
                  <EmptyState 
                    icon={Search}
                    title="No Matching Courses Found"
                    description={`No courses found matching "${searchQuery}". Try a different search term.`}
                    actionText="Clear Search"
                    onAction={() => setSearchQuery('')}
                  />
                </div>
              ) : (
                <div className="bg-white rounded-xl border-2 border-dashed border-gray-200">
                  <EmptyState 
                    icon={BookOpen}
                    title="No Enrolled Courses"
                    description="You haven't enrolled in any courses yet. Explore our wide range of courses and start learning today!"
                    actionText="Explore Courses"
                    onAction={() => window.location.href = '/courses'}
                  />
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'certificates' && (
            <div className="space-y-6">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">My Certificates</h2>
                <p className="text-gray-600">Your achievements and completed courses</p>
              </div>
              
              {filteredCertificates.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {paginatedCertificates.map(cert => (
                      <CertificateCard key={cert._id} cert={cert} />
                    ))}
                  </div>
                  <Pagination 
                    currentPage={certificatesPage}
                    totalPages={totalCertificatesPages}
                    onPageChange={setCertificatesPage}
                  />
                </>
              ) : searchQuery ? (
                <div className="bg-white rounded-xl border-2 border-dashed border-gray-200">
                  <EmptyState 
                    icon={Search}
                    title="No Matching Certificates Found"
                    description={`No certificates found matching "${searchQuery}". Try a different search term.`}
                    actionText="Clear Search"
                    onAction={() => setSearchQuery('')}
                  />
                </div>
              ) : (
                <div className="bg-white rounded-xl border-2 border-dashed border-gray-200">
                  <EmptyState 
                    icon={Award}
                    title="No Certificates Earned"
                    description="You haven't earned any certificates yet. Complete your enrolled courses to receive certificates and showcase your skills!"
                    actionText="View My Courses"
                    onAction={() => setActiveTab('courses')}
                  />
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default StudDashboard;