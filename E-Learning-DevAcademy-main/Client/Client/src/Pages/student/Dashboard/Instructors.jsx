import React, { useState } from 'react';
import { Users, Star, BookOpen, UserPlus, UserMinus, Search, ChevronLeft, ChevronRight, Award } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAllInstructorsQuery, useFollowInstructorsMutation } from '@/features/api/authApi';
import { toast } from 'sonner';


const Instructors = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const instructorsPerPage = 6;

  const {data,isLoading,isError}=useAllInstructorsQuery();
  const [followInstructors]=useFollowInstructorsMutation();
  const [followedInstructors, setFollowedInstructors] = useState([]);
  
 

  
  // Filter instructors by search
  const filteredInstructors = data?.instructors.filter(instructor =>
    instructor?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    instructor?.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredInstructors?.length / instructorsPerPage);
  const startIndex = (currentPage - 1) * instructorsPerPage;
  const endIndex = startIndex + instructorsPerPage;
  const currentInstructors = filteredInstructors?.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };



const handleFollowToggle = async (instructorId) => {
  const isFollowing = followedInstructors.includes(instructorId);

  // Optimistic UI update
  setFollowedInstructors(prev =>
    isFollowing
      ? prev.filter(id => id !== instructorId)
      : [...prev, instructorId]
  );

  try {
    await followInstructors(instructorId);

    toast.success(
      isFollowing
        ? "Instructor unfollowed"
        : "Instructor followed"
    );
  } catch (error) {
    // Rollback UI if API fails
    setFollowedInstructors(prev =>
      isFollowing
        ? [...prev, instructorId]
        : prev.filter(id => id !== instructorId)
    );

    toast.error("Something went wrong. Please try again.");
  }
};


  const isFollowing = (instructorId) => {
    return followedInstructors.includes(instructorId);
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <p className="text-red-500">Failed to load instructors</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
     
      
      {/* Hero Section */}
      <section className="pt-10 pb-8 px-6 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Our Instructors</h1>
              <p className="text-gray-600">
                {data.count} expert instructors ready to help you learn
              </p>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search instructors by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-purple-600 transition-colors"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Instructors Grid */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Results Info */}
          <div className="mb-6">
            <p className="text-gray-600">
              Showing <span className="font-semibold">{startIndex + 1}-{Math.min(endIndex, filteredInstructors.length)}</span> of <span className="font-semibold">{filteredInstructors.length}</span> instructors
            </p>
          </div>

          {/* Empty State */}
          {currentInstructors.length === 0 ? (
            <div className="text-center py-20">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No instructors found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search query</p>
              <button
                onClick={() => setSearchQuery('')}
                className="px-6 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-all"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <>
              {/* Instructors Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {currentInstructors.map((instructor) => (
                  <div
                    key={instructor._id}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group"
                  >
                    {/* Profile Image */}
                    <div className="relative h-48 bg-gradient-to-br from-purple-400 to-blue-400">
                      <img 
                        src={instructor.photoUrl || "https://github.com/shadcn.png"} 
                        alt={instructor.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      
                      {/* Top Instructor Badge */}
                      {instructor.avgRating >= 4.8 && (
                        <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          Top Rated
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {/* Name & Email */}
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{instructor.name}</h3>
                        <p className="text-sm text-gray-500">{instructor.email}</p>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="text-center p-3 bg-purple-50 rounded-xl">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span className="font-bold text-gray-900">{instructor.avgRating}</span>
                          </div>
                          <p className="text-xs text-gray-600">Rating</p>
                        </div>

                        <div className="text-center p-3 bg-blue-50 rounded-xl">
                          <div className="font-bold text-gray-900 mb-1">
                            {instructor.totalCourses}
                          </div>
                          <p className="text-xs text-gray-600">Courses</p>
                        </div>

                        <div className="text-center p-3 bg-green-50 rounded-xl">
                          <div className="font-bold text-gray-900 mb-1">
                            {instructor.totalStudents >= 1000 
                              ? `${(instructor.totalStudents / 1000).toFixed(1)}K` 
                              : instructor.totalStudents}
                          </div>
                          <p className="text-xs text-gray-600">Students</p>
                        </div>
                      </div>

                      {/* Follow Button */}
                      <button
                        onClick={() => handleFollowToggle(instructor._id)}
                        className={`w-full py-3 rounded-xl font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                          isFollowing(instructor._id)
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg'
                        }`}
                      >
                        {isFollowing(instructor._id) ? (
                          <>
                            <UserMinus className="w-5 h-5" />
                            Unfollow
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-5 h-5" />
                            Follow
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg ${
                      currentPage === 1
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-purple-600 cursor-pointer hover:bg-purple-50 border border-purple-600'
                    }`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <div className="flex gap-2">
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNumber = index + 1;
                      
                      // Show first page, last page, current page, and pages around current
                      if (
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                            className={`px-4 py-2 rounded-lg font-semibold ${
                              currentPage === pageNumber
                                ? 'bg-purple-600 text-white cursor-pointer'
                                : 'bg-white text-gray-700 hover:bg-purple-50 border cursor-pointer border-gray-300'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      } else if (
                        pageNumber === currentPage - 2 ||
                        pageNumber === currentPage + 2
                      ) {
                        return <span key={pageNumber} className="px-2 py-2">...</span>;
                      }
                      return null;
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg ${
                      currentPage === totalPages
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-purple-600 cursor-pointer hover:bg-purple-50 border border-purple-600'
                    }`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

     
    </div>
  );
};

export default Instructors;