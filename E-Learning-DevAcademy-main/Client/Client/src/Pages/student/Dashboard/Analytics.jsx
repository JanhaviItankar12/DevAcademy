import React, { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { BookOpen, Award, TrendingUp, Calendar, Clock, Target, X } from 'lucide-react';
import { useAnalyticsQuery } from '@/features/api/authApi';
import LoadingSpinner from '@/components/LoadingSpinner';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('year'); // week, month, year
  const { data, isLoading, isError } = useAnalyticsQuery({ range: timeRange });

  // Debug the API response
  useEffect(() => {
    if (data) {
      console.log('API Data Structure:', {
        data,
        completedCourses: data?.data?.completedCourses,
        certificates: data?.data?.certificates,
        totals: data?.data?.totals
      });
    }
  }, [data]);

  // Safely extract data from API response
  const rawAnalyticsData = useMemo(() => {
    if (!data?.data) {
      return { completedCourses: [], certificates: [] };
    }
    
    // Handle different response structures
    const apiData = data.data;
    
    return {
      completedCourses: Array.isArray(apiData.completedCourses) ? apiData.completedCourses : [],
      certificates: Array.isArray(apiData.certificates) ? apiData.certificates : [],
      // If backend provides pre-calculated totals
      totalCourses: apiData.totalCourses || (Array.isArray(apiData.completedCourses) ? apiData.completedCourses.length : 0),
      totalCertificates: apiData.totalCertificates || (Array.isArray(apiData.certificates) ? apiData.certificates.length : 0)
    };
  }, [data]);

  // Process data based on time range
  const processedData = useMemo(() => {
    const now = new Date();
    let startDate;

    switch (timeRange) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Ensure we have date field - handle different field names
    const filteredCourses = rawAnalyticsData.completedCourses
      .filter(course => {
        // Check if course has a date field (could be date, completedAt, etc.)
        const courseDate = course.date || course.completedAt;
        return courseDate && new Date(courseDate) >= startDate;
      })
      .map(course => ({
        ...course,
        date: course.date || course.completedAt // Normalize to 'date' field
      }));

    const filteredCertificates = rawAnalyticsData.certificates
      .filter(cert => {
        const certDate = cert.date || cert.issuedAt;
        return certDate && new Date(certDate) >= startDate;
      })
      .map(cert => ({
        ...cert,
        date: cert.date || cert.issuedAt // Normalize to 'date' field
      }));

    console.log('Filtered Data:', {
      courses: filteredCourses.length,
      certificates: filteredCertificates.length,
      sampleCourse: filteredCourses[0],
      sampleCert: filteredCertificates[0]
    });

    // Monthly aggregation for year view
    let chartData = [];
    
    if (timeRange === 'year') {
      const monthlyData = {};
      
      filteredCourses.forEach(course => {
        if (!course.date) return;
        
        const date = new Date(course.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthLabel = date.toLocaleDateString('en-US', { month: 'short' });
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { 
            month: monthLabel, 
            courses: 0, 
            certificates: 0, 
            sortKey: monthKey 
          };
        }
        monthlyData[monthKey].courses += 1;
      });

      filteredCertificates.forEach(cert => {
        if (!cert.date) return;
        
        const date = new Date(cert.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthLabel = date.toLocaleDateString('en-US', { month: 'short' });
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { 
            month: monthLabel, 
            courses: 0, 
            certificates: 0, 
            sortKey: monthKey 
          };
        }
        monthlyData[monthKey].certificates += 1;
      });
      
      chartData = Object.values(monthlyData).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    } else {
      // Daily aggregation for week/month view
      const dateMap = {};
      
      filteredCourses.forEach(course => {
        if (!course.date) return;
        
        const dateStr = course.date.split('T')[0]; // Get YYYY-MM-DD part
        const label = new Date(dateStr).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
        
        if (!dateMap[dateStr]) {
          dateMap[dateStr] = { 
            date: label, 
            courses: 0, 
            certificates: 0, 
            sortKey: dateStr 
          };
        }
        dateMap[dateStr].courses += 1;
      });

      filteredCertificates.forEach(cert => {
        if (!cert.date) return;
        
        const dateStr = cert.date.split('T')[0]; // Get YYYY-MM-DD part
        const label = new Date(dateStr).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
        
        if (!dateMap[dateStr]) {
          dateMap[dateStr] = { 
            date: label, 
            courses: 0, 
            certificates: 0, 
            sortKey: dateStr 
          };
        }
        dateMap[dateStr].certificates += 1;
      });
      
      chartData = Object.values(dateMap).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    }

    // Category distribution
    const categoryMap = {};
    filteredCourses.forEach(course => {
      if (course.category) {
        categoryMap[course.category] = (categoryMap[course.category] || 0) + 1;
      }
    });

    const categoryData = Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value
    }));

    console.log('Processed Data:', {
      chartData,
      categoryData,
      chartDataLength: chartData.length
    });

    return {
      chartData,
      categoryData,
      totalCourses: filteredCourses.length,
      totalCertificates: filteredCertificates.length
    };
  }, [timeRange, rawAnalyticsData]);

  const COLORS = ['#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#ec4899'];

  const StatCard = ({ icon: Icon, label, value, color, bgColor, trend }) => (
    <div className="bg-white p-5 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2.5 rounded-lg ${bgColor}`}>
          <Icon size={20} className={color} />
        </div>
        {trend && (
          <span className="text-xs text-green-600 font-medium">+{trend}%</span>
        )}
      </div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg">Failed to load analytics data</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Analytics Dashboard</h1>
            <p className="text-lg text-gray-500">Track your learning progress and achievements</p>
          </div>
          
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-medium"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last Year</option>
          </select>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard
            icon={BookOpen}
            label="Courses Completed"
            value={processedData.totalCourses}
            color="text-purple-600"
            bgColor="bg-purple-50"
          />
          <StatCard
            icon={Award}
            label="Certificates Earned"
            value={processedData.totalCertificates}
            color="text-blue-600"
            bgColor="bg-blue-50"
          />
          <StatCard
            icon={Target}
            label="Success Rate"
            value={`${rawAnalyticsData.certificates.length > 0 ? 
              Math.round((rawAnalyticsData.certificates.length / rawAnalyticsData.completedCourses.length) * 100) : 0}%`}
            color="text-green-600"
            bgColor="bg-green-50"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Completion Trend Chart */}
          <div className="bg-white p-5 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Completion Trend</h3>
                <p className="text-sm text-gray-500">Courses and certificates over time</p>
              </div>
            </div>
            
            {processedData.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={processedData.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey={timeRange === 'year' ? 'month' : 'date'} 
                    tick={{ fontSize: 11 }}
                    stroke="#9ca3af"
                  />
                  <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '12px' }}
                    iconType="line"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="courses" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    name="Courses Completed"
                    dot={{ fill: '#8b5cf6', r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="certificates" 
                    stroke="#06b6d4" 
                    strokeWidth={2}
                    name="Certificates Earned"
                    dot={{ fill: '#06b6d4', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-80">
                <p className="text-gray-400">No data available for the selected time range</p>
              </div>
            )}
          </div>

          {/* Category Distribution */}
          <div className="bg-white p-5 rounded-lg border border-gray-200">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-gray-800">Category Distribution</h3>
              <p className="text-xs text-gray-500">Courses completed by category</p>
            </div>
            
            {processedData.categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={processedData.categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {processedData.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-80">
                <p className="text-gray-400">No category data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Bar Chart - Courses vs Certificates */}
        <div className="bg-white p-5 rounded-lg border border-gray-200 mb-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Monthly Overview</h3>
            <p className="text-sm text-gray-500">Comparison of completed courses and earned certificates</p>
          </div>
          
          {processedData.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={processedData.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey={timeRange === 'year' ? 'month' : 'date'} 
                  tick={{ fontSize: 11 }}
                  stroke="#9ca3af"
                />
                <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '12px' }}
                />
                <Bar 
                  dataKey="courses" 
                  fill="#8b5cf6" 
                  name="Courses Completed"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="certificates" 
                  fill="#06b6d4" 
                  name="Certificates Earned"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-80">
              <p className="text-gray-400">No chart data available</p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Completions */}
          <div className="bg-white p-5 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Completions</h3>
            <div className="space-y-3">
              {rawAnalyticsData.completedCourses.slice(0, 3).map((course, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <BookOpen size={16} className="text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-medium text-gray-800 truncate">{course.courseTitle}</p>
                    <p className="text-sm text-gray-500">{course.category}</p>
                  </div>
                  <span className="text-sm text-gray-500 whitespace-nowrap">
                    {new Date(course.date || course.completedAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Certificates */}
          <div className="bg-white p-5 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Certificates</h3>
            <div className="space-y-3">
              {rawAnalyticsData.certificates.slice(0, 3).map((cert, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Award size={16} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-medium text-gray-800 truncate">{cert.courseTitle}</p>
                    <p className="text-sm text-gray-500 font-mono">{cert.certificateId}</p>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {new Date(cert.date || cert.issuedAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;