export function checkIfTodayIs(
  dateStr: string,
  timeStr: string,
  action: any = null
) {
  const [day, month, year] = dateStr.split('-').map(Number);

  const [time, period] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);

  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  const targetDate = new Date(year, month - 1, day, hours, minutes);

  const today = new Date();

  const isSameDay =
    today.getFullYear() === targetDate.getFullYear() &&
    today.getMonth() === targetDate.getMonth() &&
    today.getDate() === targetDate.getDate();

  if (isSameDay) {
    if (action !== null) {
      action();
    } else {
      return isSameDay;
    }
  }
}
