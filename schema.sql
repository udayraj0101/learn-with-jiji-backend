-- Learn with Jiji - Database Schema
-- Supabase PostgreSQL Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Profiles table (linked to Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resources table (learning materials: PPT, videos, documents)
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('ppt', 'video', 'document')),
  file_url TEXT NOT NULL,
  keywords TEXT[], -- Array of keywords for search
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Queries table (user search history)
CREATE TABLE queries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  query_text TEXT NOT NULL,
  response_text TEXT,
  resources_returned JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE queries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles table
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for resources table
-- All authenticated users can view resources
CREATE POLICY "Authenticated users can view resources"
  ON resources FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for queries table
CREATE POLICY "Users can view own queries"
  ON queries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own queries"
  ON queries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Insert sample learning resources
INSERT INTO resources (title, description, type, file_url, keywords) VALUES
('Introduction to RAG', 'Learn about Retrieval Augmented Generation', 'ppt', 'https://example.com/rag-intro.ppt', ARRAY['rag', 'retrieval', 'generation', 'ai']),
('RAG Explained Video', 'Video tutorial on RAG concepts', 'video', 'https://example.com/rag-video.mp4', ARRAY['rag', 'tutorial', 'video', 'ai']),
('AI Fundamentals', 'Basic AI concepts and terminology', 'ppt', 'https://example.com/ai-basics.ppt', ARRAY['ai', 'basics', 'fundamentals', 'machine learning']),
('Prompt Engineering Guide', 'How to write effective prompts', 'document', 'https://example.com/prompts.pdf', ARRAY['prompts', 'engineering', 'llm', 'ai']);

-- ============================================
-- STORAGE BUCKET
-- ============================================

-- Create storage bucket for learning materials
-- Run this in Supabase Dashboard > Storage:
-- Bucket name: learning-materials
-- Public: Yes

-- ============================================
-- INDEXES (Optional - for performance)
-- ============================================

-- Index on keywords for faster search
CREATE INDEX idx_resources_keywords ON resources USING GIN (keywords);

-- Index on user_id for faster query lookups
CREATE INDEX idx_queries_user_id ON queries(user_id);

-- Index on created_at for sorting
CREATE INDEX idx_queries_created_at ON queries(created_at DESC);
