import React, { useState } from 'react';
import { Mail, Search, Filter, Eye, Trash2, MailOpen, Clock, User, Tag, MessageSquare, Send, ChevronLeft, ChevronRight, X, Reply,ChevronDown } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useDeleteMessageMutation, useGetMessagesQuery, useMarkAsReadMutation } from '@/features/api/authApi';

const Messages = () => {
  const { data, isLoading, isError, refetch } = useGetMessagesQuery();
  const [deleteMessage] = useDeleteMessageMutation();
  const [markAsRead] = useMarkAsReadMutation();
  
  const messages = data?.data || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyError, setReplyError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false); // Mobile filter state
  const messagesPerPage = 5;

  const categories = [
    { value: 'all', label: 'All Messages', color: 'gray' },
    { value: 'general', label: 'General', color: 'blue' },
    { value: 'technical', label: 'Technical', color: 'red' },
    { value: 'instructor', label: 'Instructor', color: 'purple' },
    { value: 'feedback', label: 'Feedback', color: 'green' }
  ];

  const getCategoryBadgeClass = (category) => {
    const colorMap = {
      general: 'bg-blue-100 text-blue-700',
      technical: 'bg-red-100 text-red-700',
      instructor: 'bg-purple-100 text-purple-700',
      feedback: 'bg-green-100 text-green-700'
    };
    return colorMap[category] || 'bg-gray-100 text-gray-700';
  };

  const filteredMessages = messages
    .filter(msg => {
      const matchesSearch = msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          msg.subject.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || msg.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Pagination
  const totalPages = Math.ceil(filteredMessages.length / messagesPerPage);
  const startIndex = (currentPage - 1) * messagesPerPage;
  const endIndex = startIndex + messagesPerPage;
  const currentMessages = filteredMessages.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const unreadCount = messages.filter(msg => !msg.isRead).length;

  const handleViewMessage = (message) => {
    setSelectedMessage(message);
    setShowModal(true);
  };

  const handleMarkAsRead = () => {
    if (!selectedMessage.isRead) {
      setShowReplyModal(true);
    }
  };

  const handleSubmitReply = async () => {
    // Reset previous errors
    setReplyError('');
    
    // Validation
    if (!replyMessage.trim()) {
      setReplyError('Reply message is required');
      return;
    }
    
    if (replyMessage.trim().length < 5) {
      setReplyError('Reply message must be at least 5 characters long');
      return;
    }

    try {
      await markAsRead({ 
        messageId: selectedMessage._id, 
        replyMessage: replyMessage.trim()
      }).unwrap();
      
      // Refresh the data immediately
      refetch();
      
      setShowReplyModal(false);
      setShowModal(false);
      setReplyMessage('');
      
      // Show success message
      alert('Reply sent successfully and message marked as read!');
    } catch (error) {
      console.error('Failed to mark as read:', error);
      alert('Failed to send reply. Please try again.');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await deleteMessage(messageId).unwrap();
        // Refresh the data after deletion
        refetch();
        if (selectedMessage?._id === messageId) {
          setShowModal(false);
        }
      } catch (error) {
        console.error('Failed to delete message:', error);
        alert('Failed to delete message. Please try again.');
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  // Mobile date format
  const formatDateMobile = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <p className="text-red-500 text-center p-4">Failed to load messages. Please try refreshing.</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Messages</h1>
                <p className="text-sm sm:text-lg text-gray-600">Manage all contact messages</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex-1 sm:flex-none px-3 py-1.5 sm:px-4 sm:py-2 bg-red-100 rounded-lg">
                <span className="text-xs sm:text-base text-red-700 font-semibold">{unreadCount} Unread</span>
              </div>
              <div className="flex-1 sm:flex-none px-3 py-1.5 sm:px-4 sm:py-2 bg-purple-100 rounded-lg">
                <span className="text-xs sm:text-base text-purple-700 font-semibold">{messages.length} Total</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6">
          {/* Mobile Filter Header */}
          <div className="sm:hidden mb-4">
            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="w-full bg-gray-100 rounded-lg p-3 flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-600" />
                <span className="font-medium text-gray-700">
                  Filters {selectedCategory !== 'all' && `(${selectedCategory})`}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${isMobileFilterOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className={`flex flex-col gap-4 ${isMobileFilterOpen ? 'block' : 'hidden sm:flex'}`}>
            
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  placeholder="Search by name, email, or subject..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 sm:pl-12 pr-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-purple-600 focus:outline-none transition-colors text-sm sm:text-base cursor-text"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => {
                    setSelectedCategory(cat.value);
                    setIsMobileFilterOpen(false);
                  }}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium transition-all cursor-pointer text-sm sm:text-base ${
                    selectedCategory === cat.value
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.label}
                  {cat.value !== 'all' && (
                    <span className="ml-1 sm:ml-2 text-xs">
                      ({messages.filter(m => m.category === cat.value).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Messages List */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-4 sm:mb-6">
          {/* Results Info */}
          <div className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-50 border-b border-gray-200">
            <p className="text-xs sm:text-sm text-gray-600">
              Showing <span className="font-semibold">{startIndex + 1}-{Math.min(endIndex, filteredMessages.length)}</span> of <span className="font-semibold">{filteredMessages.length}</span> messages
            </p>
          </div>

          {currentMessages.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <Mail className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
              <p className="text-gray-500 text-base sm:text-lg">No messages found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {currentMessages.map((message) => (
                <div
                  key={message._id}
                  className={`p-4 sm:p-6 hover:bg-purple-50 transition-colors cursor-pointer ${
                    !message.isRead ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleViewMessage(message)}
                >
                  {/* Mobile View */}
                  <div className="sm:hidden">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="flex-shrink-0 mt-0.5">
                          {message.isRead ? (
                            <MailOpen className="w-4 h-4 text-gray-400" />
                          ) : (
                            <Mail className="w-4 h-4 text-purple-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-bold text-gray-900 text-sm ${!message.isRead ? 'text-purple-900' : ''}`}>
                              {message.name}
                            </h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getCategoryBadgeClass(message.category)}`}>
                              {message.category}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 truncate">{message.email}</p>
                          <h4 className={`font-semibold text-gray-900 text-sm mt-1 ${!message.isRead ? 'text-purple-900' : ''}`}>
                            {message.subject}
                          </h4>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="text-xs text-gray-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDateMobile(message.createdAt)}
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewMessage(message);
                            }}
                            className="p-1 hover:bg-purple-100 cursor-pointer rounded transition-colors"
                            title="View Message"
                          >
                            <Eye className="w-4 h-4 text-purple-600" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteMessage(message._id);
                            }}
                            className="p-1 hover:bg-red-100 rounded cursor-pointer transition-colors"
                            title="Delete Message"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 ml-7">{message.message}</p>
                  </div>

                  {/* Desktop View */}
                  <div className="hidden sm:flex items-start gap-4">
                    
                    {/* Read Status Indicator */}
                    <div className="flex-shrink-0 mt-1">
                      {message.isRead ? (
                        <MailOpen className="w-5 h-5 text-gray-400" />
                      ) : (
                        <Mail className="w-5 h-5 text-purple-600" />
                      )}
                    </div>

                    {/* Message Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className={`font-bold text-gray-900 ${!message.isRead ? 'text-purple-900' : ''}`}>
                              {message.name}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryBadgeClass(message.category)}`}>
                              {message.category}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{message.email}</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          {formatDate(message.createdAt)}
                        </div>
                      </div>

                      <h4 className={`font-semibold text-gray-900 mb-2 ${!message.isRead ? 'text-purple-900' : ''}`}>
                        {message.subject}
                      </h4>
                      <p className="text-gray-600 line-clamp-2">{message.message}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewMessage(message);
                        }}
                        className="p-2 hover:bg-purple-100 cursor-pointer rounded-lg transition-colors"
                        title="View Message"
                      >
                        <Eye className="w-5 h-5 text-purple-600" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMessage(message._id);
                        }}
                        className="p-2 hover:bg-red-100 rounded-lg cursor-pointer transition-colors"
                        title="Delete Message"
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <div className="text-xs sm:text-sm text-gray-700">
              Page {currentPage} of {totalPages} • {filteredMessages.length} total messages
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg cursor-pointer ${
                  currentPage === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-purple-600 hover:bg-purple-50 border border-purple-600'
                }`}
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <div className="flex gap-1 overflow-x-auto max-w-[200px] sm:max-w-none">
                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1;
                  
                  if (
                    totalPages <= 5 ||
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg cursor-pointer font-semibold text-sm sm:text-base min-w-[36px] sm:min-w-[44px] ${
                          currentPage === pageNumber
                            ? 'bg-purple-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-purple-50 border border-gray-300'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  } else if (
                    pageNumber === currentPage - 2 ||
                    pageNumber === currentPage + 2
                  ) {
                    return <span key={pageNumber} className="px-2 py-2 text-gray-500">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg cursor-pointer ${
                  currentPage === totalPages
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-purple-600 hover:bg-purple-50 border border-purple-600'
                }`}
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Message View Modal */}
      {showModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-xl sm:rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 sm:p-6 rounded-t-xl sm:rounded-t-3xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-lg rounded-lg sm:rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-2xl font-bold text-white">Message Details</h2>
                    <p className="text-purple-100 text-xs sm:text-sm">From {selectedMessage.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white cursor-pointer hover:bg-white/20 p-1 sm:p-2 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              
              {/* Sender Info */}
              <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Name</p>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">{selectedMessage.name}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Email</p>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base break-all">{selectedMessage.email}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Category</p>
                    <span className={`inline-block px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-semibold ${getCategoryBadgeClass(selectedMessage.category)}`}>
                      {selectedMessage.category}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Date</p>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">{formatDate(selectedMessage.createdAt)}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Status</p>
                    <span className={`inline-block px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-semibold ${
                      selectedMessage.isRead ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {selectedMessage.isRead ? 'Read' : 'Unread'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 block">Subject</label>
                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <p className="text-gray-900 font-medium text-sm sm:text-base">{selectedMessage.subject}</p>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 block">Message</label>
                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <p className="text-gray-900 whitespace-pre-wrap text-sm sm:text-base">{selectedMessage.message}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t border-gray-200">
                {!selectedMessage.isRead && (
                  <button
                    onClick={handleMarkAsRead}
                    className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r cursor-pointer from-purple-600 to-blue-600 text-white rounded-lg sm:rounded-xl font-semibold hover:shadow-xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                    Mark as Read & Reply
                  </button>
                )}
                <button
                  onClick={() => handleDeleteMessage(selectedMessage._id)}
                  className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-red-600 text-white cursor-pointer rounded-lg sm:rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  Delete
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-200 cursor-pointer text-gray-700 rounded-lg sm:rounded-xl font-semibold hover:bg-gray-300 transition-colors text-sm sm:text-base"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reply Message Modal */}
      {showReplyModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-xl sm:rounded-3xl shadow-2xl max-w-xl w-full">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 sm:p-6 rounded-t-xl sm:rounded-t-3xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-lg rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Send className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-2xl font-bold text-white">Reply to Message</h2>
                    <p className="text-purple-100 text-xs sm:text-sm break-all">Send reply to {selectedMessage.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowReplyModal(false);
                    setReplyMessage('');
                    setReplyError('');
                  }}
                  className="text-white hover:bg-white/20 p-1 sm:p-2 cursor-pointer rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-yellow-800">
                  <strong>Note:</strong> You must send a reply message to mark this message as read.
                </p>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Reply Message <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-2">(Minimum 5 characters)</span>
                </label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => {
                    setReplyMessage(e.target.value);
                    if (replyError) setReplyError('');
                  }}
                  placeholder="Type your reply message here..."
                  rows="4"
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 ${replyError ? 'border-red-500' : 'border-gray-200'} rounded-lg sm:rounded-xl focus:border-purple-600 focus:outline-none transition-colors resize-none text-sm sm:text-base cursor-text`}
                  required
                />
                {replyError && (
                  <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-red-600">{replyError}</p>
                )}
                <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-500">
                  Characters: {replyMessage.length} / Minimum: 5
                  {replyMessage.length < 5 && (
                    <span className="text-red-500 ml-1 sm:ml-2">
                      ({5 - replyMessage.length} more required)
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
                <button
                  onClick={handleSubmitReply}
                  disabled={!replyMessage.trim() || replyMessage.trim().length < 5}
                  className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 cursor-pointer bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg sm:rounded-xl font-semibold hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  Send Reply & Mark as Read
                </button>
                <button
                  onClick={() => {
                    setShowReplyModal(false);
                    setReplyMessage('');
                    setReplyError('');
                  }}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 cursor-pointer bg-gray-200 text-gray-700 rounded-lg sm:rounded-xl font-semibold hover:bg-gray-300 transition-colors text-sm sm:text-base"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;