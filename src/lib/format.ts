/** Today's date as YYYY-MM-DD in the user's local timezone. */
export function todayLocalDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** "2026-06-26T10:00:00" -> "10:00" */
export function timeOf(isoLocalDateTime: string): string {
  return isoLocalDateTime.slice(11, 16);
}

/** "2026-06-26T10:00:00" -> "2026-06-26" */
export function dateOf(isoLocalDateTime: string): string {
  return isoLocalDateTime.slice(0, 10);
}

/** Builds a LocalDateTime string the backend accepts: "YYYY-MM-DDTHH:mm:ss". */
export function toLocalDateTime(date: string, time: string): string {
  return `${date}T${time}:00`;
}

/** Formats a credits amount, e.g. 10 -> "10.00 cr". */
export function credits(amount: number): string {
  return `${amount.toFixed(2)} cr`;
}

/** Duration in hours between two "HH:mm" times on the same day (0 if invalid). */
export function hoursBetween(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  if ([sh, sm, eh, em].some((n) => Number.isNaN(n))) return 0;
  const minutes = eh * 60 + em - (sh * 60 + sm);
  return minutes > 0 ? minutes / 60 : 0;
}

/** Current local time as "HH:mm". */
export function nowTime(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}
