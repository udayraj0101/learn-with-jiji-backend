# API Testing Guide

## Test the API using these examples

### 1. Start the Server
```bash
npm start
```

### 2. Test Endpoints

#### A. Health Check
```bash
curl http://localhost:3000/
```

#### B. Signup (Create User)
```bash
curl -X POST http://localhost:3000/auth/signup ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"test123456\",\"fullName\":\"Test User\"}"
```

#### C. Login (Get Access Token)
```bash
curl -X POST http://localhost:3000/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"test123456\"}"
```

**Save the `access_token` from the response!**

#### D. Ask Jiji (Replace YOUR_TOKEN with actual token)
```bash
curl -X POST http://localhost:3000/ask-jiji ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer YOUR_TOKEN" ^
  -d "{\"query\":\"Explain RAG\"}"
```

## Test Queries to Try

1. "Explain RAG"
2. "What is prompt engineering?"
3. "Tell me about AI"
4. "How does machine learning work?"

## Using Postman/Thunder Client

### Step 1: Signup
- Method: POST
- URL: http://localhost:3000/auth/signup
- Body (JSON):
```json
{
  "email": "test@example.com",
  "password": "test123456",
  "fullName": "Test User"
}
```

### Step 2: Login
- Method: POST
- URL: http://localhost:3000/auth/login
- Body (JSON):
```json
{
  "email": "test@example.com",
  "password": "test123456"
}
```
- Copy the `access_token` from response

### Step 3: Ask Jiji
- Method: POST
- URL: http://localhost:3000/ask-jiji
- Headers:
  - Content-Type: application/json
  - Authorization: Bearer YOUR_ACCESS_TOKEN
- Body (JSON):
```json
{
  "query": "Explain RAG"
}
```

## Expected Response Format

```json
{
  "query": "Explain RAG",
  "answer": "RAG (Retrieval Augmented Generation) is a technique...",
  "resources": [
    {
      "id": "uuid-here",
      "title": "Introduction to RAG",
      "description": "Learn about Retrieval Augmented Generation",
      "type": "ppt",
      "url": "https://..."
    }
  ]
}
```
