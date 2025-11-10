-- ===================================
-- REMOTE WORKS DATABASE SCHEMA
-- For Supabase PostgreSQL
-- ===================================
-- Run this in Supabase SQL Editor
-- ===================================

-- Enable UUID extension (optional, for future use)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================
-- ENUMS
-- ===================================

CREATE TYPE user_role AS ENUM ('freelancer', 'agent', 'business', 'admin');
CREATE TYPE project_status AS ENUM ('open', 'in_progress', 'completed', 'cancelled');
CREATE TYPE application_status AS ENUM ('pending', 'accepted', 'rejected', 'withdrawn');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- ===================================
-- USERS TABLE
-- ===================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'freelancer',
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ===================================
-- PROFILES TABLE
-- ===================================

CREATE TABLE profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    bio TEXT,
    avatar_url VARCHAR(500),
    resume_url VARCHAR(500),
    skills JSONB DEFAULT '[]'::jsonb,
    location VARCHAR(200),
    phone VARCHAR(50),
    website VARCHAR(500),
    linkedin VARCHAR(500),

    -- Statistics
    total_earnings NUMERIC(10, 2) DEFAULT 0.0,
    completed_projects INTEGER DEFAULT 0,
    average_rating NUMERIC(3, 2) DEFAULT 0.0,
    total_reviews INTEGER DEFAULT 0,

    -- Agent specific
    is_agent_approved BOOLEAN DEFAULT FALSE,
    agent_multiplier NUMERIC(3, 1) DEFAULT 3.0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on user_id for faster lookups
CREATE INDEX idx_profiles_user_id ON profiles(user_id);

-- ===================================
-- PROJECTS TABLE
-- ===================================

CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    budget NUMERIC(10, 2) NOT NULL,
    deadline TIMESTAMP WITH TIME ZONE,
    status project_status DEFAULT 'open',
    requirements JSONB DEFAULT '{}'::jsonb,
    attachments JSONB DEFAULT '[]'::jsonb,

    -- Matching fields
    required_skills JSONB DEFAULT '[]'::jsonb,
    experience_level VARCHAR(50),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_category ON projects(category);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

-- ===================================
-- APPLICATIONS TABLE
-- ===================================

CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    applicant_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cover_letter TEXT,
    proposed_rate NUMERIC(10, 2),
    status application_status DEFAULT 'pending',
    ai_match_score NUMERIC(5, 2),

    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Prevent duplicate applications
    UNIQUE(project_id, applicant_id)
);

-- Create indexes
CREATE INDEX idx_applications_project_id ON applications(project_id);
CREATE INDEX idx_applications_applicant_id ON applications(applicant_id);
CREATE INDEX idx_applications_status ON applications(status);

-- ===================================
-- AGENT ASSIGNMENTS TABLE
-- ===================================

CREATE TABLE agent_assignments (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    agent_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    freelancer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status project_status DEFAULT 'in_progress',
    agent_earnings NUMERIC(10, 2) DEFAULT 0.0,
    freelancer_passive_earnings NUMERIC(10, 2) DEFAULT 0.0,

    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_agent_assignments_project_id ON agent_assignments(project_id);
CREATE INDEX idx_agent_assignments_agent_id ON agent_assignments(agent_id);
CREATE INDEX idx_agent_assignments_freelancer_id ON agent_assignments(freelancer_id);

-- ===================================
-- REVIEWS TABLE
-- ===================================

CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    reviewer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_reviews_project_id ON reviews(project_id);
CREATE INDEX idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX idx_reviews_reviewee_id ON reviews(reviewee_id);

-- ===================================
-- PAYMENTS TABLE
-- ===================================

CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    payer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    payee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    platform_fee NUMERIC(10, 2) DEFAULT 0.0,
    stripe_payment_intent_id VARCHAR(255),
    status payment_status DEFAULT 'pending',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_payments_project_id ON payments(project_id);
CREATE INDEX idx_payments_payer_id ON payments(payer_id);
CREATE INDEX idx_payments_payee_id ON payments(payee_id);
CREATE INDEX idx_payments_status ON payments(status);

-- ===================================
-- NOTIFICATIONS TABLE
-- ===================================

CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- ===================================
-- TRIGGERS FOR UPDATED_AT
-- ===================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- SAMPLE DATA (OPTIONAL - FOR TESTING)
-- ===================================

-- Uncomment below to insert sample data

/*
-- Insert test users
INSERT INTO users (email, hashed_password, role) VALUES
('freelancer@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqYjK8u7sW', 'freelancer'), -- password: testpass123
('agent@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqYjK8u7sW', 'agent'),
('business@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqYjK8u7sW', 'business');

-- Insert profiles for test users
INSERT INTO profiles (user_id, first_name, last_name) VALUES
(1, 'John', 'Freelancer'),
(2, 'Jane', 'Agent'),
(3, 'Bob', 'Business');
*/

-- ===================================
-- VERIFICATION QUERIES
-- ===================================

-- Run these to verify schema was created successfully

-- List all tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Count tables (should be 8)
SELECT COUNT(*) as table_count
FROM information_schema.tables
WHERE table_schema = 'public';

-- List all enums
SELECT t.typname as enum_name,
       e.enumlabel as enum_value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'public'
ORDER BY t.typname, e.enumlabel;

-- ===================================
-- CLEANUP (IF NEEDED)
-- ===================================

-- WARNING: This will delete all data!
-- Uncomment and run if you need to start fresh

/*
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS agent_assignments CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TYPE IF EXISTS payment_status;
DROP TYPE IF EXISTS application_status;
DROP TYPE IF EXISTS project_status;
DROP TYPE IF EXISTS user_role;
*/
