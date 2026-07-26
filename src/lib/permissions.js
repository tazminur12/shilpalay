/**
 * Permission catalog for Roles & Permissions management.
 * Keys are stored on Role.permissions and can be checked later in the app.
 */

export const PERMISSION_MODULES = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    permissions: [{ key: 'dashboard.view', label: 'View dashboard' }],
  },
  {
    key: 'products',
    label: 'Products',
    permissions: [
      { key: 'products.view', label: 'View products' },
      { key: 'products.create', label: 'Create products' },
      { key: 'products.edit', label: 'Edit products' },
      { key: 'products.delete', label: 'Delete products' },
    ],
  },
  {
    key: 'categories',
    label: 'Categories',
    permissions: [
      { key: 'categories.view', label: 'View categories' },
      { key: 'categories.manage', label: 'Create / edit / delete categories' },
    ],
  },
  {
    key: 'inventory',
    label: 'Inventory',
    permissions: [
      { key: 'inventory.view', label: 'View inventory' },
      { key: 'inventory.manage', label: 'Update stock & inventory' },
    ],
  },
  {
    key: 'orders',
    label: 'Orders',
    permissions: [
      { key: 'orders.view', label: 'View orders' },
      { key: 'orders.manage', label: 'Update / process orders' },
      { key: 'orders.cancel', label: 'Cancel orders' },
    ],
  },
  {
    key: 'customers',
    label: 'Customers',
    permissions: [
      { key: 'customers.view', label: 'View customers' },
      { key: 'customers.manage', label: 'Edit / manage customers' },
    ],
  },
  {
    key: 'content',
    label: 'Content & Banners',
    permissions: [
      { key: 'content.view', label: 'View content' },
      { key: 'content.manage', label: 'Manage banners, blogs & pages' },
    ],
  },
  {
    key: 'offers',
    label: 'Offers & Coupons',
    permissions: [
      { key: 'offers.view', label: 'View offers' },
      { key: 'offers.manage', label: 'Manage coupons, discounts & flash sales' },
    ],
  },
  {
    key: 'payments',
    label: 'Payments',
    permissions: [
      { key: 'payments.view', label: 'View transactions' },
      { key: 'payments.manage', label: 'Manage refunds & payments' },
    ],
  },
  {
    key: 'support',
    label: 'Support',
    permissions: [
      { key: 'support.view', label: 'View messages' },
      { key: 'support.manage', label: 'Reply & manage templates' },
    ],
  },
  {
    key: 'roles',
    label: 'Roles & Admin',
    permissions: [
      { key: 'roles.view', label: 'View roles' },
      { key: 'roles.manage', label: 'Create / edit / delete roles' },
      { key: 'users.assign_role', label: 'Assign roles to users' },
    ],
  },
  {
    key: 'settings',
    label: 'Settings',
    permissions: [
      { key: 'settings.view', label: 'View settings' },
      { key: 'settings.manage', label: 'Update site settings' },
    ],
  },
];

export const ALL_PERMISSION_KEYS = PERMISSION_MODULES.flatMap((m) =>
  m.permissions.map((p) => p.key)
);

export function slugifyRoleKey(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40);
}

export function normalizePermissions(permissions) {
  if (!Array.isArray(permissions)) return [];
  const allowed = new Set(ALL_PERMISSION_KEYS);
  return [...new Set(permissions.filter((p) => allowed.has(p)))];
}

/** Built-in roles seeded when the collection is empty */
export const DEFAULT_ROLES = [
  {
    name: 'Super Admin',
    key: 'super_admin',
    description: 'Full access to every module and setting.',
    permissions: [...ALL_PERMISSION_KEYS],
    status: 'Active',
    isSystem: true,
  },
  {
    name: 'Admin',
    key: 'admin',
    description: 'Manage store operations except deleting system roles.',
    permissions: ALL_PERMISSION_KEYS.filter((k) => k !== 'roles.manage'),
    status: 'Active',
    isSystem: true,
  },
  {
    name: 'Vendor',
    key: 'vendor',
    description: 'Manage own products and view related orders.',
    permissions: [
      'dashboard.view',
      'products.view',
      'products.create',
      'products.edit',
      'inventory.view',
      'orders.view',
    ],
    status: 'Active',
    isSystem: true,
  },
  {
    name: 'Inventory Manager',
    key: 'inventory_manager',
    description: 'Stock levels and inventory updates.',
    permissions: ['dashboard.view', 'products.view', 'inventory.view', 'inventory.manage'],
    status: 'Active',
    isSystem: true,
  },
  {
    name: 'Order Staff',
    key: 'order_staff',
    description: 'Process and update customer orders.',
    permissions: ['dashboard.view', 'orders.view', 'orders.manage', 'customers.view'],
    status: 'Active',
    isSystem: true,
  },
  {
    name: 'Delivery',
    key: 'delivery',
    description: 'View and update delivery-related order status.',
    permissions: ['dashboard.view', 'orders.view', 'orders.manage'],
    status: 'Active',
    isSystem: true,
  },
  {
    name: 'Accounts',
    key: 'accounts',
    description: 'Payments, refunds and financial views.',
    permissions: ['dashboard.view', 'payments.view', 'payments.manage', 'orders.view'],
    status: 'Active',
    isSystem: true,
  },
  {
    name: 'Customer Support',
    key: 'customer_support',
    description: 'Handle customer messages and support templates.',
    permissions: [
      'dashboard.view',
      'customers.view',
      'orders.view',
      'support.view',
      'support.manage',
    ],
    status: 'Active',
    isSystem: true,
  },
  {
    name: 'QC',
    key: 'qc',
    description: 'Quality control for products and inventory.',
    permissions: ['dashboard.view', 'products.view', 'products.edit', 'inventory.view'],
    status: 'Active',
    isSystem: true,
  },
  {
    name: 'Marketing Manager',
    key: 'marketing_manager',
    description: 'Banners, content, offers and campaigns.',
    permissions: [
      'dashboard.view',
      'content.view',
      'content.manage',
      'offers.view',
      'offers.manage',
    ],
    status: 'Active',
    isSystem: true,
  },
  {
    name: 'Customer',
    key: 'customer',
    description: 'Storefront customer account (no dashboard access).',
    permissions: [],
    status: 'Active',
    isSystem: true,
  },
];
