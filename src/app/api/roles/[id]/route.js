import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import authOptions from '@/lib/auth';
import connectDB from '@/lib/db';
import Role from '@/models/Role';
import User from '@/models/User';
import { ALL_PERMISSION_KEYS, normalizePermissions, slugifyRoleKey } from '@/lib/permissions';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  if (!session || !['super_admin', 'admin'].includes(role)) {
    return null;
  }
  return session;
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

export async function GET(req, { params }) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid role id.' }, { status: 400 });
    }

    await connectDB();
    const role = await Role.findById(id);
    if (!role) {
      return NextResponse.json({ message: 'Role not found' }, { status: 404 });
    }

    const userCount = await User.countDocuments({ role: role.key });
    return NextResponse.json(serializeRole(role, userCount));
  } catch (error) {
    console.error('Failed to fetch role:', error);
    return NextResponse.json({ message: 'Failed to fetch role' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid role id.' }, { status: 400 });
    }

    const body = await req.json();
    const name = String(body.name || '').trim();
    const description = String(body.description || '').trim().slice(0, 300);
    const status = body.status === 'Inactive' ? 'Inactive' : 'Active';

    if (!name) {
      return NextResponse.json({ message: 'Role name is required.' }, { status: 400 });
    }

    await connectDB();
    const role = await Role.findById(id);
    if (!role) {
      return NextResponse.json({ message: 'Role not found' }, { status: 404 });
    }

    const previousKey = role.key;
    let nextKey = role.key;

    // System role keys stay fixed; custom roles can rename key carefully
    if (!role.isSystem && body.key) {
      nextKey = slugifyRoleKey(body.key);
      if (!nextKey) {
        return NextResponse.json({ message: 'Role key is required.' }, { status: 400 });
      }
      if (nextKey !== previousKey) {
        const clash = await Role.findOne({ key: nextKey, _id: { $ne: id } });
        if (clash) {
          return NextResponse.json(
            { message: `Role key "${nextKey}" already exists.` },
            { status: 400 }
          );
        }
      }
    }

    let permissions = normalizePermissions(body.permissions);
    if (role.key === 'super_admin') {
      permissions = [...ALL_PERMISSION_KEYS];
    }

    role.name = name;
    role.description = description;
    role.status = status;
    role.permissions = permissions;
    role.key = nextKey;
    await role.save();

    // Keep assigned users in sync if custom role key changed
    if (previousKey !== nextKey) {
      await User.updateMany({ role: previousKey }, { $set: { role: nextKey } });
    }

    const userCount = await User.countDocuments({ role: role.key });
    return NextResponse.json(serializeRole(role, userCount));
  } catch (error) {
    console.error('Failed to update role:', error);
    if (error?.code === 11000) {
      return NextResponse.json({ message: 'Role key already exists.' }, { status: 400 });
    }
    return NextResponse.json(
      { message: error.message || 'Failed to update role' },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid role id.' }, { status: 400 });
    }

    await connectDB();
    const role = await Role.findById(id);
    if (!role) {
      return NextResponse.json({ message: 'Role not found' }, { status: 404 });
    }

    if (role.isSystem) {
      return NextResponse.json(
        { message: 'System roles cannot be deleted.' },
        { status: 400 }
      );
    }

    const userCount = await User.countDocuments({ role: role.key });
    if (userCount > 0) {
      return NextResponse.json(
        {
          message: `Cannot delete role. ${userCount} user(s) still assigned. Reassign them first.`,
        },
        { status: 400 }
      );
    }

    await Role.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Failed to delete role:', error);
    return NextResponse.json({ message: 'Failed to delete role' }, { status: 500 });
  }
}
