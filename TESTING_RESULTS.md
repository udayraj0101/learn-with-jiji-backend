# Learn with Jiji - Testing Documentation

## API Testing Results

### 1. Signup Endpoint Test

**Request:**
```
POST http://localhost:3000/auth/signup
Content-Type: application/json

{
  "email": "uday72192@gmail.com",
  "password": "123456",
  "fullName": "Uday Raj"
}
```

**Response (200 OK):**
```json
{
  "message": "User created successfully. You can now login.",
  "user": {
    "id": "ea129d57-9594-4466-8ee3-a87b9878357e",
    "email": "uday72192@gmail.com",
    "email_confirmed_at": "2026-02-08T11:06:20.170511866Z",
    "user_metadata": {
      "full_name": "Uday Raj"
    }
  }
}
```

✅ **Status:** SUCCESS - User created in Supabase Auth and profiles table

---

### 2. Login Endpoint Test

**Request:**
```
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "uday72192@gmail.com",
  "password": "123456"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "ea129d57-9594-4466-8ee3-a87b9878357e",
    "email": "uday72192@gmail.com"
  },
  "session": { ... },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

✅ **Status:** SUCCESS - User authenticated, access token received

---

### 3. Ask Jiji Endpoint Test

**Request:**
```
POST http://localhost:3000/ask-jiji
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "query": "Explain RAG"
}
```

**Response (200 OK):**
```json
{
  "query": "Explain RAG",
  "answer": "RAG (Retrieval Augmented Generation) is a technique that enhances AI responses by retrieving relevant information from a knowledge base before generating an answer. It combines the power of large language models with external data sources to provide more accurate and contextual responses.",
  "resources": [
    {
      "id": "67e63e94-9f8b-417d-9e76-8ad36660f8e6",
      "title": "Introduction to RAG",
      "description": "Learn about Retrieval Augmented Generation",
      "type": "ppt",
      "url": "https://example.com/rag-intro.ppt"
    },
    {
      "id": "36a53a11-1d3c-4a88-8d63-b4acbf447e19",
      "title": "RAG Explained Video",
      "description": "Video tutorial on RAG concepts",
      "type": "video",
      "url": "https://example.com/rag-video.mp4"
    }
  ]
}
```

✅ **Status:** SUCCESS - Query processed, 2 relevant resources found, response generated

---

## Server Logs

```
========== SIGNUP REQUEST ==========
📥 Request Body: { "email": "uday72192@gmail.com", "password": "123456", "fullName": "Uday Raj" }
✅ Extracted Data: Email: uday72192@gmail.com
🔄 Calling Supabase Auth signUp (admin)...
📨 Supabase Response: User created successfully
🔄 Creating profile in database...
✅ Signup Successful!

========== LOGIN REQUEST ==========
📥 Request Body: { "email": "uday72192@gmail.com", "password": "123456" }
🔄 Calling Supabase Auth signInWithPassword...
✅ Login Successful!

========== ASK JIJI REQUEST ==========
📥 Request Body: { "query": "Explain RAG" }
👤 User ID: ea129d57-9594-4466-8ee3-a87b9878357e
✅ Query: Explain RAG
🔍 Search Keywords: [ 'explain', 'rag' ]
🔄 Searching resources in Supabase...
📨 Search Response: Resources Found: 2
✅ Query saved successfully
✅ Sending response to client
```

---

## Supabase Database Verification

### Tables Created:
1. ✅ **profiles** - Contains user profile data
2. ✅ **resources** - Contains 4 learning resources
3. ✅ **queries** - Contains user query history

### Row Level Security (RLS):
- ✅ All tables have RLS enabled
- ✅ Policies configured for user data isolation
- ✅ Resources accessible to all authenticated users

### Storage:
- ✅ Bucket `learning-materials` created (public)
- ✅ Sample files uploaded

---

## Test Summary

| Endpoint | Method | Auth Required | Status | Response Time |
|----------|--------|---------------|--------|---------------|
| `/` | GET | No | ✅ 200 OK | < 50ms |
| `/auth/signup` | POST | No | ✅ 200 OK | ~500ms |
| `/auth/login` | POST | No | ✅ 200 OK | ~300ms |
| `/ask-jiji` | POST | Yes | ✅ 200 OK | ~200ms |

---

## Security Features Verified

✅ JWT token validation on protected endpoints
✅ Row Level Security policies active
✅ Environment variables used for secrets
✅ Input validation on all endpoints
✅ CORS enabled for frontend integration
✅ `.gitignore` prevents secret exposure

---

## Additional Test Cases

### Test Case 1: Unauthorized Access
**Request:** POST /ask-jiji (without Authorization header)
**Expected:** 401 Unauthorized
**Result:** ✅ PASS

### Test Case 2: Invalid Query
**Request:** POST /ask-jiji with empty query
**Expected:** 400 Bad Request
**Result:** ✅ PASS

### Test Case 3: Different Query
**Request:** POST /ask-jiji with query "What is prompt engineering?"
**Expected:** Relevant response with resources
**Result:** ✅ PASS - Found 1 resource, generated appropriate answer

---

## Conclusion

All API endpoints are working correctly. The backend successfully:
- Authenticates users via Supabase Auth
- Stores user data with RLS protection
- Searches and retrieves relevant learning resources
- Generates contextual AI responses
- Logs queries for history tracking

**Assignment Status: COMPLETE ✅**
