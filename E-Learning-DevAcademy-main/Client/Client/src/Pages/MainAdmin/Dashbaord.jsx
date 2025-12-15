import React, { useEffect, useState } from 'react';
import { Users, BookOpen, GraduationCap, TrendingUp, DollarSign, UserCheck, Award, Clock, ArrowUp, ArrowDown, IndianRupee } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useGetAdminDashboardQuery } from '@/features/api/courseApi';
import Revenu from './ComponentOfDashboard/Revenu';

import LoadingSpinner from '@/components/LoadingSpinner';
import { useGetAdminDataQuery } from '@/features/api/authApi';



const AdminDashboard = () => {
  const [range, setRange] = useState('week');
  const { data, isLoading, isError, refetch } = useGetAdminDashboardQuery(range);
  const { data: adminData, isError: adminError, isLoading: adminLoading } = useGetAdminDataQuery();


  useEffect(() => {
    if (refetch) {
      refetch({ range });
    }
  }, [range]);

  // Platform usage stats
  const usageData = [
    { name: "Active", value: data?.data?.usageData.active, color: "#10b981" },   // green
    { name: "Inactive", value: data?.data?.usageData.inactive, color: "#ef4444" } // red
  ];

  const StatCard = ({ icon: Icon, title, value, subtitle, change, changeLabel, color, bgColor }) => (
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className={`p-2 sm:p-3 rounded-lg ${bgColor}`}>
          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${color}`} />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${change >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
            {change >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <h3 className="text-gray-600 text-xs sm:text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-xs sm:text-sm text-gray-500">{subtitle || changeLabel}</p>
    </div>
  );

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-gray-50 mt-5">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 text-sm sm:text-base lg:text-lg mt-1">
                Welcome back! Here's what's happening with your platform today.
              </p>
            </div>
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <div className="text-right mr-2 sm:mr-4 hidden sm:block">
                <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">Administrator</p>
                <p className="text-sm sm:text-base lg:text-lg text-gray-500">{adminData?.admin?.name}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg overflow-hidden">
                {adminData?.admin?.photoUrl ? (
                  <img
                    src={adminData.admin.photoUrl}
                    alt="Admin"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{adminData?.admin?.name?.charAt(0).toUpperCase()}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="space-y-6 sm:space-y-8">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard
              icon={Users}
              title="Total Students"
              value={data?.data?.totalStudents}
              subtitle={`${data?.data?.studentThisMonth} enrolled this month`}
              changeLabel="vs last month"
              color="text-blue-600"
              bgColor="bg-blue-50"
            />
            <StatCard
              icon={UserCheck}
              title="Total Instructors"
              value={data?.data?.totalInstructors}
              subtitle={`${data?.data?.instructorsThisMonth} joined this month`}
              changeLabel="vs last month"
              color="text-purple-600"
              bgColor="bg-purple-50"
            />
            <StatCard
              icon={IndianRupee}
              title="Total Sales"
              value={`₹ ${data?.data?.totalRevenue}`}
              subtitle="Revenue this month"
              changeLabel="vs last month"
              color="text-green-600"
              bgColor="bg-green-50"
            />
            <StatCard
              icon={Award}
              title="Completion Rate"
              value={data?.data?.completionRate}
              subtitle="Average across all courses"
              changeLabel="vs last month"
              color="text-orange-600"
              bgColor="bg-orange-50"
            />
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <h3 className="text-gray-600 text-xs sm:text-sm font-medium">Active Courses</h3>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{data?.data?.activeCourses}</p>
              <p className='text-gray-500 text-xs sm:text-sm mt-1'>These are the courses currently available and running for students.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <h3 className="text-gray-600 text-xs sm:text-sm font-medium">InActive Courses</h3>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{data?.data?.inactiveCourses}</p>
              <p className='text-gray-500 text-xs sm:text-sm mt-1'>These courses are currently not active or unavailable for enrollment.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <h3 className="text-gray-600 text-xs sm:text-sm font-medium">Platform Growth</h3>
              </div>

              {/* Flex container for horizontal layout with labels */}
              <div className="flex gap-6 sm:gap-10">
                <div className="flex flex-col items-center">
                  <span className="text-xl sm:text-2xl font-bold text-gray-900">{data?.data?.studentGrowth}%</span>
                  <span className="text-gray-500 text-xs sm:text-sm">Student Growth</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xl sm:text-2xl font-bold text-gray-900">{data?.data?.revenueGrowth}%</span>
                  <span className="text-gray-500 text-xs sm:text-sm">Revenue Growth</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <GraduationCap className="w-5 h-5 text-rose-600" />
                <h3 className="text-gray-600 text-xs sm:text-sm font-medium">Certificates Issued</h3>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{data?.data?.totalCertificates}</p>
              <p className="text-xs text-gray-500 mt-1">{data?.data?.certificatesThisMonth} issued in this month</p>
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Revenue Chart - Takes 2 columns on large screens */}
            <div className="lg:col-span-2">
              <Revenu
                range={range}
                setRange={setRange}
                data={data}
                isLoading={isLoading}
                isError={isError}
              />
            </div>
            
            {/* User Status Distribution */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4 sm:mb-6">User Status</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={usageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {usageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {usageData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-xs sm:text-sm text-gray-700">{item.name}</span>
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-gray-900">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Enrollment Trends */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4 sm:mb-6">Enrollment Trends</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data?.data?.enrollmentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="week" 
                    stroke="#6b7280" 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="#6b7280" 
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="students" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="instructors" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Course Completion by Category */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4 sm:mb-6">Course Completion Rate (%)</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data?.data?.completionCategories} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    type="number" 
                    stroke="#6b7280" 
                    unit="%" 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="category" 
                    stroke="#6b7280" 
                    width={80}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="completed" stackId="a" fill="#10b981" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="uncompleted" stackId="a" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};



export default AdminDashboard;