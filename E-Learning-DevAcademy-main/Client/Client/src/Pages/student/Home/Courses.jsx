import React, { useState, useEffect } from 'react';
import { BookOpen, Star, Users, Clock, Search, Filter, ChevronDown, TrendingUp, Award, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useGetPublishedCoursesQuery } from '@/features/api/courseApi';

export default function Courses() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedLevel, setSelectedLevel] = useState('all');
    const [selectedPrice, setSelectedPrice] = useState('all');
    const [sortBy, setSortBy] = useState('popular');
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const coursesPerPage = 6;

    const { user } = useSelector(store => store.auth);

    const { data, isLoading, isError } = useGetPublishedCoursesQuery();

    const allCourses = data?.courses || [];


    // Handle enrollment
    const handleEnrollment = (courseId) => {
        if (!user) {
            window.location.href = '/login';
        } else {
            // Add your enrollment logic here
            window.location.href = `/course-detail/${courseId}`;
        }
    };




    // Update the categories extraction with optional chaining
    const uniqueCategories = ['all', ...Array.from(new Set(allCourses
        .filter(course => course?.category)
        .map(course => course.category)
    ))];

    const categories = uniqueCategories.map(cat => ({
  value: cat,
  label: cat === 'all' ? 'All Categories' : cat,
  count: cat === 'all' ? allCourses.length : allCourses.filter(c => c?.category === cat).length
}));

    // Filter and sort courses
    const filteredCourses = allCourses
        .filter(course => course.isPublished)
        .filter(course => {
            const matchesSearch =
  (course?.courseTitle?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
  (course?.subTitle?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
  (course?.description?.toLowerCase() || "").includes(searchQuery.toLowerCase());

            const matchesCategory = selectedCategory === 'all' || course?.category === selectedCategory;
            const matchesLevel = selectedLevel === 'all' || course?.courseLevel === selectedLevel;
            const matchesPrice = selectedPrice === 'all' ||
                (selectedPrice === 'free' && course?.coursePrice === 0) ||
                (selectedPrice === 'paid' && course?.coursePrice > 0) ||
                (selectedPrice === 'under3000' && course?.coursePrice < 3000) ||
                (selectedPrice === 'above3000' && course?.coursePrice >= 3000);

            return matchesSearch && matchesCategory && matchesLevel && matchesPrice;
        })
        .sort((a, b) => {
            const aRating = a?.rating || 0;
            const bRating = b?.rating || 0;
            const aEnrolled = a?.enrolledStudents || 0;
            const bEnrolled = b?.enrolledStudents || 0;
            const aPrice = a?.coursePrice || 0;
            const bPrice = b?.coursePrice || 0;
            const aId = a?.id || 0;
            const bId = b?.id || 0;

            if (sortBy === 'popular') return bEnrolled - aEnrolled;
            if (sortBy === 'rating') return bRating - aRating;
            if (sortBy === 'newest') return bId - aId;
            if (sortBy === 'price-low') return aPrice - bPrice;
            if (sortBy === 'price-high') return bPrice - aPrice;
            return 0;
        });

    // Pagination logic
    const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
    const startIndex = (currentPage - 1) * coursesPerPage;
    const endIndex = startIndex + coursesPerPage;
    const currentCourses = filteredCourses.slice(startIndex, endIndex);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedCategory, selectedLevel, selectedPrice, sortBy]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
            {/* Navigation */}


            {/* Hero Section */}
            <section className="pt-32 pb-12 px-6 bg-gradient-to-r from-purple-600 to-blue-600">
                <div className="max-w-7xl mx-auto text-center text-white">
                    <h1 className="text-5xl font-bold mb-4">Explore Our Courses</h1>
                    <p className="text-xl text-purple-100 mb-8">
                        {filteredCourses.length} courses available to boost your skills
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-2xl mx-auto">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search for courses..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-full text-gray-900 focus:outline-none focus:ring-4 focus:ring-purple-300"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Filters and Content */}
            <section className="py-12 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row gap-8">

                        {/* Sidebar Filters */}
                        <div className="lg:w-64 flex-shrink-0">
                            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold text-lg flex items-center gap-2">
                                        <Filter className="w-5 h-5" />
                                        Filters
                                    </h3>
                                    <button
                                        onClick={() => {
                                            setSelectedCategory('all');
                                            setSelectedLevel('all');
                                            setSelectedPrice('all');
                                            setSearchQuery('');
                                        }}
                                        className="text-sm text-purple-600 hover:text-purple-700"
                                    >
                                        Clear All
                                    </button>
                                </div>

                                {/* Category Filter */}
                                <div className="mb-6">
                                    <h4 className="font-semibold mb-3">Category</h4>
                                    <div className="space-y-2">
                                        {categories.map(cat => (
                                            <label key={cat.value} className="flex items-center space-x-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="category"
                                                    value={cat.value}
                                                    checked={selectedCategory === cat.value}
                                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                                    className="text-purple-600"
                                                />
                                                <span className="text-sm text-gray-700">{cat.label}</span>
                                                <span className="text-xs text-gray-400">({cat.count})</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Level Filter */}
                                <div className="mb-6">
                                    <h4 className="font-semibold mb-3">Level</h4>
                                    <div className="space-y-2">
                                        {['all', 'Beginner', 'Medium', 'Advance'].map(level => (
                                            <label key={level} className="flex items-center space-x-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="level"
                                                    value={level}
                                                    checked={selectedLevel === level}
                                                    onChange={(e) => setSelectedLevel(e.target.value)}
                                                    className="text-purple-600"
                                                />
                                                <span className="text-sm text-gray-700">
                                                    {level === 'all' ? 'All Levels' : level}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Price Filter */}
                                <div className="mb-6">
                                    <h4 className="font-semibold mb-3">Price</h4>
                                    <div className="space-y-2">
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="price"
                                                value="all"
                                                checked={selectedPrice === 'all'}
                                                onChange={(e) => setSelectedPrice(e.target.value)}
                                                className="text-purple-600"
                                            />
                                            <span className="text-sm text-gray-700">All Prices</span>
                                        </label>
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="price"
                                                value="free"
                                                checked={selectedPrice === 'free'}
                                                onChange={(e) => setSelectedPrice(e.target.value)}
                                                className="text-purple-600"
                                            />
                                            <span className="text-sm text-gray-700">Free</span>
                                        </label>
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="price"
                                                value="paid"
                                                checked={selectedPrice === 'paid'}
                                                onChange={(e) => setSelectedPrice(e.target.value)}
                                                className="text-purple-600"
                                            />
                                            <span className="text-sm text-gray-700">Paid</span>
                                        </label>
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="price"
                                                value="under3000"
                                                checked={selectedPrice === 'under3000'}
                                                onChange={(e) => setSelectedPrice(e.target.value)}
                                                className="text-purple-600"
                                            />
                                            <span className="text-sm text-gray-700">Under ₹3,000</span>
                                        </label>
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="price"
                                                value="above3000"
                                                checked={selectedPrice === 'above3000'}
                                                onChange={(e) => setSelectedPrice(e.target.value)}
                                                className="text-purple-600"
                                            />
                                            <span className="text-sm text-gray-700">Above ₹3,000</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Course Grid */}
                        <div className="flex-1">
                            {/* Sort Options */}
                            <div className="flex items-center justify-between mb-6">
                                <p className="text-gray-600">
                                    Showing <span className="font-semibold">{startIndex + 1}-{Math.min(endIndex, filteredCourses.length)}</span> of <span className="font-semibold">{filteredCourses.length}</span> courses
                                </p>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">Sort by:</span>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                                    >
                                        <option value="popular">Most Popular</option>
                                        <option value="rating">Highest Rated</option>
                                        <option value="newest">Newest</option>
                                        <option value="price-low">Price: Low to High</option>
                                        <option value="price-high">Price: High to Low</option>
                                    </select>
                                </div>
                            </div>

                            {/* Course Cards */}
                            {currentCourses.length === 0 ? (
                                <div className="text-center py-20">
                                    <div className="text-6xl mb-4">📚</div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">No courses found</h3>
                                    <p className="text-gray-600 mb-6">Try adjusting your filters or search query</p>
                                    <button
                                        onClick={() => {
                                            setSelectedCategory('all');
                                            setSelectedLevel('all');
                                            setSelectedPrice('all');
                                            setSearchQuery('');
                                        }}
                                        className="px-6 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-all"
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {currentCourses.map((course) => (
                                            <div
                                                key={course.id}
                                                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group"
                                            >
                                                <div className="relative overflow-hidden h-48">
                                                    <img
                                                        src={course.courseThumbnail}
                                                        alt={course.courseTitle}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                    />
                                                    <div className="absolute top-4 left-4">
                                                        <span className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full">
                                                            {course.courseLevel}
                                                        </span>
                                                    </div>
                                                    <div className="absolute top-4 right-4">
                                                        <span className="px-3 py-1 bg-white text-gray-900 text-xs font-bold rounded-full">
                                                            {course.category}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="p-6">
                                                    <h3 className="text-xl font-bold mb-2 text-gray-900">{course.courseTitle}</h3>
                                                    <p className="text-gray-600 text-sm mb-4">{course.subTitle}</p>

                                                    <div className="flex items-center gap-2 mb-4">
                                                        <div className="flex items-center">
                                                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                            <span className="ml-1 font-semibold text-sm">{course.rating}</span>
                                                            <span className="ml-1 text-gray-500 text-xs">({course.reviewCount})</span>
                                                        </div>
                                                        <span className="text-gray-400">•</span>
                                                        <span className="text-gray-600 text-sm">{course.enrolledStudents.toLocaleString()} students</span>
                                                    </div>

                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                                                            <BookOpen className="w-4 h-4" />
                                                            <span>{course.lectures} lectures</span>
                                                        </div>
                                                        <div className="text-sm text-gray-500">By {course.creator.name}</div>
                                                    </div>

                                                    <div className="flex items-center justify-between pt-4 border-t">
                                                        <div className="text-2xl font-bold text-purple-600">
                                                            ₹{course.coursePrice.toLocaleString()}
                                                        </div>
                                                        <button
                                                            onClick={() => handleEnrollment(course.id)}
                                                            className="px-6 cursor-pointer py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-all font-semibold text-sm"
                                                        >
                                                            Enroll Now
                                                        </button>
                                                    </div>
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
                                                className={`p-2 rounded-lg ${currentPage === 1
                                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                        : 'bg-white text-purple-600 hover:bg-purple-50 border border-purple-600'
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
                                                                className={`px-4 py-2 rounded-lg font-semibold ${currentPage === pageNumber
                                                                        ? 'bg-purple-600 text-white'
                                                                        : 'bg-white text-gray-700 hover:bg-purple-50 border border-gray-300'
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
                                                className={`p-2 rounded-lg ${currentPage === totalPages
                                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                        : 'bg-white text-purple-600 hover:bg-purple-50 border border-purple-600'
                                                    }`}
                                            >
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>


        </div>
    );
}