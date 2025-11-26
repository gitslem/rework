#!/usr/bin/env python3
"""
Script to create all database tables including the new candidate_projects tables.
Run this from the backend directory: python create_tables.py
"""

import sys
from pathlib import Path

# Add the backend directory to the path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from app.db.database import Base, engine, init_db
from app.models.models import (
    User, Profile, Project, Application, AgentAssignment,
    Review, Payment, Escrow, Notification, ProjectBrief,
    SandboxSession, SandboxCollaborator, ProofOfBuild,
    ProofArtifact, BuildCertificate, Milestone, ProofApproval,
    ProjectMessage, AISummary, PortfolioItem,
    # New models
    CandidateProject, ProjectUpdate, ProjectAction
)

def create_all_tables():
    """Create all database tables"""
    print("=" * 60)
    print("Creating Database Tables")
    print("=" * 60)

    try:
        # Import all models to ensure they're registered
        print("\n✓ All models imported successfully")

        # Create all tables
        print("\n📊 Creating tables in database...")
        Base.metadata.create_all(bind=engine)

        print("\n✅ SUCCESS! All tables created:")
        print("\nCore Tables:")
        print("  - users")
        print("  - profiles")
        print("  - projects")
        print("  - applications")
        print("  - agent_assignments")
        print("  - reviews")
        print("  - payments")
        print("  - escrows")
        print("  - notifications")

        print("\nNew Project Management Tables:")
        print("  ✨ candidate_projects")
        print("  ✨ project_updates")
        print("  ✨ project_actions")

        print("\nOther Tables:")
        print("  - project_briefs")
        print("  - sandbox_sessions")
        print("  - sandbox_collaborators")
        print("  - proofs_of_build")
        print("  - proof_artifacts")
        print("  - build_certificates")
        print("  - milestones")
        print("  - proof_approvals")
        print("  - project_messages")
        print("  - ai_summaries")
        print("  - portfolio_items")

        print("\n" + "=" * 60)
        print("✅ Database initialization completed successfully!")
        print("=" * 60)

        return True

    except Exception as e:
        print(f"\n❌ ERROR: Failed to create tables")
        print(f"Error message: {str(e)}")
        print("\nTroubleshooting:")
        print("1. Check your DATABASE_URL in .env file")
        print("2. Ensure PostgreSQL is running (if using PostgreSQL)")
        print("3. For SQLite, ensure the directory is writable")
        return False

if __name__ == "__main__":
    print("\n🚀 Starting database table creation...\n")
    success = create_all_tables()
    sys.exit(0 if success else 1)
