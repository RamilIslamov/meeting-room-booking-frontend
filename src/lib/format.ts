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
