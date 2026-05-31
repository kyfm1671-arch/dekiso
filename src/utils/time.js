export function formatPostTime(iso) {
  const date = new Date(iso);
  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  const time = date.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  if (isToday) return time;

  const monthDay = date.toLocaleDateString('ja-JP', {
    month: 'numeric',
    day: 'numeric',
  });
  return `${monthDay} ${time}`;
}
