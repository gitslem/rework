# Feature 4: Timezone-Aware Collaboration - Quick Start Guide

## 🚀 What's New

This feature enables distributed teams to collaborate effectively across timezones with:
- 📍 User timezone and working hours tracking
- 🕐 Visual timeline showing team availability
- 🤝 Automatic overlap window calculation
- 💡 Smart meeting time suggestions

## 📦 Files Added

### Backend
- `backend/app/services/timezone_service.py` - Core timezone logic
- `backend/app/api/endpoints/collaboration.py` - API endpoints
- `database/migrations/004_add_timezone_fields.sql` - Database migration

### Frontend
- `frontend/src/components/TimezoneTimeline.tsx` - Visual timeline
- `frontend/src/components/TimezoneSelector.tsx` - Timezone picker
- `frontend/src/components/WorkingHoursSelector.tsx` - Working hours config
- `frontend/src/pages/team-timezone.tsx` - Team collaboration page
- `frontend/src/pages/profile-settings.tsx` - Profile with timezone settings

### Files Modified
- `backend/app/models/models.py` - Added timezone fields to Profile
- `backend/app/schemas/schemas.py` - Added timezone schemas
- `backend/main.py` - Registered collaboration router

## 🔧 Setup Instructions

### 1. Database Migration

**For PostgreSQL:**
```bash
psql $DATABASE_URL -f database/migrations/004_add_timezone_fields.sql
```

**For SQLite (Development):**
The migration will run automatically on next app start via SQLAlchemy schema updates.

### 2. Backend Setup

The backend is ready to go! Just restart the server:
```bash
cd backend
uvicorn main:app --reload
```

**Test the API:**
```bash
# Check health
curl http://localhost:8000/health

# View API docs
open http://localhost:8000/docs
```

### 3. Frontend Setup

No additional dependencies needed! The components use built-in browser APIs.

```bash
cd frontend
npm run dev
```

## 🎯 How to Use

### For End Users

#### 1. Set Your Timezone

1. Go to **Profile Settings** (`/profile-settings`)
2. Scroll to "Timezone & Working Hours" section
3. Select your timezone from the dropdown
4. Configure your working hours (default: 9 AM - 5 PM)
5. Select your working days (default: Mon-Fri)
6. Click **Save Changes**

#### 2. View Team Timeline

**Option A: Project Team**
1. Go to **Team Timezone** page (`/team-timezone`)
2. Select "Project Team" mode
3. Enter your project ID
4. Click **Load**

**Option B: Custom Team**
1. Go to **Team Timezone** page
2. Select "Custom Team" mode
3. Enter user IDs (comma-separated)
4. Click **Calculate**

#### 3. Find Best Meeting Times

The timeline shows:
- **Blue blocks** = Working hours
- **Gray blocks** = Off hours
- **Green border** = Current time
- **Best meeting times** listed below the timeline

## 📡 API Endpoints

### Get Your Timezone Info
```bash
GET /api/v1/collaboration/timezones/me
Authorization: Bearer {token}
```

### Calculate Project Team Overlap
```bash
POST /api/v1/collaboration/overlap/project
Authorization: Bearer {token}
Content-Type: application/json

{
  "project_id": 123,
  "include_applicants": false
}
```

### Calculate Custom Team Overlap
```bash
POST /api/v1/collaboration/overlap/custom
Authorization: Bearer {token}
Content-Type: application/json

{
  "user_ids": [1, 2, 3, 4]
}
```

### Update Profile with Timezone
```bash
PATCH /api/v1/users/me/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "timezone": "America/New_York",
  "working_hours_start": 9,
  "working_hours_end": 17,
  "working_days": [1, 2, 3, 4, 5]
}
```

### Get Timezone List
```bash
GET /api/v1/collaboration/timezones/list
```

## 🧪 Testing Scenarios

### Scenario 1: Same Timezone (Full Overlap)
- User 1: New York, 9-5, Mon-Fri
- User 2: New York, 9-5, Mon-Fri
- **Expected:** 40 hours/week overlap

### Scenario 2: US East Coast + Europe
- User 1: New York (UTC-5), 9-5, Mon-Fri
- User 2: London (UTC+0), 9-5, Mon-Fri
- **Expected:** 3 hours/day overlap (9 AM - 12 PM NY = 2 PM - 5 PM London)

### Scenario 3: US + Asia (Minimal Overlap)
- User 1: Los Angeles (UTC-8), 9-5, Mon-Fri
- User 2: Tokyo (UTC+9), 9-5, Mon-Fri
- **Expected:** Very small or no overlap (17 hour difference)

### Scenario 4: Night Shift
- User 1: New York, 22-6 (night shift), Mon-Fri
- User 2: New York, 9-5, Mon-Fri
- **Expected:** No overlap

## 🎨 UI Components Usage

### TimezoneSelector
```tsx
import TimezoneSelector from '../components/TimezoneSelector';

<TimezoneSelector
  value={timezone}
  onChange={(tz) => setTimezone(tz)}
/>
```

### WorkingHoursSelector
```tsx
import WorkingHoursSelector from '../components/WorkingHoursSelector';

<WorkingHoursSelector
  startHour={9}
  endHour={17}
  workingDays={[1, 2, 3, 4, 5]}
  onStartHourChange={setStartHour}
  onEndHourChange={setEndHour}
  onWorkingDaysChange={setWorkingDays}
/>
```

### TimezoneTimeline
```tsx
import TimezoneTimeline from '../components/TimezoneTimeline';

<TimezoneTimeline
  users={teamData.user_timezones}
  overlapWindows={teamData.best_meeting_times}
  currentUserTimezone="America/New_York"
/>
```

## 🐛 Troubleshooting

### "Invalid timezone" error
- Use IANA timezone names: `"America/New_York"` ✅ not `"EST"` ❌
- Check: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones

### No overlap windows found
- Verify users have overlapping working days
- Check timezone span (>12 hours makes overlap unlikely)
- Consider async communication for large spans

### Timeline not updating
- Clear browser cache
- Check console for errors
- Verify API returns correct data

### Migration already applied
- Check existing columns: `\d profiles` in psql
- Skip if columns already exist
- Or use `IF NOT EXISTS` in migration

## 📚 Documentation

- **Full Documentation:** `docs/FEATURE_4_TIMEZONE_COLLABORATION.md`
- **API Docs:** http://localhost:8000/docs (when backend running)

## 🔮 Future Enhancements

- [ ] Calendar integration (Google, Microsoft)
- [ ] AI meeting scheduler
- [ ] Recurring meeting optimizer
- [ ] Slack/Discord bot
- [ ] Mobile app with push notifications
- [ ] Public holidays database
- [ ] "Do Not Disturb" periods

## ✅ Verification Checklist

After setup, verify:
- [ ] Backend starts without errors
- [ ] Migration applied successfully
- [ ] Can update profile with timezone
- [ ] Can view timezone list
- [ ] Profile settings page loads
- [ ] Team timezone page loads
- [ ] Timeline renders correctly
- [ ] Best meeting times show up

## 🎉 Ready to Use!

Your timezone-aware collaboration feature is now ready. Users can:
1. Set their timezone and working hours
2. View team availability
3. Find optimal meeting times
4. Collaborate across time zones effectively

Need help? Check the full documentation in `docs/FEATURE_4_TIMEZONE_COLLABORATION.md`
