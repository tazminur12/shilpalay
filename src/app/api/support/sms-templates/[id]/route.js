import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import SMSTemplate from '@/models/SMSTemplate';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid template ID' },
        { status: 400 }
      );
    }

    const template = await SMSTemplate.findById(id);

    if (!template) {
      return NextResponse.json(
        { message: 'SMS template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error fetching SMS template:', error);
    return NextResponse.json(
      { message: 'Failed to fetch SMS template', error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = params;
    const body = await req.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid template ID' },
        { status: 400 }
      );
    }

    // Check if name already exists for another template
    if (body.name) {
      const existingTemplate = await SMSTemplate.findOne({
        name: body.name,
        _id: { $ne: id }
      });
      if (existingTemplate) {
        return NextResponse.json(
          { message: 'A template with this name already exists' },
          { status: 400 }
        );
      }
    }

    // Validate message length
    if (body.message && body.message.length > 160) {
      return NextResponse.json(
        { message: 'SMS message cannot exceed 160 characters' },
        { status: 400 }
      );
    }

    const template = await SMSTemplate.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );

    if (!template) {
      return NextResponse.json(
        { message: 'SMS template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error updating SMS template:', error);
    return NextResponse.json(
      { message: 'Failed to update SMS template', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid template ID' },
        { status: 400 }
      );
    }

    const template = await SMSTemplate.findByIdAndDelete(id);

    if (!template) {
      return NextResponse.json(
        { message: 'SMS template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'SMS template deleted successfully' });
  } catch (error) {
    console.error('Error deleting SMS template:', error);
    return NextResponse.json(
      { message: 'Failed to delete SMS template', error: error.message },
      { status: 500 }
    );
  }
}
