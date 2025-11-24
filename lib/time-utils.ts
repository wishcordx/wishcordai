// Format timestamp like Discord: "Today at 2:30 PM", "Yesterday at 3:15 PM", "12/24/2024"
export function formatDiscordTimestamp(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  
  if (messageDate.getTime() === today.getTime()) {
    return `Today at ${timeStr}`;
  } else if (messageDate.getTime() === yesterday.getTime()) {
    return `Yesterday at ${timeStr}`;
  } else if (now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
    // Within last 7 days, show day name
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    return `${dayName} at ${timeStr}`;
  } else {
    // Older messages show full date
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  }
}

// Relative time for hover tooltip: "2 minutes ago", "3 hours ago"
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffSec < 60) {
    return 'Just now';
  } else if (diffMin < 60) {
    return `${diffMin} ${diffMin === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffHour < 24) {
    return `${diffHour} ${diffHour === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffDay < 7) {
    return `${diffDay} ${diffDay === 1 ? 'day' : 'days'} ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
}
