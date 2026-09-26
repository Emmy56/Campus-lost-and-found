/**
 * Utility to format ISO dates or timestamps into human-readable relative time strings
 * e.g. "Just now", "5m ago", "2h ago", "3d ago"
 */
export function formatTimeAgo(timestampOrIso) {
  if (!timestampOrIso) return 'Just now';

  let date;
  if (typeof timestampOrIso === 'number') {
    date = new Date(timestampOrIso);
  } else if (typeof timestampOrIso === 'string') {
    const parsed = Date.parse(timestampOrIso);
    if (!isNaN(parsed)) {
      date = new Date(parsed);
    } else {
      // If it's a static text string like "Just now" or "10:30 AM", return it as is
      return timestampOrIso;
    }
  } else if (timestampOrIso instanceof Date) {
    date = timestampOrIso;
  } else {
    return 'Just now';
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 45) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays}d ago`;
  }

  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}
