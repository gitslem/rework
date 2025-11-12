-- ===================================
-- PROOF-OF-BUILD VERIFICATION LAYER
-- Migration 003: Add proof-of-build tables
-- ===================================

-- Add GitHub OAuth fields to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS github_id VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS github_access_token TEXT;

-- Create indexes for GitHub fields
CREATE INDEX IF NOT EXISTS idx_users_github_id ON users(github_id);

-- ===================================
-- ENUMS FOR PROOF-OF-BUILD
-- ===================================

CREATE TYPE proof_type AS ENUM ('commit', 'pull_request', 'repository', 'file', 'screenshot');
CREATE TYPE proof_status AS ENUM ('pending', 'verified', 'failed', 'expired');
CREATE TYPE certificate_status AS ENUM ('active', 'revoked', 'expired');

-- ===================================
-- PROOFS OF BUILD TABLE
-- ===================================

CREATE TABLE proofs_of_build (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,

    -- Proof metadata
    proof_type proof_type NOT NULL,
    status proof_status DEFAULT 'pending',

    -- GitHub data (for commits, PRs, repos)
    github_repo_url VARCHAR(500),
    github_repo_name VARCHAR(255),
    github_commit_hash VARCHAR(255),
    github_pr_number INTEGER,
    github_pr_url VARCHAR(500),
    github_branch VARCHAR(255),

    -- File/Screenshot verification
    file_name VARCHAR(255),
    file_url VARCHAR(500),
    file_hash VARCHAR(255),
    file_size INTEGER,

    -- Verification data
    verified_at TIMESTAMP WITH TIME ZONE,
    verification_signature TEXT,
    verification_metadata JSONB DEFAULT '{}'::jsonb,

    -- Milestone tracking
    milestone_name VARCHAR(255),
    milestone_description TEXT,

    -- Timestamps
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,

    -- Additional metadata
    description TEXT,
    proof_metadata JSONB DEFAULT '{}'::jsonb,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for proofs_of_build
CREATE INDEX idx_proofs_user_id ON proofs_of_build(user_id);
CREATE INDEX idx_proofs_project_id ON proofs_of_build(project_id);
CREATE INDEX idx_proofs_status ON proofs_of_build(status);
CREATE INDEX idx_proofs_commit_hash ON proofs_of_build(github_commit_hash);
CREATE INDEX idx_proofs_file_hash ON proofs_of_build(file_hash);
CREATE INDEX idx_proofs_created_at ON proofs_of_build(created_at DESC);

-- ===================================
-- PROOF ARTIFACTS TABLE
-- ===================================

CREATE TABLE proof_artifacts (
    id SERIAL PRIMARY KEY,
    proof_id INTEGER NOT NULL REFERENCES proofs_of_build(id) ON DELETE CASCADE,

    -- Artifact data
    artifact_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_hash VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100),

    -- Metadata
    description TEXT,
    artifact_metadata JSONB DEFAULT '{}'::jsonb,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for proof_artifacts
CREATE INDEX idx_proof_artifacts_proof_id ON proof_artifacts(proof_id);
CREATE INDEX idx_proof_artifacts_file_hash ON proof_artifacts(file_hash);

-- ===================================
-- BUILD CERTIFICATES TABLE
-- ===================================

CREATE TABLE build_certificates (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,

    -- Certificate data
    certificate_id VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,

    -- Milestone info
    milestone_name VARCHAR(255) NOT NULL,
    milestone_date TIMESTAMP WITH TIME ZONE NOT NULL,

    -- Verification
    status certificate_status DEFAULT 'active',
    signature TEXT NOT NULL,
    signature_algorithm VARCHAR(50) DEFAULT 'HMAC-SHA256',

    -- Certificate content
    certificate_data JSONB NOT NULL,
    badge_url VARCHAR(500),

    -- Blockchain/notarization (for future)
    blockchain_tx_hash VARCHAR(255),
    blockchain_network VARCHAR(50),
    notarized_at TIMESTAMP WITH TIME ZONE,

    -- Verification URL
    verification_url VARCHAR(500),

    -- Proof references
    proof_ids JSONB DEFAULT '[]'::jsonb,

    -- Expiration
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    revocation_reason TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for build_certificates
CREATE INDEX idx_certificates_user_id ON build_certificates(user_id);
CREATE INDEX idx_certificates_project_id ON build_certificates(project_id);
CREATE INDEX idx_certificates_certificate_id ON build_certificates(certificate_id);
CREATE INDEX idx_certificates_status ON build_certificates(status);
CREATE INDEX idx_certificates_blockchain_tx ON build_certificates(blockchain_tx_hash);
CREATE INDEX idx_certificates_issued_at ON build_certificates(issued_at DESC);

-- ===================================
-- TRIGGERS FOR UPDATED_AT
-- ===================================

CREATE TRIGGER update_proofs_updated_at BEFORE UPDATE ON proofs_of_build
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certificates_updated_at BEFORE UPDATE ON build_certificates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- VERIFICATION QUERIES
-- ===================================

-- Count new tables (should be 3)
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('proofs_of_build', 'proof_artifacts', 'build_certificates')
ORDER BY table_name;

-- ===================================
-- ROLLBACK (IF NEEDED)
-- ===================================

-- WARNING: This will delete all proof-of-build data!
-- Uncomment and run if you need to rollback

/*
DROP TABLE IF EXISTS build_certificates CASCADE;
DROP TABLE IF EXISTS proof_artifacts CASCADE;
DROP TABLE IF EXISTS proofs_of_build CASCADE;

DROP TYPE IF EXISTS certificate_status;
DROP TYPE IF EXISTS proof_status;
DROP TYPE IF EXISTS proof_type;

ALTER TABLE users DROP COLUMN IF EXISTS github_id;
ALTER TABLE users DROP COLUMN IF EXISTS github_access_token;
*/
