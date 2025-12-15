import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  BookOpen, 
  Star,
  Calendar,
  Award,
  Target,
  Activity,
  ArrowLeft,
  Download,
  IndianRupee
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useGetInstructorDashboardQuery, useGetAllCoursesByInstructorQuery } from '@/features/api/courseApi';
import LoadingSpinner from '@/components/LoadingSpinner';

const MainAnalytics = ({ navigate }) => {
  const [timeRange, setTimeRange] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  const { data, isLoading } = useGetInstructorDashboardQuery(timeRange);
  const { data: courseData } = useGetAllCoursesByInstructorQuery();

  const courses = courseData?.courseData || [];
  
  // Generate mock trend data based on timeRange
  const generateTrendData = () => {
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365;
    const data = [];
    const baseRevenue = (data?.totalRevenue || 50000) / days;
    const baseStudents = (data?.totalStudents || 500) / days;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const variance = Math.random() * 0.4 + 0.8; // 80% to 120%
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: Math.round(baseRevenue * variance * (days - i + 1)),
        students: Math.round(baseStudents * variance * (days - i + 1)),
        enrollments: Math.round(Math.random() * 15 + 5)
      });
    }
    return data;
  };

  const trendData = data?.trendData || generateTrendData();

  // Create a mutable copy of courses array
  const mutableCourses = [...courses];

  // Course performance data
  const coursePerformanceData = mutableCourses.slice(0, 6).map(course => ({
    name: course.title.length > 20 ? course.title.substring(0, 20) + '...' : course.title,
    students: course.students || 0,
    revenue: course.revenue || 0,
    rating: course.rating || 0
  }));

  // Revenue by course (Pie chart)
  const revenueByCourse = mutableCourses.slice(0, 5).map(course => ({
    name: course.title.length > 15 ? course.title.substring(0, 15) + '...' : course.title,
    value: course.revenue || 0
  }));

  // Status distribution
  const publishedCount = mutableCourses.filter(c => c.isPublished).length;
  const draftCount = mutableCourses.filter(c => !c.isPublished).length;
  const statusData = [
    { name: 'Published', value: publishedCount, color: '#10b981' },
    { name: 'Draft', value: draftCount, color: '#6b7280' }
  ];

  // Rating distribution
  const ratingDistribution = [
    { range: '4.5-5.0', count: mutableCourses.filter(c => c.rating >= 4.5).length },
    { range: '4.0-4.4', count: mutableCourses.filter(c => c.rating >= 4.0 && c.rating < 4.5).length },
    { range: '3.5-3.9', count: mutableCourses.filter(c => c.rating >= 3.5 && c.rating < 4.0).length },
    { range: '3.0-3.4', count: mutableCourses.filter(c => c.rating >= 3.0 && c.rating < 3.5).length },
    { range: '<3.0', count: mutableCourses.filter(c => c.rating < 3.0).length }
  ];

  // Get best performer and highest rated (computed once)
  const bestPerformer = mutableCourses.length > 0 
    ? [...mutableCourses].sort((a, b) => (b.students || 0) - (a.students || 0))[0]
    : null;
  
  const highestRated = mutableCourses.length > 0
    ? [...mutableCourses].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0]
    : null;

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const stats = {
    totalRevenue: data?.totalRevenue || 0,
    totalStudents: data?.totalStudents || 0,
    totalCourses: data?.totalCourses || 0,
    avgRating: Number((Number(data?.averageRating) || 0).toFixed(1)),
    revenueGrowth: data?.revenuAgragateGrowth || 0,
    studentGrowth: data?.studentAgregateGrowth || 0,
    avgRevenuePerStudent: data?.totalRevenue && data?.totalStudents 
      ? Math.round(data.totalRevenue / data.totalStudents) 
      : 0,
    completionRate: 78 // Mock data
  };

  if (isLoading) {
    return (
      <LoadingSpinner/>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 mt-5">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
             
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-gray-600 mt-1">Comprehensive insights into your performance</p>
              </div>
            </div>
            <div className="flex gap-3">
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="week">Last 7 days</option>
                <option value="month">Last 30 days</option>
                <option value="year">Last year</option>
              </select>
              
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-lg font-medium">Total Revenue</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">₹{stats.totalRevenue.toLocaleString()}</h3>
               
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <IndianRupee className="text-green-600" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-lg font-medium">Total Students</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">{stats.totalStudents.toLocaleString()}</h3>
                
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="text-blue-600" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-lg font-medium">Avg Revenue/Student</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">₹{stats.avgRevenuePerStudent.toLocaleString()}</h3>
                <p className="text-gray-500 text-sm mt-2">Per enrollment</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Target className="text-purple-600" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-lg font-medium">Average Rating</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">{stats.avgRating}</h3>
                <p className="text-gray-500 text-sm mt-2">Across all courses</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Star className="text-yellow-600" size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Revenue & Enrollment Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Trend */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Revenue Trend</h3>
                <p className="text-sm text-gray-600">Daily revenue over time</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setSelectedMetric('revenue')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    selectedMetric === 'revenue' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Revenue
                </button>
                <button 
                  onClick={() => setSelectedMetric('students')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    selectedMetric === 'students' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Students
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey={selectedMetric} 
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Enrollments Trend */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900">Daily Enrollments</h3>
              <p className="text-sm text-gray-600">New student enrollments per day</p>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="enrollments" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Course Performance & Revenue Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Performing Courses */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900">Top Performing Courses</h3>
              <p className="text-sm text-gray-600">By student enrollment</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={coursePerformanceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="students" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900">Revenue Distribution</h3>
              <p className="text-sm text-gray-600">By course contribution</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenueByCourse}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {revenueByCourse.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rating & Status Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Rating Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900">Rating Distribution</h3>
              <p className="text-sm text-gray-600">Course ratings breakdown</p>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={ratingDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Course Status */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900">Course Status</h3>
              <p className="text-sm text-gray-600">Published vs Draft courses</p>
            </div>
            <div className="flex items-center justify-center h-64">
              <div className="relative">
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">{courses.length}</div>
                    <div className="text-sm text-gray-600">Total</div>
                  </div>
                </div>
              </div>
              <div className="ml-8 space-y-4">
                {statusData.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }}></div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      <div className="text-lg font-bold text-gray-700">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900">Performance Insights</h3>
            <p className="text-sm text-gray-600">Key takeaways and recommendations</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-3 mb-2">
                <Activity className="text-blue-600" size={24} />
                <h4 className="font-semibold text-gray-900">Best Performer</h4>
              </div>
              <p className="text-sm text-gray-600">
                {courses.length > 0 && [...courses].sort((a, b) => (b.students || 0) - (a.students || 0))[0]?.title}
              </p>
              <p className="text-xs text-blue-600 mt-2 font-medium">
                {courses.length > 0 && [...courses].sort((a, b) => (b.students || 0) - (a.students || 0))[0]?.students} students enrolled
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center gap-3 mb-2">
                <Award className="text-green-600" size={24} />
                <h4 className="font-semibold text-gray-900">Highest Rated</h4>
              </div>
              <p className="text-sm text-gray-600">
                {courses.length > 0 && [...courses].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0]?.title}
              </p>
              <p className="text-xs text-green-600 mt-2 font-medium flex items-center gap-1">
                <Star size={12} fill="currentColor" />
                {courses.length > 0 && Number([...courses].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0]?.rating || 0).toFixed(1)} rating
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
              <div className="flex items-center gap-3 mb-2">
                <Target className="text-purple-600" size={24} />
                <h4 className="font-semibold text-gray-900">Growth Opportunity</h4>
              </div>
              <p className="text-sm text-gray-600">
                {draftCount > 0 ? `${draftCount} draft courses ready to publish` : 'All courses published'}
              </p>
              <p className="text-xs text-purple-600 mt-2 font-medium">
                Publish drafts to increase reach
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainAnalytics;