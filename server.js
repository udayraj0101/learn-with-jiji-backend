require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Supabase clients
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Admin client for signup (bypasses email confirmation)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Middleware
app.use(cors());
app.use(express.json());

// Auth middleware
const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.split(' ')[1];
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  
  req.user = user;
  next();
};

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Learn with Jiji API is running',
    endpoints: {
      askJiji: 'POST /ask-jiji',
      signup: 'POST /auth/signup',
      login: 'POST /auth/login'
    }
  });
});

// Auth endpoints
app.post('/auth/signup', async (req, res) => {
  console.log('\n========== SIGNUP REQUEST ==========');
  console.log('📥 Request Body:', JSON.stringify(req.body, null, 2));
  console.log('📥 Headers:', JSON.stringify(req.headers, null, 2));
  
  try {
    const { email, password, fullName } = req.body;
    
    console.log('✅ Extracted Data:');
    console.log('   Email:', email);
    console.log('   Password:', password ? '***' + password.slice(-2) : 'undefined');
    console.log('   Full Name:', fullName);
    
    if (!email || !password) {
      console.log('❌ Validation Failed: Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    console.log('🔄 Calling Supabase Auth signUp (admin)...');
    const signUpPayload = {
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName }
    };
    console.log('📤 Supabase Payload:', JSON.stringify({ email, password: '***', email_confirm: true, user_metadata: signUpPayload.user_metadata }, null, 2));
    
    const { data, error } = await supabaseAdmin.auth.admin.createUser(signUpPayload);

    console.log('📨 Supabase Response:');
    console.log('   Data:', JSON.stringify(data, null, 2));
    console.log('   Error:', error ? JSON.stringify(error, null, 2) : 'null');

    if (error) {
      console.log('❌ Supabase Error:', error.message);
      console.log('   Error Code:', error.code);
      console.log('   Error Status:', error.status);
      return res.status(400).json({ error: error.message });
    }

    // Create profile
    if (data.user) {
      console.log('🔄 Creating profile in database...');
      const profileData = {
        id: data.user.id,
        email: data.user.email,
        full_name: fullName
      };
      console.log('📤 Profile Data:', JSON.stringify(profileData, null, 2));
      
      const { data: profileResult, error: profileError } = await supabaseAdmin.from('profiles').insert(profileData);
      
      console.log('📨 Profile Insert Response:');
      console.log('   Data:', JSON.stringify(profileResult, null, 2));
      console.log('   Error:', profileError ? JSON.stringify(profileError, null, 2) : 'null');
    }

    console.log('✅ Signup Successful!');
    console.log('========== END SIGNUP REQUEST ==========\n');
    
    res.json({ 
      message: 'User created successfully. You can now login.',
      user: data.user
    });
  } catch (error) {
    console.log('❌ EXCEPTION:', error);
    console.log('   Message:', error.message);
    console.log('   Stack:', error.stack);
    console.log('========== END SIGNUP REQUEST ==========\n');
    res.status(500).json({ error: error.message });
  }
});

app.post('/auth/login', async (req, res) => {
  console.log('\n========== LOGIN REQUEST ==========');
  console.log('📥 Request Body:', JSON.stringify(req.body, null, 2));
  
  try {
    const { email, password } = req.body;
    
    console.log('✅ Extracted Data:');
    console.log('   Email:', email);
    console.log('   Password:', password ? '***' + password.slice(-2) : 'undefined');
    
    if (!email || !password) {
      console.log('❌ Validation Failed: Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    console.log('🔄 Calling Supabase Auth signInWithPassword...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    console.log('📨 Supabase Response:');
    console.log('   Data:', data ? 'User found' : 'null');
    console.log('   Error:', error ? JSON.stringify(error, null, 2) : 'null');

    if (error) {
      console.log('❌ Supabase Error:', error.message);
      console.log('========== END LOGIN REQUEST ==========\n');
      return res.status(400).json({ error: error.message });
    }

    console.log('✅ Login Successful!');
    console.log('========== END LOGIN REQUEST ==========\n');
    
    res.json({ 
      message: 'Login successful',
      user: data.user,
      session: data.session,
      access_token: data.session.access_token
    });
  } catch (error) {
    console.log('❌ EXCEPTION:', error.message);
    console.log('========== END LOGIN REQUEST ==========\n');
    res.status(500).json({ error: error.message });
  }
});

// Main endpoint: Ask Jiji
app.post('/ask-jiji', authenticateUser, async (req, res) => {
  console.log('\n========== ASK JIJI REQUEST ==========');
  console.log('📥 Request Body:', JSON.stringify(req.body, null, 2));
  console.log('👤 User ID:', req.user.id);
  
  try {
    const { query } = req.body;
    
    // Validate input
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      console.log('❌ Validation Failed: Invalid query');
      return res.status(400).json({ error: 'Query is required and must be a non-empty string' });
    }

    console.log('✅ Query:', query);
    
    // Search for relevant resources using keyword matching
    const keywords = query.toLowerCase().split(' ').filter(word => word.length > 2);
    console.log('🔍 Search Keywords:', keywords);
    
    console.log('🔄 Searching resources in Supabase...');
    const { data: resources, error: searchError } = await supabase
      .from('resources')
      .select('*')
      .or(keywords.map(keyword => `keywords.cs.{${keyword}}`).join(','));

    console.log('📨 Search Response:');
    console.log('   Resources Found:', resources ? resources.length : 0);
    console.log('   Resources:', JSON.stringify(resources, null, 2));
    console.log('   Error:', searchError ? JSON.stringify(searchError, null, 2) : 'null');
    
    if (searchError) {
      console.error('❌ Search error:', searchError);
    }

    // Generate mocked AI response
    const answer = generateMockedResponse(query, resources || []);
    console.log('💬 Generated Answer:', answer.substring(0, 100) + '...');

    // Save query to database
    console.log('🔄 Saving query to database...');
    const { error: insertError } = await supabase
      .from('queries')
      .insert({
        user_id: req.user.id,
        query_text: query,
        response_text: answer,
        resources_returned: resources || []
      });

    if (insertError) {
      console.error('❌ Insert error:', insertError);
    } else {
      console.log('✅ Query saved successfully');
    }

    console.log('✅ Sending response to client');
    console.log('========== END ASK JIJI REQUEST ==========\n');
    
    // Return structured response
    res.json({
      query: query,
      answer: answer,
      resources: (resources || []).map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        type: r.type,
        url: r.file_url
      }))
    });

  } catch (error) {
    console.error('❌ EXCEPTION:', error);
    console.error('   Message:', error.message);
    console.error('   Stack:', error.stack);
    console.log('========== END ASK JIJI REQUEST ==========\n');
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Mocked AI response generator
function generateMockedResponse(query, resources) {
  const queryLower = query.toLowerCase();
  
  if (queryLower.includes('rag')) {
    return 'RAG (Retrieval Augmented Generation) is a technique that enhances AI responses by retrieving relevant information from a knowledge base before generating an answer. It combines the power of large language models with external data sources to provide more accurate and contextual responses.';
  } else if (queryLower.includes('prompt')) {
    return 'Prompt engineering is the practice of designing and refining inputs to AI models to get desired outputs. It involves crafting clear, specific instructions that guide the AI to produce relevant and accurate responses.';
  } else if (queryLower.includes('ai') || queryLower.includes('artificial intelligence')) {
    return 'Artificial Intelligence (AI) refers to computer systems that can perform tasks typically requiring human intelligence, such as learning, reasoning, problem-solving, and understanding language. Modern AI includes machine learning, deep learning, and neural networks.';
  } else if (resources.length > 0) {
    return `I found ${resources.length} relevant learning resource(s) related to "${query}". These materials will help you understand the topic better. Check out the resources below for detailed information.`;
  } else {
    return `Thank you for your question about "${query}". While I don't have specific resources on this exact topic right now, I'm here to help you learn. Try asking about RAG, AI fundamentals, or prompt engineering.`;
  }
}

// Start server
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 Learn with Jiji API running on http://localhost:${PORT}');
  console.log('='.repeat(60));
  console.log('📚 Endpoints available:');
  console.log('   GET  / - Health check');
  console.log('   POST /auth/signup - Create new user');
  console.log('   POST /auth/login - Login user');
  console.log('   POST /ask-jiji - Ask Jiji a question (requires auth)');
  console.log('='.repeat(60));
  console.log('\n🔍 Detailed logging enabled for all requests\n');
  console.log('Supabase URL:', process.env.SUPABASE_URL);
  console.log('Supabase Key:', process.env.SUPABASE_ANON_KEY ? '✅ Loaded' : '❌ Missing');
  console.log('\n');
});
