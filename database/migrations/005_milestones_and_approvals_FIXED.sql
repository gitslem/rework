-- ===================================
-- MILESTONES & PROOF APPROVALS - FIXED VERSION
-- Migration 005: Add milestones and proof approval system
-- Handles existing types gracefully
-- ===================================

-- ===================================
-- DROP EXISTING TYPES IF NEEDED (Safe cleanup)
-- ===================================

-- Drop dependent objects first, then types
DROP TABLE IF EXISTS proof_approvals CASCADE;
DROP TABLE IF EXISTS milestones CASCADE;

DROP TYPE IF EXISTS approval_status CASCADE;
DROP TYPE IF EXISTS milestone_status CASCADE;

-- ===================================
-- CREATE ENUMS FOR MILESTONES
-- ===================================

CREATE TYPE milestone_status AS ENUM ('pending', 'in_review', 'approved', 'rejected', 'completed');
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected', 'revision_requested');

-- ===================================
-- MILESTONES TABLE
-- ===================================

CREATE TABLE milestones (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

    -- Milestone info
    milestone_number INTEGER NOT NULL, -- Order in the project (1, 2, 3, etc.)
    title VARCHAR(255) NOT NULL,
    description TEXT,

    -- Budget allocation
    budget_percentage FLOAT NOT NULL DEFAULT 0, -- Percentage of total project budget (0-100)
    budget_amount FLOAT, -- Calculated amount based on project budget

    -- Status and dates
    status milestone_status DEFAULT 'pending',
    due_date TIMESTAMP WITH TIME ZONE,
    completion_date TIMESTAMP WITH TIME ZONE,

    -- Requirements
    required_deliverables TEXT[], -- Array of required deliverable descriptions
    acceptance_criteria TEXT[], -- Array of acceptance criteria

    -- Proof tracking
    proof_ids JSONB DEFAULT '[]'::jsonb, -- Array of associated proof IDs

    -- Payment tracking
    escrow_id INTEGER REFERENCES escrows(id) ON DELETE SET NULL,
    payment_released BOOLEAN DEFAULT FALSE,
    payment_released_at TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Ensure unique milestone numbers per project
    UNIQUE(project_id, milestone_number)
);

-- Create indexes for milestones
CREATE INDEX idx_milestones_project_id ON milestones(project_id);
CREATE INDEX idx_milestones_status ON milestones(status);
CREATE INDEX idx_milestones_due_date ON milestones(due_date);
CREATE INDEX idx_milestones_project_number ON milestones(project_id, milestone_number);

-- ===================================
-- PROOF APPROVALS TABLE
-- ===================================

CREATE TABLE proof_approvals (
    id SERIAL PRIMARY KEY,
    proof_id INTEGER NOT NULL REFERENCES proofs_of_build(id) ON DELETE CASCADE,
    milestone_id INTEGER REFERENCES milestones(id) ON DELETE CASCADE,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

    -- Reviewer (project owner/company)
    reviewer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Approval status
    status approval_status DEFAULT 'pending',

    -- Feedback
    feedback TEXT,
    revision_notes TEXT,

    -- Approval/rejection details
    approved_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Ensure one approval per proof (can be updated)
    UNIQUE(proof_id)
);

-- Create indexes for proof_approvals
CREATE INDEX idx_proof_approvals_proof_id ON proof_approvals(proof_id);
CREATE INDEX idx_proof_approvals_milestone_id ON proof_approvals(milestone_id);
CREATE INDEX idx_proof_approvals_project_id ON proof_approvals(project_id);
CREATE INDEX idx_proof_approvals_reviewer_id ON proof_approvals(reviewer_id);
CREATE INDEX idx_proof_approvals_status ON proof_approvals(status);

-- ===================================
-- UPDATE EXISTING TABLES
-- ===================================

-- Add milestone_id to proofs_of_build for better tracking
-- Use IF NOT EXISTS equivalent for PostgreSQL
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'proofs_of_build'
        AND column_name = 'milestone_id'
    ) THEN
        ALTER TABLE proofs_of_build
        ADD COLUMN milestone_id INTEGER REFERENCES milestones(id) ON DELETE SET NULL;

        CREATE INDEX idx_proofs_milestone_id ON proofs_of_build(milestone_id);
    END IF;
END $$;

-- ===================================
-- TRIGGERS FOR UPDATED_AT
-- ===================================

-- Create update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS update_milestones_updated_at ON milestones;
CREATE TRIGGER update_milestones_updated_at
    BEFORE UPDATE ON milestones
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_proof_approvals_updated_at ON proof_approvals;
CREATE TRIGGER update_proof_approvals_updated_at
    BEFORE UPDATE ON proof_approvals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- MILESTONE COMPLETION TRIGGER
-- ===================================

-- Function to auto-update milestone status when all proofs are approved
CREATE OR REPLACE FUNCTION check_milestone_completion()
RETURNS TRIGGER AS $$
DECLARE
    total_proofs INTEGER;
    approved_proofs INTEGER;
    milestone_record RECORD;
BEGIN
    -- Get the milestone for this proof
    IF NEW.milestone_id IS NOT NULL THEN
        -- Count total proofs for this milestone
        SELECT COUNT(*) INTO total_proofs
        FROM proofs_of_build
        WHERE milestone_id = NEW.milestone_id;

        -- Count approved proofs
        SELECT COUNT(*) INTO approved_proofs
        FROM proofs_of_build p
        INNER JOIN proof_approvals pa ON p.id = pa.proof_id
        WHERE p.milestone_id = NEW.milestone_id
        AND pa.status = 'approved';

        -- If all proofs are approved and milestone is in_review, mark as approved
        IF total_proofs > 0 AND approved_proofs = total_proofs THEN
            SELECT * INTO milestone_record
            FROM milestones
            WHERE id = NEW.milestone_id;

            IF milestone_record.status = 'in_review' THEN
                UPDATE milestones
                SET status = 'approved',
                    completion_date = CURRENT_TIMESTAMP
                WHERE id = NEW.milestone_id;
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on proof_approvals when status changes to approved
DROP TRIGGER IF EXISTS trigger_milestone_completion ON proof_approvals;
CREATE TRIGGER trigger_milestone_completion
    AFTER INSERT OR UPDATE OF status ON proof_approvals
    FOR EACH ROW
    WHEN (NEW.status = 'approved')
    EXECUTE FUNCTION check_milestone_completion();

-- ===================================
-- VERIFICATION QUERIES
-- ===================================

-- Count new tables (should be 2)
SELECT 'Tables created:' as info, table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('milestones', 'proof_approvals')
ORDER BY table_name;

-- Verify enums created
SELECT 'Enums created:' as info, typname as enum_name
FROM pg_type
WHERE typname IN ('milestone_status', 'approval_status')
ORDER BY typname;

-- Check milestone_id column was added
SELECT 'Milestone column added to proofs:' as info,
       EXISTS(
           SELECT 1 FROM information_schema.columns
           WHERE table_name = 'proofs_of_build'
           AND column_name = 'milestone_id'
       ) as column_exists;

SELECT '✅ Migration completed successfully!' as result;
