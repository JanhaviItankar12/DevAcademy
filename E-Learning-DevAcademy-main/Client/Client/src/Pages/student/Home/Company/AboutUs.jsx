import React from 'react';
import { BookOpen, Users, Award, Target, Heart, Zap, TrendingUp, Globe, RockingChair, Star, GraduationCap } from 'lucide-react';
import { useGetDataforHeroSectionQuery } from '@/features/api/courseApi';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function AboutUs() {

  const { data: dataForHeroSection, isLoading, isError } = useGetDataforHeroSectionQuery();
  const navigate = useNavigate();
  const { user } = useSelector(store => store.auth);


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
      value: dataForHeroSection?.overallRating
        ? `${dataForHeroSection.overallRating}`
        : "0.0",
      label: "Rating Score",
      icon: <Star className="w-6 h-6" />
    }
  ];


  const values = [
    {
      icon: <Target className="w-12 h-12" />,
      title: "Mission Driven",
      description: "We're committed to making quality education accessible to everyone, everywhere."
    },
    {
      icon: <Heart className="w-12 h-12" />,
      title: "Student First",
      description: "Every decision we make is centered around what's best for our learners."
    },
    {
      icon: <Zap className="w-12 h-12" />,
      title: "Innovation",
      description: "We constantly evolve our platform with cutting-edge technology and teaching methods."
    },
    {
      icon: <Award className="w-12 h-12" />,
      title: "Excellence",
      description: "We maintain the highest standards in course quality and instructor expertise."
    }
  ];

  const handleNavigation = () => {
    window.location.href = "/courses";
  };

  const handleBecomeInstructor = () => {
    navigate("/login", { state: { tab: "signup" } });
  };

  const handleNavigationforTeaching = () => {
    navigate("/instructor/course");
  };

  const founder = {
    name: "Ananya Sharma",
    role: "Co-Founder & CTO",
    image: "https://cdn.pixabay.com/photo/2023/01/26/13/33/woman-7746006_1280.jpg",
    bio: "Tech visionary with a passion for building scalable platforms. Ananya has led multiple EdTech projects and is dedicated to creating seamless learning experiences."
  };

  const timeline = [
    {
      year: "May 2025",
      event: "Project Initiated",
      description: "Started DevAcademy as a solo project to build a web platform for tech education"
    },
    {
      year: "Aug 2025",
      event: "Core Platform Development",
      description: "Developed basic frontend and backend with course listing, signup, and login"
    },
    {
      year: "Sep 2025",
      event: "First Courses Added",
      description: "Created initial set of courses and implemented course viewing functionality"
    },
    {
      year: "Oct 2025",
      event: "User Dashboard & Features",
      description: "Added student dashboard, course progress tracking, and certificate generation"
    },
    {
      year: "Dec 2025",
      event: "Polished MVP",
      description: "Completed major features: instructor program, search, and responsive design; ready for showcase"
    },
    {
      year: "2026",
      event: "Future Plans",
      description: "Planning AI recommendations, gamified learning, and mobile app development"
    }
  ];


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">



      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            About DevAcademy
          </h1>
          <p className="text-2xl text-gray-600 max-w-3xl mx-auto mb-12">
            Empowering the next generation of developers with world-class education and hands-on learning experiences
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50 hover:shadow-xl transition-all">
                <div className="text-purple-600 flex justify-center mb-4">{stat.icon}</div>
                <div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Our Story</h2>
          <div className="bg-white rounded-3xl shadow-2xl p-12">
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              DevAcademy was born in early 2025 from a simple yet powerful idea: everyone deserves access to quality tech education, regardless of their background or location. As a solo founder with a passion for education and technology, I noticed a significant gap between what traditional education offered and what the industry actually needed.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Starting with just a handful of courses and a vision to make a difference, DevAcademy has grown into a thriving learning platform. Today, we're proud to serve over 1,000 students across 20+ countries, working with 100+ expert instructors who share our commitment to quality education.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Every day, we work towards our mission of making tech education accessible, affordable, and effective. We believe that learning should be engaging, practical, and directly applicable to real-world scenarios. That's why our courses are designed by industry professionals and updated regularly to reflect the latest trends and technologies. This is just the beginning of our journey.
            </p>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Our Values</h2>
          <p className="text-xl text-gray-600 text-center mb-12">The principles that guide everything we do</p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, idx) => (
              <div key={idx} className="p-8 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 text-white hover:scale-105 transition-all">
                <div className="mb-4">{value.icon}</div>
                <h3 className="text-2xl font-bold mb-3">{value.title}</h3>
                <p className="text-purple-100">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Our Journey</h2>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-purple-600 to-blue-600"></div>

            {timeline.map((item, idx) => (
              <div key={idx} className={`flex items-center mb-12 ${idx % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                <div className={`w-1/2 ${idx % 2 === 0 ? 'pr-12 text-right' : 'pl-12 text-left'}`}>
                  <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all">
                    <div className="text-3xl font-bold text-purple-600 mb-2">{item.year}</div>
                    <h3 className="text-xl font-bold mb-2">{item.event}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-purple-600 rounded-full border-4 border-white shadow-lg"></div>
                <div className="w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Meet the Founder</h2>
          <p className="text-xl text-gray-600 text-center mb-12">The visionary behind DevAcademy</p>

          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl shadow-2xl overflow-hidden">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="relative h-96 md:h-full">
                <img
                  src={founder.image}
                  alt={founder.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 to-transparent"></div>
                <div className="absolute bottom-8 left-8 text-white">
                  <h3 className="text-3xl font-bold mb-2">{founder.name}</h3>
                  <p className="text-xl text-purple-200">{founder.role}</p>
                </div>
              </div>
              <div className="p-8 md:p-12">
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  {founder.bio}
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                    <p className="text-gray-700">10+ years in EdTech and Software Development</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                    <p className="text-gray-700">Former Tech Lead at leading companies</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                    <p className="text-gray-700">Passionate about democratizing education</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                    <p className="text-gray-700">Trained 5000+ students in previous roles</p>
                  </div>
                </div>
                <div className="mt-8">
                  <blockquote className="border-l-4 border-purple-600 pl-4 italic text-gray-700">
                    "Education is the most powerful tool for change. My goal is to make quality tech education accessible to every aspiring developer, regardless of their circumstances."
                  </blockquote>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white rounded-3xl shadow-2xl p-12">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center text-white mb-6">
                <Target className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-bold mb-4">Our Mission</h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                To empower individuals worldwide with the skills and knowledge needed to succeed in the ever-evolving tech industry. We strive to make quality education accessible, affordable, and practical for everyone.
              </p>
            </div>
            <div className="bg-white rounded-3xl shadow-2xl p-12">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-6">
                <TrendingUp className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-bold mb-4">Our Vision</h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                To become India's leading online learning platform, bridging the gap between education and industry. We envision a future where anyone with determination can acquire world-class skills and transform their career.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Join Our Mission</h2>
          <p className="text-xl mb-8 text-purple-100">
            Be part of a community that's shaping the future of tech education
          </p>
          <div className="flex gap-4 justify-center flex-wrap">

            {/* For student or not logged in */}
            {(!user || user?.role === 'student') && (
              <>
                <button
                  onClick={handleNavigation}
                  className="px-10 cursor-pointer py-4 bg-white text-purple-600 rounded-full font-bold text-lg hover:shadow-2xl transition-all"
                >
                  Start Learning Today
                </button>
                <button
                  onClick={handleBecomeInstructor}
                  className="px-10 py-4 border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white hover:text-purple-600 transition-all cursor-pointer"
                >
                  Become an Instructor
                </button>
              </>
            )}

            {/* For instructor only */}
            {user?.role === 'instructor' && (
              <button
                onClick={handleNavigationforTeaching}
                className="px-10 cursor-pointer py-4 bg-white text-purple-600 rounded-full font-bold text-lg hover:shadow-2xl transition-all"
              >
                Start Teaching Today
              </button>
            )}

          </div>
        </div>
      </section>



    </div>
  );
}