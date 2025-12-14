import React, { useState, useEffect } from 'react';
import { BookOpen, Mail, Lock, User, Shield, Eye, EyeOff, Loader2, AlertCircle, X } from 'lucide-react';
import { useLoginUserMutation, useRegisterUserMutation, useForgotPasswordMutation } from '@/features/api/authApi';
import { toast } from 'sonner';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { userLoggedIn } from '@/features/authSlice';

export function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loginInput, setLoginInput] = useState({ email: "", password: "", role: "student" });
  const [signupInput, setSignupInput] = useState({ name: "", email: "", password: "", role: "student" });
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [] });
  
  // State for tracking which flow is active
  const [activeFlow, setActiveFlow] = useState("login"); // login, signup, forgotPassword

  // API mutations
  const [registerUser, { isLoading: registeredLoading }] = useRegisterUserMutation();
  const [loginUser, { isLoading: loginIsLoading }] = useLoginUserMutation();
  const [forgotPassword, { isLoading: forgotPasswordLoading }] = useForgotPasswordMutation();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [tab, setTab] = useState("login");
  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    if (location.state?.tab === "signup") {
      setTab("signup");
      setActiveFlow("signup");
    }
  }, [location.state]);

  // Email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password strength checker
  const checkPasswordStrength = (password) => {
    let score = 0;
    const feedback = [];

    if (password.length >= 8) {
      score++;
    } else {
      feedback.push("At least 8 characters");
    }

    if (/[A-Z]/.test(password)) {
      score++;
    } else {
      feedback.push("One uppercase letter");
    }

    if (/[a-z]/.test(password)) {
      score++;
    } else {
      feedback.push("One lowercase letter");
    }

    if (/[0-9]/.test(password)) {
      score++;
    } else {
      feedback.push("One number");
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score++;
    } else {
      feedback.push("One special character");
    }

    return { score, feedback };
  };

  const changeInputHandler = (e, type) => {
    const { name, value } = e.target;
    
    // Clear error for this field
    setErrors(prev => ({ ...prev, [name]: '' }));

    if (type === "signup") {
      setSignupInput({ ...signupInput, [name]: value });
      
      // Real-time password strength check
      if (name === 'password') {
        const strength = checkPasswordStrength(value);
        setPasswordStrength(strength);
      }
    } else {
      setLoginInput({ ...loginInput, [name]: value });
    }
  };

  const validateForm = (type) => {
    const newErrors = {};
    
    if (type === "forgotPassword") {
      if (!forgotPasswordEmail || forgotPasswordEmail.trim() === '') {
        newErrors.email = 'Email is required';
      } else if (!validateEmail(forgotPasswordEmail)) {
        newErrors.email = 'Please enter a valid email address';
      }
      return newErrors;
    }

    const data = type === "signup" ? signupInput : loginInput;

    // Name validation (signup only)
    if (type === "signup") {
      if (!data.name || data.name.trim() === '') {
        newErrors.name = 'Name is required';
      } else if (data.name.trim().length < 2) {
        newErrors.name = 'Name must be at least 2 characters';
      }
    }

    // Email validation
    if (!data.email || data.email.trim() === '') {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(data.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!data.password || data.password === '') {
      newErrors.password = 'Password is required';
    } else if (type === "signup") {
      // Strong password validation for signup
      if (data.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      } else if (!/[A-Z]/.test(data.password)) {
        newErrors.password = 'Password must contain at least one uppercase letter';
      } else if (!/[a-z]/.test(data.password)) {
        newErrors.password = 'Password must contain at least one lowercase letter';
      } else if (!/[0-9]/.test(data.password)) {
        newErrors.password = 'Password must contain at least one number';
      } else if (!/[^A-Za-z0-9]/.test(data.password)) {
        newErrors.password = 'Password must contain at least one special character';
      }
    } else {
      // Basic validation for login
      if (data.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    }

    // Role validation
    if (!data.role) {
      newErrors.role = 'Please select a role';
    }

    return newErrors;
  };

  const handleRegistration = async (type) => {
    // Validate form
    const validationErrors = validateForm(type);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix all errors before submitting');
      return;
    }

    const inputData = type === "signup" ? signupInput : loginInput;
    const action = type === "signup" ? registerUser : loginUser;

    try {
      const result = await action(inputData).unwrap();
      
      if (result) {
        if (type === "signup") {
          setTab("login");
          setActiveFlow("login");
          setSignupInput({ name: "", email: "", password: "", role: "student" });
          setPasswordStrength({ score: 0, feedback: [] });
          toast.success(result.message || "Signup Successful! Please login.");
        } else {
          dispatch(userLoggedIn({
            user: result.user,
            token: result.token
          }));
          
          localStorage.setItem("token", result.token);
          localStorage.setItem("user", JSON.stringify(result.user));
          navigate(from, { replace: true });
          toast.success(result.message || "Login Successful!");
        }
      }
    } catch (error) {
      toast.error(error?.data?.message || `${type === "signup" ? "Signup" : "Login"} Failed`);
      console.log("Error from backend:", error);
    }
  };

  const handleForgotPassword = async () => {
    const validationErrors = validateForm("forgotPassword");
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix errors before submitting');
      return;
    }

    try {
      const result = await forgotPassword({ email: forgotPasswordEmail }).unwrap();
      toast.success(result.message || "Password reset link sent to your email!");
      setForgotPasswordEmail("");
      setActiveFlow("login");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to send reset email");
    }
  };

  // Google Sign-In Handler
  const handleGoogleSignIn = async (type = "login") => {
    try {
      const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const redirectUrl = `${backendUrl}/api/auth/google?flow=${type}`;
      window.location.href = redirectUrl;
    } catch (error) {
      toast.error("Google sign-in failed");
      console.error("Google sign-in error:", error);
    }
  };

  const getPasswordStrengthColor = (score) => {
    if (score <= 2) return 'bg-red-500';
    if (score === 3) return 'bg-yellow-500';
    if (score === 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (score) => {
    if (score <= 2) return 'Weak';
    if (score === 3) return 'Fair';
    if (score === 4) return 'Good';
    return 'Strong';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          
          {/* Back button for forgot password flow */}
          {activeFlow === "forgotPassword" && (
            <button
              onClick={() => setActiveFlow("login")}
              className="flex items-center gap-2 text-gray-600 hover:text-purple-600 mb-6 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back to Login
            </button>
          )}

          {/* Forgot Password Flow */}
          {activeFlow === "forgotPassword" && (
            <div className="space-y-5">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h2>
                <p className="text-gray-600 text-sm">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={forgotPasswordEmail}
                    onChange={(e) => {
                      setForgotPasswordEmail(e.target.value);
                      setErrors(prev => ({ ...prev, email: '' }));
                    }}
                    placeholder="Enter your email"
                    className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                      errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-purple-600'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <X className="w-4 h-4" /> {errors.email}
                  </p>
                )}
              </div>

              <button
                onClick={handleForgotPassword}
                disabled={forgotPasswordLoading}
                className="w-full py-4 bg-gradient-to-r cursor-pointer from-purple-600 to-blue-600 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {forgotPasswordLoading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending...
                  </span>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </div>
          )}

          {/* Login/Signup Flow */}
          {(activeFlow === "login" || activeFlow === "signup") && (
            <>
              {/* Tab Switcher */}
              <div className="flex gap-2 mb-8 bg-gray-100 p-1 rounded-full">
                <button
                  onClick={() => {
                    setTab('login');
                    setActiveFlow('login');
                    setErrors({});
                  }}
                  className={`flex-1 py-3 px-6 rounded-full cursor-pointer font-semibold transition-all ${
                    tab === 'login'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-purple-600'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setTab('signup');
                    setActiveFlow('signup');
                    setErrors({});
                    setPasswordStrength({ score: 0, feedback: [] });
                  }}
                  className={`flex-1 py-3 px-6 cursor-pointer rounded-full font-semibold transition-all ${
                    tab === 'signup'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-purple-600'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Google Sign-In Button */}
              <div className="mb-6">
                <button
                  onClick={() => handleGoogleSignIn(tab)}
                  className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <img 
                    src="https://www.google.com/favicon.ico" 
                    alt="Google" 
                    className="w-5 h-5"
                  />
                  <span className="font-semibold text-gray-700">
                    Continue with Google
                  </span>
                </button>
                
                <div className="flex items-center my-6">
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <span className="px-4 text-gray-500 text-sm">Or continue with</span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>
              </div>

              {/* Login Form */}
              {tab === 'login' && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome Back!</h2>
                    <p className="text-gray-600 text-sm">Login to continue your learning journey</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        name="email"
                        value={loginInput.email}
                        onChange={(e) => changeInputHandler(e, 'login')}
                        placeholder="Enter your email"
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                          errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-purple-600'
                        }`}
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                        <X className="w-4 h-4" /> {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={loginInput.password}
                        onChange={(e) => changeInputHandler(e, 'login')}
                        placeholder="Enter your password"
                        className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                          errors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-purple-600'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                        <X className="w-4 h-4" /> {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Forgot Password Link */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => setActiveFlow("forgotPassword")}
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Login As <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <select
                        name="role"
                        value={loginInput.role}
                        onChange={(e) => changeInputHandler(e, 'login')}
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-colors appearance-none cursor-pointer ${
                          errors.role ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-purple-600'
                        }`}
                      >
                        <option value="student">Student</option>
                        <option value="instructor">Instructor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRegistration('login')}
                    disabled={loginIsLoading}
                    className="w-full py-4 bg-gradient-to-r cursor-pointer from-purple-600 to-blue-600 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loginIsLoading ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Please wait...
                      </span>
                    ) : (
                      'Login to Account'
                    )}
                  </button>

                  <p className="text-center text-gray-600 text-sm">
                    Don't have an account?{' '}
                    <button
                      onClick={() => {
                        setTab('signup');
                        setActiveFlow('signup');
                        setErrors({});
                      }}
                      className="text-purple-600 cursor-pointer font-semibold hover:text-purple-700"
                    >
                      Sign up now
                    </button>
                  </p>
                </div>
              )}

              {/* Signup Form */}
              {tab === 'signup' && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Create Account</h2>
                    <p className="text-gray-600 text-sm">Start your learning journey today</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="name"
                        value={signupInput.name}
                        onChange={(e) => changeInputHandler(e, 'signup')}
                        placeholder="Enter your name"
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                          errors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-purple-600'
                        }`}
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                        <X className="w-4 h-4" /> {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        name="email"
                        value={signupInput.email}
                        onChange={(e) => changeInputHandler(e, 'signup')}
                        placeholder="Enter your email"
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                          errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-purple-600'
                        }`}
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                        <X className="w-4 h-4" /> {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={signupInput.password}
                        onChange={(e) => changeInputHandler(e, 'signup')}
                        placeholder="Create a strong password"
                        className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                          errors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-purple-600'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    
                    {/* Password Strength Indicator */}
                    {signupInput.password && (
                      <div className="mt-2">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength.score)}`}
                              style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                            ></div>
                          </div>
                          <span className={`text-xs font-semibold ${
                            passwordStrength.score <= 2 ? 'text-red-500' :
                            passwordStrength.score === 3 ? 'text-yellow-500' :
                            passwordStrength.score === 4 ? 'text-blue-500' : 'text-green-500'
                          }`}>
                            {getPasswordStrengthText(passwordStrength.score)}
                          </span>
                        </div>
                        {passwordStrength.feedback.length > 0 && (
                          <div className="text-xs text-gray-600 space-y-1">
                            <p className="font-semibold">Password must include:</p>
                            {passwordStrength.feedback.map((item, idx) => (
                              <p key={idx} className="flex items-center gap-1">
                                <X className="w-3 h-3 text-red-500" /> {item}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                        <X className="w-4 h-4" /> {errors.password}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Sign Up As <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <select
                        name="role"
                        value={signupInput.role}
                        onChange={(e) => changeInputHandler(e, 'signup')}
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-colors appearance-none cursor-pointer ${
                          errors.role ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-purple-600'
                        }`}
                      >
                        <option value="student">Student</option>
                        <option value="instructor">Instructor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>

                  {/* Instructor Guidelines - Shows when instructor is selected */}
                  {signupInput.role === 'instructor' && (
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-purple-200 rounded-2xl p-6 space-y-4">
                      <div className="flex items-center gap-2 text-purple-700 mb-3">
                        <AlertCircle className="w-6 h-6" />
                        <h3 className="font-bold text-lg">Instructor Approval Process</h3>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex gap-3">
                          <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">
                            1
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">Sign Up</p>
                            <p className="text-gray-600 text-xs">Create your instructor account</p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">
                            2
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">Admin Review</p>
                            <p className="text-gray-600 text-xs">Wait 3-5 business days for approval</p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">
                            3
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">Start Teaching</p>
                            <p className="text-gray-600 text-xs">Login and create your courses</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-green-100 border border-green-300 rounded-xl p-3 mt-4">
                        <p className="text-green-800 text-xs font-semibold">
                          ✓ Earn 70% revenue share • Reach 1000+ students • Build your portfolio
                        </p>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => handleRegistration('signup')}
                    disabled={registeredLoading}
                    className="w-full py-4 cursor-pointer bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {registeredLoading ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Please wait...
                      </span>
                    ) : (
                      'Create Account'
                    )}
                  </button>

                  <p className="text-center text-gray-600 text-sm">
                    Already have an account?{' '}
                    <button
                      onClick={() => {
                        setTab('login');
                        setActiveFlow('login');
                        setErrors({});
                        setPasswordStrength({ score: 0, feedback: [] });
                      }}
                      className="text-purple-600 font-semibold cursor-pointer hover:text-purple-700"
                    >
                      Login here
                    </button>
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}