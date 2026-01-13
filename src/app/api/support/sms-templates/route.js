import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import SMSTemplate from '@/models/SMSTemplate';
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
    const templateType = searchParams.get('templateType');
    const status = searchParams.get('status');

    let query = {};

    if (templateType) {
      query.templateType = templateType;
    }

    if (status) {
      query.status = status;
    }

    const templates = await SMSTemplate.find(query).sort({ createdAt: -1 });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching SMS templates:', error);
    return NextResponse.json(
      { message: 'Failed to fetch SMS templates', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await req.json();

    // Check if template name already exists
    const existingTemplate = await SMSTemplate.findOne({ name: body.name });
    if (existingTemplate) {
      return NextResponse.json(
        { message: 'A template with this name already exists' },
        { status: 400 }
      );
    }

    // Validate message length
    if (body.message && body.message.length > 160) {
      return NextResponse.json(
        { message: 'SMS message cannot exceed 160 characters' },
        { status: 400 }
      );
    }

    const template = new SMSTemplate(body);
    await template.save();

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Error creating SMS template:', error);
    return NextResponse.json(
      { message: 'Failed to create SMS template', error: error.message },
      { status: 500 }
    );
  }
}
