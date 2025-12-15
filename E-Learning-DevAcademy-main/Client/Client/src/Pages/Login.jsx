import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Shield, Eye, EyeOff, Loader2, AlertCircle, ArrowLeft, X } from 'lucide-react';
import { useLoginUserMutation, useRegisterUserMutation, useForgotPasswordMutation, useGoogleLoginMutation } from '@/features/api/authApi';
import { toast } from 'sonner';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { userLoggedIn } from '@/features/authSlice';
import { GoogleLogin } from '@react-oauth/google';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("student");
  const [loginInput, setLoginInput] = useState({ email: "", password: "", role: "student" });
  const [signupInput, setSignupInput] = useState({ name: "", email: "", password: "", role: "student" });
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [] });
  const [activeFlow, setActiveFlow] = useState("login");
  const [tab, setTab] = useState("login");
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleRole, setGoogleRole] = useState("student");

  // API mutations
  const [registerUser, { isLoading: registeredLoading }] = useRegisterUserMutation();
  const [loginUser, { isLoading: loginIsLoading }] = useLoginUserMutation();
  const [forgotPassword, { isLoading: forgotPasswordLoading }] = useForgotPasswordMutation();
  const [googleLogin] = useGoogleLoginMutation();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
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
    setErrors(prev => ({ ...prev, [name]: '' }));

    if (type === "signup") {
      setSignupInput({ ...signupInput, [name]: value });
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

  // Google handle function
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const result = await googleLogin({
        credential: credentialResponse.credential,
        role: googleRole, // Use the role selected in modal
      }).unwrap();

      if (result.user.role === "instructor" && !result.user.isApproved) {
        toast.info("Your instructor account is pending admin approval");
        setShowGoogleModal(false);
        return;
      }

      dispatch(userLoggedIn({
        user: result.user,
        token: result.token,
      }));

      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));

      navigate(from, { replace: true });
      toast.success(result.message || "Login successful");
      setShowGoogleModal(false);

    } catch (error) {
      toast.error(error?.data?.message || "Google login failed");
      setShowGoogleModal(false);
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

  // Custom Google button click handler
  const handleCustomGoogleClick = () => {
    setShowGoogleModal(true);
    setGoogleRole("student"); // Reset to default
  };

  return (
    <div className="min-h-screen bg-gradient-to-br mt-9 from-purple-50 via-white to-blue-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          
          {/* Forgot Password Flow */}
          {activeFlow === "forgotPassword" && (
            <div className="space-y-4">
              <button
                onClick={() => setActiveFlow("login")}
                className="flex items-center cursor-pointer gap-2 text-gray-600 hover:text-purple-600 mb-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Login</span>
              </button>

              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-6 h-6 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Reset Password</h2>
                <p className="text-gray-600 text-sm mt-1">We'll send you a reset link</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="email"
                    value={forgotPasswordEmail}
                    onChange={(e) => {
                      setForgotPasswordEmail(e.target.value);
                      setErrors(prev => ({ ...prev, email: '' }));
                    }}
                    placeholder="your@email.com"
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                      errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-purple-200'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              <button
                onClick={handleForgotPassword}
                disabled={forgotPasswordLoading}
                className="w-full py-2.5 cursor-pointer bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {forgotPasswordLoading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </span>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </div>
          )}

          {/* Google Login Modal */}
          {showGoogleModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-6 max-w-sm w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Continue with Google</h3>
                  <button
                    onClick={() => setShowGoogleModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <p className="text-gray-600 text-lg mb-6">
                  Please select your role first, then sign in with Google:
                </p>
                
                {/* Role Selection */}
                <div className="space-y-4 mb-6">
                  <div 
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${googleRole === "student" ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:bg-gray-50'}`}
                    onClick={() => setGoogleRole("student")}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${googleRole === "student" ? 'border-purple-500' : 'border-gray-300'}`}>
                        {googleRole === "student" && <div className="w-2.5 h-2.5 bg-purple-500 rounded-full"></div>}
                      </div>
                      <div>
                        <span className="font-medium block">Student</span>
                        <p className="text-xs text-gray-500 mt-1">Access courses and learn</p>
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${googleRole === "instructor" ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:bg-gray-50'}`}
                    onClick={() => setGoogleRole("instructor")}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${googleRole === "instructor" ? 'border-purple-500' : 'border-gray-300'}`}>
                        {googleRole === "instructor" && <div className="w-2.5 h-2.5 bg-purple-500 rounded-full"></div>}
                      </div>
                      <div>
                        <span className="font-medium block">Instructor</span>
                        <p className="text-xs text-gray-500 mt-1">Create and manage courses</p>
                        {googleRole === "instructor" && (
                          <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                            <AlertCircle className="inline w-3 h-3 mr-1" />
                            Requires admin approval (3-5 business days)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Google Login Button INSIDE Modal */}
                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => {
                      toast.error("Google sign-in failed");
                      setShowGoogleModal(false);
                    }}
                    shape="rectangular"
                    text="signin_with"
                    size="large"
                  />
                </div>
                
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setShowGoogleModal(false)}
                    className="text-sm cursor-pointer text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Login/Signup Flow */}
          {(activeFlow === "login" || activeFlow === "signup") && (
            <>
              {/* Tab Switcher */}
              <div className="flex gap-2 mb-5 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => {
                    setTab('login');
                    setActiveFlow('login');
                    setErrors({});
                  }}
                  className={`flex-1 py-2 rounded-md font-semibold text-lg transition-all cursor-pointer ${
                    tab === 'login' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-600 hover:text-purple-600'
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
                  className={`flex-1 py-2 rounded-md font-semibold text-lg cursor-pointer transition-all ${
                    tab === 'signup' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-600 hover:text-purple-600'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Custom Google Login Button on Main Page */}
              <div className="mb-4">
                <button
                  onClick={handleCustomGoogleClick}
                  className="w-full py-2.5 px-4 border cursor-pointer border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 mb-3"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-lg font-medium">Continue with Google</span>
                </button>

                <div className="flex items-center my-3">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <span className="mx-3 text-gray-500 text-xs">OR</span>
                  <div className="flex-grow border-t border-gray-300"></div>
                </div>
              </div>

              {/* Login Form */}
              {tab === 'login' && (
                <div className="space-y-3.5">
                  <div className="mb-3">
                    <h2 className="text-xl font-bold text-gray-900">Welcome Back!</h2>
                    <p className="text-gray-600 text-sm">Continue your learning journey</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="email"
                        name="email"
                        value={loginInput.email}
                        onChange={(e) => changeInputHandler(e, 'login')}
                        placeholder="your@email.com"
                        className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                          errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-purple-200'
                        }`}
                      />
                    </div>
                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={loginInput.password}
                        onChange={(e) => changeInputHandler(e, 'login')}
                        placeholder="Enter password"
                        className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                          errors.password ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-purple-200'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => setActiveFlow("forgotPassword")}
                      className="text-sm text-purple-600 hover:text-purple-700 cursor-pointer font-medium"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Login As</label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <select
                        name="role"
                        value={loginInput.role}
                        onChange={(e) => changeInputHandler(e, 'login')}
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 appearance-none"
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
                    className="w-full py-2.5 cursor-pointer text-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {loginIsLoading ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Please wait...
                      </span>
                    ) : (
                      'Login'
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
                      className="text-purple-600 cursor-pointer text-sm font-semibold hover:text-purple-700"
                    >
                      Sign up
                    </button>
                  </p>
                </div>
              )}

              {/* Signup Form */}
              {tab === 'signup' && (
                <div className="space-y-3.5">
                  <div className="mb-3">
                    <h2 className="text-xl font-bold text-gray-900">Create Account</h2>
                    <p className="text-gray-600 text-sm">Start your learning journey</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        name="name"
                        value={signupInput.name}
                        onChange={(e) => changeInputHandler(e, 'signup')}
                        placeholder="John Doe"
                        className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                          errors.name ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-purple-200'
                        }`}
                      />
                    </div>
                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="email"
                        name="email"
                        value={signupInput.email}
                        onChange={(e) => changeInputHandler(e, 'signup')}
                        placeholder="your@email.com"
                        className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                          errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-purple-200'
                        }`}
                      />
                    </div>
                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={signupInput.password}
                        onChange={(e) => changeInputHandler(e, 'signup')}
                        placeholder="Create strong password"
                        className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                          errors.password ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-purple-200'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {signupInput.password && (
                      <div className="mt-1.5">
                        <div className="flex items-center gap-1.5 mb-1">
                          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${getPasswordStrengthColor(passwordStrength.score)}`}
                              style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                            ></div>
                          </div>
                          <span className={`text-xs font-medium ${
                            passwordStrength.score <= 2 ? 'text-red-500' :
                            passwordStrength.score === 3 ? 'text-yellow-500' :
                            passwordStrength.score === 4 ? 'text-blue-500' : 'text-green-500'
                          }`}>
                            {getPasswordStrengthText(passwordStrength.score)}
                          </span>
                        </div>
                        {passwordStrength.feedback.length > 0 && (
                          <p className="text-xs text-gray-600">
                            Need: {passwordStrength.feedback.join(', ')}
                          </p>
                        )}
                      </div>
                    )}
                    {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Sign Up As</label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <select
                        name="role"
                        value={signupInput.role}
                        onChange={(e) => changeInputHandler(e, 'signup')}
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 appearance-none"
                      >
                        <option value="student">Student</option>
                        <option value="instructor">Instructor</option>
                      </select>
                    </div>
                  </div>

                  {signupInput.role === 'instructor' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-blue-900 mb-1">Instructor Approval Required</p>
                          <p className="text-sm text-blue-700 leading-relaxed">
                            Admin will review your account within 3-5 business days. You'll receive an email once approved to start creating courses.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => handleRegistration('signup')}
                    disabled={registeredLoading}
                    className="w-full py-2.5 bg-gradient-to-r text-lg cursor-pointer from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {registeredLoading ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
                      className="text-purple-600  cursor-pointer text-sm font-semibold hover:text-purple-700"
                    >
                      Login
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