import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

const ALLOWED_EXTENSIONS = new Set([
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
  'avif',
  'bmp',
  'svg',
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function isImageFile(file) {
  if (file?.type && file.type.startsWith('image/')) return true;
  const name = typeof file?.name === 'string' ? file.name : '';
  const ext = name.split('.').pop()?.toLowerCase();
  return ext ? ALLOWED_EXTENSIONS.has(ext) : false;
}

function sanitizeFolder(folder) {
  const cleaned = String(folder || '')
    .replace(/[^a-zA-Z0-9/_-]/g, '')
    .replace(/^\/+|\/+$/g, '');
  if (!cleaned.startsWith('shilpalay/')) {
    return 'shilpalay/banners';
  }
  return cleaned.slice(0, 80);
}

export async function POST(req) {
  try {
    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        {
          message: 'Cloudinary configuration missing',
          error:
            'Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, NEXT_PUBLIC_CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET',
        },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file');
    const folder = sanitizeFolder(formData.get('folder') || 'shilpalay/banners');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ message: 'No file provided' }, { status: 400 });
    }

    if (!isImageFile(file)) {
      return NextResponse.json(
        { message: 'Invalid file type. Please upload an image (JPG, PNG, WebP, GIF).' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: 'File size too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          overwrite: false,
          unique_filename: true,
          // Keep uploads reasonably sized for banners/products
          transformation: [{ width: 2400, crop: 'limit', quality: 'auto:good', fetch_format: 'auto' }],
        },
        (error, uploaded) => {
          if (error) reject(error);
          else resolve(uploaded);
        }
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json({
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    console.error('Upload error:', error);

    let message = 'Failed to upload image';
    if (error?.http_code === 401) {
      message = `Invalid Cloudinary credentials. Please check cloud_name (${cloudName}), API key, and API secret.`;
    } else if (error?.message) {
      message = error.message;
    }

    return NextResponse.json(
      {
        message,
        error: error?.message || 'Unknown error',
        http_code: error?.http_code,
      },
      { status: 500 }
    );
  }
}
