# Learn with Jiji - Backend API

AI-powered learning companion backend built with Node.js, Express, and Supabase.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- Supabase account

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd VeidaLabs_Assignment
```

2. Install dependencies
```bash
npm install
```

3. Environment variables are already configured in `.env` file

4. Start the server
```bash
npm start
```

Server will run on `http://localhost:3000`

## 📡 API Endpoints

### 1. Health Check
```
GET /
```
Returns API status and available endpoints.

### 2. User Signup
```
POST /auth/signup
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "fullName": "John Doe"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": { ... },
  "session": { ... }
}
```

### 3. User Login
```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": { ... },
  "session": { ... },
  "access_token": "eyJhbGc..."
}
```

### 4. Ask Jiji (Main Endpoint)
```
POST /ask-jiji
```

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "query": "Explain RAG"
}
```

**Response:**
```json
{
  "query": "Explain RAG",
  "answer": "RAG (Retrieval Augmented Generation) is a technique...",
  "resources": [
    {
      "id": "uuid",
      "title": "Introduction to RAG",
      "description": "Learn about Retrieval Augmented Generation",
      "type": "ppt",
      "url": "https://..."
    }
  ]
}
```

## 🔒 Authentication & Security

### How Auth Works
1. User signs up via `/auth/signup` endpoint
2. User logs in via `/auth/login` and receives an `access_token`
3. User includes token in `Authorization: Bearer <token>` header for protected endpoints
4. Backend validates token using Supabase Auth
5. If valid, request proceeds; if invalid, returns 401 Unauthorized

### Row Level Security (RLS)
Supabase RLS is enabled on all tables:

**Profiles Table:**
- Users can only view and update their own profile
- Policy: `auth.uid() = id`

**Resources Table:**
- All authenticated users can view resources
- Policy: `TO authenticated USING (true)`

**Queries Table:**
- Users can only view and insert their own queries
- Policy: `auth.uid() = user_id`

### Security Best Practices Implemented
- ✅ Environment variables for sensitive keys (not in code)
- ✅ Row Level Security enabled on all tables
- ✅ JWT token validation on protected endpoints
- ✅ Input validation on all endpoints
- ✅ CORS enabled for frontend integration
- ✅ `.gitignore` prevents committing secrets

## 🗄️ Database Schema

### Tables

**profiles**
- `id` (UUID, Primary Key, references auth.users)
- `email` (TEXT, Unique)
- `full_name` (TEXT)
- `created_at` (TIMESTAMP)

**resources**
- `id` (UUID, Primary Key)
- `title` (TEXT)
- `description` (TEXT)
- `type` (TEXT: 'ppt', 'video', 'document')
- `file_url` (TEXT)
- `keywords` (TEXT[])
- `created_at` (TIMESTAMP)

**queries**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to profiles)
- `query_text` (TEXT)
- `response_text` (TEXT)
- `resources_returned` (JSONB)
- `created_at` (TIMESTAMP)

### Storage
- Bucket: `learning-materials` (public)
- Contains: PPT files, videos, documents

## 🧪 Testing the API

### Demo Screenshots

Complete API testing demonstration with screenshots:

![Screenshot 1](screenshots/Screenshot%20(507).png)
![Screenshot 2](screenshots/Screenshot%20(508).png)
![Screenshot 3](screenshots/Screenshot%20(509).png)
![Screenshot 4](screenshots/Screenshot%20(510).png)
![Screenshot 5](screenshots/Screenshot%20(511).png)
![Screenshot 6](screenshots/Screenshot%20(512).png)
![Screenshot 7](screenshots/Screenshot%20(513).png)
![Screenshot 8](screenshots/Screenshot%20(514).png)

See [TESTING_RESULTS.md](TESTING_RESULTS.md) for detailed test documentation.

### Using cURL

**1. Signup:**
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"test123456\",\"fullName\":\"Test User\"}"
```

**2. Login:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"test123456\"}"
```

**3. Ask Jiji:**
```bash
curl -X POST http://localhost:3000/ask-jiji \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d "{\"query\":\"Explain RAG\"}"
```

### Using Postman/Thunder Client
1. Import the endpoints
2. Create a signup request
3. Create a login request and save the `access_token`
4. Use the token in `/ask-jiji` request header

## 🔍 How It Works

1. **User Authentication**: Uses Supabase Auth for secure user management
2. **Query Processing**: Accepts user query and validates input
3. **Resource Search**: Searches resources table using keyword matching on the `keywords` array
4. **Response Generation**: Returns mocked AI response with relevant resources
5. **Query Logging**: Saves query and response to database for history

## 📦 Project Structure

```
VeidaLabs_Assignment/
├── screenshots/        # API testing screenshots
├── server.js          # Main Express server
├── package.json       # Dependencies
├── .env              # Environment variables (not in git)
├── .gitignore        # Git ignore rules
├── schema.sql        # Database schema
├── API_TESTING.md    # API testing guide
├── TESTING_RESULTS.md # Detailed test results
└── README.md         # This file
```

## 🎯 One Improvement with More Time

**Implement Vector Search for Semantic Matching:**

Currently, the search uses simple keyword matching. With more time, I would implement:

1. **Vector Embeddings**: Use OpenAI or Cohere to generate embeddings for resources
2. **pgvector Extension**: Enable Supabase's pgvector for similarity search
3. **Semantic Search**: Find resources based on meaning, not just keywords
4. **Better Relevance**: Return more contextually relevant resources

This would significantly improve the quality of search results and make Jiji truly intelligent.

**Additional Improvements:**
- Add rate limiting to prevent abuse
- Implement caching for frequently asked queries
- Add pagination for large result sets
- Create admin endpoints for managing resources
- Add analytics dashboard for query insights

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage

## 📝 Notes

- AI responses are mocked for this assignment (no real LLM integration)
- Sample resources are pre-populated in the database
- RLS policies ensure data security at the database level
- All secrets are stored in environment variables

## 👨‍💻 Developer

Created for VeidaLabs Software Developer Hiring Assignment

---

**Assignment Completed in 2 Hours** ⏱️
