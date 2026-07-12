import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CHOSUNG = [
  "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ",
  "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"
];

export function getChosung(str: string) {
  let result = "";
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    // 한글 가(44032) ~ 힣(55203)
    if (code >= 44032 && code <= 55203) {
      const chosungIndex = Math.floor((code - 44032) / 588);
      result += CHOSUNG[chosungIndex];
    } else {
      result += str[i]; // 알파벳, 숫자 등은 그대로
    }
  }
  return result;
}

export function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

export function isMobile() {
  if (typeof window === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}
