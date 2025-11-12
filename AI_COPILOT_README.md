# AI Co-Pilot for Project Management - Integration Guide

## Overview

The AI Co-Pilot feature provides intelligent project management assistance by:
- Analyzing GitHub activity (commits, PRs)
- Summarizing project messages/communications
- Identifying completed tasks and blockers
- Recommending next steps
- Generating weekly progress digests automatically

## Features Implemented

### 1. Backend Components

#### Database Models (`backend/app/models/models.py`)
- **`ProjectMessage`**: Stores chat messages between project stakeholders
- **`AISummary`**: Stores AI-generated summaries with structured insights
- **`SummaryType`** enum: WEEKLY, ON_DEMAND, MILESTONE

#### Services (`backend/app/services/ai_copilot_service.py`)
- **`AICopilotService`**: Core service for AI analysis
  - `generate_project_summary()`: Generates comprehensive AI summaries
  - `get_project_summaries()`: Retrieves historical summaries
  - `get_latest_summary()`: Gets most recent summary
  - `send_message()`: Sends project messages
  - `get_project_messages()`: Retrieves project messages

#### API Endpoints (`backend/app/api/endpoints/ai_copilot.py`)
- `POST /api/v1/ai-copilot/summary/generate` - Generate on-demand summary
- `GET /api/v1/ai-copilot/summaries/{project_id}` - Get all summaries
- `GET /api/v1/ai-copilot/summary/latest/{project_id}` - Get latest summary
- `POST /api/v1/ai-copilot/messages` - Send message
- `GET /api/v1/ai-copilot/messages/{project_id}` - Get messages

#### Celery Tasks (`backend/app/tasks/ai_tasks.py`)
- **`generate_weekly_summaries`**: Automatic weekly summaries (Mondays 9 AM UTC)
- **`cleanup_old_summaries`**: Archive summaries older than 90 days
- **`generate_summary_for_project`**: Async task for on-demand generation

### 2. Frontend Components

#### Components
- **`AISummaryCard.tsx`**: Dashboard card displaying latest AI summary
  - Shows key metrics (commits, PRs, messages)
  - Displays activity level
  - Lists tasks completed, blockers, and next steps
  - Expandable/collapsible details

- **`GenerateSummaryModal.tsx`**: Modal for generating on-demand summaries
  - Period selection (24 hours to 3 months)
  - Data source toggles (GitHub, messages)
  - Loading states and error handling

## Setup Instructions

### 1. Backend Setup

#### Install Dependencies
```bash
cd backend
pip install openai celery redis
```

Or add to `requirements.txt`:
```
openai>=1.0.0
celery>=5.3.0
redis>=5.0.0
```

#### Environment Variables
Add to `.env` file:
```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-4o-mini  # or gpt-4o, gpt-3.5-turbo

# Redis for Celery
REDIS_URL=redis://localhost:6379/0
```

#### Initialize Database
```bash
# Run database migration
cd backend
python -m app.db.database  # or use Alembic if configured

# Or use the API endpoint
curl -X POST http://localhost:8000/init-db
```

#### Start Celery Worker (Optional for weekly summaries)
```bash
cd backend
celery -A app.core.celery_app worker --loglevel=info
```

#### Start Celery Beat (Optional for scheduled tasks)
```bash
cd backend
celery -A app.core.celery_app beat --loglevel=info
```

### 2. Frontend Setup

#### Environment Variables
Ensure `frontend/.env.local` has:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### Usage Example

```tsx
import AISummaryCard from '@/components/AISummaryCard';
import GenerateSummaryModal from '@/components/GenerateSummaryModal';
import { useState } from 'react';

export default function ProjectDashboard({ projectId }: { projectId: number }) {
  const [showModal, setShowModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleGenerateClick = () => {
    setShowModal(true);
  };

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1); // Trigger refresh
  };

  return (
    <div className="space-y-6">
      <h1>Project Dashboard</h1>

      {/* AI Summary Card */}
      <AISummaryCard
        key={refreshKey}
        projectId={projectId}
        onGenerateClick={handleGenerateClick}
      />

      {/* Generate Summary Modal */}
      <GenerateSummaryModal
        projectId={projectId}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
```

## API Usage Examples

### Generate On-Demand Summary
```bash
curl -X POST http://localhost:8000/api/v1/ai-copilot/summary/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": 1,
    "summary_type": "on_demand",
    "period_days": 7,
    "include_github": true,
    "include_messages": true
  }'
```

### Get Latest Summary
```bash
curl http://localhost:8000/api/v1/ai-copilot/summary/latest/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Send Project Message
```bash
curl -X POST http://localhost:8000/api/v1/ai-copilot/messages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": 1,
    "message": "Project milestone completed!",
    "message_type": "text"
  }'
```

## AI Summary Structure

The AI-generated summary includes:

```json
{
  "id": 1,
  "project_id": 1,
  "title": "Weekly Summary - Dec 15, 2024",
  "summary": "Comprehensive 2-3 paragraph overview...",
  "tasks_completed": [
    "Implemented user authentication",
    "Fixed critical bug in payment processing"
  ],
  "blockers": [
    "Waiting for API access from third-party service"
  ],
  "next_steps": [
    "Complete integration tests",
    "Deploy to staging environment"
  ],
  "key_metrics": {
    "activity_level": "high",
    "progress_velocity": "accelerating",
    "risk_level": "low",
    "commits": 15,
    "prs": 3,
    "messages": 28
  },
  "github_commits_analyzed": 15,
  "github_prs_analyzed": 3,
  "messages_analyzed": 28,
  "period_start": "2024-12-08T00:00:00Z",
  "period_end": "2024-12-15T00:00:00Z",
  "ai_model_used": "gpt-4o-mini",
  "created_at": "2024-12-15T09:00:00Z"
}
```

## Data Flow

1. **Data Collection**:
   - GitHub activity from `ProofOfBuild` records
   - Project messages from `ProjectMessage` table
   - Project metadata (status, deadline, budget)

2. **AI Analysis**:
   - OpenAI processes collected data
   - Generates structured insights
   - Identifies patterns and trends

3. **Storage**:
   - Summary saved to `AISummary` table
   - Linked to project and user

4. **Display**:
   - Frontend fetches latest summary
   - Renders in dashboard card
   - Allows expansion for details

## Scheduled Tasks

### Weekly Summaries (Mondays 9 AM UTC)
Automatically generates summaries for all active projects:
- Projects with status `OPEN` or `IN_PROGRESS`
- Analyzes last 7 days of activity
- Sends notifications (if configured)

### Summary Cleanup (Sundays Midnight)
Archives summaries older than 90 days:
- Keeps summaries searchable
- Reduces database size
- Maintains historical records

## Future Enhancements

### Planned Features (from requirements)
1. **Conversation-based AI PM**:
   - Upgrade to LangGraph or Autogen agents
   - Interactive Q&A about project status

2. **External Integrations**:
   - Notion API sync
   - Jira integration
   - Linear API connection

3. **Predictive Analytics**:
   - Delay detection based on work patterns
   - Timeline estimation
   - Resource bottleneck identification

4. **Webhooks**:
   - GitHub webhook integration
   - Real-time activity processing
   - Instant summary triggers

## Troubleshooting

### No summaries generated
- Check `OPENAI_API_KEY` is set correctly
- Verify project has GitHub activity or messages
- Check API logs for errors

### Celery tasks not running
- Ensure Redis is running: `redis-cli ping`
- Check Celery worker is started
- Verify `REDIS_URL` in environment

### Frontend not loading summaries
- Check API URL in `.env.local`
- Verify authentication token is valid
- Check browser console for errors

## Cost Considerations

- **gpt-4o-mini**: Most cost-effective (~$0.15/1M tokens)
- **gpt-4o**: Higher quality, higher cost (~$2.50/1M tokens)
- Average summary uses ~500-1500 tokens
- Weekly summaries for 100 projects ≈ $0.015 - $0.375/week

## Security

- All endpoints require authentication
- Users can only access their project summaries
- OpenAI API key stored securely in environment
- No sensitive data sent to OpenAI (hashed commits, sanitized messages)

## Testing

```bash
# Test backend endpoints
cd backend
pytest tests/test_ai_copilot.py

# Test frontend components
cd frontend
npm test -- AISummaryCard.test.tsx
```

## Support

For issues or questions:
1. Check logs: `backend/logs/` or console
2. Review API docs: `http://localhost:8000/docs`
3. Verify database tables exist: `init-db` endpoint
4. Check OpenAI API status: https://status.openai.com/

---

**Integration Complete!** 🎉

The AI Co-Pilot is now fully integrated and ready to provide intelligent project management insights.
