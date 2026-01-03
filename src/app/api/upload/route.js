import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Get environment variables
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

// Validate environment variables
if (!cloudName || !apiKey || !apiSecret) {
  console.error('Missing Cloudinary environment variables');
}

// Configure Cloudinary - cloud_name is case-sensitive, so use as provided
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

export async function POST(req) {
  try {
    // Check if environment variables are set
    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { 
          message: 'Cloudinary configuration missing', 
          error: 'Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, NEXT_PUBLIC_CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment variables'
        },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { message: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { message: 'Invalid file type. Please upload an image.' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { message: 'File size too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'shilpalay/categories',
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            // Provide more helpful error messages
            let errorMessage = 'Failed to upload image';
            if (error.http_code === 401) {
              errorMessage = `Invalid Cloudinary credentials. Please check your cloud_name (current: ${cloudName}), API key, and API secret.`;
            } else if (error.message) {
              errorMessage = error.message;
            }
            reject(
              NextResponse.json(
                { 
                  message: errorMessage, 
                  error: error.message || 'Unknown error',
                  http_code: error.http_code
                },
                { status: 500 }
              )
            );
          } else {
            resolve(
              NextResponse.json({
                url: result.secure_url,
                public_id: result.public_id,
              })
            );
          }
        }
      );

      uploadStream.end(buffer);
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { message: 'Failed to upload image', error: error.message },
      { status: 500 }
    );
  }
}

