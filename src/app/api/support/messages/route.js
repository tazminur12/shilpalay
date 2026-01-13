import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import CustomerMessage from '@/models/CustomerMessage';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');

    let query = {};

    if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    if (priority) {
      query.priority = priority;
    }

    const messages = await CustomerMessage.find(query)
      .populate('assignedTo', 'name email')
      .populate('orderId', 'orderNumber')
      .populate('productId', 'name')
      .populate('replies.repliedBy', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching customer messages:', error);
    return NextResponse.json(
      { message: 'Failed to fetch customer messages', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const message = new CustomerMessage(body);
    await message.save();

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Error creating customer message:', error);
    return NextResponse.json(
      { message: 'Failed to create customer message', error: error.message },
      { status: 500 }
    );
  }
}
