# Shared Sandbox Feature - AI Build/Test Environment

## Overview

The Shared Sandbox feature provides an isolated development and testing environment where freelancers and clients can collaborate in real-time to test AI flows, chatbots, prompts, and APIs.

## Features

### MVP (Implemented)

- **Code Editor**: Monaco Editor (VS Code editor) with syntax highlighting for Python, JavaScript, and TypeScript
- **Terminal**: xterm.js terminal for displaying execution output and errors
- **File Management**: Create, edit, and delete files within the sandbox
- **Code Execution**: Isolated execution using Docker containers with resource limits
- **Real-time Collaboration**: WebSocket-based real-time updates when multiple users work in the same sandbox
- **Session Management**: Create, list, update, and delete sandbox sessions
- **Access Control**: Share sandboxes with specific users or project collaborators
- **Execution History**: Track all code executions with timestamps, output, and duration

### Architecture

#### Backend (FastAPI + Python)

**Database Schema:**
- `sandbox_sessions`: Main sandbox table storing metadata, files, and execution history
- `sandbox_collaborators`: Tracks active users in real-time collaboration
- Enums: `sandbox_status`, `sandbox_language`

**API Endpoints:**
- `POST /api/v1/sandboxes/`: Create new sandbox
- `GET /api/v1/sandboxes/`: List user's sandboxes
- `GET /api/v1/sandboxes/{id}`: Get sandbox details
- `PATCH /api/v1/sandboxes/{id}`: Update sandbox
- `DELETE /api/v1/sandboxes/{id}`: Delete sandbox
- `POST /api/v1/sandboxes/{id}/execute`: Execute code
- `POST /api/v1/sandboxes/{id}/files`: Manage files (create/update/delete)
- `POST /api/v1/sandboxes/{id}/share`: Share with users
- `GET /api/v1/sandboxes/{id}/collaborators`: Get active collaborators
- `POST /api/v1/sandboxes/{id}/snapshot`: Create version snapshot
- `WebSocket /api/v1/sandboxes/{id}/ws`: Real-time collaboration

**Execution Service:**
- Docker-based isolated execution
- Resource limits: 256MB RAM, 0.5 CPU, 30s default timeout
- No network access for security
- Read-only filesystem with temporary directory for execution
- Fallback to local execution for development (insecure)

#### Frontend (Next.js + TypeScript)

**Pages:**
- `/sandboxes`: List all sandboxes with create dialog
- `/sandbox/[id]`: Main sandbox IDE with editor, terminal, and file tree

**Components:**
- Monaco Editor for code editing
- xterm.js terminal for output
- File tree with create/delete actions
- Real-time collaboration indicators

## Usage

### Creating a Sandbox

1. Navigate to `/sandboxes`
2. Click "New Sandbox"
3. Enter name, description, and select language (Python, JavaScript, or TypeScript)
4. Click "Create"

### Using the Sandbox

1. **File Management:**
   - Click the folder icon to create new files
   - Select files from the sidebar to edit
   - Hover over files and click trash icon to delete

2. **Writing Code:**
   - Type code in the Monaco editor
   - Auto-saves when switching files
   - Click "Save" button to manually save

3. **Running Code:**
   - Click "Run" button to execute the current file
   - Output appears in the terminal below
   - Errors are displayed in red

4. **Collaboration:**
   - Share sandbox with others using the Share button
   - See active collaborators in the header
   - Real-time updates when others edit files

### Sharing a Sandbox

```javascript
// Via API
await sandboxesAPI.share(sandboxId, [userId1, userId2]);
```

Or use the Share button in the UI to add collaborators.

### Integration with Projects

Sandboxes can be linked to projects:

```javascript
// Create sandbox for a project
await sandboxesAPI.create({
  name: "Project Test Environment",
  project_id: projectId,
  language: "python",
});
```

## Security

- **Isolated Execution**: Each execution runs in a fresh Docker container
- **No Network Access**: Containers have `--network none` flag
- **Resource Limits**: CPU and memory are capped
- **Read-only Filesystem**: Only `/tmp` is writable
- **Timeout Protection**: Maximum 5 minutes execution time
- **Access Control**: Only owners and shared users can access sandboxes

## Database Migration

To add sandbox tables to your database:

```bash
# Run the migration SQL
psql <database_url> -f database/migrations/001_add_sandbox_sessions.sql
```

Or use the database migration tool:

```bash
cd backend
python migrate.py
```

## Docker Requirements

For sandbox execution, Docker must be installed and running:

```bash
# Check Docker availability
docker --version

# Pull required images
docker pull python:3.11-slim
docker pull node:18-alpine
```

If Docker is not available, the system falls back to local execution (development only, insecure).

## API Examples

### Create Sandbox

```bash
curl -X POST http://localhost:8000/api/v1/sandboxes/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Python Sandbox",
    "language": "python",
    "description": "Testing AI scripts"
  }'
```

### Execute Code

```bash
curl -X POST http://localhost:8000/api/v1/sandboxes/1/execute \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "file_path": "main.py",
    "timeout": 30
  }'
```

### Create File

```bash
curl -X POST http://localhost:8000/api/v1/sandboxes/1/files \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "create",
    "file_path": "script.py",
    "content": "print(\"Hello World\")"
  }'
```

## WebSocket Messages

### Client to Server

```javascript
// Typing indicator
ws.send(JSON.stringify({
  type: "typing",
  is_typing: true,
  file: "main.py"
}));

// File change notification
ws.send(JSON.stringify({
  type: "file_change",
  file_path: "main.py"
}));

// Execution started
ws.send(JSON.stringify({
  type: "execution_started",
  file_path: "main.py"
}));
```

### Server to Client

```javascript
// User joined
{
  "type": "user_joined",
  "user_id": 123,
  "timestamp": "2025-11-12T10:30:00Z"
}

// File changed by another user
{
  "type": "file_changed",
  "user_id": 123,
  "file_path": "main.py",
  "timestamp": "2025-11-12T10:31:00Z"
}

// Cursor update
{
  "type": "cursor_update",
  "user_id": 123,
  "position": {"line": 10, "column": 5}
}
```

## Future Enhancements

### Planned Features

1. **Version Control**:
   - Git-like snapshots
   - Diff viewing
   - Branch/merge capabilities

2. **Enhanced Containerization**:
   - Persistent containers per user
   - Custom Docker images
   - Resource scaling based on tier

3. **AI Testing Integration**:
   - Quality score metrics
   - Latency tracking
   - Token cost calculation
   - A/B testing for prompts

4. **Team Sandboxes**:
   - Multi-user editing (CRDT)
   - Video/voice chat integration
   - Screen sharing
   - Preview links for sharing results

5. **Advanced Features**:
   - Package installation (pip, npm)
   - Environment variables
   - Database connections
   - API key management
   - Deployment to staging environments

## Troubleshooting

### Docker Not Available

If you see "Docker not available" warnings:
1. Install Docker: https://docs.docker.com/get-docker/
2. Start Docker daemon
3. Verify with: `docker ps`

### Execution Timeouts

If code consistently times out:
1. Check resource limits in `runtime_config`
2. Optimize code for performance
3. Increase timeout (max 5 minutes)

### WebSocket Connection Failed

If real-time collaboration doesn't work:
1. Check WebSocket URL configuration
2. Verify JWT token is valid
3. Check browser console for errors
4. Ensure firewall allows WebSocket connections

## Support

For issues or questions:
- GitHub Issues: https://github.com/your-org/relaywork/issues
- Documentation: https://docs.relaywork.com/sandbox
- Email: support@relaywork.com
