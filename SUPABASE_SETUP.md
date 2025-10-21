# Supabase Setup Guide for WanderLink

## 🗄️ Database Schema

### **Step 1: Create Supabase Project**

1. Go to https://supabase.com
2. Create a new project
3. Wait for database to initialize
4. Copy your project credentials:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

---

## 📊 **Database Tables**

Run these SQL commands in Supabase SQL Editor:

### **1. Users Table**

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  agent_address TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);
```

### **2. User Preferences Table**

```sql
-- User preferences table
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Basic preferences
  age INTEGER,
  gender TEXT,
  location TEXT,
  
  -- Travel preferences
  preferred_destinations TEXT[],
  budget_min DECIMAL(10, 2),
  budget_max DECIMAL(10, 2),
  travel_pace TEXT CHECK (travel_pace IN ('relaxed', 'moderate', 'packed')),
  group_size_preference TEXT,
  
  -- Interests (stored as array)
  interests TEXT[],
  
  -- Additional preferences
  accommodation_types TEXT[],
  dietary_restrictions TEXT[],
  languages_spoken TEXT[],
  travel_experience TEXT CHECK (travel_experience IN ('beginner', 'intermediate', 'expert')),
  smoking_preference TEXT,
  drinking_preference TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own preferences
CREATE POLICY "Users can manage own preferences" ON user_preferences
  FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth.uid() = id));
```

### **3. Match Requests Table**

```sql
-- Match requests table
CREATE TABLE match_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  trip_id TEXT NOT NULL,
  
  -- Match details
  compatibility_score DECIMAL(5, 2),
  match_factors JSONB, -- Store detailed compatibility breakdown
  
  -- Status
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')) DEFAULT 'pending',
  
  -- Messages
  user_message TEXT,
  host_response TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE match_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own match requests
CREATE POLICY "Users can read own match requests" ON match_requests
  FOR SELECT USING (user_id IN (SELECT id FROM users WHERE auth.uid() = id));

-- Policy: Users can create match requests
CREATE POLICY "Users can create match requests" ON match_requests
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE auth.uid() = id));
```

### **4. Saved Matches Table**

```sql
-- Saved matches table (favorites)
CREATE TABLE saved_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  trip_id TEXT NOT NULL,
  compatibility_score DECIMAL(5, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, trip_id)
);

-- Enable RLS
ALTER TABLE saved_matches ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their saved matches
CREATE POLICY "Users can manage saved matches" ON saved_matches
  FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth.uid() = id));
```

### **5. User Agent States Table**

```sql
-- User agent states (for persistent agent management)
CREATE TABLE user_agent_states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  agent_address TEXT NOT NULL UNIQUE,
  agent_seed TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  last_active_at TIMESTAMP WITH TIME ZONE,
  agent_config JSONB, -- Store agent configuration
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_agent_states ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own agent state
CREATE POLICY "Users can read own agent state" ON user_agent_states
  FOR SELECT USING (user_id IN (SELECT id FROM users WHERE auth.uid() = id));
```

### **6. Create Indexes for Performance**

```sql
-- Indexes for better query performance
CREATE INDEX idx_users_agent_address ON users(agent_address);
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_match_requests_user_id ON match_requests(user_id);
CREATE INDEX idx_match_requests_status ON match_requests(status);
CREATE INDEX idx_saved_matches_user_id ON saved_matches(user_id);
CREATE INDEX idx_user_agent_states_user_id ON user_agent_states(user_id);
CREATE INDEX idx_user_agent_states_agent_address ON user_agent_states(agent_address);
```

### **7. Create Updated At Trigger**

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_match_requests_updated_at BEFORE UPDATE ON match_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_agent_states_updated_at BEFORE UPDATE ON user_agent_states
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 🔐 **Environment Variables**

Add to your `.env` files:

### **Backend (`agents/.env`)**
```env
# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_service_role_key

# Existing
GEMINI_API_KEY=your_gemini_key
```

### **Frontend (`frontend/.env.local`)**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# API
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 📦 **Install Dependencies**

### **Backend**
```bash
cd agents
pip install supabase-py
```

### **Frontend**
```bash
cd frontend
npm install @supabase/supabase-js
```

---

## ✅ **Verification**

After running the SQL commands, verify tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

You should see:
- users
- user_preferences
- match_requests
- saved_matches
- user_agent_states

---

## 🚀 **Next Steps**

1. Create Supabase project
2. Run all SQL commands above
3. Copy credentials to `.env` files
4. Install dependencies
5. Run the application

Your database is now ready for the full user agent system!
