const datetimeFormat = Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit'
});

export function formatDateTime(datetime: string): string {
  return datetimeFormat.format(new Date(datetime));
}
