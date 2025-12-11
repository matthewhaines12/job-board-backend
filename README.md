# Job Board Backend

A full-featured REST API backend for a job board application built with Node.js, Express, and MongoDB. Features JWT authentication, email verification, job search with advanced filtering, and external job data fetching from RapidAPI.

## Features

- **User Authentication**
  - JWT-based authentication with access and refresh tokens
  - Email verification system
  - Secure password hashing with bcrypt
  - Password requirements enforcement
- **Job Management**
  - Advanced job search with multiple filters (location, salary, remote, etc.)
  - Pagination support
  - Job statistics and analytics
  - Fetch fresh jobs from external API (JSearch via RapidAPI)
- **User Features**
  - Save/bookmark jobs
  - View saved jobs

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- RapidAPI account with JSearch API access
- Gmail account (for email verification) or other SMTP service

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd job-board-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory (use `.env.example` as template):

   ```env
   RAPIDAPI_KEY=your_rapidapi_key_here
   MONGO_URI=your_mongodb_connection_string
   CLIENT_URL=http://localhost:5173
   PORT=3001
   ACCESS_TOKEN_SECRET=your_random_secret_string
   REFRESH_TOKEN_SECRET=your_random_secret_string
   EMAIL_TOKEN_SECRET=your_random_secret_string
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_app_password
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=465
   EMAIL_SECURE=true
   NODE_ENV=development
   ```

4. **Generate JWT secrets** (optional - for better security)
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
   Run this command three times to generate secrets for ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, and EMAIL_TOKEN_SECRET.

## Running the Application

**Development mode** (with auto-restart):

```bash
npm run dev
```

The server will start on `http://localhost:3001` (or your specified PORT).

## API Endpoints

### Health Check

- `GET /health` - Check server status

### Jobs (`/api/jobs`)

- `GET /` - Get jobs with filtering and pagination
  - Query params: `query`, `location`, `sort_by`, `employment_type`, `remote`, `min_salary`, `max_salary`, `date_posted`, `experience`, `field`, `deadline`, `type`, `limit`, `page`
- `GET /count` - Get total job count
- `GET /stats` - Get job statistics
- `POST /fetch` - Fetch fresh jobs from external API (body: `{ query, location, pages }`)

### Authentication (`/api/auth`)

- `POST /signup` - Create new account (body: `{ email, password }`)
- `POST /login` - Login (body: `{ email, password }`)
- `POST /refresh` - Refresh access token (uses httpOnly cookie)
- `POST /logout` - Logout (clears refresh token cookie)
- `GET /verify-email?token=<token>` - Verify email address

### Users (`/api/users`) - Requires authentication

- `GET /saved-jobs` - Get user's saved jobs
- `POST /save-job` - Save a job (body: `{ jobID }`)
- `DELETE /saved-jobs/:jobID` - Remove saved job

## 🔐 Authentication Flow

1. **Sign Up**: User creates account → receives verification email
2. **Verify Email**: User clicks link in email → account verified
3. **Login**: User logs in → receives access token (JSON) + refresh token (httpOnly cookie)
4. **Access Protected Routes**: Include access token in Authorization header: `Bearer <token>`
5. **Token Refresh**: When access token expires, call `/api/auth/refresh` to get new tokens
6. **Logout**: Call `/api/auth/logout` to clear refresh token

## Fetching Fresh Jobs

Use the included script to populate your database with jobs:

```bash
node fetch-fresh-jobs.js
```

This script:

- Searches multiple locations and keywords
- Avoids duplicates using unique `job_id`
- Reports inserted jobs and API usage
- Respects RapidAPI rate limits

**Note**: RapidAPI free tier typically allows ~200 calls/month. The script tracks usage to help you stay within limits.

## Project Structure

```
job-board-backend/
├── src/
│   ├── config/
│   │   └── connectDB.js         # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── jobsController.js    # Job search & management
│   │   └── usersController.js   # User profile & saved jobs
│   ├── middleware/
│   │   └── verifyAccessToken.js # JWT verification middleware
│   ├── models/
│   │   ├── Job.js               # Job schema
│   │   └── User.js              # User schema
│   ├── routes/
│   │   ├── authRoute.js         # Auth endpoints
│   │   ├── jobsRoute.js         # Job endpoints
│   │   └── usersRoute.js        # User endpoints
│   ├── utils/
│   │   └── sendEmail.js         # Email utility
│   └── server.js                # Express app setup
├── fetch-fresh-jobs.js          # Job fetching script
├── .env                         # Environment variables (not in git)
├── package.json
└── README.md
```

## Key Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **jsonwebtoken** - JWT authentication
- **bcrypt** - Password hashing
- **nodemailer** - Email sending
- **axios** - HTTP client for external API
- **cookie-parser** - Parse cookies
- **cors** - Enable CORS

## Password Requirements

Passwords must:

- Be at least 10 characters long
- Contain at least one uppercase letter
- Contain at least one lowercase letter
- Contain at least one number
- Contain at least one special character

## Email Setup (Gmail)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password: [Google Account Settings](https://myaccount.google.com/apppasswords)
3. Use the app password in `EMAIL_PASS` environment variable

## Important Notes

- **Security**: This is configured for local development. For production:
  - Rotate all secrets
  - Use environment-specific configurations
  - Consider adding rate limiting
  - Enable HTTPS

---
