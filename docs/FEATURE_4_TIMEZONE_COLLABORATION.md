# Feature 4: Timezone-Aware Collaboration

## Overview

The Timezone-Aware Collaboration feature enables distributed teams to work effectively across different time zones by:
- Tracking each user's timezone and working hours
- Calculating overlap windows for synchronous meetings
- Visualizing team availability in an intuitive timeline
- Scheduling notifications within user's working hours
- Auto-suggesting best meeting times

## Architecture

### Data Model

#### Profile Extensions (backend/app/models/models.py:128-164)

Added to the `Profile` model:
```python
timezone = Column(String, default="UTC", nullable=False)
working_hours_start = Column(Integer, default=9, nullable=False)  # 0-23
working_hours_end = Column(Integer, default=17, nullable=False)    # 0-23
working_days = Column(JSON, default=[1, 2, 3, 4, 5])              # 0=Sunday, 6=Saturday
```

### Backend Services

#### TimezoneService (backend/app/services/timezone_service.py)

Core business logic for timezone calculations:

**Key Methods:**
- `get_current_time_in_timezone(timezone)` - Get current time in specific timezone
- `convert_time_to_timezone(dt, target_timezone)` - Convert datetime between timezones
- `is_user_in_working_hours(...)` - Check if user is currently working
- `calculate_overlap_windows(users)` - Find overlap periods between team members
- `get_best_meeting_times(overlap_windows)` - Suggest optimal meeting slots
- `calculate_timezone_span(users)` - Calculate timezone spread across team
- `schedule_notification_in_working_hours(...)` - Schedule notifications appropriately

**Technologies:**
- Python `zoneinfo` module (Python 3.9+) for IANA timezone support
- Timezone-aware datetime objects throughout
- Handles edge cases: midnight crossing, DST transitions

### API Endpoints

#### Collaboration Router (backend/app/api/endpoints/collaboration.py)

**Endpoints:**

1. **GET `/api/v1/collaboration/timezones/me`**
   - Returns current user's timezone information
   - Response: `UserTimezoneInfo`

2. **GET `/api/v1/collaboration/timezones/user/{user_id}`**
   - Get timezone info for specific user
   - Response: `UserTimezoneInfo`

3. **POST `/api/v1/collaboration/overlap/project`**
   - Calculate overlap for project team
   - Request: `ProjectTeamRequest` (project_id, include_applicants)
   - Response: `TeamOverlapResponse`

4. **POST `/api/v1/collaboration/overlap/custom`**
   - Calculate overlap for custom user list
   - Request: `CustomTeamRequest` (user_ids[])
   - Response: `TeamOverlapResponse`

5. **GET `/api/v1/collaboration/timezones/current-hour/{user_id}`**
   - Get user's current local time and working status
   - Response: `{ current_hour, is_working_hours, timezone, ... }`

6. **GET `/api/v1/collaboration/timezones/list`**
   - Get list of common timezones for selector
   - Response: `[{ value, label, offset }, ...]`

### Frontend Components

#### 1. TimezoneTimeline (frontend/src/components/TimezoneTimeline.tsx)

Visual timeline showing team working hours:
- **24-hour grid** showing each user's working hours
- **Color coding:** Blue = working hours, Gray = off hours, Green border = current time
- **Overlap indicators:** Shows best collaboration windows
- **Real-time updates:** Current hour highlighted

**Props:**
```typescript
interface TimezoneTimelineProps {
  users: UserTimezoneInfo[];
  overlapWindows: OverlapWindow[];
  currentUserTimezone: string;
}
```

#### 2. TimezoneSelector (frontend/src/components/TimezoneSelector.tsx)

Dropdown for selecting timezone with:
- **Search functionality** - Filter timezones by name
- **Current time display** - Shows local time for selected timezone
- **Grouped by region** - North America, Europe, Asia, etc.
- **Common timezones** - Pre-populated list from API

#### 3. WorkingHoursSelector (frontend/src/components/WorkingHoursSelector.tsx)

Configure working hours and days:
- **Hour range selector** - Start/end time dropdowns
- **Day toggles** - Visual buttons for each day of week
- **Quick presets** - "Weekdays" and "All Days" buttons
- **Weekly hours summary** - Calculates total hours/week

### Pages

#### 1. Team Timezone Page (frontend/src/pages/team-timezone.tsx)

Main collaboration visualization:
- **Project mode** - View team for specific project
- **Custom mode** - Enter user IDs manually
- **Statistics cards** - Team size, overlap hours, timezone span
- **Timeline visualization** - Full team working hours
- **Best meeting times** - Top 5 collaboration windows

#### 2. Profile Settings Page (frontend/src/pages/profile-settings.tsx)

User profile management with timezone:
- **Personal information** - Name, bio, location
- **Professional info** - Skills, website, LinkedIn
- **Timezone settings** - Timezone selector integrated
- **Working hours** - Configure schedule and days
- **Real-time preview** - Current local time display

## Database Migration

### Migration File (database/migrations/004_add_timezone_fields.sql)

**Changes:**
1. Add 4 new columns to `profiles` table
2. Add check constraints for hour values (0-23)
3. Create index on timezone column
4. Smart migration: Auto-detect timezone from location field

**Default Values:**
- timezone: "UTC"
- working_hours_start: 9
- working_hours_end: 17
- working_days: [1, 2, 3, 4, 5] (Mon-Fri)

**Run Migration:**
```bash
psql $DATABASE_URL -f database/migrations/004_add_timezone_fields.sql
```

## Key Features

### 1. Timezone Overlap Calculation

**Algorithm:**
1. Convert each user's working hours to UTC
2. Find intersection of all UTC time ranges
3. Identify overlapping periods
4. Sort by duration (longest first)
5. Return top 5 best meeting windows

**Edge Cases Handled:**
- Midnight crossing (e.g., 22:00 - 06:00)
- Different working days
- Daylight Saving Time transitions
- Multiple timezones with large spans

### 2. Smart Notification Scheduling

The `schedule_notification_in_working_hours()` method:
- Finds next available working hour
- Respects user's working days
- Returns UTC timestamp for scheduling
- Fallback to next business day if needed

### 3. Real-Time Status

Working status indicators:
- Green = Currently in working hours
- Gray = Currently off hours
- Shows local time for any user
- Updates automatically

## Usage Examples

### Backend: Calculate Team Overlap

```python
from app.services.timezone_service import TimezoneService

# Create user info list
users = [
    UserTimezoneInfo(
        user_id=1,
        name="Alice",
        timezone="America/New_York",
        working_hours_start=9,
        working_hours_end=17,
        working_days=[1,2,3,4,5]
    ),
    UserTimezoneInfo(
        user_id=2,
        name="Bob",
        timezone="Europe/London",
        working_hours_start=9,
        working_hours_end=17,
        working_days=[1,2,3,4,5]
    )
]

# Calculate overlaps
overlaps = TimezoneService.calculate_overlap_windows(users)
best_times = TimezoneService.get_best_meeting_times(overlaps, min_duration_hours=1.0)

print(f"Best meeting time: {best_times[0].start_hour_local}:00 - {best_times[0].end_hour_local}:00")
print(f"Duration: {best_times[0].duration_hours} hours")
```

### Frontend: Display Team Timeline

```typescript
import TimezoneTimeline from '../components/TimezoneTimeline';

function ProjectTeam() {
  const [teamData, setTeamData] = useState(null);

  useEffect(() => {
    // Fetch team overlap
    api.post('/api/v1/collaboration/overlap/project', {
      project_id: 123,
      include_applicants: false
    }).then(response => {
      setTeamData(response.data);
    });
  }, []);

  return (
    <TimezoneTimeline
      users={teamData.user_timezones}
      overlapWindows={teamData.best_meeting_times}
      currentUserTimezone="America/New_York"
    />
  );
}
```

### Frontend: Profile Settings

```typescript
import TimezoneSelector from '../components/TimezoneSelector';
import WorkingHoursSelector from '../components/WorkingHoursSelector';

function ProfileSettings() {
  const [timezone, setTimezone] = useState('UTC');
  const [workingHours, setWorkingHours] = useState({
    start: 9,
    end: 17,
    days: [1,2,3,4,5]
  });

  const handleSave = async () => {
    await api.patch('/api/v1/users/me/profile', {
      timezone,
      working_hours_start: workingHours.start,
      working_hours_end: workingHours.end,
      working_days: workingHours.days
    });
  };

  return (
    <div>
      <TimezoneSelector value={timezone} onChange={setTimezone} />
      <WorkingHoursSelector
        startHour={workingHours.start}
        endHour={workingHours.end}
        workingDays={workingHours.days}
        onStartHourChange={(h) => setWorkingHours({...workingHours, start: h})}
        onEndHourChange={(h) => setWorkingHours({...workingHours, end: h})}
        onWorkingDaysChange={(d) => setWorkingHours({...workingHours, days: d})}
      />
    </div>
  );
}
```

## API Response Examples

### Team Overlap Response

```json
{
  "user_timezones": [
    {
      "user_id": 1,
      "name": "Alice Johnson",
      "timezone": "America/New_York",
      "working_hours_start": 9,
      "working_hours_end": 17,
      "working_days": [1, 2, 3, 4, 5],
      "avatar_url": "https://..."
    },
    {
      "user_id": 2,
      "name": "Bob Smith",
      "timezone": "Europe/London",
      "working_hours_start": 9,
      "working_hours_end": 17,
      "working_days": [1, 2, 3, 4, 5]
    }
  ],
  "overlap_windows": [
    {
      "start_utc": "2025-11-12T14:00:00Z",
      "end_utc": "2025-11-12T17:00:00Z",
      "start_hour_local": 9,
      "end_hour_local": 12,
      "duration_hours": 3.0,
      "participating_users": [1, 2],
      "day_of_week": 2
    }
  ],
  "best_meeting_times": [
    {
      "start_utc": "2025-11-12T14:00:00Z",
      "end_utc": "2025-11-12T17:00:00Z",
      "start_hour_local": 9,
      "end_hour_local": 12,
      "duration_hours": 3.0,
      "participating_users": [1, 2],
      "day_of_week": 2
    }
  ],
  "total_overlap_hours_per_week": 15.0,
  "timezone_span_hours": 5
}
```

## Future Enhancements

### Planned Improvements

1. **Scheduler Microservice**
   - Dedicated service for complex scheduling
   - Meeting room integration
   - Automated scheduling suggestions

2. **AI Calendar Assistant**
   - Google Calendar / Microsoft Outlook sync
   - AI-powered meeting suggestions
   - Async checkpoint recommendations
   - Conflict resolution

3. **Advanced Features**
   - Recurring meeting optimizer
   - Team timezone heatmap
   - Historical overlap analytics
   - Custom notification windows
   - Public holidays integration
   - "Do Not Disturb" periods

4. **Mobile App**
   - Push notifications in user's timezone
   - Quick availability status
   - Meeting countdown timers

5. **Integrations**
   - Slack timezone bot
   - Calendar embeds
   - Time zone converter widget
   - Email scheduling

## Testing

### Manual Testing Checklist

- [ ] Create profile with timezone and working hours
- [ ] Update profile with different timezone
- [ ] View team timeline for project
- [ ] Calculate custom team overlap
- [ ] Verify current hour indicator moves correctly
- [ ] Test with users in very different timezones (e.g., US + Asia)
- [ ] Test with midnight-crossing hours (e.g., 22:00 - 06:00)
- [ ] Verify best meeting times are accurate
- [ ] Test timezone selector search
- [ ] Test working days toggle

### API Testing

```bash
# Get your timezone info
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/v1/collaboration/timezones/me

# Get project team overlap
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"project_id": 1, "include_applicants": false}' \
  http://localhost:8000/api/v1/collaboration/overlap/project

# Get custom team overlap
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"user_ids": [1, 2, 3]}' \
  http://localhost:8000/api/v1/collaboration/overlap/custom

# Update profile with timezone
curl -X PATCH -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"timezone": "America/New_York", "working_hours_start": 9, "working_hours_end": 17}' \
  http://localhost:8000/api/v1/users/me/profile
```

## Troubleshooting

### Common Issues

1. **Migration fails with "column already exists"**
   - Solution: Add `IF NOT EXISTS` to ALTER TABLE statements
   - Check: `\d profiles` in psql to see existing columns

2. **Invalid timezone error**
   - Solution: Use IANA timezone names (e.g., "America/New_York" not "EST")
   - Check: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones

3. **No overlap windows found**
   - Check: Users have overlapping working days
   - Verify: Timezones are correctly set
   - Consider: Timezone span might be too large (>12 hours)

4. **Frontend timezone display incorrect**
   - Solution: Ensure browser supports `Intl.DateTimeFormat`
   - Check: Console for timezone errors

## Performance Considerations

- **Database:** Index on `profiles.timezone` for fast filtering
- **Caching:** Consider caching timezone list endpoint
- **API:** Overlap calculation is O(n) for n users
- **Frontend:** Timeline rendering optimized with CSS grid

## Security

- **User privacy:** Users can only see timezones of:
  - Project team members they're part of
  - Users they specify in custom team requests
  - Public profile views (future feature)

- **Validation:** All hour values constrained to 0-23
- **Sanitization:** Timezone values validated against IANA database

## Deployment

1. **Run migration:**
   ```bash
   psql $DATABASE_URL -f database/migrations/004_add_timezone_fields.sql
   ```

2. **Restart backend:**
   ```bash
   cd backend
   uvicorn main:app --reload
   ```

3. **Deploy frontend:**
   ```bash
   cd frontend
   npm run build
   npm start
   ```

## Resources

- **IANA Timezone Database:** https://www.iana.org/time-zones
- **Python zoneinfo docs:** https://docs.python.org/3/library/zoneinfo.html
- **MDN Intl.DateTimeFormat:** https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat

## License

Part of the Remote Works platform - MIT License
