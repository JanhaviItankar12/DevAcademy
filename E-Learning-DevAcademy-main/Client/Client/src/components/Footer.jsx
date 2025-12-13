import { CodeSquareIcon, } from 'lucide-react'
import React from 'react'
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';


const Footer = () => {
  const { user } = useSelector(store => store.auth);

  const isAdmin = user?.role === "admin";
  const isStudent = user?.role === "student";
  const isInstructor = user?.role === "instructor";

  const handleProtectedClick = (e) => {
    if (!user) {
      e.preventDefault(); // stop navigation
      alert("You need to create an account to access this feature.");
      navigate("/login");
    }
  };


  return (
    <footer className=" bg-gray-900 text-white py-12 px-6  ">
      <div className="max-w-7xl mx-auto">

        {/* ADMIN VIEW - Centered */}
        {isAdmin ? (
          <div className="flex justify-center">
            <div className="text-center max-w-md">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <CodeSquareIcon className="w-6 h-6" />
                <span className="text-xl font-bold">DevAcademy</span>
              </div>
              <p className="text-gray-400">
                Empowering learners worldwide with quality education and recognized certifications.
              </p>
            </div>
          </div>
        ) : (
          /* NON-ADMIN VIEWS - Always Centered with Flexbox */
          <div className="flex flex-wrap justify-center gap-12 md:gap-16 lg:gap-20">

            {/* BRAND - Always visible */}
            <div className="text-center w-64">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <CodeSquareIcon className="w-6 h-6" />
                <span className="text-xl font-bold">DevAcademy</span>
              </div>
              <p className="text-gray-400">
                Empowering learners worldwide with quality education and recognized certifications.
              </p>
            </div>

            {/* FOR STUDENTS - Show for no user or student role */}
            {(!user || isStudent) && (
              <div className="text-center w-64">
                <h4 className="font-bold mb-4">For Students</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <Link
                      to="/courses"
                      onClick={handleProtectedClick}
                      className="hover:text-white cursor-pointer transition-colors"
                    >
                      Browse Courses
                    </Link>
                  </li>

                  <li>
                    <Link
                      to="/student/dashboard"
                      onClick={handleProtectedClick}
                      className="hover:text-white cursor-pointer transition-colors"
                    >
                      Dashboard
                    </Link>
                  </li>

                  <li>
                    <Link
                      to="/student/completed-courses"
                      onClick={handleProtectedClick}
                      className="hover:text-white cursor-pointer transition-colors"
                    >
                      Completed Courses
                    </Link>
                  </li>

                  <li>
                    <Link
                      to="/student/analytics"
                      onClick={handleProtectedClick}
                      className="hover:text-white cursor-pointer transition-colors"
                    >
                      Analytics
                    </Link>
                  </li>
                </ul>

              </div>
            )}

            {/* FOR INSTRUCTORS - Show for no user or instructor role */}
            {(!user || isInstructor) && (
              <div className="text-center w-64">
                <h4 className="font-bold mb-4">For Instructors</h4>
                <ul className="space-y-2 text-gray-400">

                  {!user && (
                    <li>
                      <Link
                        to="/apply-to-teach"
                        onClick={handleProtectedClick}
                        className="hover:text-white cursor-pointer transition-colors"
                      >
                        Apply to Teach
                      </Link>
                    </li>
                  )}

                  <li>
                    <Link
                      to="/instructor/dashboard"
                      onClick={handleProtectedClick}
                      className="hover:text-white cursor-pointer transition-colors"
                    >
                      Instructor Dashboard
                    </Link>
                  </li>

                  <li>
                    <Link
                      to="/instructor/course"
                      onClick={handleProtectedClick}
                      className="hover:text-white cursor-pointer transition-colors"
                    >
                      Create Course
                    </Link>
                  </li>

                  <li>
                    <Link
                      to="/instructor/analytics"
                      onClick={handleProtectedClick}
                      className="hover:text-white cursor-pointer transition-colors"
                    >
                      Analytics
                    </Link>
                  </li>

                </ul>

              </div>
            )}

            {/* COMPANY - Show for students and instructors */}
            {(isStudent || isInstructor || !user) && (
              <div className="text-center w-64">
                <h4 className="font-bold mb-4">Company</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <Link to="/about-us" className="hover:text-white cursor-pointer transition-colors">
                      About Us
                    </Link>
                  </li>

                  <li>
                    <Link to="/contact" className="hover:text-white cursor-pointer transition-colors">
                      Contact
                    </Link>
                  </li>

                  <li>
                    <Link to="/privacy-policy" className="hover:text-white cursor-pointer transition-colors">
                      Privacy Policy
                    </Link>
                  </li>

                  <li>
                    <Link to="/terms-and-conditions" className="hover:text-white cursor-pointer transition-colors">
                      Terms of Service
                    </Link>
                  </li>
                </ul>

              </div>
            )}

          </div>
        )}

      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
        <p>&copy; 2025 DevAcademy. All rights reserved.</p>
      </div>
    </footer>
  );
};






export default Footer;