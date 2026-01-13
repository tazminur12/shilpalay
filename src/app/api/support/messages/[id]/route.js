import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import CustomerMessage from '@/models/CustomerMessage';
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
        { message: 'Invalid message ID' },
        { status: 400 }
      );
    }

    const message = await CustomerMessage.findById(id)
      .populate('assignedTo', 'name email')
      .populate('orderId', 'orderNumber')
      .populate('productId', 'name')
      .populate('replies.repliedBy', 'name email');

    if (!message) {
      return NextResponse.json(
        { message: 'Message not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error fetching customer message:', error);
    return NextResponse.json(
      { message: 'Failed to fetch customer message', error: error.message },
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
        { message: 'Invalid message ID' },
        { status: 400 }
      );
    }

    // Handle reply addition
    if (body.reply) {
      const message = await CustomerMessage.findByIdAndUpdate(
        id,
        {
          $push: {
            replies: {
              message: body.reply,
              repliedBy: session.user.id,
              repliedAt: new Date(),
            }
          },
          $set: { status: 'replied' }
        },
        { new: true }
      ).populate('replies.repliedBy', 'name email');

      return NextResponse.json(message);
    }

    // Regular update
    const message = await CustomerMessage.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email')
     .populate('replies.repliedBy', 'name email');

    if (!message) {
      return NextResponse.json(
        { message: 'Message not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error updating customer message:', error);
    return NextResponse.json(
      { message: 'Failed to update customer message', error: error.message },
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
        { message: 'Invalid message ID' },
        { status: 400 }
      );
    }

    const message = await CustomerMessage.findByIdAndDelete(id);

    if (!message) {
      return NextResponse.json(
        { message: 'Message not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Customer message deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer message:', error);
    return NextResponse.json(
      { message: 'Failed to delete customer message', error: error.message },
      { status: 500 }
    );
  }
}
