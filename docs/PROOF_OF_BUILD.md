# Proof-of-Build Verification Layer

## Overview

The Proof-of-Build verification layer is a comprehensive system that allows users to verify and certify their work delivery through multiple channels including GitHub commits, pull requests, repositories, and file uploads. This system generates cryptographically signed certificates that can be used to prove work completion.

## Features Implemented

### 1. Database Schema

**New Tables:**
- `proofs_of_build` - Stores verified proofs of work
- `proof_artifacts` - Additional artifacts attached to proofs (screenshots, logs, etc.)
- `build_certificates` - Signed certificates for verified milestones

**User Extensions:**
- Added `github_id` and `github_access_token` fields to users table
- Integrated with existing `projects` table for project-linked proofs

### 2. GitHub OAuth Integration

**Features:**
- Complete GitHub OAuth 2.0 flow for authentication and authorization
- Connect GitHub account to existing user accounts
- Store GitHub access tokens for API access
- Automatic email verification from GitHub

**Endpoints:**
- `POST /api/v1/auth/github` - GitHub OAuth login
- `POST /api/v1/auth/github/connect` - Connect GitHub to existing account

**Configuration:**
```env
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### 3. Proof Verification Services

**GitHub Verification:**
- **Commit Verification** - Verify individual commits with metadata extraction
  - Commit message, author, date
  - Code statistics (additions, deletions, files changed)
  - Verification status from GitHub

- **Pull Request Verification** - Verify PRs with complete information
  - PR title, state, author
  - Merge status and date
  - Code statistics

- **Repository Verification** - Verify repository ownership/access
  - Repository metadata
  - Stars, forks, language
  - Created/updated dates

**File/Screenshot Verification:**
- SHA-256 hash calculation for files
- Timestamp-based verification
- Support for multiple artifact types (screenshots, logs, documents, etc.)

### 4. Certificate Generation

**Features:**
- Generate signed certificates from verified proofs
- HMAC-SHA256 cryptographic signatures
- Unique certificate IDs
- Optional expiration dates
- Public verification URLs

**Certificate Data Includes:**
- Certificate ID and title
- Milestone name and date
- All included proofs with details
- User information
- Signature for verification

### 5. Backend API Endpoints

#### Proof Verification Endpoints
```
POST   /api/v1/proofs/verify/github/commit    - Verify GitHub commit
POST   /api/v1/proofs/verify/github/pr        - Verify GitHub PR
POST   /api/v1/proofs/verify/github/repo      - Verify GitHub repository
POST   /api/v1/proofs/verify/file             - Verify file/screenshot
```

#### Proof Management Endpoints
```
GET    /api/v1/proofs/                        - Get all proofs (with filters)
GET    /api/v1/proofs/{proof_id}              - Get specific proof
DELETE /api/v1/proofs/{proof_id}              - Delete proof
```

#### Proof Artifacts Endpoints
```
POST   /api/v1/proofs/{proof_id}/artifacts   - Add artifact to proof
GET    /api/v1/proofs/{proof_id}/artifacts   - Get proof artifacts
```

#### Certificate Endpoints
```
POST   /api/v1/proofs/certificates            - Generate certificate
GET    /api/v1/proofs/certificates            - Get all certificates
GET    /api/v1/proofs/certificates/{cert_id}  - Get specific certificate (public)
POST   /api/v1/proofs/certificates/{cert_id}/verify   - Verify certificate
POST   /api/v1/proofs/certificates/{cert_id}/revoke   - Revoke certificate
```

### 6. Frontend UI

**Proofs Page** (`/proofs`)
- View all proofs and certificates
- Create new proofs
- Connect GitHub account
- Switch between proofs and certificates tabs
- Visual status indicators
- Proof details with metadata

**Features:**
- GitHub connection banner for non-connected users
- Proof type icons (GitHub, File, etc.)
- Status indicators (verified, pending, failed)
- Certificate management
- Public verification URLs

## Integration with Existing Features

### Projects Integration
- Proofs can be linked to specific projects via `project_id`
- Project owners can view proofs submitted for their projects
- Proofs support milestone tracking within projects

### User Profiles
- GitHub connection status visible in user profile
- Proof count and certificate count can be added to user stats
- Proofs can contribute to user reputation/ratings

### Agent System
- Agents can verify work completed for clients
- Proofs serve as evidence for completed assignments
- Certificates can be automatically generated on project completion

### Sandbox Integration (Future)
- Link sandbox executions to proofs
- Include test results as proof artifacts
- Verify code execution history

## Security Features

### Cryptographic Signatures
- All proofs and certificates are signed using HMAC-SHA256
- Signatures include timestamp, user ID, and proof data
- Signature verification prevents tampering

### Data Integrity
- SHA-256 file hashing for uploaded files
- Immutable proof records once verified
- Certificate revocation capability

### Access Control
- Users can only view/manage their own proofs
- Project-linked proofs respect project access controls
- Certificate verification is public but read-only

## Usage Examples

### 1. Verify a GitHub Commit

```bash
POST /api/v1/proofs/verify/github/commit
Authorization: Bearer {token}

{
  "repo_name": "username/repository",
  "commit_hash": "abc123def456",
  "project_id": 42,
  "milestone_name": "Feature Implementation",
  "description": "Implemented user authentication"
}
```

**Response:**
```json
{
  "id": 1,
  "proof_type": "commit",
  "status": "verified",
  "github_repo_name": "username/repository",
  "github_commit_hash": "abc123def456",
  "verified_at": "2025-11-12T10:30:00Z",
  "verification_signature": "...",
  "verification_metadata": {
    "commit_message": "Implemented user authentication",
    "author": "John Doe",
    "additions": 245,
    "deletions": 18,
    "files_changed": 12
  }
}
```

### 2. Generate a Certificate

```bash
POST /api/v1/proofs/certificates
Authorization: Bearer {token}

{
  "title": "Sprint 1 Completion",
  "milestone_name": "Sprint 1",
  "proof_ids": [1, 2, 3, 4],
  "project_id": 42,
  "description": "Completed all Sprint 1 deliverables",
  "expires_in_days": 365
}
```

**Response:**
```json
{
  "id": 1,
  "certificate_id": "CERT-ABC123XYZ456",
  "title": "Sprint 1 Completion",
  "milestone_name": "Sprint 1",
  "status": "active",
  "signature": "...",
  "verification_url": "https://relaywork.io/verify/CERT-ABC123XYZ456",
  "proof_ids": [1, 2, 3, 4],
  "issued_at": "2025-11-12T11:00:00Z",
  "expires_at": "2026-11-12T11:00:00Z"
}
```

### 3. Verify a Certificate

```bash
POST /api/v1/proofs/certificates/1/verify

Response:
{
  "valid": true,
  "certificate_id": "CERT-ABC123XYZ456",
  "issued_at": "2025-11-12T11:00:00Z",
  "expires_at": "2026-11-12T11:00:00Z",
  "status": "active",
  "proofs_count": 4
}
```

## Database Schema Details

### proofs_of_build Table
```sql
- id: Primary key
- user_id: Foreign key to users
- project_id: Optional foreign key to projects
- proof_type: ENUM (commit, pull_request, repository, file, screenshot)
- status: ENUM (pending, verified, failed, expired)
- github_repo_url, github_repo_name, github_commit_hash, github_pr_number
- file_name, file_url, file_hash, file_size
- verified_at, verification_signature, verification_metadata
- milestone_name, milestone_description
- created_at, updated_at
```

### proof_artifacts Table
```sql
- id: Primary key
- proof_id: Foreign key to proofs_of_build
- artifact_type: Type of artifact
- file_name, file_url, file_hash, file_size, mime_type
- description, metadata
- created_at
```

### build_certificates Table
```sql
- id: Primary key
- user_id: Foreign key to users
- project_id: Optional foreign key to projects
- certificate_id: Unique certificate identifier
- title, description, milestone_name, milestone_date
- status: ENUM (active, revoked, expired)
- signature, signature_algorithm
- certificate_data: JSON with complete certificate info
- badge_url, verification_url
- proof_ids: JSON array of included proof IDs
- blockchain_tx_hash, blockchain_network (for future blockchain integration)
- issued_at, expires_at, revoked_at, revocation_reason
- created_at, updated_at
```

## Future Enhancements

### On-Chain Notarization
- Integrate with Polygon or Hyperledger for blockchain timestamping
- Store transaction hashes in `blockchain_tx_hash` field
- Provide immutable proof of certificate issuance

### AI Model Validation
- Integrate with Hugging Face or Replicate API
- Verify ML model artifacts
- Include model performance metrics in proofs

### Proof of Test
- Automatically capture unit test results
- Include code coverage reports
- Link to CI/CD pipeline runs
- Verify benchmark results

### Badge System
- Generate SVG badges for certificates
- Embeddable badges for websites/portfolios
- Real-time verification status

### Milestone Automation
- Auto-generate certificates on project milestones
- Integration with project management tools
- Scheduled proof verification

### Analytics Dashboard
- Proof submission trends
- Certificate issuance statistics
- User verification metrics

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Proof Signatures
PROOF_SIGNATURE_KEY=your_secure_random_key_here

# Frontend (for verification URLs)
FRONTEND_URL=https://yourdomain.com
```

### Database Migration

Run the migration to add proof-of-build tables:

```bash
psql -U your_user -d your_database -f database/migrations/003_proof_of_build.sql
```

Or for automatic migration, the tables will be created on app startup if using SQLAlchemy.

## Testing

### Manual Testing Steps

1. **Connect GitHub Account**
   - Navigate to `/proofs`
   - Click "Connect GitHub"
   - Complete OAuth flow
   - Verify connection status

2. **Create Commit Proof**
   - Make a commit to a GitHub repository
   - In app, click "Create Proof"
   - Select "Commit" type
   - Enter repo name and commit hash
   - Verify proof is created and marked as verified

3. **Generate Certificate**
   - Create multiple proofs
   - Click "Generate Certificate"
   - Select proofs to include
   - Enter certificate details
   - Verify certificate is generated with unique ID

4. **Verify Certificate**
   - Copy certificate verification URL
   - Open in new browser (public access)
   - Verify certificate shows as valid
   - Check signature verification

### API Testing

Use the FastAPI docs at `/docs` to test all endpoints:
- GitHub OAuth flow
- Proof creation endpoints
- Certificate generation
- Verification endpoints

## Troubleshooting

### GitHub OAuth Issues
- Verify `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are set
- Check OAuth app callback URL matches your frontend URL
- Ensure OAuth app has correct scopes: `repo`, `user:email`

### Signature Verification Fails
- Verify `PROOF_SIGNATURE_KEY` is consistent across restarts
- Don't change the key after generating certificates
- Check signature data format matches expected pattern

### Proof Verification Fails
- Check GitHub access token is valid
- Verify repository access permissions
- Ensure commit/PR exists and is accessible

## API Integration Examples

### Python Client

```python
import requests

# Connect to API
api_url = "http://localhost:8000/api/v1"
token = "your_access_token"
headers = {"Authorization": f"Bearer {token}"}

# Verify commit
response = requests.post(
    f"{api_url}/proofs/verify/github/commit",
    headers=headers,
    json={
        "repo_name": "username/repo",
        "commit_hash": "abc123",
        "milestone_name": "Feature X"
    }
)
proof = response.json()
print(f"Proof ID: {proof['id']}, Status: {proof['status']}")

# Generate certificate
response = requests.post(
    f"{api_url}/proofs/certificates",
    headers=headers,
    json={
        "title": "Milestone Certificate",
        "milestone_name": "Phase 1",
        "proof_ids": [proof['id']]
    }
)
cert = response.json()
print(f"Certificate: {cert['certificate_id']}")
print(f"Verify at: {cert['verification_url']}")
```

### JavaScript/TypeScript Client

```typescript
const apiUrl = 'http://localhost:8000/api/v1';
const token = localStorage.getItem('access_token');

// Verify PR
const verifyPR = async (repoName: string, prNumber: number) => {
  const response = await fetch(`${apiUrl}/proofs/verify/github/pr`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      repo_name: repoName,
      pr_number: prNumber,
      milestone_name: 'Feature Development'
    })
  });
  return response.json();
};

// Get all proofs
const getProofs = async () => {
  const response = await fetch(`${apiUrl}/proofs/`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

## Support and Contributing

For issues or feature requests related to Proof-of-Build:
1. Check existing documentation
2. Review API docs at `/docs`
3. Test with sample data first
4. Report issues with detailed reproduction steps

## License

This feature is part of the Relaywork platform and follows the same license as the main project.
