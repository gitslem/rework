"""
Timezone-Aware Collaboration Service
Handles timezone overlap calculations, working hours analysis, and scheduling optimization
"""

from datetime import datetime, timedelta
from typing import List, Dict, Tuple, Optional
from zoneinfo import ZoneInfo
import logging

from app.schemas.schemas import UserTimezoneInfo, OverlapWindow, TimeSlot

logger = logging.getLogger(__name__)


class TimezoneService:
    """Service for timezone-aware collaboration features"""

    @staticmethod
    def get_current_time_in_timezone(timezone: str) -> datetime:
        """Get current time in a specific timezone"""
        try:
            tz = ZoneInfo(timezone)
            return datetime.now(tz)
        except Exception as e:
            logger.error(f"Invalid timezone {timezone}: {e}")
            return datetime.now(ZoneInfo("UTC"))

    @staticmethod
    def convert_time_to_timezone(dt: datetime, target_timezone: str) -> datetime:
        """Convert a datetime to a specific timezone"""
        try:
            if dt.tzinfo is None:
                # Assume UTC if no timezone info
                dt = dt.replace(tzinfo=ZoneInfo("UTC"))
            target_tz = ZoneInfo(target_timezone)
            return dt.astimezone(target_tz)
        except Exception as e:
            logger.error(f"Error converting time to timezone {target_timezone}: {e}")
            return dt

    @staticmethod
    def get_user_local_hour(user_timezone: str) -> int:
        """Get current hour in user's timezone (0-23)"""
        current_time = TimezoneService.get_current_time_in_timezone(user_timezone)
        return current_time.hour

    @staticmethod
    def is_user_in_working_hours(
        user_timezone: str,
        working_hours_start: int,
        working_hours_end: int,
        working_days: List[int],
        check_time: Optional[datetime] = None
    ) -> bool:
        """
        Check if user is currently in their working hours

        Args:
            user_timezone: IANA timezone string
            working_hours_start: Start hour (0-23)
            working_hours_end: End hour (0-23)
            working_days: List of working days (0=Sunday, 6=Saturday)
            check_time: Optional time to check (defaults to now)

        Returns:
            True if user is in working hours, False otherwise
        """
        if check_time is None:
            current_time = TimezoneService.get_current_time_in_timezone(user_timezone)
        else:
            current_time = TimezoneService.convert_time_to_timezone(check_time, user_timezone)

        # Check day of week (0=Monday in Python, need to convert)
        day_of_week = (current_time.weekday() + 1) % 7  # Convert to 0=Sunday
        if day_of_week not in working_days:
            return False

        # Check hour
        current_hour = current_time.hour
        if working_hours_end > working_hours_start:
            # Normal case: 9-17
            return working_hours_start <= current_hour < working_hours_end
        else:
            # Overnight case: 22-6 (crosses midnight)
            return current_hour >= working_hours_start or current_hour < working_hours_end

    @staticmethod
    def calculate_overlap_windows(
        users: List[UserTimezoneInfo],
        reference_date: Optional[datetime] = None
    ) -> List[OverlapWindow]:
        """
        Calculate overlap windows between multiple users' working hours

        Args:
            users: List of user timezone information
            reference_date: Optional reference date (defaults to today)

        Returns:
            List of overlap windows sorted by duration (longest first)
        """
        if len(users) < 2:
            return []

        if reference_date is None:
            reference_date = datetime.now(ZoneInfo("UTC"))

        # Start from Monday of the current week
        days_since_monday = (reference_date.weekday()) % 7
        week_start = (reference_date - timedelta(days=days_since_monday)).replace(
            hour=0, minute=0, second=0, microsecond=0
        )

        overlap_windows = []

        # Check each day of the week
        for day_offset in range(7):
            current_date = week_start + timedelta(days=day_offset)
            day_of_week = (current_date.weekday() + 1) % 7  # 0=Sunday

            # Convert each user's working hours to UTC for this day
            user_utc_windows = []
            participating_user_ids = []

            for user in users:
                # Check if user works on this day
                if day_of_week not in user.working_days:
                    continue

                # Convert user's local working hours to UTC
                user_tz = ZoneInfo(user.timezone)
                local_start = current_date.replace(
                    hour=user.working_hours_start,
                    minute=0,
                    second=0,
                    microsecond=0,
                    tzinfo=ZoneInfo("UTC")
                )

                # Create local time in user's timezone
                local_date = current_date.replace(tzinfo=None)
                local_start = datetime(
                    local_date.year,
                    local_date.month,
                    local_date.day,
                    user.working_hours_start,
                    0, 0,
                    tzinfo=user_tz
                )
                local_end = datetime(
                    local_date.year,
                    local_date.month,
                    local_date.day,
                    user.working_hours_end,
                    0, 0,
                    tzinfo=user_tz
                )

                # Convert to UTC
                utc_start = local_start.astimezone(ZoneInfo("UTC"))
                utc_end = local_end.astimezone(ZoneInfo("UTC"))

                user_utc_windows.append((utc_start, utc_end))
                participating_user_ids.append(user.user_id)

            # Find overlapping time windows
            if len(user_utc_windows) >= 2:
                # Find intersection of all windows
                overlap_start = max(window[0] for window in user_utc_windows)
                overlap_end = min(window[1] for window in user_utc_windows)

                if overlap_start < overlap_end:
                    # There is an overlap
                    duration_hours = (overlap_end - overlap_start).total_seconds() / 3600

                    # Convert back to first user's local time for display
                    first_user_tz = ZoneInfo(users[0].timezone)
                    local_start = overlap_start.astimezone(first_user_tz)
                    local_end = overlap_end.astimezone(first_user_tz)

                    overlap_windows.append(OverlapWindow(
                        start_utc=overlap_start,
                        end_utc=overlap_end,
                        start_hour_local=local_start.hour,
                        end_hour_local=local_end.hour,
                        duration_hours=duration_hours,
                        participating_users=participating_user_ids,
                        day_of_week=day_of_week
                    ))

        # Sort by duration (longest first)
        overlap_windows.sort(key=lambda x: x.duration_hours, reverse=True)

        return overlap_windows

    @staticmethod
    def get_best_meeting_times(
        overlap_windows: List[OverlapWindow],
        min_duration_hours: float = 1.0,
        limit: int = 5
    ) -> List[OverlapWindow]:
        """
        Get the best meeting times from overlap windows

        Args:
            overlap_windows: List of all overlap windows
            min_duration_hours: Minimum duration for a meeting window
            limit: Maximum number of suggestions to return

        Returns:
            Top meeting time suggestions
        """
        # Filter windows by minimum duration
        suitable_windows = [
            window for window in overlap_windows
            if window.duration_hours >= min_duration_hours
        ]

        # Return top N windows
        return suitable_windows[:limit]

    @staticmethod
    def calculate_total_overlap_hours_per_week(overlap_windows: List[OverlapWindow]) -> float:
        """Calculate total overlap hours per week"""
        return sum(window.duration_hours for window in overlap_windows)

    @staticmethod
    def calculate_timezone_span(users: List[UserTimezoneInfo]) -> int:
        """
        Calculate the span in hours between the earliest and latest timezone

        Args:
            users: List of user timezone information

        Returns:
            Hour span between timezones (0-24)
        """
        if not users:
            return 0

        # Get UTC offset for each user at a reference time
        reference_time = datetime(2024, 6, 15, 12, 0, 0, tzinfo=ZoneInfo("UTC"))  # Mid-year to avoid DST issues

        offsets = []
        for user in users:
            try:
                user_tz = ZoneInfo(user.timezone)
                user_time = reference_time.astimezone(user_tz)
                # Get offset in hours
                offset_seconds = user_time.utcoffset().total_seconds()
                offset_hours = offset_seconds / 3600
                offsets.append(offset_hours)
            except Exception as e:
                logger.error(f"Error calculating timezone span for {user.timezone}: {e}")
                continue

        if not offsets:
            return 0

        return int(max(offsets) - min(offsets))

    @staticmethod
    def format_time_in_timezone(dt: datetime, timezone: str, format_str: str = "%Y-%m-%d %H:%M %Z") -> str:
        """
        Format a datetime in a specific timezone

        Args:
            dt: Datetime to format
            timezone: Target timezone
            format_str: Format string

        Returns:
            Formatted time string
        """
        local_time = TimezoneService.convert_time_to_timezone(dt, timezone)
        return local_time.strftime(format_str)

    @staticmethod
    def schedule_notification_in_working_hours(
        user_timezone: str,
        working_hours_start: int,
        working_hours_end: int,
        working_days: List[int],
        preferred_hour: Optional[int] = None
    ) -> datetime:
        """
        Schedule a notification for the next available working hour

        Args:
            user_timezone: User's IANA timezone
            working_hours_start: Start of working hours
            working_hours_end: End of working hours
            working_days: List of working days
            preferred_hour: Preferred hour to schedule (optional)

        Returns:
            UTC datetime for the scheduled notification
        """
        user_tz = ZoneInfo(user_timezone)
        current_time = datetime.now(user_tz)

        # If preferred hour specified and it's in working hours, try to use it
        if preferred_hour is not None and working_hours_start <= preferred_hour < working_hours_end:
            target_hour = preferred_hour
        else:
            # Default to start of working hours
            target_hour = working_hours_start

        # Find next working day
        for days_ahead in range(8):  # Check up to a week ahead
            check_date = current_time + timedelta(days=days_ahead)
            day_of_week = (check_date.weekday() + 1) % 7  # 0=Sunday

            if day_of_week in working_days:
                # Found a working day
                scheduled_time = check_date.replace(
                    hour=target_hour,
                    minute=0,
                    second=0,
                    microsecond=0
                )

                # Make sure it's in the future
                if scheduled_time > current_time:
                    # Convert to UTC
                    return scheduled_time.astimezone(ZoneInfo("UTC"))

        # Fallback: schedule for tomorrow at target hour
        tomorrow = current_time + timedelta(days=1)
        scheduled_time = tomorrow.replace(
            hour=target_hour,
            minute=0,
            second=0,
            microsecond=0
        )
        return scheduled_time.astimezone(ZoneInfo("UTC"))

    @staticmethod
    def get_overlap_percentage(
        user1: UserTimezoneInfo,
        user2: UserTimezoneInfo
    ) -> float:
        """
        Calculate the percentage of working hours that overlap between two users

        Args:
            user1: First user's timezone info
            user2: Second user's timezone info

        Returns:
            Percentage of overlap (0-100)
        """
        overlaps = TimezoneService.calculate_overlap_windows([user1, user2])

        if not overlaps:
            return 0.0

        # Calculate total working hours per week for user1
        working_days_count = len(user1.working_days)
        hours_per_day = user1.working_hours_end - user1.working_hours_start
        total_hours = working_days_count * hours_per_day

        # Calculate total overlap hours
        overlap_hours = sum(window.duration_hours for window in overlaps)

        # Calculate percentage
        if total_hours == 0:
            return 0.0

        return min(100.0, (overlap_hours / total_hours) * 100)
