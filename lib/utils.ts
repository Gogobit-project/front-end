import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getStatusColor = (status: string) => {
  switch (status) {
    case "winning":
    case "won":
    case "approved":
    case "Live":
    case "owned":
      return "bg-green-500/10 text-green-400 border-green-500/20";
    case "outbid":
    case "lost":
    case "rejected":
    case "Ended":
      return "bg-red-500/10 text-red-400 border-red-500/20";
    case "Pending":
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    case "listed":
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    default:
      return "bg-white/10 text-white/80 border-white/20";
  }
};

// Fungsi ini juga bisa dipindahkan ke sini jika digunakan di tempat lain
export const copyToClipboard = (text: string) => {
  if (text) navigator.clipboard.writeText(text);
};

export function formatTimeLeft(endTime: Date) {
  const diff = endTime.getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  return `${days}d ${hours}h`;
}
