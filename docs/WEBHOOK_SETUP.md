# GitHub Webhook Setup Guide

## Overview

Automatic proof creation via GitHub webhooks allows freelancers to automatically generate proof-of-build records when they commit code with project ID tags.

## How It Works

1. Freelancer makes a commit with a project ID tag in the message
2. GitHub sends a webhook event to your server
3. System automatically creates a verified proof of build
4. Proof appears in project dashboard immediately

## Setup Instructions

### 1. Configure Environment Variable

Add your GitHub webhook secret to `.env`:

```bash
GITHUB_WEBHOOK_SECRET=your_secret_here_use_strong_random_string
```

Generate a strong secret:
```bash
openssl rand -hex 32
```

### 2. Configure GitHub Repository Webhook

1. Go to your GitHub repository
2. Navigate to **Settings** → **Webhooks**
3. Click **Add webhook**
4. Configure:
   - **Payload URL**: `https://yourdomain.com/api/v1/webhooks/github`
   - **Content type**: `application/json`
   - **Secret**: (use the same value as GITHUB_WEBHOOK_SECRET)
   - **Events**: Select "Just the push event"
   - **Active**: ✅ Checked

5. Click **Add webhook**

### 3. Link GitHub Username to Profile

Freelancers must set their GitHub username in their Relaywork profile:

1. Go to **Profile Settings**
2. Add GitHub username (e.g., `octocat`)
3. Save

## Commit Message Format

Include project ID tags in commit messages:

### Supported Formats

```bash
# Hash format
git commit -m "Fix authentication bug #relay-123"
git commit -m "Add feature #project-456"
git commit -m "Refactor code #proj-789"

# Bracket format
git commit -m "[relay-123] Implement user dashboard"
git commit -m "[project-456] Update API endpoints"
```

### Multiple Projects

Link a single commit to multiple projects:

```bash
git commit -m "Shared utility function #relay-123 #relay-456"
```

### Project ID Patterns

The system recognizes these patterns (case-insensitive):
- `#relay-{id}`
- `#project-{id}`
- `#proj-{id}`
- `[relay-{id}]`
- `[project-{id}]`
- `[proj-{id}]`

## What Gets Tracked

Each proof automatically includes:

- ✅ **Commit hash** - Full SHA-1 hash
- ✅ **Commit message** - Complete commit message
- ✅ **Author information** - Name and email
- ✅ **Timestamp** - When commit was made
- ✅ **Repository** - Full repository name (org/repo)
- ✅ **Branch** - Which branch was pushed
- ✅ **File changes** - Number of files added/modified/removed
- ✅ **Automatic verification** - Webhook proofs are auto-verified

## Security

### Signature Verification

All webhook requests are verified using HMAC-SHA256:

```python
# Automatic verification in webhook endpoint
def verify_github_signature(payload, signature, secret):
    mac = hmac.new(secret.encode(), msg=payload, digestmod=hashlib.sha256)
    expected = mac.hexdigest()
    return hmac.compare_digest(expected, signature)
```

### Authorization Check

Proofs are only created if:

1. User has connected GitHub username in profile
2. User has an **accepted** application on the project
3. Project ID exists and is valid
4. No duplicate proof for same commit+project

## Testing

### Test Webhook Endpoint

```bash
curl https://yourdomain.com/api/v1/webhooks/github/test
```

Expected response:
```json
{
  "status": "ok",
  "message": "GitHub webhook endpoint is active",
  "instructions": {
    "setup": "Configure webhook in GitHub repository settings",
    "url": "/api/v1/webhooks/github",
    "content_type": "application/json",
    "events": ["push"],
    "commit_format": "Include project ID in commit message: #relay-123 or [relay-123]"
  }
}
```

### Test Commit

Make a test commit:

```bash
git commit -m "Test webhook integration #relay-123" --allow-empty
git push
```

Check webhook deliveries in GitHub:
- Go to **Settings** → **Webhooks**
- Click on your webhook
- View **Recent Deliveries**
- Check response status (should be 200)

## Troubleshooting

### Webhook Not Creating Proofs

**Check 1: GitHub Username**
- Ensure GitHub username is set in Relaywork profile
- Must match the username that pushed the commit

**Check 2: Application Status**
- User must have **accepted** application on project
- Check application status in project dashboard

**Check 3: Project ID Format**
- Use correct format: `#relay-123` or `[relay-123]`
- Project ID must exist in database

**Check 4: Webhook Delivery**
- Check GitHub webhook Recent Deliveries tab
- Look for 200 status code
- Review response body for errors

### Signature Verification Failed

- Ensure GITHUB_WEBHOOK_SECRET matches in both:
  - Server environment variables
  - GitHub webhook configuration

### Duplicate Proofs

System prevents duplicates:
- One proof per commit hash + project ID combination
- Subsequent webhook calls for same commit return existing proof

## API Response

Successful webhook processing returns:

```json
{
  "message": "Webhook processed successfully",
  "repository": "username/repo-name",
  "commits_processed": 3,
  "proofs_created": 2,
  "proofs": [
    {
      "proof_id": 45,
      "project_id": 123,
      "commit_hash": "a1b2c3d",
      "description": "Auto: Fix authentication bug"
    },
    {
      "proof_id": 46,
      "project_id": 124,
      "commit_hash": "e4f5g6h",
      "description": "Auto: Add new feature"
    }
  ]
}
```

## Manual Sync (Future Feature)

For backfilling proofs from existing commits:

```bash
POST /api/v1/webhooks/github/manual-sync
{
  "repository_url": "https://github.com/username/repo",
  "branch": "main",
  "since_days": 30
}
```

*Note: Manual sync not yet implemented. Use webhooks for real-time proof creation.*

## Best Practices

### For Freelancers

1. **Always include project ID** in commit messages for client work
2. **Set GitHub username** in profile before starting work
3. **Use descriptive commit messages** - they become proof descriptions
4. **Push regularly** - proofs are created immediately on push

### For Companies

1. **Verify freelancer has GitHub username** set before assignment
2. **Monitor proof activity** in project dashboard
3. **Use milestone system** to group proofs for payment releases
4. **Check webhook deliveries** if proofs aren't appearing

### Commit Message Examples

✅ **Good**:
```
#relay-123 Implement user authentication with JWT

- Add login endpoint with email/password validation
- Implement JWT token generation and verification
- Add password hashing with bcrypt
- Include refresh token rotation
```

❌ **Bad**:
```
fix stuff
```

⚠️ **Missing ID**:
```
Implement user authentication
```
(No proof created - missing project ID)

## Monitoring

### View Proofs in Dashboard

**Freelancers:**
- Dashboard → Recent Proofs widget
- Projects → Select Project → Proofs tab

**Companies:**
- Projects → Select Project → Proofs tab
- View real-time proof submissions
- See commit metadata and stats

### Webhook Logs

Server logs include:
```
INFO: Received push event from username/repo by user123 with 3 commits
INFO: Found project IDs [123, 456] in commit a1b2c3d
INFO: Created proof 45 from commit a1b2c3d for project 123
```

## Advanced Configuration

### Custom Webhook URL

If using a reverse proxy or custom domain:

```nginx
location /webhooks/github {
    proxy_pass http://localhost:8000/api/v1/webhooks/github;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

### Multiple Repositories

Configure the webhook in each repository that contains client work:
- Personal repository
- Organization repositories
- Client-owned repositories (with permission)

Each repository's webhook should point to the same endpoint.

## FAQ

**Q: Can I use webhooks with private repositories?**
A: Yes, webhooks work with both public and private repositories.

**Q: What if I forget to include project ID in commit?**
A: The commit won't create a proof automatically. Add it to the next commit or create a proof manually.

**Q: Can I edit auto-created proofs?**
A: Auto-created proofs are verified but can be viewed by authorized users.

**Q: What happens if project doesn't exist?**
A: Webhook processes successfully but doesn't create proof. Check logs for warnings.

**Q: Can I use multiple project IDs in one commit?**
A: Yes! Include multiple tags: `#relay-123 #relay-456`

**Q: How quickly are proofs created?**
A: Immediately upon push - typically within 1-2 seconds.

## Support

If you encounter issues:

1. Check webhook delivery in GitHub
2. Review server logs for errors
3. Verify all setup requirements
4. Test with webhook test endpoint
5. Contact support with webhook delivery ID
