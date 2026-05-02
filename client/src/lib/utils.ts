import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function calculateProgress(current: number, total: number): number {
  return Math.min(100, Math.max(0, Math.round((current / total) * 100)));
}

export function getDimensionColor(dimension: string) {
  const colors = {
    physical: {
      primary: "text-emerald-600",
      secondary: "text-emerald-400",
      bg: "bg-emerald-600",
      bgOpacity: "bg-emerald-600/20",
      border: "border-emerald-600",
    },
    emotional: {
      primary: "text-gold-400",
      secondary: "text-gold-300",
      bg: "bg-gold-400",
      bgOpacity: "bg-gold-400/20",
      border: "border-gold-400",
    },
    intellectual: {
      primary: "text-indigo-600",
      secondary: "text-indigo-400",
      bg: "bg-indigo-600",
      bgOpacity: "bg-indigo-600/20",
      border: "border-indigo-600",
    },
    spiritual: {
      primary: "text-rose-500",
      secondary: "text-rose-400",
      bg: "bg-rose-500",
      bgOpacity: "bg-rose-500/20",
      border: "border-rose-500",
    },
    relational: {
      primary: "text-purple-400",
      secondary: "text-purple-300",
      bg: "bg-purple-400",
      bgOpacity: "bg-purple-400/20",
      border: "border-purple-400",
    },
  };

  return colors[dimension as keyof typeof colors] || colors.physical;
}

export function getDimensionIcon(dimension: string) {
  return {
    name: dimension.charAt(0).toUpperCase() + dimension.slice(1),
    color: getDimensionColor(dimension).primary,
  };
}

export function getMoodLabel(mood: number): string {
  const moods = {
    1: "Struggling",
    2: "Neutral",
    3: "Good",
    4: "Great",
    5: "Amazing",
  };
  
  return moods[mood as keyof typeof moods] || "Unknown";
}

export function getMoodEmoji(mood: number): string {
  const emojis = {
    1: "😞",
    2: "😐",
    3: "🙂",
    4: "😊",
    5: "🤩",
  };
  
  return emojis[mood as keyof typeof emojis] || "❓";
}
