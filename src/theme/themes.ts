import { ThemeId } from '../types';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  nameUrdu: string;
  primary: string; // Hex for preview
  accent: string;
  bgHex: string;
  cardHex: string;
  // Tailwind class sets
  appBg: string;
  cardBg: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accentText: string;
  accentBg: string;
  accentBorder: string;
  buttonPrimary: string;
  badgeBg: string;
  inputBg: string;
}

export const themes: Record<ThemeId, ThemeConfig> = {
  black_gold: {
    id: 'black_gold',
    name: 'Black & Gold (Royal Luxury)',
    nameUrdu: 'سیاہ اور سنہری (شاہی انداز)',
    primary: '#D4AF37',
    accent: '#F59E0B',
    bgHex: '#0A0A0A',
    cardHex: '#141414',
    appBg: 'bg-[#0a0a0a]',
    cardBg: 'bg-[#141414]/90 backdrop-blur-md',
    cardBorder: 'border-amber-500/25',
    textPrimary: 'text-amber-50',
    textSecondary: 'text-amber-200/80',
    textMuted: 'text-amber-400/50',
    accentText: 'text-amber-400',
    accentBg: 'bg-amber-500/15',
    accentBorder: 'border-amber-500/40',
    buttonPrimary: 'bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 text-neutral-950 font-bold hover:brightness-110 shadow-lg shadow-amber-900/30',
    badgeBg: 'bg-amber-950/60 border border-amber-500/30 text-amber-300',
    inputBg: 'bg-neutral-900/90 border-amber-500/30 text-amber-50 focus:border-amber-400',
  },

  blue_white: {
    id: 'blue_white',
    name: 'Blue & White (Executive Royal)',
    nameUrdu: 'نیلا اور سفید (شاہی ایگزیکٹو)',
    primary: '#2563EB',
    accent: '#38BDF8',
    bgHex: '#030712',
    cardHex: '#0B1528',
    appBg: 'bg-[#030712]',
    cardBg: 'bg-[#0b1528]/90 backdrop-blur-md',
    cardBorder: 'border-blue-500/30',
    textPrimary: 'text-white',
    textSecondary: 'text-blue-100/80',
    textMuted: 'text-blue-300/60',
    accentText: 'text-blue-400',
    accentBg: 'bg-blue-500/15',
    accentBorder: 'border-blue-500/40',
    buttonPrimary: 'bg-gradient-to-r from-blue-700 to-blue-500 text-white font-bold hover:brightness-110 shadow-lg shadow-blue-900/40',
    badgeBg: 'bg-blue-950/70 border border-blue-500/30 text-blue-200',
    inputBg: 'bg-slate-900/90 border-blue-500/30 text-white focus:border-blue-400',
  },

  green_white: {
    id: 'green_white',
    name: 'Green & White (Emerald Merchant)',
    nameUrdu: 'سبز اور سفید (زمرد تاجر)',
    primary: '#059669',
    accent: '#34D399',
    bgHex: '#021810',
    cardHex: '#06281C',
    appBg: 'bg-[#021810]',
    cardBg: 'bg-[#06281c]/90 backdrop-blur-md',
    cardBorder: 'border-emerald-500/30',
    textPrimary: 'text-emerald-50',
    textSecondary: 'text-emerald-200/80',
    textMuted: 'text-emerald-400/60',
    accentText: 'text-emerald-400',
    accentBg: 'bg-emerald-500/15',
    accentBorder: 'border-emerald-500/40',
    buttonPrimary: 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold hover:brightness-110 shadow-lg shadow-emerald-950/50',
    badgeBg: 'bg-emerald-950/70 border border-emerald-500/30 text-emerald-200',
    inputBg: 'bg-teal-950/90 border-emerald-500/30 text-emerald-50 focus:border-emerald-400',
  },

  brown_black: {
    id: 'brown_black',
    name: 'Brown & Black (Saddle Leather)',
    nameUrdu: 'کتھئی اور سیاہ (اصلی چمڑا)',
    primary: '#9A5B32',
    accent: '#D97706',
    bgHex: '#120B07',
    cardHex: '#1F140D',
    appBg: 'bg-[#120b07]',
    cardBg: 'bg-[#1f140d]/90 backdrop-blur-md',
    cardBorder: 'border-[#9A5B32]/35',
    textPrimary: 'text-amber-50',
    textSecondary: 'text-orange-200/80',
    textMuted: 'text-amber-300/60',
    accentText: 'text-amber-500',
    accentBg: 'bg-amber-600/15',
    accentBorder: 'border-amber-600/40',
    buttonPrimary: 'bg-gradient-to-r from-[#80461B] to-[#B8682F] text-amber-50 font-bold hover:brightness-110 shadow-lg shadow-amber-950/50',
    badgeBg: 'bg-amber-950/70 border border-amber-600/30 text-amber-200',
    inputBg: 'bg-[#180E09] border-[#9A5B32]/35 text-amber-50 focus:border-amber-500',
  },

  purple: {
    id: 'purple',
    name: 'Purple (Imperial Velvet)',
    nameUrdu: 'جامنی (شاہی مخمل)',
    primary: '#7C3AED',
    accent: '#C084FC',
    bgHex: '#0D071E',
    cardHex: '#1B113B',
    appBg: 'bg-[#0d071e]',
    cardBg: 'bg-[#1b113b]/90 backdrop-blur-md',
    cardBorder: 'border-purple-500/30',
    textPrimary: 'text-purple-50',
    textSecondary: 'text-purple-200/80',
    textMuted: 'text-purple-400/60',
    accentText: 'text-purple-300',
    accentBg: 'bg-purple-600/15',
    accentBorder: 'border-purple-500/40',
    buttonPrimary: 'bg-gradient-to-r from-purple-700 to-violet-500 text-white font-bold hover:brightness-110 shadow-lg shadow-purple-950/50',
    badgeBg: 'bg-purple-950/70 border border-purple-500/30 text-purple-200',
    inputBg: 'bg-[#130b2e] border-purple-500/30 text-purple-50 focus:border-purple-400',
  },

  light: {
    id: 'light',
    name: 'Light Mode (Clean Ledger)',
    nameUrdu: 'روشن موڈ (سفید کھاتہ)',
    primary: '#1E293B',
    accent: '#0284C7',
    bgHex: '#F8FAFC',
    cardHex: '#FFFFFF',
    appBg: 'bg-slate-50',
    cardBg: 'bg-white shadow-sm',
    cardBorder: 'border-slate-200',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-700',
    textMuted: 'text-slate-500',
    accentText: 'text-sky-700',
    accentBg: 'bg-sky-50',
    accentBorder: 'border-sky-300',
    buttonPrimary: 'bg-slate-900 text-white font-bold hover:bg-slate-800 shadow-md',
    badgeBg: 'bg-slate-100 border border-slate-300 text-slate-800',
    inputBg: 'bg-white border-slate-300 text-slate-900 focus:border-slate-700',
  },

  dark: {
    id: 'dark',
    name: 'Dark Mode (Obsidian Carbon)',
    nameUrdu: 'ڈارک موڈ (تاریک میٹ)',
    primary: '#64748B',
    accent: '#94A3B8',
    bgHex: '#090A0F',
    cardHex: '#12141D',
    appBg: 'bg-[#090a0f]',
    cardBg: 'bg-[#12141d]/90 backdrop-blur-md',
    cardBorder: 'border-neutral-800',
    textPrimary: 'text-neutral-100',
    textSecondary: 'text-neutral-300',
    textMuted: 'text-neutral-400',
    accentText: 'text-neutral-200',
    accentBg: 'bg-neutral-800/50',
    accentBorder: 'border-neutral-700',
    buttonPrimary: 'bg-neutral-100 text-neutral-950 font-bold hover:bg-white shadow-md',
    badgeBg: 'bg-neutral-900 border border-neutral-800 text-neutral-300',
    inputBg: 'bg-[#0f1118] border-neutral-800 text-neutral-100 focus:border-neutral-600',
  },

  system: {
    id: 'system',
    name: 'System Default (Auto OS)',
    nameUrdu: 'سسٹم ڈیفالٹ (خودکار)',
    primary: '#6366F1',
    accent: '#818CF8',
    bgHex: '#0F172A',
    cardHex: '#1E293B',
    appBg: 'bg-slate-900',
    cardBg: 'bg-slate-800/90 backdrop-blur-md',
    cardBorder: 'border-slate-700',
    textPrimary: 'text-slate-100',
    textSecondary: 'text-slate-300',
    textMuted: 'text-slate-400',
    accentText: 'text-indigo-400',
    accentBg: 'bg-indigo-500/15',
    accentBorder: 'border-indigo-500/40',
    buttonPrimary: 'bg-indigo-600 text-white font-bold hover:bg-indigo-500 shadow-md',
    badgeBg: 'bg-indigo-950/70 border border-indigo-500/30 text-indigo-200',
    inputBg: 'bg-slate-950/90 border-slate-700 text-slate-100 focus:border-indigo-400',
  },
};

export function resolveTheme(themeId: ThemeId): ThemeConfig {
  if (themeId === 'system') {
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return themes.light;
    }
    return themes.dark;
  }
  return themes[themeId] || themes.black_gold;
}
