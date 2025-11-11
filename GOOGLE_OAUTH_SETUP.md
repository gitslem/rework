# Google OAuth Setup Guide

This application now uses Google OAuth for authentication. Follow these steps to set it up.

## Prerequisites

- A Google Cloud Platform account
- Access to Google Cloud Console

## Setup Steps

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project ID

### 2. Enable Google+ API

1. In the Cloud Console, go to **APIs & Services > Library**
2. Search for "Google+ API" or "Google Identity"
3. Click **Enable**

### 3. Create OAuth 2.0 Credentials

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth client ID**
3. If prompted, configure the OAuth consent screen:
   - Choose **External** for user type (or Internal if using Google Workspace)
   - Fill in the required fields (app name, support email, etc.)
   - Add scopes: `email`, `profile`, `openid`
   - Save and continue
4. Create OAuth client ID:
   - Application type: **Web application**
   - Name: "Remote Works" (or your app name)
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - Add your production URL when ready
   - Authorized redirect URIs:
     - `http://localhost:3000` (for development)
     - Add your production URL when ready
5. Click **Create**
6. Copy the **Client ID** and **Client Secret**

### 4. Configure Environment Variables

#### Frontend (.env.local or .env)

Create `/frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
```

#### Backend (.env)

Create `/backend/.env`:

```env
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///./remoteworks.db
```

### 5. Run the Application

#### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

The backend will run on `http://localhost:8000`

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:3000`

### 6. Test the Authentication

1. Navigate to `http://localhost:3000/login`
2. Click "Sign in with Google"
3. Select your Google account
4. Grant permissions
5. You should be redirected to the dashboard

## Features

### What's New

- **Google OAuth Login**: Users can now sign in with their Google account
- **Google OAuth Registration**: New users can register using Google
- **Automatic Profile Creation**: User profiles are created automatically upon Google sign-in
- **No Password Required**: OAuth users don't need to set or remember passwords
- **Role Selection**: During registration, users can choose their role (Freelancer, Agent, or Business)

### Security Features

- JWT token-based authentication
- Automatic token refresh
- Google token verification
- Secure session management

## Database Changes

The following changes were made to support Google OAuth:

### User Model Updates

- Added `google_id` field (nullable, unique)
- Made `hashed_password` field nullable (for OAuth users)
- Google OAuth users have `is_verified=True` by default

## API Endpoints

### New Endpoint

**POST** `/api/v1/auth/google`

Request body:
```json
{
  "token": "google-oauth-token",
  "role": "freelancer"  // optional, defaults to "freelancer"
}
```

Response:
```json
{
  "access_token": "jwt-access-token",
  "refresh_token": "jwt-refresh-token",
  "token_type": "bearer"
}
```

### Existing Endpoints (Still Available)

- **POST** `/api/v1/auth/register` - Traditional email/password registration
- **POST** `/api/v1/auth/login` - Traditional email/password login
- **POST** `/api/v1/auth/refresh` - Refresh access token

## Troubleshooting

### "Google login failed"

1. Check that `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set in frontend
2. Verify the Client ID is correct
3. Ensure JavaScript origins are configured in Google Cloud Console
4. Check browser console for detailed errors

### "Invalid Google token"

1. Verify `GOOGLE_CLIENT_ID` is set in backend .env
2. Ensure the Client ID matches between frontend and backend
3. Check that the Google+ API is enabled

### "Token verification failed"

1. Make sure both `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
2. Verify the credentials are from the same OAuth client
3. Check backend logs for detailed error messages

### Database Errors

If you encounter database errors after updating:

```bash
cd backend
# For SQLite (development)
rm remoteworks.db
python -c "from app.db.database import engine, Base; from app.models.models import *; Base.metadata.create_all(bind=engine)"

# For PostgreSQL (production)
# Run migrations or recreate tables as needed
```

## Production Deployment

Before deploying to production:

1. Update authorized JavaScript origins and redirect URIs in Google Cloud Console
2. Set production environment variables
3. Use HTTPS for all URLs
4. Generate a secure `SECRET_KEY`
5. Use PostgreSQL instead of SQLite
6. Enable additional security features as needed

## Support

For issues or questions, please refer to:
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [React OAuth Google Docs](https://www.npmjs.com/package/@react-oauth/google)
- Project issue tracker
