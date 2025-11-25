-- ===================================
-- AGENT MARKETPLACE UPDATES
-- Migration for Remote-Works redesign as agent-candidate marketplace
-- ===================================

-- Add candidate approval status (candidates must be approved by admin before hiring agents)
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_candidate_approved BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS candidate_approved_at TIMESTAMP WITH TIME ZONE;

-- Add agent verification and services
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS agent_services JSONB DEFAULT '[]'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS agent_success_rate NUMERIC(5, 2) DEFAULT 0.0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS agent_total_clients INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS agent_verification_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS agent_verified_at TIMESTAMP WITH TIME ZONE;

-- Add messaging/communication table
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(200),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    parent_message_id INTEGER REFERENCES messages(id) ON DELETE CASCADE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for messaging
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Add service requests table (candidates requesting help from agents)
CREATE TABLE IF NOT EXISTS service_requests (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    agent_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform VARCHAR(100) NOT NULL, -- e.g., 'Outlier', 'Alignerr', etc.
    service_type VARCHAR(100) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, in_progress, completed, cancelled
    refund_policy TEXT,

    -- Success tracking
    platform_approval_status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    platform_approved_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for service requests
CREATE INDEX IF NOT EXISTS idx_service_requests_candidate_id ON service_requests(candidate_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_agent_id ON service_requests(agent_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_platform ON service_requests(platform);

-- Update existing enums to include 'candidate' role
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'candidate' AND enumtypid = 'user_role'::regtype) THEN
        ALTER TYPE user_role ADD VALUE 'candidate';
    END IF;
END $$;

-- Add trigger for messages updated_at
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add trigger for service_requests updated_at
CREATE TRIGGER update_service_requests_updated_at BEFORE UPDATE ON service_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for new user columns
CREATE INDEX IF NOT EXISTS idx_users_candidate_approved ON users(is_candidate_approved);
CREATE INDEX IF NOT EXISTS idx_profiles_agent_verification ON profiles(agent_verification_status);

-- Add comments for documentation
COMMENT ON COLUMN users.is_candidate_approved IS 'Whether the candidate has been approved by admin to hire agents';
COMMENT ON COLUMN users.candidate_approved_at IS 'Timestamp when the candidate was approved by admin';
COMMENT ON COLUMN profiles.agent_services IS 'JSON array of platforms/services the agent supports (e.g., ["Outlier", "Alignerr"])';
COMMENT ON COLUMN profiles.agent_success_rate IS 'Agent success rate percentage (0-100)';
COMMENT ON COLUMN profiles.agent_total_clients IS 'Total number of clients the agent has helped';
COMMENT ON COLUMN profiles.agent_verification_status IS 'Agent verification status: pending, verified, rejected';
COMMENT ON TABLE messages IS 'Messages between candidates and agents';
COMMENT ON TABLE service_requests IS 'Service requests from candidates to agents for platform approvals';
