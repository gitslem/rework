-- ===================================
-- SHARED SANDBOX FEATURE - MIGRATION
-- Add sandbox_sessions table for AI Build/Test Environment
-- ===================================

-- Create enum for sandbox status
CREATE TYPE sandbox_status AS ENUM ('active', 'stopped', 'terminated', 'error');

-- Create enum for programming language
CREATE TYPE sandbox_language AS ENUM ('python', 'javascript', 'typescript');

-- ===================================
-- SANDBOX_SESSIONS TABLE
-- ===================================

CREATE TABLE sandbox_sessions (
    id SERIAL PRIMARY KEY,

    -- Ownership & Access
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shared_with JSONB DEFAULT '[]'::jsonb,  -- Array of user IDs who can access

    -- Session metadata
    name VARCHAR(200) NOT NULL,
    description TEXT,
    language sandbox_language DEFAULT 'python',
    status sandbox_status DEFAULT 'active',

    -- File system state
    files JSONB DEFAULT '{}'::jsonb,  -- File tree: {"main.py": {"content": "...", "type": "file"}, ...}

    -- Execution environment
    container_id VARCHAR(255),  -- Docker container ID
    runtime_config JSONB DEFAULT '{}'::jsonb,  -- CPU, memory limits, timeout, etc.

    -- Execution history & results
    execution_history JSONB DEFAULT '[]'::jsonb,  -- Array of {timestamp, code, output, error, duration_ms}
    last_output TEXT,
    last_error TEXT,
    last_executed_at TIMESTAMP WITH TIME ZONE,

    -- Resource tracking
    total_executions INTEGER DEFAULT 0,
    total_runtime_ms INTEGER DEFAULT 0,

    -- AI Testing metadata (for future)
    ai_test_results JSONB DEFAULT '{}'::jsonb,  -- Quality scores, latency, token costs

    -- Version control (for future snapshots)
    version INTEGER DEFAULT 1,
    parent_snapshot_id INTEGER REFERENCES sandbox_sessions(id) ON DELETE SET NULL,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    terminated_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better query performance
CREATE INDEX idx_sandbox_sessions_owner_id ON sandbox_sessions(owner_id);
CREATE INDEX idx_sandbox_sessions_project_id ON sandbox_sessions(project_id);
CREATE INDEX idx_sandbox_sessions_status ON sandbox_sessions(status);
CREATE INDEX idx_sandbox_sessions_created_at ON sandbox_sessions(created_at DESC);
CREATE INDEX idx_sandbox_sessions_last_accessed_at ON sandbox_sessions(last_accessed_at DESC);

-- Create GIN index for shared_with array queries (who has access)
CREATE INDEX idx_sandbox_sessions_shared_with ON sandbox_sessions USING GIN (shared_with);

-- ===================================
-- SANDBOX_COLLABORATORS TABLE
-- For tracking active users in real-time collaboration
-- ===================================

CREATE TABLE sandbox_collaborators (
    id SERIAL PRIMARY KEY,
    sandbox_id INTEGER NOT NULL REFERENCES sandbox_sessions(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Collaboration metadata
    cursor_position JSONB,  -- {line, column, file}
    is_typing BOOLEAN DEFAULT FALSE,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Session tracking
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP WITH TIME ZONE,

    UNIQUE(sandbox_id, user_id)
);

-- Create indexes
CREATE INDEX idx_sandbox_collaborators_sandbox_id ON sandbox_collaborators(sandbox_id);
CREATE INDEX idx_sandbox_collaborators_user_id ON sandbox_collaborators(user_id);
CREATE INDEX idx_sandbox_collaborators_last_activity ON sandbox_collaborators(last_activity DESC);

-- ===================================
-- TRIGGERS FOR UPDATED_AT
-- ===================================

-- Apply trigger to sandbox_sessions
CREATE TRIGGER update_sandbox_sessions_updated_at
    BEFORE UPDATE ON sandbox_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- UPDATE PROJECTS TABLE
-- Add sandbox_enabled flag to projects
-- ===================================

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS sandbox_enabled BOOLEAN DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_projects_sandbox_enabled ON projects(sandbox_enabled);

-- ===================================
-- VERIFICATION QUERIES
-- ===================================

-- Verify sandbox_sessions table was created
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'sandbox_sessions'
ORDER BY ordinal_position;

-- Verify sandbox_collaborators table was created
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'sandbox_collaborators'
ORDER BY ordinal_position;

-- Verify enums were created
SELECT t.typname as enum_name,
       e.enumlabel as enum_value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname IN ('sandbox_status', 'sandbox_language')
ORDER BY t.typname, e.enumlabel;
