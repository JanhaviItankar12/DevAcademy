import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, TrendingUp, Users, DollarSign, PlayCircle, Star, Eye, Calendar, Download, IndianRupee, Clock, TrendingDown, BarChart3, PieChart } from 'lucide-react';
import { Chart, registerables } from 'chart.js';
import { data, useNavigate, useParams } from 'react-router-dom';
import { useGetCourseAnalyticsQuery } from '@/features/api/courseApi';

// Register Chart.js components
Chart.register(...registerables);

const CourseAnalytics = () => {
    const currentYear = new Date().getFullYear();
    const [selectedPeriod, setSelectedPeriod] = useState(currentYear);
    const [engagementView, setEngagementView] = useState('cards'); // 'cards', 'dropoff', 'watchtime', 'views'
    const [chartInstances, setChartInstances] = useState({
        revenue: null,
        rating: null,
        engagement: null
    });

    const params = useParams();
    const courseId = params.courseId;
    const navigate = useNavigate();

    const { data: analyticsData, isAnalyticsLoading } = useGetCourseAnalyticsQuery({
        courseId,
        selectedyear: selectedPeriod
    });

    console.log('Analytics Data:', analyticsData);

    if (isAnalyticsLoading) {
        return <p className="text-center text-gray-500">Loading analytics...</p>;
    }

    console.log(analyticsData);
    const course = analyticsData?.course;

    // Refs for chart canvases
    const revenueChartRef = useRef(null);
    const ratingChartRef = useRef(null);
    const dropoffChartRef = useRef(null);
    const watchtimeChartRef = useRef(null);
    const viewsChartRef = useRef(null);

    const ratingCounts = analyticsData?.reviw
        ? [5, 4, 3, 2, 1].map(star =>
            analyticsData?.reviw?.filter(r => r.rating === star).length || 0
        )
        : [0, 0, 0, 0, 0];

    // Helper functions for lecture engagement
    const getCompletionColor = (rate) => {
        if (rate >= 80) return 'text-green-600 bg-green-100 dark:bg-green-900/30';
        if (rate >= 60) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
        return 'text-red-600 bg-red-100 dark:bg-red-900/30';
    };

    const getCompletionBarColor = (rate) => {
        if (rate >= 80) return 'bg-green-500';
        if (rate >= 60) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
       
        if (!analyticsData?.monthlyData) return;
        
        
        // Destroy existing charts if they exist
        let revenueChartInstance = null;
        let ratingChartInstance = null;
        let dropoffChartInstance = null;
        let watchtimeChartInstance = null;
        let viewsChartInstance = null;

        if (revenueChartRef.current && analyticsData?.monthlyData) {
            const ctx = revenueChartRef.current.getContext('2d');
            
            // Create gradient for revenue bars
            const revenueGradient = ctx.createLinearGradient(0, 0, 0, 400);
            revenueGradient.addColorStop(0, 'rgba(59, 130, 246, 0.9)');
            revenueGradient.addColorStop(1, 'rgba(59, 130, 246, 0.3)');
            
            // Create gradient for enrollment line
            const enrollmentGradient = ctx.createLinearGradient(0, 0, 0, 400);
            enrollmentGradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
            enrollmentGradient.addColorStop(1, 'rgba(16, 185, 129, 0.05)');
            
            revenueChartInstance = new Chart(revenueChartRef.current, {
                type: 'bar',
                data: {
                    labels: analyticsData.monthlyData.map(item => item.month),
                    datasets: [
                        {
                            label: 'Revenue',
                            data: analyticsData.monthlyData.map(item => item.revenue),
                            backgroundColor: revenueGradient,
                            borderColor: 'rgba(59, 130, 246, 1)',
                            borderWidth: 2,
                            borderRadius: 8,
                            borderSkipped: false,
                            yAxisID: 'y',
                            barPercentage: 0.7,
                            categoryPercentage: 0.8
                        },
                        {
                            label: 'Enrollments',
                            data: analyticsData.monthlyData.map(item => item.enrollments),
                            backgroundColor: enrollmentGradient,
                            borderColor: 'rgba(16, 185, 129, 1)',
                            borderWidth: 3,
                            type: 'line',
                            yAxisID: 'y1',
                            fill: true,
                            tension: 0.4,
                            pointRadius: 5,
                            pointHoverRadius: 7,
                            pointBackgroundColor: 'rgba(16, 185, 129, 1)',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            pointHoverBackgroundColor: '#fff',
                            pointHoverBorderColor: 'rgba(16, 185, 129, 1)',
                            pointHoverBorderWidth: 3
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        mode: 'index',
                        intersect: false,
                    },
                    plugins: {
                        legend: {
                            position: 'top',
                            align: 'end',
                            labels: {
                                usePointStyle: true,
                                pointStyle: 'circle',
                                padding: 20,
                                font: {
                                    size: 13,
                                    weight: '600'
                                }
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            borderWidth: 1,
                            padding: 12,
                            displayColors: true,
                            callbacks: {
                                label: function(context) {
                                    let label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.datasetIndex === 0) {
                                        label += '₹' + context.parsed.y.toLocaleString('en-IN');
                                    } else {
                                        label += context.parsed.y.toLocaleString();
                                    }
                                    return label;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(156, 163, 175, 0.1)',
                                drawBorder: false
                            },
                            ticks: {
                                font: {
                                    size: 12
                                },
                                callback: function(value) {
                                    return '₹' + (value / 1000).toFixed(0) + 'K';
                                }
                            },
                            title: {
                                display: true,
                                text: 'Revenue (₹)',
                                font: {
                                    size: 13,
                                    weight: '600'
                                },
                                padding: { top: 10, bottom: 10 }
                            }
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            beginAtZero: true,
                            grid: {
                                drawOnChartArea: false,
                            },
                            ticks: {
                                font: {
                                    size: 12
                                }
                            },
                            title: {
                                display: true,
                                text: 'Enrollments',
                                font: {
                                    size: 13,
                                    weight: '600'
                                },
                                padding: { top: 10, bottom: 10 }
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                font: {
                                    size: 12
                                }
                            }
                        }
                    }
                }
            });
        }

        if (ratingChartRef.current && analyticsData?.reviw) {
            ratingChartInstance = new Chart(ratingChartRef.current, {
                type: 'doughnut',
                data: {
                    labels: ['5 Stars', '4 Stars', '3 Stars', '2 Stars', '1 Star'],
                    datasets: [{
                        data: ratingCounts,
                        backgroundColor: [
                            'rgba(255, 206, 86, 0.7)',
                            'rgba(54, 162, 235, 0.7)',
                            'rgba(75, 192, 192, 0.7)',
                            'rgba(153, 102, 255, 0.7)',
                            'rgba(255, 99, 132, 0.7)'
                        ],
                        borderColor: [
                            'rgba(255, 206, 86, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 99, 132, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                        },
                        title: {
                            display: true,
                            text: 'Rating Distribution'
                        }
                    }
                }
            });
        }

        // Drop-off Line/Area Chart
        if (dropoffChartRef.current && analyticsData?.lectureEngagement && engagementView === 'dropoff') {
            dropoffChartInstance = new Chart(dropoffChartRef.current, {
                type: 'line',
                data: {
                    labels: analyticsData?.lectureEngagement.map(item => item.title),
                    datasets: [{
                        label: 'Drop-off Rate (%)',
                        data: analyticsData?.lectureEngagement.map(item => item.dropOff || 0),
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderColor: 'rgba(239, 68, 68, 1)',
                        pointBackgroundColor: 'rgba(239, 68, 68, 1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(239, 68, 68, 1)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            title: {
                                display: true,
                                text: 'Drop-off Rate (%)'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Lectures'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: 'Lecture Drop-off Rates'
                        }
                    }
                }
            });
        }

        // Average Watch Time Horizontal Bar Chart
        if (watchtimeChartRef.current && analyticsData?.lectureEngagement && engagementView === 'watchtime') {
            watchtimeChartInstance = new Chart(watchtimeChartRef.current, {
                type: 'bar',
                data: {
                    labels: analyticsData?.lectureEngagement.map(item => item.title),
                    datasets: [{
                        label: 'Average Watch Time (minutes)',
                        data: analyticsData?.lectureEngagement.map(item => (item.avgTime || 0) / 60), // Convert to minutes
                        backgroundColor: 'rgba(59, 130, 246, 0.7)',
                        borderColor: 'rgba(59, 130, 246, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    indexAxis: 'y', // This makes it horizontal
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Average Watch Time (minutes)'
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Lectures'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: 'Average Watch Time per Lecture'
                        }
                    }
                }
            });
        }

        // Views Vertical Bar Chart
        if (viewsChartRef.current && analyticsData?.lectureEngagement && engagementView === 'views') {
            viewsChartInstance = new Chart(viewsChartRef.current, {
                type: 'bar',
                data: {
                    labels: analyticsData?.lectureEngagement.map(item => item.title),
                    datasets: [{
                        label: 'Views',
                        data: analyticsData?.lectureEngagement.map(item => item.views || 0),
                        backgroundColor: 'rgba(16, 185, 129, 0.7)',
                        borderColor: 'rgba(16, 185, 129, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Number of Views'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Lectures'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: 'Views per Lecture'
                        }
                    }
                }
            });
        }

        // Cleanup function to destroy charts when component unmounts
        return () => {
            if (revenueChartInstance) revenueChartInstance.destroy();
            if (ratingChartInstance) ratingChartInstance.destroy();
            if (dropoffChartInstance) dropoffChartInstance.destroy();
            if (watchtimeChartInstance) watchtimeChartInstance.destroy();
            if (viewsChartInstance) viewsChartInstance.destroy();
        };
    }, [selectedPeriod, analyticsData, engagementView]); // Re-run effect when period or view changes

    const StatCard = ({ title, value, icon: Icon, trend, color = 'blue' }) => (
        <div className='bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm'>
            <div className='flex items-center justify-between'>
                <div>
                    <p className='text-sm text-gray-600 dark:text-gray-400 mb-1'>{title}</p>
                    <p className={`text-2xl font-bold text-${color}-600 dark:text-${color}-400`}>{value}</p>
                    {trend && (
                        <div className='flex items-center mt-2 text-sm'>
                            <TrendingUp className='h-4 w-4 text-green-500 mr-1' />
                            <span className='text-green-600'>+{trend}% this month</span>
                        </div>
                    )}
                </div>
                <div className={`p-3 bg-${color}-100 dark:bg-${color}-900/30 rounded-lg`}>
                    <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
                </div>
            </div>
        </div>
    );

    // Helper function to get the correct icon for activity type
    const getActivityIcon = (activity) => {
        switch (activity.type) {
            case 'enrollment':
                return <Users className='h-4 w-4 text-blue-600' />;
            case 'completion':
                return <PlayCircle className='h-4 w-4 text-green-600' />;
            case 'review':
                return <Star className='h-4 w-4 text-yellow-600' />;
            default:
                return <Users className='h-4 w-4 text-gray-600' />;
        }
    };

    // Helper function to get the correct background color for activity type
    const getActivityBgColor = (activity) => {
        switch (activity.type) {
            case 'enrollment':
                return 'bg-blue-100 dark:bg-blue-900/30';
            case 'completion':
                return 'bg-green-100 dark:bg-green-900/30';
            case 'review':
                return 'bg-yellow-100 dark:bg-yellow-900/30';
            default:
                return 'bg-gray-100 dark:bg-gray-900/30';
        }
    };

    return (
        <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
            {/* Header */}
            <div className='bg-white dark:bg-gray-800 border-b shadow-sm'>
                <div className='max-w-7xl mx-auto px-4 md:px-8 py-4'>
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-4'>
                            <button className='p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors'>
                                <ArrowLeft className='h-5 w-5 cursor-pointer' onClick={() => navigate(-1)} />
                            </button>
                            <div>
                                <h1 className='text-xl font-bold text-gray-900 dark:text-white'>Course Analytics</h1>
                                <p className='text-lg text-gray-500'>{course?.courseTitle}</p>
                            </div>
                        </div>
                        <div className='flex items-center gap-3'>
                            <select
                                value={selectedPeriod}
                                onChange={(e) => setSelectedPeriod(parseInt(e.target.value))}
                                className="px-3 py-2 bg-white  dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                            >
                                <option value={2023}>2023</option>
                                <option value={2024}>2024</option>
                                <option value={2025}>2025</option>
                            </select>
{/* 
                            <button className='flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors'>
                                <Download className='h-4 w-4' />
                                Export
                            </button> */}
                        </div>
                    </div>
                </div>
            </div>

            <div className='max-w-7xl mx-auto px-4 md:px-8 py-8'>
                {/* Key Metrics */}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
                    <StatCard
                        title="Total Revenue"
                        value={`₹${analyticsData?.overview?.totalRevenue}`}
                        icon={IndianRupee}
                        color="green"
                    />
                    <StatCard
                        title="Total Students"
                        value={`${analyticsData?.overview.totalStudents}`}
                        icon={Users}
                        color="blue"
                    />
                    <StatCard
                        title="Average Rating"
                        value={analyticsData?.overview.averageRating}
                        icon={Star}
                        color="yellow"
                    />
                    <StatCard
                        title="Completion Rate"
                        value={`${analyticsData?.overview.completionRate}%`}
                        icon={PlayCircle}
                        color="purple"
                    />
                </div>

                {/* Revenue & Enrollment Chart */}
                <div className='bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm mb-8'>
                    <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-6'>Revenue & Enrollments</h3>
                    <div className='h-80'>
                        <canvas ref={revenueChartRef} />
                    </div>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                    {/* Rating Distribution */}
                    <div className='bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm'>
                        <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-6'>Rating Distribution</h3>
                        <div className='h-64'>
                            <canvas ref={ratingChartRef} />
                        </div>
                    </div>

                    {/* Enhanced Lecture Engagement */}
                    <div className='bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm'>
                        <div className='flex items-center justify-between mb-6'>
                            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>Lecture Engagement</h3>
                            <div className='flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1 gap-1'>
                                <button
                                    onClick={() => setEngagementView('cards')}
                                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                                        engagementView === 'cards'
                                            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                    }`}
                                    title="Cards View"
                                >
                                    Cards
                                </button>
                                <button
                                    onClick={() => setEngagementView('dropoff')}
                                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                                        engagementView === 'dropoff'
                                            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                    }`}
                                    title="Drop-off Chart"
                                >
                                    Drop-off
                                </button>
                                <button
                                    onClick={() => setEngagementView('watchtime')}
                                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                                        engagementView === 'watchtime'
                                            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                    }`}
                                    title="Watch Time Chart"
                                >
                                    Watch Time
                                </button>
                                <button
                                    onClick={() => setEngagementView('views')}
                                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                                        engagementView === 'views'
                                            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                    }`}
                                    title="Views Chart"
                                >
                                    Views
                                </button>
                            </div>
                        </div>

                        {engagementView === 'cards' ? (
                            <div className='space-y-4 max-h-64 overflow-y-auto'>
                                {(analyticsData?.lectureEngagement || []).map((lecture, index) => (
                                    <div key={index} className='bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors'>
                                        {/* Header */}
                                        <div className='flex items-start justify-between mb-3'>
                                            <h4 className='text-sm font-semibold text-gray-900 dark:text-white line-clamp-1 flex-1 mr-2'>
                                                {lecture.title}
                                            </h4>
                                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getCompletionColor(100 - lecture.dropOff)}`}>
                                                {Math.round(100 - lecture.dropOff)}%
                                            </div>
                                        </div>

                                        {/* Metrics Grid */}
                                        <div className='grid grid-cols-3 gap-3 mb-3'>
                                            <div className='text-center'>
                                                <div className='flex items-center justify-center mb-1'>
                                                    <TrendingDown className='h-3 w-3 text-red-500 mr-1' />
                                                    <span className='text-xs text-red-600 dark:text-red-400 font-medium'>Drop %</span>
                                                </div>
                                                <p className='text-sm font-bold text-red-700 dark:text-red-300'>
                                                    {Math.round(lecture.dropOff || 0)}%
                                                </p>
                                            </div>
                                            
                                            <div className='text-center'>
                                                <div className='flex items-center justify-center mb-1'>
                                                    <Clock className='h-3 w-3 text-blue-500 mr-1' />
                                                    <span className='text-xs text-blue-600 dark:text-blue-400 font-medium'>Avg Time</span>
                                                </div>
                                                <p className='text-sm font-bold text-blue-700 dark:text-blue-300'>
                                                    {formatTime(lecture.avgTime || 0)}
                                                </p>
                                            </div>

                                            <div className='text-center'>
                                                <div className='flex items-center justify-center mb-1'>
                                                    <Eye className='h-3 w-3 text-green-500 mr-1' />
                                                    <span className='text-xs text-green-600 dark:text-green-400 font-medium'>Views</span>
                                                </div>
                                                <p className='text-sm font-bold text-green-700 dark:text-green-300'>
                                                    {lecture.views || 0}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className='w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2'>
                                            <div 
                                                className={`h-2 rounded-full transition-all duration-500 ${getCompletionBarColor(100 - lecture.dropOff)}`}
                                                style={{ width: `${Math.max(0, 100 - lecture.dropOff)}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : engagementView === 'dropoff' ? (
                            <div className='h-64'>
                                <canvas ref={dropoffChartRef} />
                            </div>
                        ) : engagementView === 'watchtime' ? (
                            <div className='h-64'>
                                <canvas ref={watchtimeChartRef} />
                            </div>
                        ) : engagementView === 'views' ? (
                            <div className='h-64'>
                                <canvas ref={viewsChartRef} />
                            </div>
                        ) : null}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className='bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm mt-8'>
                    <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-6'>Recent Activity</h3>
                    <div className='space-y-4'>
                        {analyticsData?.recentActivity?.map((activity, index) => (
                            <div key={index} className='flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg'>
                                <div className={`p-2 rounded-full ${getActivityBgColor(activity)}`}>
                                    {getActivityIcon(activity)}
                                </div>
                                <div className='flex-1'>
                                    <p className='text-sm font-medium text-gray-900 dark:text-white'>
                                        {activity.student} {' '}
                                        {activity.type === 'enrollment' && 'enrolled in the course'}
                                        {activity.type === 'completion' && 'completed the course'}
                                        {activity.type === 'review' && `left a ${activity.rating}-star review`}
                                    </p>
                                    <p className='text-xs text-gray-500'>{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseAnalytics;