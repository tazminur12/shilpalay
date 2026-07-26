"use client";

import {
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  Shield,
  ShieldCheck,
  Users,
  Lock,
  UserPlus,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import Swal from 'sweetalert2';
import { PERMISSION_MODULES, slugifyRoleKey } from '@/lib/permissions';

const EMPTY_ROLE_FORM = {
  name: '',
  key: '',
  description: '',
  status: 'Active',
  permissions: [],
};

const EMPTY_USER_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  mobile: '',
  gender: '',
  password: '',
  role: 'customer',
};

async function readErrorMessage(res, fallback) {
  try {
    const data = await res.json();
    return data.message || data.error || fallback;
  } catch {
    return fallback;
  }
}

export default function RoleManagementPage() {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('roles');
  const [searchQuery, setSearchQuery] = useState('');

  // Role modal
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [savingRole, setSavingRole] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [roleForm, setRoleForm] = useState(EMPTY_ROLE_FORM);
  const [keyManual, setKeyManual] = useState(false);

  // User create / assign
  const [showUserModal, setShowUserModal] = useState(false);
  const [savingUser, setSavingUser] = useState(false);
  const [userForm, setUserForm] = useState(EMPTY_USER_FORM);
  const [editingUserId, setEditingUserId] = useState(null);
  const [selectedUserRole, setSelectedUserRole] = useState('');
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    fetchRoles();
    fetchUsers();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await fetch('/api/roles', { cache: 'no-store' });
      if (!res.ok) throw new Error(await readErrorMessage(res, 'Failed to fetch roles'));
      const data = await res.json();
      setRoles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      Swal.fire('Error', error.message || 'Failed to fetch roles', 'error');
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const activeRoleOptions = useMemo(
    () => roles.filter((r) => r.status === 'Active'),
    [roles]
  );

  const selectedRoleForUser = useMemo(
    () => activeRoleOptions.find((r) => r.key === userForm.role) || null,
    [activeRoleOptions, userForm.role]
  );

  const filteredRoles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter((role) =>
      [role.name, role.key, role.description, role.status]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [roles, searchQuery]);

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return users;
    return users.filter((user) =>
      [user.firstName, user.lastName, user.email, user.role]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [users, userSearch]);

  const resetRoleForm = () => {
    setRoleForm(EMPTY_ROLE_FORM);
    setEditingId(null);
    setKeyManual(false);
  };

  const openCreateRoleModal = () => {
    resetRoleForm();
    setShowRoleModal(true);
  };

  const openEditRoleModal = (role) => {
    setEditingId(role._id);
    setRoleForm({
      name: role.name || '',
      key: role.key || '',
      description: role.description || '',
      status: role.status || 'Active',
      permissions: [...(role.permissions || [])],
    });
    setKeyManual(true);
    setShowRoleModal(true);
  };

  const closeRoleModal = () => {
    if (savingRole) return;
    setShowRoleModal(false);
    resetRoleForm();
  };

  const handleNameChange = (value) => {
    setRoleForm((prev) => ({
      ...prev,
      name: value,
      key: keyManual || editingId ? prev.key : slugifyRoleKey(value),
    }));
  };

  const togglePermission = (key) => {
    if (roleForm.key === 'super_admin') return;
    setRoleForm((prev) => {
      const has = prev.permissions.includes(key);
      return {
        ...prev,
        permissions: has
          ? prev.permissions.filter((p) => p !== key)
          : [...prev.permissions, key],
      };
    });
  };

  const toggleModule = (module) => {
    if (roleForm.key === 'super_admin') return;
    const keys = module.permissions.map((p) => p.key);
    const allSelected = keys.every((k) => roleForm.permissions.includes(k));
    setRoleForm((prev) => {
      if (allSelected) {
        return {
          ...prev,
          permissions: prev.permissions.filter((p) => !keys.includes(p)),
        };
      }
      return {
        ...prev,
        permissions: [...new Set([...prev.permissions, ...keys])],
      };
    });
  };

  const selectAllPermissions = () => {
    if (roleForm.key === 'super_admin') return;
    const all = PERMISSION_MODULES.flatMap((m) => m.permissions.map((p) => p.key));
    setRoleForm((prev) => ({ ...prev, permissions: all }));
  };

  const clearPermissions = () => {
    if (roleForm.key === 'super_admin') return;
    setRoleForm((prev) => ({ ...prev, permissions: [] }));
  };

  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    if (!roleForm.name.trim()) {
      Swal.fire('Required', 'Please enter a role name.', 'warning');
      return;
    }
    if (!roleForm.key.trim()) {
      Swal.fire('Required', 'Please enter a role key.', 'warning');
      return;
    }

    setSavingRole(true);
    try {
      const url = editingId ? `/api/roles/${editingId}` : '/api/roles';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roleForm),
      });

      if (!res.ok) {
        throw new Error(await readErrorMessage(res, 'Failed to save role'));
      }

      Swal.fire({
        icon: 'success',
        title: editingId ? 'Role updated' : 'Role created',
        timer: 1500,
        showConfirmButton: false,
      });
      setShowRoleModal(false);
      resetRoleForm();
      await fetchRoles();
    } catch (error) {
      Swal.fire('Error', error.message || 'Failed to save role', 'error');
    } finally {
      setSavingRole(false);
    }
  };

  const handleDeleteRole = async (role) => {
    if (role.isSystem) {
      Swal.fire('Protected', 'System roles cannot be deleted.', 'info');
      return;
    }

    const result = await Swal.fire({
      title: `Delete "${role.name}"?`,
      text:
        role.userCount > 0
          ? `This role is assigned to ${role.userCount} user(s). Reassign them before deleting.`
          : 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#000',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete',
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`/api/roles/${role._id}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error(await readErrorMessage(res, 'Failed to delete role'));
      }
      Swal.fire('Deleted', 'Role has been deleted.', 'success');
      fetchRoles();
    } catch (error) {
      Swal.fire('Error', error.message || 'Failed to delete role', 'error');
    }
  };

  const openCreateUserModal = () => {
    const defaultRole =
      activeRoleOptions.find((r) => r.key === 'admin')?.key ||
      activeRoleOptions.find((r) => r.key !== 'customer')?.key ||
      activeRoleOptions[0]?.key ||
      'customer';
    setUserForm({ ...EMPTY_USER_FORM, role: defaultRole });
    setShowUserModal(true);
  };

  const closeUserModal = () => {
    if (savingUser) return;
    setShowUserModal(false);
    setUserForm(EMPTY_USER_FORM);
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    if (
      !userForm.firstName.trim() ||
      !userForm.lastName.trim() ||
      !userForm.email.trim() ||
      !userForm.mobile.trim() ||
      !userForm.password
    ) {
      Swal.fire('Required', 'Please fill all required fields.', 'warning');
      return;
    }
    if (userForm.password.length < 6) {
      Swal.fire('Invalid', 'Password must be at least 6 characters.', 'warning');
      return;
    }
    if (!userForm.role) {
      Swal.fire('Required', 'Please select a role.', 'warning');
      return;
    }

    setSavingUser(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm),
      });
      if (!res.ok) {
        throw new Error(await readErrorMessage(res, 'Failed to create user'));
      }

      Swal.fire({
        icon: 'success',
        title: 'User created',
        text: 'User has been created with the selected role.',
        timer: 1600,
        showConfirmButton: false,
      });
      setShowUserModal(false);
      setUserForm(EMPTY_USER_FORM);
      await Promise.all([fetchUsers(), fetchRoles()]);
    } catch (error) {
      Swal.fire('Error', error.message || 'Failed to create user', 'error');
    } finally {
      setSavingUser(false);
    }
  };

  const handleSaveUserRole = async (userId) => {
    try {
      const res = await fetch(`/api/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedUserRole }),
      });
      if (!res.ok) {
        throw new Error(await readErrorMessage(res, 'Failed to update user role'));
      }
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: selectedUserRole } : u))
      );
      setEditingUserId(null);
      setSelectedUserRole('');
      Swal.fire({
        icon: 'success',
        title: 'Role assigned',
        timer: 1400,
        showConfirmButton: false,
      });
      fetchRoles();
    } catch (error) {
      Swal.fire('Error', error.message || 'Failed to update user role', 'error');
    }
  };

  const handleDeleteUser = async (user) => {
    if (currentUserId && user._id === currentUserId) {
      Swal.fire('Not allowed', 'You cannot delete your own account.', 'info');
      return;
    }

    const result = await Swal.fire({
      title: 'Delete user?',
      html: `<p class="text-sm text-gray-600">Remove <strong>${user.firstName} ${user.lastName}</strong> (${user.email}) permanently?</p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#000',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete',
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`/api/users/${user._id}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error(await readErrorMessage(res, 'Failed to delete user'));
      }
      setUsers((prev) => prev.filter((u) => u._id !== user._id));
      Swal.fire({
        icon: 'success',
        title: 'User deleted',
        timer: 1400,
        showConfirmButton: false,
      });
      fetchRoles();
    } catch (error) {
      Swal.fire('Error', error.message || 'Failed to delete user', 'error');
    }
  };

  const roleBadgeClass = (key) => {
    if (key === 'super_admin') return 'bg-purple-100 text-purple-800';
    if (key === 'admin') return 'bg-blue-100 text-blue-800';
    if (key === 'customer') return 'bg-gray-100 text-gray-700';
    return 'bg-emerald-50 text-emerald-800';
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading roles...</div>;
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Roles & Permissions</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create roles, create users, and assign access by role
          </p>
        </div>
        {activeTab === 'roles' ? (
          <button
            type="button"
            onClick={openCreateRoleModal}
            className="inline-flex items-center justify-center gap-2 bg-black text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Role
          </button>
        ) : (
          <button
            type="button"
            onClick={openCreateUserModal}
            className="inline-flex items-center justify-center gap-2 bg-black text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Create User
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'roles'
              ? 'border-black text-black'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Roles
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'users'
              ? 'border-black text-black'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          Users
        </button>
      </div>

      {activeTab === 'roles' && (
        <>
          <div className="mb-4 relative max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search roles..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Key
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Permissions
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Users
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRoles.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-500 text-sm">
                        No roles found. Create your first role.
                      </td>
                    </tr>
                  ) : (
                    filteredRoles.map((role) => (
                      <tr key={role._id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                              {role.isSystem ? (
                                <ShieldCheck className="w-4 h-4 text-gray-600" />
                              ) : (
                                <Shield className="w-4 h-4 text-gray-600" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 flex items-center gap-2">
                                {role.name}
                                {role.isSystem && (
                                  <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                    <Lock className="w-3 h-3" />
                                    System
                                  </span>
                                )}
                              </div>
                              {role.description && (
                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 max-w-xs">
                                  {role.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <code className="text-xs bg-gray-50 border border-gray-100 px-2 py-1 rounded text-gray-700">
                            {role.key}
                          </code>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {role.permissions?.length || 0} permission
                          {(role.permissions?.length || 0) === 1 ? '' : 's'}
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1.5 text-sm text-gray-700">
                            <Users className="w-3.5 h-3.5 text-gray-400" />
                            {role.userCount || 0}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              role.status === 'Active'
                                ? 'bg-green-50 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {role.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => openEditRoleModal(role)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit role"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRole(role)}
                              disabled={role.isSystem}
                              className={`p-2 rounded-lg transition-colors ${
                                role.isSystem
                                  ? 'text-gray-300 cursor-not-allowed'
                                  : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                              }`}
                              title={
                                role.isSystem
                                  ? 'System roles cannot be deleted'
                                  : 'Delete role'
                              }
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
          </div>
        </>
      )}

      {activeTab === 'users' && (
        <>
          <div className="mb-4 relative max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Mobile
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-500 text-sm">
                        No users found. Click Create User to add one.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold text-xs">
                              {user.firstName?.charAt(0)}
                              {user.lastName?.charAt(0)}
                            </div>
                            <span className="font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-500">{user.email}</td>
                        <td className="py-4 px-6 text-sm text-gray-500">{user.mobile || '—'}</td>
                        <td className="py-4 px-6">
                          {editingUserId === user._id ? (
                            <select
                              value={selectedUserRole}
                              onChange={(e) => setSelectedUserRole(e.target.value)}
                              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-black focus:border-black block w-full max-w-xs p-2.5"
                            >
                              {activeRoleOptions.map((role) => (
                                <option key={role.key} value={role.key}>
                                  {role.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${roleBadgeClass(
                                user.role
                              )}`}
                            >
                              {user.role?.replace(/_/g, ' ')}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {editingUserId === user._id ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleSaveUserRole(user._id)}
                                  className="px-3 py-1.5 text-xs font-medium bg-black text-white rounded-lg hover:bg-gray-800"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingUserId(null);
                                    setSelectedUserRole('');
                                  }}
                                  className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingUserId(user._id);
                                    setSelectedUserRole(user.role || 'customer');
                                  }}
                                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Change role"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteUser(user)}
                                  disabled={currentUserId === user._id}
                                  className={`p-2 rounded-lg transition-colors ${
                                    currentUserId === user._id
                                      ? 'text-gray-300 cursor-not-allowed'
                                      : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                                  }`}
                                  title={
                                    currentUserId === user._id
                                      ? 'Cannot delete your own account'
                                      : 'Delete user'
                                  }
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Create / Edit Role Modal — scrollable body */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="min-h-full flex items-start sm:items-center justify-center p-4">
            <button
              type="button"
              aria-label="Close overlay"
              className="fixed inset-0 bg-black/40"
              onClick={closeRoleModal}
            />
            <div className="relative bg-white w-full max-w-3xl rounded-xl shadow-xl flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {editingId ? 'Edit Role' : 'Create Role'}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Define access with module permissions
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeRoleModal}
                  disabled={savingRole}
                  className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRoleSubmit} className="flex flex-col min-h-0 flex-1 overflow-hidden">
                <div className="px-6 py-5 space-y-5 overflow-y-auto overscroll-contain flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Role name *
                      </label>
                      <input
                        type="text"
                        value={roleForm.name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="e.g. Content Editor"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Role key *
                      </label>
                      <input
                        type="text"
                        value={roleForm.key}
                        onChange={(e) => {
                          setKeyManual(true);
                          setRoleForm((prev) => ({
                            ...prev,
                            key: slugifyRoleKey(e.target.value),
                          }));
                        }}
                        disabled={Boolean(
                          editingId && roles.find((r) => r._id === editingId)?.isSystem
                        )}
                        placeholder="content_editor"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-black focus:border-black disabled:bg-gray-50 disabled:text-gray-500"
                        required
                      />
                      <p className="text-[11px] text-gray-400 mt-1">
                        Lowercase key used in the database (system keys are locked)
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Description
                    </label>
                    <textarea
                      value={roleForm.description}
                      onChange={(e) =>
                        setRoleForm((prev) => ({ ...prev, description: e.target.value }))
                      }
                      rows={2}
                      maxLength={300}
                      placeholder="Short note about what this role can do"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Status
                    </label>
                    <select
                      value={roleForm.status}
                      onChange={(e) =>
                        setRoleForm((prev) => ({ ...prev, status: e.target.value }))
                      }
                      className="w-full md:w-48 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-sm font-medium text-gray-800">Permissions</h3>
                        <p className="text-xs text-gray-500">
                          {roleForm.permissions.length} selected
                          {roleForm.key === 'super_admin'
                            ? ' · Super Admin always has full access'
                            : ''}
                        </p>
                      </div>
                      {roleForm.key !== 'super_admin' && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={selectAllPermissions}
                            className="text-xs text-gray-600 hover:text-black px-2 py-1 rounded hover:bg-gray-100"
                          >
                            Select all
                          </button>
                          <button
                            type="button"
                            onClick={clearPermissions}
                            className="text-xs text-gray-600 hover:text-black px-2 py-1 rounded hover:bg-gray-100"
                          >
                            Clear
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 pb-2">
                      {PERMISSION_MODULES.map((module) => {
                        const keys = module.permissions.map((p) => p.key);
                        const selectedCount = keys.filter((k) =>
                          roleForm.permissions.includes(k)
                        ).length;
                        const allSelected = selectedCount === keys.length;

                        return (
                          <div
                            key={module.key}
                            className="border border-gray-200 rounded-lg overflow-hidden"
                          >
                            <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50">
                              <label className="flex items-center gap-2 text-sm font-medium text-gray-800 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={allSelected}
                                  disabled={roleForm.key === 'super_admin'}
                                  onChange={() => toggleModule(module)}
                                  className="rounded border-gray-300"
                                />
                                {module.label}
                              </label>
                              <span className="text-xs text-gray-500">
                                {selectedCount}/{keys.length}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 p-3">
                              {module.permissions.map((perm) => (
                                <label
                                  key={perm.key}
                                  className="flex items-center gap-2 text-sm text-gray-700 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={roleForm.permissions.includes(perm.key)}
                                    disabled={roleForm.key === 'super_admin'}
                                    onChange={() => togglePermission(perm.key)}
                                    className="rounded border-gray-300"
                                  />
                                  {perm.label}
                                </label>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-white shrink-0">
                  <button
                    type="button"
                    onClick={closeRoleModal}
                    disabled={savingRole}
                    className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingRole}
                    className="px-5 py-2.5 text-sm font-medium bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-60"
                  >
                    {savingRole ? 'Saving...' : editingId ? 'Update Role' : 'Create Role'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal — scrollable body */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="min-h-full flex items-start sm:items-center justify-center p-4">
            <button
              type="button"
              aria-label="Close overlay"
              className="fixed inset-0 bg-black/40"
              onClick={closeUserModal}
            />
            <div className="relative bg-white w-full max-w-3xl rounded-xl shadow-xl flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Create User</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Add a user and assign a role
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeUserModal}
                  disabled={savingUser}
                  className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={handleUserSubmit}
                className="flex flex-col min-h-0 flex-1 overflow-hidden"
              >
                <div className="px-6 py-5 space-y-5 overflow-y-auto overscroll-contain flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        First name *
                      </label>
                      <input
                        type="text"
                        value={userForm.firstName}
                        onChange={(e) =>
                          setUserForm((prev) => ({ ...prev, firstName: e.target.value }))
                        }
                        placeholder="e.g. Rakib"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Last name *
                      </label>
                      <input
                        type="text"
                        value={userForm.lastName}
                        onChange={(e) =>
                          setUserForm((prev) => ({ ...prev, lastName: e.target.value }))
                        }
                        placeholder="e.g. Hasan"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={userForm.email}
                        onChange={(e) =>
                          setUserForm((prev) => ({ ...prev, email: e.target.value }))
                        }
                        placeholder="user@shilpalay.com"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Mobile *
                      </label>
                      <input
                        type="text"
                        value={userForm.mobile}
                        onChange={(e) =>
                          setUserForm((prev) => ({ ...prev, mobile: e.target.value }))
                        }
                        placeholder="01XXXXXXXXX"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Password *
                      </label>
                      <input
                        type="password"
                        value={userForm.password}
                        onChange={(e) =>
                          setUserForm((prev) => ({ ...prev, password: e.target.value }))
                        }
                        placeholder="Minimum 6 characters"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                        required
                        minLength={6}
                      />
                      <p className="text-[11px] text-gray-400 mt-1">
                        Share this password with the user after creating
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Gender
                      </label>
                      <select
                        value={userForm.gender}
                        onChange={(e) =>
                          setUserForm((prev) => ({ ...prev, gender: e.target.value }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                      >
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-sm font-medium text-gray-800">Role</h3>
                        <p className="text-xs text-gray-500">
                          Access is granted from the selected role&apos;s permissions
                        </p>
                      </div>
                    </div>

                    <select
                      value={userForm.role}
                      onChange={(e) =>
                        setUserForm((prev) => ({ ...prev, role: e.target.value }))
                      }
                      className="w-full md:w-64 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                      required
                    >
                      {activeRoleOptions.length === 0 ? (
                        <option value="">No active roles</option>
                      ) : (
                        activeRoleOptions.map((role) => (
                          <option key={role.key} value={role.key}>
                            {role.name}
                          </option>
                        ))
                      )}
                    </select>

                    {selectedRoleForUser && (
                      <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50">
                          <span className="text-sm font-medium text-gray-800">
                            {selectedRoleForUser.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {selectedRoleForUser.permissions?.length || 0} permissions
                          </span>
                        </div>
                        <div className="p-3 text-xs text-gray-600">
                          {selectedRoleForUser.description ||
                            'No description added for this role.'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-white shrink-0">
                  <button
                    type="button"
                    onClick={closeUserModal}
                    disabled={savingUser}
                    className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingUser || activeRoleOptions.length === 0}
                    className="px-5 py-2.5 text-sm font-medium bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-60"
                  >
                    {savingUser ? 'Saving...' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
