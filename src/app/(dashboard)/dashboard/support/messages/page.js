"use client";

import { Plus, Edit, Trash2, Search, X, Mail, Phone, MessageSquare, Clock, CheckCircle, Archive, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

export default function CustomerMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [replyText, setReplyText] = useState('');

  const statuses = [
    { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-800' },
    { value: 'read', label: 'Read', color: 'bg-gray-100 text-gray-800' },
    { value: 'replied', label: 'Replied', color: 'bg-green-100 text-green-800' },
    { value: 'resolved', label: 'Resolved', color: 'bg-purple-100 text-purple-800' },
    { value: 'archived', label: 'Archived', color: 'bg-yellow-100 text-yellow-800' },
  ];

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'order', label: 'Order' },
    { value: 'product', label: 'Product' },
    { value: 'payment', label: 'Payment' },
    { value: 'shipping', label: 'Shipping' },
    { value: 'return', label: 'Return' },
    { value: 'technical', label: 'Technical' },
    { value: 'other', label: 'Other' },
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
    { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' },
  ];

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/support/messages');
      if (res.ok) {
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : []);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/support/messages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        Swal.fire('Success', 'Status updated successfully', 'success');
        fetchMessages();
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      Swal.fire('Error', error.message || 'Failed to update status', 'error');
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) {
      Swal.fire('Error', 'Please enter a reply message', 'error');
      return;
    }

    try {
      const res = await fetch(`/api/support/messages/${selectedMessage._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: replyText })
      });

      if (res.ok) {
        Swal.fire('Success', 'Reply sent successfully', 'success');
        setShowReplyModal(false);
        setReplyText('');
        setSelectedMessage(null);
        fetchMessages();
      } else {
        throw new Error('Failed to send reply');
      }
    } catch (error) {
      Swal.fire('Error', error.message || 'Failed to send reply', 'error');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#000',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/support/messages/${id}`, {
          method: 'DELETE'
        });

        if (res.ok) {
          Swal.fire('Deleted!', 'Message has been deleted.', 'success');
          fetchMessages();
        } else {
          const error = await res.json();
          throw new Error(error.message || 'Failed to delete');
        }
      } catch (error) {
        Swal.fire('Error', error.message || 'Failed to delete message', 'error');
      }
    }
  };

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = 
      msg.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.message?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || msg.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || msg.category === categoryFilter;
    const matchesPriority = priorityFilter === 'all' || msg.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  const getStatusInfo = (status) => {
    return statuses.find(s => s.value === status) || statuses[0];
  };

  const getPriorityInfo = (priority) => {
    return priorities.find(p => p.value === priority) || priorities[1];
  };

  const getCategoryLabel = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.label : category;
  };

  const unreadCount = messages.filter(m => m.status === 'new').length;

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading messages...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Customer Messages</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage customer inquiries and support messages
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                {unreadCount} new
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="all">All Status</option>
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              {priorities.map((priority) => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredMessages.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                  No messages found.
                </td>
              </tr>
            ) : (
              filteredMessages.map((message) => {
                const statusInfo = getStatusInfo(message.status);
                const priorityInfo = getPriorityInfo(message.priority);
                return (
                  <tr key={message._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{message.name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                        <Mail className="w-3 h-3" />
                        {message.email}
                      </div>
                      {message.phone && (
                        <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                          <Phone className="w-3 h-3" />
                          {message.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{message.subject}</div>
                      <div className="text-xs text-gray-500 mt-1 line-clamp-1">{message.message}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getCategoryLabel(message.category)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${priorityInfo.color}`}>
                        {priorityInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(message.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedMessage(message);
                            setShowModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="View"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedMessage(message);
                            setShowReplyModal(true);
                          }}
                          className="text-green-600 hover:text-green-900"
                          title="Reply"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(message._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* View Message Modal */}
      {showModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Message Details</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedMessage(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">From</h3>
                <p className="text-sm text-gray-900">{selectedMessage.name}</p>
                <p className="text-xs text-gray-500">{selectedMessage.email}</p>
                {selectedMessage.phone && (
                  <p className="text-xs text-gray-500">{selectedMessage.phone}</p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Subject</h3>
                <p className="text-sm text-gray-900">{selectedMessage.subject}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Message</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <h3 className="text-xs font-medium text-gray-500 mb-1">Category</h3>
                  <p className="text-sm text-gray-900">{getCategoryLabel(selectedMessage.category)}</p>
                </div>
                <div>
                  <h3 className="text-xs font-medium text-gray-500 mb-1">Priority</h3>
                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getPriorityInfo(selectedMessage.priority).color}`}>
                    {getPriorityInfo(selectedMessage.priority).label}
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-medium text-gray-500 mb-1">Status</h3>
                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusInfo(selectedMessage.status).color}`}>
                    {getStatusInfo(selectedMessage.status).label}
                  </span>
                </div>
              </div>

              {/* Replies */}
              {selectedMessage.replies && selectedMessage.replies.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Replies</h3>
                  <div className="space-y-3">
                    {selectedMessage.replies.map((reply, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-xs font-medium text-gray-900">
                              {reply.repliedBy?.name || 'Admin'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(reply.repliedAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{reply.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Update */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Update Status</h3>
                <div className="flex flex-wrap gap-2">
                  {statuses.map((status) => (
                    <button
                      key={status.value}
                      onClick={() => {
                        handleStatusUpdate(selectedMessage._id, status.value);
                        setShowModal(false);
                        setSelectedMessage(null);
                      }}
                      className={`px-3 py-1 text-xs rounded-full transition-colors ${
                        selectedMessage.status === status.value
                          ? status.color
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedMessage(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setShowReplyModal(true);
                }}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Reply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Reply to Message</h2>
              <button
                onClick={() => {
                  setShowReplyModal(false);
                  setReplyText('');
                  setSelectedMessage(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reply Message</label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={6}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Type your reply..."
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowReplyModal(false);
                  setReplyText('');
                  setSelectedMessage(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReply}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Send Reply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
