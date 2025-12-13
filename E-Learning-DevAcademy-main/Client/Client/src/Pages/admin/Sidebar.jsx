import { BookCheckIcon, ChartAreaIcon, ChartNoAxesColumn, SquareLibrary, Menu, X, Award, Users, TrendingUp, User, MessageCircle } from 'lucide-react'
import React, { useState } from 'react'
import { useSelector } from 'react-redux';
import { Link, Outlet, useLocation } from 'react-router-dom'

const Sidebar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const user = useSelector((state) => state.auth.user);
    const role = user?.role || "student";

    const isActive = (path) => {
        return location.pathname.includes(path);
    };

    const menuItems = {
        admin: [
            { path: 'dashboard', icon: ChartNoAxesColumn, label: 'Dashboard' },
            { path: 'topcourses', icon: Award, label: 'Top Courses' },
            { path: 'topinstructor', icon: Users, label: 'Top Instructors' },
            { path: 'messages', icon: MessageCircle, label: 'Message' },
        ],
        instructor: [
            { path: 'dashboard', icon: ChartNoAxesColumn, label: 'Dashboard' },
            { path: 'course', icon: SquareLibrary, label: 'Courses' },
            { path: 'analytics', icon: TrendingUp, label: 'Analytics' }
        ],
        student: [
            { path: 'dashboard', icon: ChartNoAxesColumn, label: 'Dashboard' },
            { path: 'analytics', icon: ChartAreaIcon, label: 'Analytics' },
            { path: 'completed-courses', icon: BookCheckIcon, label: 'Completed Courses' },
            { path: 'instructors', icon: User, label: 'Instructors' }
        ]
    };

    const currentMenuItems = menuItems[role] || menuItems.student;

    const SidebarContent = () => (
        <div className='space-y-1'>
            {currentMenuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                    <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                            active
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                        }`}
                    >
                        <Icon size={20} />
                        <span className='font-medium text-lg'>{item.label}</span>
                    </Link>
                );
            })}
        </div>
    );

    return (
        <div className='flex min-h-screen'>
            {/* Mobile Menu Toggle */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className='lg:hidden fixed top-20 left-4 z-50 p-2 rounded-lg bg-purple-600 text-white shadow-md'
            >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className='lg:hidden fixed inset-0 bg-black/30 z-40'
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={`
                    fixed lg:sticky top-10 left-0 h-screen z-40
                    w-[260px]
                    bg-white dark:bg-gray-800
                    border-r border-gray-200 dark:border-gray-700
                    transition-transform duration-300
                    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                <div className='p-5 mt-20'>
                    <SidebarContent />
                </div>
            </div>

            {/* Main Content */}
            <div className='flex-1 mt-15 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:to-gray-800 p-6'>
                <Outlet />
            </div>
        </div>
    );
};

export default Sidebar;