# Environment Variables Setup Guide

This guide will help you set up all required environment variables for the Shilpalay e-commerce platform.

## Quick Start

1. Copy the example file:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your actual values in `.env.local`

3. Restart your development server

## Required Variables

### 🔴 Critical (Required for Basic Functionality)

#### 1. Database (MongoDB)
```env
MONGO_URI=mongodb://localhost:27017/shilpalay
```

**How to get:**
- **Local MongoDB**: Use `mongodb://localhost:27017/shilpalay`
- **MongoDB Atlas** (Cloud):
  1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
  2. Create a free cluster
  3. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/shilpalay?retryWrites=true&w=majority`
  4. Replace `username` and `password` with your credentials

#### 2. NextAuth Secret
```env
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

**How to generate:**
- **Linux/Mac**: `openssl rand -base64 32`
- **Online**: https://generate-secret.vercel.app/32
- **Windows**: Use PowerShell: `[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))`

**Important**: Use different secrets for development and production!

#### 3. Cloudinary (Image Upload)
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**How to get:**
1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Go to Dashboard
3. Copy your:
   - Cloud name
   - API Key
   - API Secret

**Note**: `NEXT_PUBLIC_*` variables are exposed to the browser. Only use for non-sensitive values.

#### 4. Site URL
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

- **Development**: `http://localhost:3000`
- **Production**: `https://yourdomain.com`

## Optional Variables (For Future Features)

### Email Configuration
When implementing email notifications:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@shilpalay.com
```

**Gmail Setup:**
1. Enable 2-factor authentication
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use the app password (not your regular password)

### SMS Configuration
When implementing SMS notifications:
```env
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

### Payment Gateway
When implementing payments:

**SSLCommerz (Bangladesh):**
```env
SSLCOMMERZ_STORE_ID=your-store-id
SSLCOMMERZ_STORE_PASSWORD=your-store-password
SSLCOMMERZ_IS_SANDBOX=true
```

**Stripe:**
```env
STRIPE_PUBLIC_KEY=pk_test_your_key
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
```

**bKash:**
```env
BKASH_APP_KEY=your-app-key
BKASH_APP_SECRET=your-app-secret
BKASH_USERNAME=your-username
BKASH_PASSWORD=your-password
BKASH_IS_SANDBOX=true
```

## Environment-Specific Files

Next.js supports multiple environment files:

- `.env` - Default (loaded in all environments)
- `.env.local` - Local overrides (ignored by git)
- `.env.development` - Development only
- `.env.production` - Production only

**Recommended**: Use `.env.local` for your actual values (it's in `.gitignore`)

## Security Best Practices

1. ✅ **Never commit `.env.local`** to version control
2. ✅ **Use different secrets** for development and production
3. ✅ **Rotate secrets** periodically
4. ✅ **Use strong secrets** (at least 32 characters)
5. ✅ **Limit access** to production environment variables
6. ✅ **Use environment-specific files** for different deployments

## Verification

After setting up, verify your configuration:

1. **Database**: Check console for connection success
2. **NextAuth**: Try logging in
3. **Cloudinary**: Try uploading an image
4. **Site URL**: Check metadata in page source

## Troubleshooting

### Database Connection Error
- Check MongoDB is running: `mongosh` or check MongoDB Atlas cluster status
- Verify connection string format
- Check network/firewall settings

### NextAuth Error
- Ensure `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your current URL
- Clear browser cookies and try again

### Cloudinary Upload Fails
- Verify all three Cloudinary variables are set
- Check API key permissions in Cloudinary dashboard
- Verify file size limits (max 10MB)

### Environment Variables Not Loading
- Restart your development server after changing `.env` files
- Ensure variable names match exactly (case-sensitive)
- Check for typos in variable names

## Production Deployment

### Vercel
1. Go to Project Settings → Environment Variables
2. Add each variable
3. Redeploy

### Other Platforms
- Add environment variables in your hosting platform's dashboard
- Ensure all required variables are set
- Use production values (not development)

## Support

If you encounter issues:
1. Check this guide
2. Verify all required variables are set
3. Check server logs for specific errors
4. Ensure `.env.local` file exists and is properly formatted

---

**Last Updated**: $(date)
**Version**: 1.0
