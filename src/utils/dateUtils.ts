export function formatDate(
  date: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString(
    "fr-FR",
    options ?? {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  );
}

export function formatDateLong(date: string): string {
  return formatDate(date, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function todayISO(): string {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}