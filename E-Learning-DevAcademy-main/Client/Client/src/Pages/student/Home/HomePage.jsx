import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Award, Code, Laptop, Zap, TrendingUp, Star, CheckCircle, Clock, GraduationCap, CheckCircle2, Quote } from 'lucide-react';
import Navbar from '@/components/navbar';
import Footer from '@/components/Footer';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import LoadingSpinner from '@/components/LoadingSpinner';
import { useGetDataforHeroSectionQuery, useGetpublishedcourseonlevelQuery, useGetReviewsforHomeQuery } from '@/features/api/courseApi';

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const { user } = useSelector(store => store.auth);

  const { data, isLoading, isError } = useGetpublishedcourseonlevelQuery();
  const { data: dataForHeroSection } = useGetDataforHeroSectionQuery();
  const { data: dataOfReviews } = useGetReviewsforHomeQuery();





  const courses = data?.courses || [];
  const reviews = dataOfReviews?.reviews || [];

  console.log(courses);

  const navigate = useNavigate();



  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  // Extract unique categories from courses
  const categories = ['all', ...Array.from(new Set(courses.map(course => course.category)))];


  const filteredCourses = activeTab === 'all'
    ? courses
    : courses.filter(course => course.category === activeTab);

  const formatNumber = (num) => {
    if (num >= 1000000) return `${Math.floor(num / 1000000)}M+`;
    if (num >= 1000) return `${Math.floor(num / 1000)}k+`;
    if (num > 0) return `${num}+`;
    return "0+";
  };


  const stats = [
    {
      value: formatNumber(dataForHeroSection?.totalStudents),
      label: "Active Students",
      icon: <Users className="w-6 h-6" />
    },
    {
      value: formatNumber(dataForHeroSection?.totalPublishedCourses),
      label: "Published Courses",
      icon: <BookOpen className="w-6 h-6" />
    },
    {
      value: formatNumber(dataForHeroSection?.totalInstructors),
      label: "Expert Instructors",
      icon: <GraduationCap className="w-6 h-6" />
    },
    {
      value: dataForHeroSection?.completionRate
        ? `${dataForHeroSection.completionRate}%`
        : "0%",
      label: "Completion Rate",
      icon: <Award className="w-6 h-6" />
    }
  ];


  const features = [
    {
      icon: <Code className="w-12 h-12" />,
      title: "Interactive Learning",
      description: "Learn through hands-on projects with real-time feedback and code reviews"
    },
    {
      icon: <Award className="w-12 h-12" />,
      title: "Earn Certificates",
      description: "Get recognized certificates upon course completion to boost your profile"
    },
    {
      icon: <Users className="w-12 h-12" />,
      title: "Expert Instructors",
      description: "Learn from industry professionals with approval-based instructor system"
    }
  ];



  const handleNavigation = () => {
    navigate("/login", { state: { tab: "signup" } });
  };

  const handleEnrollment = (courseId) => {
    navigate(`/course-detail/${courseId}`);
  }

  const handleExploreCourses = () => {
    navigate("courses")
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">


      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8 mb-16">
            <div className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
              🚀 Transform Your Career with DevAcademy
            </div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight text-gray-900">
              Learn from <span className="text-purple-600">Expert Instructors</span><br />
              Earn Certificates, Build Your Future
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join {dataForHeroSection?.totalStudents}+ students learning from industry professionals. Access {dataForHeroSection?.totalPublishedCourses}+ courses across all levels - Beginner, Medium, and Advanced. Get certified and boost your career.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button onClick={handleExploreCourses} className="px-8 cursor-pointer py-4 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-all font-semibold text-lg shadow-lg">
                Explore Courses
              </button>

              {/* Show only if NOT instructor */}
              {user?.role !== "instructor" && (
                <button
                  onClick={handleNavigation}
                  className="px-8 cursor-pointer py-4 border-2 border-purple-600 text-purple-600 rounded-full hover:bg-purple-50 transition-all font-semibold text-lg">
                  Become an Instructor
                </button>
              )}
            </div>

          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-purple-600 mb-2">{stat.icon}</div>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-gray-600 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose DevAcademy?</h2>
            <p className="text-xl text-gray-600">Everything you need to succeed in your learning journey</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50 hover:shadow-xl transition-all duration-300"
              >
                <div className="text-purple-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Explore Our Courses</h2>
            <p className="text-xl text-gray-600">Choose from Beginner, Medium, and Advanced levels</p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveTab(category)}
                className={`px-6 cursor-pointer py-2 rounded-full font-semibold transition-all ${activeTab === category
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
              >
                {category === 'all' ? 'All Courses' : category}
              </button>
            ))}
          </div>

          {/* Course Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group"
              >
               <div className="relative w-full h-60 bg-white flex items-center justify-center">
  <img
    src={course.courseThumbnail}
    alt={course.courseTitle}
    className="w-full h-full object-contain p-2"
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
                    <button onClick={() => handleEnrollment(course.id)} className="px-6 cursor-pointer py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-all font-semibold text-sm">
                       {course.isPurchased ? "Continue Course" :"Enroll Now"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="py-20 px-6 bg-gradient-to-b from-white to-purple-50 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              What Our Students Say
            </h2>
            <p className="text-xl text-gray-600">Real reviews from certified learners</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {reviews.map((review, idx) => (
              <div
                key={idx}
                className="review-card bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:rotate-1"
                style={{
                  animation: `slideInUp 0.6s ease-out ${idx * 0.2}s both`,
                  transformStyle: 'preserve-3d'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-blue-400/10 rounded-2xl -z-10 blur-xl"></div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <img
                      src={review.photoUrl}
                      alt={review.student}
                      className="w-14 h-14 rounded-full object-cover ring-4 ring-purple-100 shadow-md"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <div className="font-bold text-lg">{review.student}</div>
                    <div className="flex gap-1">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 text-yellow-400 fill-yellow-400"
                          style={{ animation: `starPop 0.3s ease-out ${i * 0.1}s both` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <Quote className="absolute -top-2 -left-2 w-8 h-8 text-purple-200" />
                  <p className="text-gray-700 mb-4 pl-4 italic leading-relaxed">{review.comment}</p>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="text-sm text-purple-600 font-semibold">{review.course}</div>
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <style jsx>{`
          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(60px) rotateX(-15deg);
            }
            to {
              opacity: 1;
              transform: translateY(0) rotateX(0);
            }
          }
          
          @keyframes starPop {
            0% {
              transform: scale(0) rotate(-180deg);
              opacity: 0;
            }
            50% {
              transform: scale(1.2) rotate(10deg);
            }
            100% {
              transform: scale(1) rotate(0);
              opacity: 1;
            }
          }
          
          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .animate-fade-in {
            animation: fade-in 0.8s ease-out;
          }
          
          .review-card {
            perspective: 1000px;
            position: relative;
          }
          
          .review-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border-radius: 1rem;
            padding: 2px;
            background: linear-gradient(135deg, #a78bfa, #60a5fa, #a78bfa);
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            opacity: 0;
            transition: opacity 0.3s;
          }
          
          .review-card:hover::before {
            opacity: 1;
          }
        `}</style>
      </section>

      {/* Become Instructor CTA */}

      {user?.role !== "instructor" &&
        <section id="become-instructor" className="py-20 px-6 bg-gradient-to-r from-purple-600 to-blue-600">
          <div className="max-w-4xl mx-auto text-center text-white">
            <GraduationCap className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-6">Become an Instructor</h2>
            <p className="text-xl mb-4 text-purple-100">Share your expertise and earn while teaching thousands of students</p>
            <p className="text-purple-100 mb-8">Our approval-based system ensures quality education. Apply today and join our community of expert instructors.</p>
            <button onClick={handleNavigation} className="px-10 py-4 cursor-pointer bg-white text-purple-600 rounded-full font-bold text-lg hover:shadow-2xl transition-all">
              Apply to Teach
            </button>
          </div>
        </section>
      }


    </div>
  );
}