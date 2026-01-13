"use client";

import { Plus, Edit, Trash2, Save, X, Mail, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import RichTextEditor from '@/app/components/RichTextEditor';

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
    templateType: 'custom',
    variables: [],
    status: 'Active',
  });
  const [variableInput, setVariableInput] = useState('');
  const [editingId, setEditingId] = useState(null);

  const templateTypes = [
    { value: 'order-confirmation', label: 'Order Confirmation' },
    { value: 'order-shipped', label: 'Order Shipped' },
    { value: 'order-delivered', label: 'Order Delivered' },
    { value: 'password-reset', label: 'Password Reset' },
    { value: 'welcome', label: 'Welcome Email' },
    { value: 'newsletter', label: 'Newsletter' },
    { value: 'promotional', label: 'Promotional' },
    { value: 'custom', label: 'Custom' },
  ];

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/support/email-templates');
      if (res.ok) {
        const data = await res.json();
        setTemplates(Array.isArray(data) ? data : []);
      } else {
        setTemplates([]);
      }
    } catch (error) {
      console.error('Error fetching email templates:', error);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddVariable = () => {
    if (variableInput.trim() && !formData.variables.includes(variableInput.trim())) {
      setFormData(prev => ({
        ...prev,
        variables: [...prev.variables, variableInput.trim()]
      }));
      setVariableInput('');
    }
  };

  const handleRemoveVariable = (variableToRemove) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.filter(v => v !== variableToRemove)
    }));
  };

  const handleEdit = (template) => {
    setEditingId(template._id);
    setFormData({
      name: template.name || '',
      subject: template.subject || '',
      body: template.body || '',
      templateType: template.templateType || 'custom',
      variables: template.variables || [],
      status: template.status || 'Active',
    });
    setShowModal(true);
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
        const res = await fetch(`/api/support/email-templates/${id}`, {
          method: 'DELETE'
        });

        if (res.ok) {
          Swal.fire('Deleted!', 'Email template has been deleted.', 'success');
          fetchTemplates();
        } else {
          const error = await res.json();
          throw new Error(error.message || 'Failed to delete');
        }
      } catch (error) {
        Swal.fire('Error', error.message || 'Failed to delete template', 'error');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.subject || !formData.body) {
      Swal.fire('Error', 'Please fill in all required fields', 'error');
      return;
    }

    try {
      const url = editingId ? `/api/support/email-templates/${editingId}` : '/api/support/email-templates';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        Swal.fire('Success', `Email template ${editingId ? 'updated' : 'created'} successfully`, 'success');
        fetchTemplates();
        setShowModal(false);
        handleNew();
      } else {
        const error = await res.json();
        throw new Error(error.message || `Failed to ${editingId ? 'update' : 'create'} template`);
      }
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    }
  };

  const handleNew = () => {
    setEditingId(null);
    setFormData({
      name: '',
      subject: '',
      body: '',
      templateType: 'custom',
      variables: [],
      status: 'Active',
    });
    setVariableInput('');
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = 
      template.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || template.templateType === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const getTypeLabel = (type) => {
    const templateType = templateTypes.find(t => t.value === type);
    return templateType ? templateType.label : type;
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading email templates...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Email Templates</h1>
          <p className="text-sm text-gray-500 mt-1">Manage email templates for automated communications</p>
        </div>
        <button
          onClick={() => {
            handleNew();
            setShowModal(true);
          }}
          className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Template
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="all">All Types</option>
              {templateTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Templates List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTemplates.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                  No email templates found. Create one to get started.
                </td>
              </tr>
            ) : (
              filteredTemplates.map((template) => (
                <tr key={template._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {template.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {template.subject}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getTypeLabel(template.templateType)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      template.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {template.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(template)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(template._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                {editingId ? 'Edit Email Template' : 'New Email Template'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                      required
                      placeholder="Order Confirmation Email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="templateType"
                      value={formData.templateType}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                      required
                    >
                      {templateTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                    required
                    placeholder="Your order has been confirmed"
                  />
                </div>

                {/* Body */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Body <span className="text-red-500">*</span>
                  </label>
                  <RichTextEditor
                    value={formData.body}
                    onChange={(content) => setFormData(prev => ({ ...prev, body: content }))}
                    placeholder="Enter email body content..."
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Use variables like {'{'}customerName{'}'}, {'{'}orderNumber{'}'} etc. in your template
                  </p>
                </div>

                {/* Variables */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Available Variables</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={variableInput}
                      onChange={(e) => setVariableInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddVariable();
                        }
                      }}
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="Add variable (e.g., customerName)"
                    />
                    <button
                      type="button"
                      onClick={handleAddVariable}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.variables.map((variable, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {'{'}{variable}{'}'}
                        <button
                          type="button"
                          onClick={() => handleRemoveVariable(variable)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
