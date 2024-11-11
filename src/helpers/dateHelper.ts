import dayjs from 'dayjs';

export function checkIfTodayIs(
  dateStr: string,
  timeStr: string,
  action: any = null
) {
  // Parse the date and time strings
  const targetDate = dayjs(`${dateStr} ${timeStr}`, 'D-M-YYYY h:mm A');

  // Check if the target date is today
  const isSameDay = targetDate.isSame(dayjs(), 'day');

  // If it's the same day, either perform the action or return the result
  if (isSameDay) {
    if (action) {
      action();
    } else {
      return isSameDay;
    }
  }
}
