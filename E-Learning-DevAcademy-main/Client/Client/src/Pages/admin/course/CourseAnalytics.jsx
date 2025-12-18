import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, TrendingUp, Users, PlayCircle, Star, Eye, IndianRupee, Clock, TrendingDown } from 'lucide-react';
import { Chart, registerables } from 'chart.js';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetCourseAnalyticsQuery } from '@/features/api/courseApi';

// Register Chart.js components
Chart.register(...registerables);

const CourseAnalytics = () => {
    const currentYear = new Date().getFullYear();
    const [selectedPeriod, setSelectedPeriod] = useState(currentYear);
    const [engagementView, setEngagementView] = useState('cards');
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    // Store chart instances in refs
    const revenueChartInstance = useRef(null);
    const ratingChartInstance = useRef(null);
    const dropoffChartInstance = useRef(null);
    const watchtimeChartInstance = useRef(null);
    const viewsChartInstance = useRef(null);

    const params = useParams();
    const courseId = params.courseId;
    const navigate = useNavigate();

    const { data: analyticsData, isAnalyticsLoading } = useGetCourseAnalyticsQuery({
        courseId,
        selectedyear: selectedPeriod
    });

    // Handle window resize for responsiveness
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);

        // Call resize handler once to set initial width
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Re-render charts when window size changes
    useEffect(() => {
        if (analyticsData) {
            initAllCharts();
        }
    }, [windowWidth]);

    if (isAnalyticsLoading) {
        return <p className="text-center text-gray-500">Loading analytics...</p>;
    }

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

    // Destroy all charts
    const destroyAllCharts = () => {
        const charts = [
            revenueChartInstance,
            ratingChartInstance,
            dropoffChartInstance,
            watchtimeChartInstance,
            viewsChartInstance
        ];

        charts.forEach(chartRef => {
            if (chartRef.current) {
                chartRef.current.destroy();
                chartRef.current = null;
            }
        });
    };

    // Initialize all charts
    const initAllCharts = () => {
        destroyAllCharts();
        initRevenueChart();
        initRatingChart();
        initEngagementCharts();
    };

    // Initialize Revenue Chart
    const initRevenueChart = () => {
        if (!revenueChartRef.current || !analyticsData?.monthlyData) return;

        const ctx = revenueChartRef.current.getContext('2d');

        // Create gradient for revenue bars
        const revenueGradient = ctx.createLinearGradient(0, 0, 0, 400);
        revenueGradient.addColorStop(0, 'rgba(59, 130, 246, 0.9)');
        revenueGradient.addColorStop(1, 'rgba(59, 130, 246, 0.3)');

        // Create gradient for enrollment line
        const enrollmentGradient = ctx.createLinearGradient(0, 0, 0, 400);
        enrollmentGradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
        enrollmentGradient.addColorStop(1, 'rgba(16, 185, 129, 0.05)');

        const isMobile = windowWidth < 768;
        const fontSize = isMobile ? 10 : 12;
        const legendFontSize = isMobile ? 11 : 13;

        revenueChartInstance.current = new Chart(revenueChartRef.current, {
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
                        barPercentage: isMobile ? 0.5 : 0.7,
                        categoryPercentage: isMobile ? 0.6 : 0.8
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
                        pointRadius: isMobile ? 3 : 5,
                        pointHoverRadius: isMobile ? 5 : 7,
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
                                size: legendFontSize,
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
                            label: function (context) {
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
                                size: fontSize
                            },
                            callback: function (value) {
                                return '₹' + (value / 1000).toFixed(0) + 'K';
                            }
                        },
                        title: {
                            display: true,
                            text: 'Revenue (₹)',
                            font: {
                                size: legendFontSize,
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
                                size: fontSize
                            }
                        },
                        title: {
                            display: true,
                            text: 'Enrollments',
                            font: {
                                size: legendFontSize,
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
                                size: fontSize
                            },
                            maxRotation: isMobile ? 45 : 0,
                            minRotation: isMobile ? 45 : 0
                        }
                    }
                }
            }
        });
    };

    // Initialize Rating Chart
    const initRatingChart = () => {
        if (!ratingChartRef.current || !analyticsData?.reviw) return;

        const isMobile = windowWidth < 768;

        ratingChartInstance.current = new Chart(ratingChartRef.current, {
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
                        position: isMobile ? 'bottom' : 'right',
                        labels: {
                            font: {
                                size: isMobile ? 10 : 12
                            },
                            padding: isMobile ? 10 : 20
                        }
                    },
                    title: {
                        display: true,
                        text: 'Rating Distribution',
                        font: {
                            size: isMobile ? 12 : 14
                        }
                    }
                },
                cutout: isMobile ? '50%' : '60%'
            }
        });
    };

    // Initialize Engagement Charts
    const initEngagementCharts = () => {
        if (!analyticsData?.lectureEngagement) return;

        const isMobile = windowWidth < 768;
        const fontSize = isMobile ? 10 : 12;
        const legendFontSize = isMobile ? 11 : 13;

        // Drop-off Chart
        if (dropoffChartRef.current && engagementView === 'dropoff') {
            dropoffChartInstance.current = new Chart(dropoffChartRef.current, {
                type: 'line',
                data: {
                    labels: analyticsData.lectureEngagement.map(item =>
                        isMobile ? item.title.substring(0, 20) + '...' : item.title
                    ),
                    datasets: [{
                        label: 'Drop-off Rate (%)',
                        data: analyticsData.lectureEngagement.map(item => item.dropOff || 0),
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderColor: 'rgba(239, 68, 68, 1)',
                        pointBackgroundColor: 'rgba(239, 68, 68, 1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(239, 68, 68, 1)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: isMobile ? 3 : 4
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
                                text: 'Drop-off Rate (%)',
                                font: {
                                    size: legendFontSize
                                }
                            },
                            ticks: {
                                font: {
                                    size: fontSize
                                }
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Lectures',
                                font: {
                                    size: legendFontSize
                                }
                            },
                            ticks: {
                                font: {
                                    size: fontSize
                                },
                                maxRotation: isMobile ? 45 : 0,
                                minRotation: isMobile ? 45 : 0
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                font: {
                                    size: legendFontSize
                                }
                            }
                        },
                        title: {
                            display: true,
                            text: 'Lecture Drop-off Rates',
                            font: {
                                size: legendFontSize
                            }
                        }
                    }
                }
            });
        }

        // Watch Time Chart
        if (watchtimeChartRef.current && engagementView === 'watchtime') {
            watchtimeChartInstance.current = new Chart(watchtimeChartRef.current, {
                type: 'bar',
                data: {
                    labels: analyticsData.lectureEngagement.map(item =>
                        isMobile ? item.title.substring(0, 20) + '...' : item.title
                    ),
                    datasets: [{
                        label: 'Avg Watch Time (min)',
                        data: analyticsData.lectureEngagement.map(item => (item.avgTime || 0) / 60),
                        backgroundColor: 'rgba(59, 130, 246, 0.7)',
                        borderColor: 'rgba(59, 130, 246, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Average Watch Time (minutes)',
                                font: {
                                    size: legendFontSize
                                }
                            },
                            ticks: {
                                font: {
                                    size: fontSize
                                }
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Lectures',
                                font: {
                                    size: legendFontSize
                                }
                            },
                            ticks: {
                                font: {
                                    size: fontSize
                                }
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                font: {
                                    size: legendFontSize
                                }
                            }
                        },
                        title: {
                            display: true,
                            text: 'Average Watch Time per Lecture',
                            font: {
                                size: legendFontSize
                            }
                        }
                    }
                }
            });
        }

        // Views Chart
        if (viewsChartRef.current && engagementView === 'views') {
            viewsChartInstance.current = new Chart(viewsChartRef.current, {
                type: 'bar',
                data: {
                    labels: analyticsData.lectureEngagement.map(item =>
                        isMobile ? item.title.substring(0, 20) + '...' : item.title
                    ),
                    datasets: [{
                        label: 'Views',
                        data: analyticsData.lectureEngagement.map(item => item.views || 0),
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
                                text: 'Number of Views',
                                font: {
                                    size: legendFontSize
                                }
                            },
                            ticks: {
                                font: {
                                    size: fontSize
                                }
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Lectures',
                                font: {
                                    size: legendFontSize
                                }
                            },
                            ticks: {
                                font: {
                                    size: fontSize
                                },
                                maxRotation: isMobile ? 45 : 0,
                                minRotation: isMobile ? 45 : 0
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                font: {
                                    size: legendFontSize
                                }
                            }
                        },
                        title: {
                            display: true,
                            text: 'Views per Lecture',
                            font: {
                                size: legendFontSize
                            }
                        }
                    }
                }
            });
        }
    };

    // Initialize main charts
    useEffect(() => {
        if (analyticsData) {
            initAllCharts();
        }
    }, [analyticsData, selectedPeriod]);

    // Update engagement charts when view changes
    useEffect(() => {
        if (analyticsData) {
            // Destroy existing engagement charts
            [dropoffChartInstance, watchtimeChartInstance, viewsChartInstance].forEach(chartRef => {
                if (chartRef.current) {
                    chartRef.current.destroy();
                    chartRef.current = null;
                }
            });
            initEngagementCharts();
        }
    }, [engagementView, analyticsData]);

    // Cleanup all charts on unmount
    useEffect(() => {
        return () => {
            destroyAllCharts();
        };
    }, []);

    // StatCard Component
    const StatCard = ({ title, value, icon: Icon, trend, color = 'blue' }) => {
        const colorClasses = {
            green: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30',
            blue: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
            yellow: 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30',
            purple: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30'
        };

        const textColorClasses = {
            green: 'text-green-600 dark:text-green-400',
            blue: 'text-blue-600 dark:text-blue-400',
            yellow: 'text-yellow-600 dark:text-yellow-400',
            purple: 'text-purple-600 dark:text-purple-400'
        };

        return (
            <div className='bg-white p-3 sm:p-4 md:p-6 rounded-xl  shadow-sm'>
                <div className='flex items-center justify-between'>
                    <div className='flex-1 min-w-0'>
                        <p className='text-lg sm:text-sm text-gray-600 dark:text-gray-400 mb-1 truncate'>{title}</p>
                        <p className={`text-lg sm:text-xl md:text-2xl font-bold ${textColorClasses[color]} truncate`}>{value}</p>
                        {trend && (
                            <div className='flex items-center mt-2 text-xs sm:text-sm'>
                                <TrendingUp className='h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-1' />
                                <span className='text-green-600 truncate'>+{trend}% this month</span>
                            </div>
                        )}
                    </div>
                    <div className={`p-2 sm:p-3 rounded-lg ml-2 flex-shrink-0 ${colorClasses[color]}`}>
                        <Icon className='h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6' />
                    </div>
                </div>
            </div>
        );
    };

    // Helper functions for activity
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
        <div className='min-h-screen bg-gray-50 dark:bg-gray-900 pt-10'>
            {/* Header */}
            <div className='bg-white dark:bg-gray-800  shadow-sm'>
                <div className='max-w-7xl mx-auto px-3 sm:px-4 md:px-8 py-4'>
                    <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                        <div className='flex items-center gap-3 sm:gap-4'>
                            <button
                                className='p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0'
                                onClick={() => navigate(-1)}
                            >
                                <ArrowLeft className='h-5 w-5' />
                            </button>
                            <div className='min-w-0'>
                                <h1 className='text-lg sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white truncate'>
                                    Course Analytics
                                </h1>
                                <p className='text-xs sm:text-sm md:text-base text-gray-500 truncate'>
                                    {course?.courseTitle}
                                </p>
                            </div>
                        </div>
                        <div className='flex items-center gap-2 sm:gap-3'>
                            <select
                                value={selectedPeriod}
                                onChange={(e) => setSelectedPeriod(parseInt(e.target.value))}
                                className="px-3 py-2 bg-white dark:bg-gray-700  rounded-lg text-xs sm:text-sm w-full sm:w-auto"
                            >
                                <option value={2023}>2023</option>
                                <option value={2024}>2024</option>
                                <option value={2025}>2025</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className='max-w-7xl mx-auto px-3 sm:px-4 md:px-8 py-4 sm:py-6 md:py-8'>
                {/* Key Metrics */}
                <div className='grid  grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8'>
                    <StatCard
                        title="Total Revenue"
                        value={`₹${analyticsData?.overview?.totalRevenue || 0}`}
                        icon={IndianRupee}
                        color="green"

                    />
                    <StatCard
                        title="Total Students"
                        value={`${analyticsData?.overview?.totalStudents || 0}`}
                        icon={Users}
                        color="blue"
                    />
                    <StatCard
                        title="Average Rating"
                        value={analyticsData?.overview?.averageRating || 0}
                        icon={Star}
                        color="yellow"
                    />
                    <StatCard
                        title="Completion Rate"
                        value={`${analyticsData?.overview?.completionRate || 0}%`}
                        icon={PlayCircle}
                        color="purple"
                    />
                </div>

                {/* Revenue & Enrollment Chart */}
                <div className='bg-white dark:bg-gray-800 p-3 sm:p-4 md:p-6 rounded-xl  shadow-sm mb-4 sm:mb-6 md:mb-8'>
                    <h3 className='text-lg sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 md:mb-6'>
                        Revenue & Enrollments
                    </h3>
                    <div className='h-48 sm:h-60 md:h-80'>
                        <canvas ref={revenueChartRef} key={`revenue-${windowWidth}`} />
                    </div>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8'>
                    {/* Rating Distribution */}
                    <div className='bg-white dark:bg-gray-800 p-3 sm:p-4 md:p-6 rounded-xl  shadow-sm'>
                        <h3 className='text-lg sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 md:mb-6'>
                            Rating Distribution
                        </h3>
                        <div className='h-40 sm:h-48 md:h-64'>
                            <canvas ref={ratingChartRef} key={`rating-${windowWidth}`} />
                        </div>
                    </div>

                    {/* Lecture Engagement */}
                    <div className='bg-white dark:bg-gray-800 p-3 sm:p-4 md:p-6 rounded-xl  shadow-sm'>
                        <div className='flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 md:mb-6 gap-2 sm:gap-3'>
                            <h3 className='text-lg sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white'>
                                Lecture Engagement
                            </h3>
                            <div className='flex flex-wrap items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1 gap-1'>
                                {['cards', 'dropoff', 'watchtime', 'views'].map((view) => (
                                    <button
                                        key={view}
                                        onClick={() => setEngagementView(view)}
                                        className={`px-2 py-1 text-xs rounded-md transition-colors capitalize ${engagementView === view
                                                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                            }`}
                                    >
                                        {view}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {engagementView === 'cards' ? (
                            <div className='space-y-2 sm:space-y-3 max-h-40 sm:max-h-48 md:max-h-64 overflow-y-auto pr-2'>
                                {(analyticsData?.lectureEngagement || []).map((lecture, index) => (
                                    <div key={index} className='bg-gray-50 dark:bg-gray-700 rounded-lg p-2 sm:p-3 md:p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors'>
                                        <div className='flex items-start justify-between mb-1 sm:mb-2'>
                                            <h4 className='text-xs sm:text-sm font-semibold text-gray-900 dark:text-white line-clamp-1 flex-1 mr-2'>
                                                {lecture.title}
                                            </h4>
                                            <div className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getCompletionColor(100 - lecture.dropOff)}`}>
                                                {Math.round(100 - lecture.dropOff)}%
                                            </div>
                                        </div>

                                        <div className='grid grid-cols-3 gap-1 sm:gap-2 md:gap-3 mb-1 sm:mb-2'>
                                            <div className='text-center'>
                                                <div className='flex items-center justify-center mb-1'>
                                                    <TrendingDown className='h-2 w-2 sm:h-3 sm:w-3 text-red-500 mr-1' />
                                                    <span className='text-xs text-red-600 dark:text-red-400 font-medium'>Drop %</span>
                                                </div>
                                                <p className='text-xs sm:text-sm font-bold text-red-700 dark:text-red-300'>
                                                    {Math.round(lecture.dropOff || 0)}%
                                                </p>
                                            </div>

                                            <div className='text-center'>
                                                <div className='flex items-center justify-center mb-1'>
                                                    <Clock className='h-2 w-2 sm:h-3 sm:w-3 text-blue-500 mr-1' />
                                                    <span className='text-xs text-blue-600 dark:text-blue-400 font-medium'>Avg Time</span>
                                                </div>
                                                <p className='text-xs sm:text-sm font-bold text-blue-700 dark:text-blue-300'>
                                                    {formatTime(lecture.avgTime || 0)}
                                                </p>
                                            </div>

                                            <div className='text-center'>
                                                <div className='flex items-center justify-center mb-1'>
                                                    <Eye className='h-2 w-2 sm:h-3 sm:w-3 text-green-500 mr-1' />
                                                    <span className='text-xs text-green-600 dark:text-green-400 font-medium'>Views</span>
                                                </div>
                                                <p className='text-xs sm:text-sm font-bold text-green-700 dark:text-green-300'>
                                                    {lecture.views || 0}
                                                </p>
                                            </div>
                                        </div>

                                        <div className='w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 sm:h-2'>
                                            <div
                                                className={`h-1.5 sm:h-2 rounded-full transition-all duration-500 ${getCompletionBarColor(100 - lecture.dropOff)}`}
                                                style={{ width: `${Math.max(0, 100 - lecture.dropOff)}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className='h-40 sm:h-48 md:h-64'>
                                {engagementView === 'dropoff' && <canvas ref={dropoffChartRef} key={`dropoff-${windowWidth}`} />}
                                {engagementView === 'watchtime' && <canvas ref={watchtimeChartRef} key={`watchtime-${windowWidth}`} />}
                                {engagementView === 'views' && <canvas ref={viewsChartRef} key={`views-${windowWidth}`} />}
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className='bg-white dark:bg-gray-800 p-3 sm:p-4 md:p-6 rounded-xl  shadow-sm mt-4 sm:mt-6 md:mt-8'>
                    <h3 className='text-lg sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 md:mb-6'>
                        Recent Activity
                    </h3>
                    <div className='space-y-2 sm:space-y-3 md:space-y-4'>
                        {analyticsData?.recentActivity?.map((activity, index) => (
                            <div key={index} className='flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg'>
                                <div className={`p-1 sm:p-2 rounded-full flex-shrink-0 ${getActivityBgColor(activity)}`}>
                                    {getActivityIcon(activity)}
                                </div>
                                <div className='flex-1 min-w-0'>
                                    <p className='text-sm sm:text-sm font-medium text-gray-900 dark:text-white truncate'>
                                        {activity.student} {' '}
                                        {activity.type === 'enrollment' && 'enrolled in the course'}
                                        {activity.type === 'completion' && 'completed the course'}
                                        {activity.type === 'review' && `left a ${activity.rating}-star review`}
                                    </p>
                                    <p className='text-sm text-gray-500 truncate'>{activity.time}</p>
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