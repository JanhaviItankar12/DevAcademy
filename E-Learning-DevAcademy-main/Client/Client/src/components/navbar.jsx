import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import DarkMode from '@/DarkMode';
import { useLoggedOutUserMutation } from '@/features/api/authApi';
import { Link as ScrollLink } from "react-scroll";
import { CodeSquareIcon, Menu, X, User } from 'lucide-react';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const { user } = useSelector(store => store.auth);
    const [loggedOutUser, { data, isSuccess }] = useLoggedOutUserMutation();

    const location = useLocation();
    const isHome = location.pathname === "/";

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Handle logout success
    useEffect(() => {
        if (isSuccess) {
            toast.success(data.message || "Logged out successfully");
            navigate("/login");
        }
    }, [isSuccess, data, navigate]);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location]);

    const logoutHandler = async () => {
        await loggedOutUser();
    };

    return (
        <>
            <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white dark:bg-[#0A0A0A] shadow-lg' : 'bg-white dark:bg-[#0A0A0A]'} border-b dark:border-gray-800 border-gray-200`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex justify-between items-center">
                        {/* Logo */}
                        <div className="flex items-center space-x-2">
                            <CodeSquareIcon className='w-6 h-6 sm:w-7 sm:h-7 text-purple-600' />
                            <Link to="/" className="flex items-center">
                                <span className="text-lg sm:text-xl font-bold text-purple-600 dark:text-purple-400">
                                    DevAcademy
                                </span>
                            </Link>
                        </div>

                        {/* Navigation Links - Desktop */}
                        {!user && isHome && (
                            <div className="hidden md:flex space-x-8">
                                <ScrollLink
                                    to="courses"
                                    smooth={true}
                                    duration={500}
                                    offset={-80}
                                    className="text-gray-700 dark:text-gray-300 hover:text-purple-600 cursor-pointer"
                                >
                                    Courses
                                </ScrollLink>
                                <ScrollLink
                                    to="features"
                                    smooth={true}
                                    duration={500}
                                    offset={-80}
                                    className="text-gray-700 dark:text-gray-300 hover:text-purple-600 cursor-pointer"
                                >
                                    Feautures
                                </ScrollLink>
                                <ScrollLink
                                    to="reviews"
                                    smooth={true}
                                    duration={500}
                                    offset={-80}
                                    className="text-gray-700 dark:text-gray-300 hover:text-purple-600 cursor-pointer"
                                >
                                    Reviews
                                </ScrollLink>

                                <ScrollLink
                                    to="become-instructor"
                                    smooth={true}
                                    duration={500}
                                    offset={-80}
                                    className="text-gray-700 dark:text-gray-300 hover:text-purple-600 cursor-pointer"
                                >
                                    Become an Instructor
                                </ScrollLink>
                            </div>
                        )}

                        {/* Auth Buttons / User Menu */}
                        <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">

                            {/* Mobile Menu Toggle (only for non-authenticated users on home page) */}
                            {!user && isHome && (
                                <button
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                    className="md:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer"
                                >
                                    {mobileMenuOpen ? (
                                        <X className="w-5 h-5" />
                                    ) : (
                                        <Menu className="w-5 h-5" />
                                    )}
                                </button>
                            )}

                            {user ? (
                                <>
                                    {/* Logged in user dropdown (unchanged) */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Avatar className="cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all">
                                                <AvatarImage src={user?.photoUrl || "https://github.com/shadcn.png"} />
                                                <AvatarFallback>
                                                    {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                                                </AvatarFallback>
                                            </Avatar>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-50 dark:bg-[#0A0A0A]" align="end">
                                            <DropdownMenuLabel className="dark:text-white">
                                                {user?.name || user?.email}
                                                <p className="text-xs font-normal text-gray-500 dark:text-gray-400">
                                                    {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                                                </p>
                                            </DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuGroup>
                                                {/* Student Role Menu Items */}
                                                {user?.role === "student" && (
                                                    <>
                                                        <DropdownMenuItem className="cursor-pointer">
                                                            <Link to="/student/dashboard" className="w-full">Dashboard</Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="cursor-pointer">
                                                            <Link to="/profile" className="w-full">Edit Profile</Link>
                                                        </DropdownMenuItem>
                                                    </>
                                                )}

                                                {/* Instructor Role Menu Items */}
                                                {user?.role === "instructor" && (
                                                    <>
                                                        <DropdownMenuItem className="cursor-pointer">
                                                            <Link to="/instructor/dashboard" className="w-full">Dashboard</Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="cursor-pointer">
                                                            <Link to="/profile" className="w-full">Edit Profile</Link>
                                                        </DropdownMenuItem>
                                                    </>
                                                )}

                                                {/* Admin Role Menu Items */}
                                                {user?.role === "admin" && (
                                                    <>
                                                        <DropdownMenuItem className="cursor-pointer">
                                                            <Link to="/admin/dashboard" className="w-full">Dashboard</Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="cursor-pointer">
                                                            <Link to="/admin/manageUser" className="w-full">Manage Users</Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="cursor-pointer">
                                                            <Link to="/admin/manageCourses" className="w-full">Manage Courses</Link>
                                                        </DropdownMenuItem>
                                                    </>
                                                )}

                                                {/* Back to Home */}
                                                <DropdownMenuItem className="cursor-pointer">
                                                    <Link to="/" className="w-full">Back to Home</Link>
                                                </DropdownMenuItem>

                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300"
                                                    onClick={logoutHandler}
                                                >
                                                    Log out
                                                </DropdownMenuItem>
                                            </DropdownMenuGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </>
                            ) : (
                                // Not logged in - Sign In / Sign Up buttons
                                <div className="flex space-x-2 sm:space-x-3">
                                    {/* Mobile: Icon-only Sign In button */}


                                    {/* Desktop: Full Sign In button */}
                                    <Button
                                        variant="outline"
                                        onClick={() => navigate("/login")}
                                        className="hidden md:flex px-5 cursor-pointer py-2 border-purple-600 text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:border-purple-400 dark:hover:bg-purple-900/20"
                                    >
                                        Sign In
                                    </Button>

                                    {/* Get Started Button - Responsive text */}
                                    <Button
                                        onClick={() => navigate("/login", { state: { tab: "signup" } })}
                                        className="px-4 sm:px-6 cursor-pointer py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-all text-sm sm:text-base"
                                    >
                                        <span className="hidden sm:inline">Get Started</span>
                                        <span className="sm:hidden">Join</span>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Menu (only for non-authenticated users on home page) */}
                {!user && isHome && mobileMenuOpen && (
                    <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0A0A0A] animate-slideDown">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                            <div className="flex flex-col space-y-3">
                                <ScrollLink
                                    to="courses"
                                    smooth={true}
                                    duration={500}
                                    offset={-80}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-base text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer transition-colors py-2"
                                >
                                    Courses
                                </ScrollLink>
                                <ScrollLink
                                    to="features"
                                    smooth={true}
                                    duration={500}
                                    offset={-80}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-base text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer transition-colors py-2"
                                >
                                    Features
                                </ScrollLink>
                                <ScrollLink
                                    to="reviews"
                                    smooth={true}
                                    duration={500}
                                    offset={-80}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-base text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer transition-colors py-2"
                                >
                                    Reviews
                                </ScrollLink>
                                <ScrollLink
                                    to="become-instructor"
                                    smooth={true}
                                    duration={500}
                                    offset={-80}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-base text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer transition-colors py-2"
                                >
                                    Become an Instructor
                                </ScrollLink>
                            </div>

                            {/* Mobile Auth Buttons inside Menu */}
                            <div className="mt-4 flex flex-col space-y-3">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        navigate("/login");
                                        setMobileMenuOpen(false);
                                    }}
                                    className="w-full cursor-pointer border-purple-600 text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:border-purple-400 dark:hover:bg-purple-900/20 py-2"
                                >
                                    Sign In
                                </Button>
                                <Button
                                    onClick={() => {
                                        navigate("/login", { state: { tab: "signup" } });
                                        setMobileMenuOpen(false);
                                    }}
                                    className="w-full cursor-pointer bg-purple-600 hover:bg-purple-700 text-white py-2"
                                >
                                    Get Started Free
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* Mobile Menu Backdrop */}
            {!user && isHome && mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}
        </>
    );
};

export default Navbar;


