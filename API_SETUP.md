# API Configuration Setup Guide

## Overview

All hardcoded `http://localhost:8000` URLs in the admin codebase have been replaced with environment variable references using `process.env.NEXT_PUBLIC_API_URL`.

## Setup Instructions

### 1. Create Environment File

Create a `.env.local` file in the `eyey-admin` directory with the following content:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Environment
NODE_ENV=development
```

### 2. Environment Variables Explained

- **NEXT_PUBLIC_API_URL**: The base URL for your backend API
  - Development: `http://localhost:8000`
  - Production: `https://your-production-domain.com`

### 3. Files Updated

The following files have been updated to use the environment variable:

#### Admin Dashboard Files:

- `app/dashboard/add-product/page.js`
- `app/dashboard/customers/page.js`
- `app/dashboard/coupons/page.js`
- `app/dashboard/view-products/page.js`
- `app/dashboard/layout.js`
- `app/dashboard/orders/page.js` (already had environment variable)
- `app/dashboard/shipping/states/page.js`
- `app/dashboard/shipping/locations/page.js`
- `app/dashboard/shipping/locations/add/page.js`
- `app/login/page.js`

#### Configuration:

- `config.js` - Centralized API configuration

### 4. Usage Pattern

All API calls now use this pattern:

```javascript
const res = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/endpoint`,
  {
    // ... fetch options
  }
);
```

### 5. Fallback Behavior

If `NEXT_PUBLIC_API_URL` is not set, the system will fallback to `http://localhost:8000` for backward compatibility.

### 6. Production Deployment

For production deployment, set the environment variable to your production API URL:

```bash
NEXT_PUBLIC_API_URL=https://your-production-api.com
```

### 7. Testing

After setting up the environment variable:

1. Restart your development server:

   ```bash
   npm run dev
   ```

2. Test the admin dashboard functionality to ensure all API calls work correctly.

### 8. Benefits

- ✅ **Environment Flexibility**: Easy switching between development and production
- ✅ **Centralized Configuration**: All API URLs managed in one place
- ✅ **Backward Compatibility**: Fallback to localhost if env var not set
- ✅ **Production Ready**: No hardcoded URLs in production code

### 9. Next Steps

You can now:

1. Set different API URLs for different environments
2. Deploy to production with the correct API endpoint
3. Use the centralized `config.js` for additional API configuration

## Troubleshooting

If you encounter issues:

1. **Check Environment File**: Ensure `.env.local` exists and has the correct variable name
2. **Restart Server**: Restart the development server after adding environment variables
3. **Check Variable Name**: Ensure you're using `NEXT_PUBLIC_API_URL` (not `API_URL`)
4. **Verify Fallback**: The fallback URL should work if the environment variable is missing
