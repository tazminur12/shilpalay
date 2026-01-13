import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import EmailTemplate from '@/models/EmailTemplate';
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

    const templates = await EmailTemplate.find(query).sort({ createdAt: -1 });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching email templates:', error);
    return NextResponse.json(
      { message: 'Failed to fetch email templates', error: error.message },
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
    const existingTemplate = await EmailTemplate.findOne({ name: body.name });
    if (existingTemplate) {
      return NextResponse.json(
        { message: 'A template with this name already exists' },
        { status: 400 }
      );
    }

    const template = new EmailTemplate(body);
    await template.save();

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Error creating email template:', error);
    return NextResponse.json(
      { message: 'Failed to create email template', error: error.message },
      { status: 500 }
    );
  }
}
