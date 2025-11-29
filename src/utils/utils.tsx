export function dateGTMToLocal(date: Date | string): Date | string {
  try {
    if (typeof date === "string") {
      date = new Date(date);
    }

    return new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
  } catch {
    return date;
  }
}
