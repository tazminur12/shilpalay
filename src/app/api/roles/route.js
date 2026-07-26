import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';
import connectDB from '@/lib/db';
import Role from '@/models/Role';
import User from '@/models/User';
import {
  DEFAULT_ROLES,
  normalizePermissions,
  slugifyRoleKey,
} from '@/lib/permissions';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  if (!session || !['super_admin', 'admin'].includes(role)) {
    return null;
  }
  return session;
}

async function ensureDefaultRoles() {
  const count = await Role.countDocuments();
  if (count > 0) return;
  await Role.insertMany(DEFAULT_ROLES);
}

function serializeRole(role, userCount = 0) {
  return {
    _id: role._id.toString(),
    name: role.name,
    key: role.key,
    description: role.description || '',
    permissions: role.permissions || [],
    status: role.status,
    isSystem: Boolean(role.isSystem),
    userCount,
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
  };
}

export async function GET() {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    await ensureDefaultRoles();

    const roles = await Role.find().sort({ isSystem: -1, name: 1 }).lean();
    const keys = roles.map((r) => r.key);
    const counts = await User.aggregate([
      { $match: { role: { $in: keys } } },
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(counts.map((c) => [c._id, c.count]));

    return NextResponse.json(
      roles.map((role) => serializeRole(role, countMap[role.key] || 0))
    );
  } catch (error) {
    console.error('Failed to fetch roles:', error);
    return NextResponse.json({ message: 'Failed to fetch roles' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const name = String(body.name || '').trim();
    const description = String(body.description || '').trim().slice(0, 300);
    const status = body.status === 'Inactive' ? 'Inactive' : 'Active';
    const key = slugifyRoleKey(body.key || name);
    const permissions = normalizePermissions(body.permissions);

    if (!name) {
      return NextResponse.json({ message: 'Role name is required.' }, { status: 400 });
    }
    if (!key) {
      return NextResponse.json({ message: 'Role key is required.' }, { status: 400 });
    }

    await connectDB();

    const existing = await Role.findOne({ key });
    if (existing) {
      return NextResponse.json(
        { message: `Role key "${key}" already exists.` },
        { status: 400 }
      );
    }

    const role = await Role.create({
      name,
      key,
      description,
      permissions,
      status,
      isSystem: false,
    });

    return NextResponse.json(serializeRole(role, 0), { status: 201 });
  } catch (error) {
    console.error('Failed to create role:', error);
    if (error?.code === 11000) {
      return NextResponse.json({ message: 'Role key already exists.' }, { status: 400 });
    }
    return NextResponse.json(
      { message: error.message || 'Failed to create role' },
      { status: 500 }
    );
  }
}
