import React, { useState, useEffect } from 'react';
import { Check, X, Mail, User, Calendar, Search, ChevronLeft, ChevronRight,Loader2 } from 'lucide-react';
import { useApproveUserMutation, useManageUserQuery, useRejectUserMutation } from '@/features/api/courseApi';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function ManageUser() {
  const [allUsers, setAllUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pending'); // pending, approved, rejected, students
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [loadingAction, setLoadingAction] = useState(null); // Track which action is loading
  const itemsPerPage = 5;

  const { data, isLoading, isError } = useManageUserQuery();
  const [approveUser, { isLoading: approveLoading }] = useApproveUserMutation();
  const [rejectUser, { isLoading: rejectLoading }] = useRejectUserMutation();

  // Update allUsers when data changes
  useEffect(() => {
    if (data) {
      const users = [
        ...(data.students || []).map(student => ({ ...student, role: 'student' })),
        ...(data.instructors?.approved || []).map(instructor => ({ 
          ...instructor, 
          role: 'instructor', 
          approved: true 
        })),
        ...(data.instructors?.rejected || []).map(instructor => ({ 
          ...instructor, 
          role: 'instructor', 
          approved: false, 
          rejected: true 
        })),
        ...(data.instructors?.pending || []).map(instructor => ({ 
          ...instructor, 
          role: 'instructor', 
          approved: false, 
          rejected: false 
        }))
      ];
      setAllUsers(users);
    }
  }, [data]);

  // Filter users based on tab and search
  const getFilteredUsers = () => {
    let filtered = [];
    
    // Filter by tab
    if (activeTab === 'students') {
      filtered = allUsers.filter(user => user.role === 'student');
    } else {
      filtered = allUsers.filter(user => user.role === 'instructor');
      
      if (activeTab === 'pending') {
        filtered = filtered.filter(i => !i.approved && !i.rejected);
      } else if (activeTab === 'approved') {
        filtered = filtered.filter(i => i.approved);
      } else if (activeTab === 'rejected') {
        filtered = filtered.filter(i => i.rejected);
      }
    }
    
    // Filter by search
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const filteredUsers = getFilteredUsers();

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to page 1 when tab or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  const handleApprove = async (instructorId) => {
    setLoadingAction(`approve-${instructorId}`);
    try {
      await approveUser(instructorId);
      
      setAllUsers(prev => prev.map(user => 
        user._id === instructorId 
          ? { ...user, approved: true, approvedAt: new Date().toISOString() }
          : user
      ));
      setSelectedInstructor(null);
      alert('Instructor approved successfully!');
    } catch (error) {
      console.error('Approval failed:', error);
      alert('Failed to approve instructor. Please try again.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReject = async (instructorId) => {
    setLoadingAction(`reject-${instructorId}`);
    try {
      await rejectUser(instructorId);
      
      setAllUsers(prev => prev.map(user => 
        user._id === instructorId 
          ? { ...user, rejected: true, rejectedAt: new Date().toISOString() }
          : user
      ));
      setSelectedInstructor(null);
      alert('Instructor registration rejected.');
    } catch (error) {
      console.error('Rejection failed:', error);
      alert('Failed to reject instructor. Please try again.');
    } finally {
      setLoadingAction(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCounts = () => {
    const instructors = allUsers.filter(u => u.role === 'instructor');
    const students = allUsers.filter(u => u.role === 'student');
    return {
      pending: instructors.filter(i => !i.approved && !i.rejected).length,
      approved: instructors.filter(i => i.approved).length,
      rejected: instructors.filter(i => i.rejected).length,
      students: students.length
    };
  };

  const counts = getCounts();

  // Loading state
  if (isLoading) {
    return (
      <LoadingSpinner/>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 text-lg font-semibold mb-2">Failed to load data</p>
          <p className="text-gray-600">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 mt-5">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            User Management
          </h1>
          <p className="text-gray-600">
            Review and manage users registrations
          </p>
        </div>

        {/* Stats */}
        <div className="grid cursor-pointer grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg text-gray-600 mb-1">Students</p>
                <p className="text-3xl font-bold text-blue-600">{counts.students}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <User className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white cursor-pointer rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg text-gray-600 mb-1">Pending</p>
                <p className="text-3xl font-bold text-orange-600">{counts.pending}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white cursor-pointer rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg text-gray-600 mb-1">Approved</p>
                <p className="text-3xl font-bold text-green-600">{counts.approved}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Check className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white cursor-pointer rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg text-gray-600 mb-1">Rejected</p>
                <p className="text-3xl font-bold text-red-600">{counts.rejected}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <X className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('students')}
                className={`px-6 py-4 text-lg cursor-pointer font-medium border-b-2 transition-colors ${
                  activeTab === 'students'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Students ({counts.students})
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-6 py-4 text-lg font-medium cursor-pointer border-b-2 transition-colors ${
                  activeTab === 'pending'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Pending ({counts.pending})
              </button>
              <button
                onClick={() => setActiveTab('approved')}
                className={`px-6 py-4 text-lg font-medium cursor-pointer border-b-2 transition-colors ${
                  activeTab === 'approved'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Approved ({counts.approved})
              </button>
              <button
                onClick={() => setActiveTab('rejected')}
                className={`px-6 py-4 text-lg font-medium cursor-pointer border-b-2 transition-colors ${
                  activeTab === 'rejected'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Rejected ({counts.rejected})
              </button>
            </nav>
          </div>

          {/* Search */}
          <div className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {currentUsers.length === 0 ? (
            <div className="p-12 text-center">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {searchTerm ? 'No users found' : `No ${activeTab === 'students' ? 'students' : activeTab + ' instructors'}`}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">
                        Registered
                      </th>
                      {activeTab === 'approved' && (
                        <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">
                          Approved
                        </th>
                      )}
                      {activeTab === 'rejected' && (
                        <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">
                          Rejected
                        </th>
                      )}
                      {activeTab === 'pending' && (
                        <th className="px-6 py-3 text-left text-lg font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentUsers.map((user) => (
                      <tr 
                        key={user._id}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                              user.role === 'student' ? 'bg-blue-100' : 'bg-purple-100'
                            }`}>
                              <span className={`font-semibold text-lg ${
                                user.role === 'student' ? 'text-blue-600' : 'text-purple-600'
                              }`}>
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-lg font-medium text-gray-900">
                                {user.name}
                              </div>
                              {user.role === 'student' && (
                                <span className="text-sm text-gray-500">Student</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-lg text-gray-900 flex items-center">
                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                            {user.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-500">
                          {formatDate(user.createdAt)}
                        </td>
                        {activeTab === 'approved' && (
                          <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-500">
                            {formatDate(user.approvedAt)}
                          </td>
                        )}
                        {activeTab === 'rejected' && (
                          <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-500">
                            {formatDate(user.rejectedAt)}
                          </td>
                        )}
                        {activeTab === 'pending' && (
                          <td className="px-6 py-4 whitespace-nowrap text-lg font-medium">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApprove(user._id)}
                                disabled={loadingAction === `approve-${user._id}` || loadingAction === `reject-${user._id}`}
                                className="bg-green-500 cursor-pointer hover:bg-green-600 text-white px-3 py-2 rounded-lg flex items-center gap-1 transition-colors disabled:opacity-70 disabled:cursor-not-allowed min-w-[100px] justify-center"
                              >
                                {loadingAction === `approve-${user._id}` ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Approving...
                                  </>
                                ) : (
                                  <>
                                    <Check className="w-4 h-4" />
                                    Approve
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => handleReject(user._id)}
                                disabled={loadingAction === `reject-${user._id}` || loadingAction === `approve-${user._id}`}
                                className="bg-red-500 cursor-pointer hover:bg-red-600 text-white px-3 py-2 rounded-lg flex items-center gap-1 transition-colors disabled:opacity-70 disabled:cursor-not-allowed min-w-[100px] justify-center"
                              >
                                {loadingAction === `reject-${user._id}` ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Rejecting...
                                  </>
                                ) : (
                                  <>
                                    <X className="w-4 h-4" />
                                    Reject
                                  </>
                                )}
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                  <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(endIndex, filteredUsers.length)}</span> of{' '}
                    <span className="font-medium">{filteredUsers.length}</span> results
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>
                    
                    <div className="flex gap-1">
                      {[...Array(totalPages)].map((_, idx) => (
                        <button
                          key={idx + 1}
                          onClick={() => setCurrentPage(idx + 1)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium ${
                            currentPage === idx + 1
                              ? 'bg-blue-500 text-white'
                              : 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}