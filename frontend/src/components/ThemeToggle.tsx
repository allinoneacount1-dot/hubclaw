import { useState } from 'react';
import type { ThemeMode } from '../services/api';
import { Sun, Moon, Monitor } from 'lucide-react';

interface ThemeToggleProps {
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  className?: string;
}

const themeConfig = {
  dark: { icon: Moon, label: 'Dark' },
  light: { icon: Sun, label: 'Light' },
  auto: { icon: Monitor, label: 'Auto' },
};

export function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
    root.style.colorScheme = 'dark';
  } else if (theme === 'light') {
    root.classList.remove('dark');
    root.classList.add('light');
    root.style.colorScheme = 'light';
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark', prefersDark);
    root.classList.toggle('light', !prefersDark);
    root.style.colorScheme = prefersDark ? 'dark' : 'light';
  }
}

export default function ThemeToggle({ theme, onThemeChange, className }: ThemeToggleProps) {
  const handleToggle = () => {
    const modes: ThemeMode[] = ['dark', 'light', 'auto'];
    const nextIndex = (modes.indexOf(theme) + 1) % modes.length;
    const nextTheme = modes[nextIndex];
    onThemeChange(nextTheme);
    applyTheme(nextTheme);
  };

  const cfg = themeConfig[theme];
  const Icon = cfg.icon;

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border transition-all ${
        theme === 'light'
          ? 'bg-slate-100 border-slate-300 text-slate-600 hover:bg-slate-200 hover:text-cyan-600'
          : 'bg-slate-800/30 border-slate-800/30 text-slate-500 hover:text-cyan-400 hover:border-cyan-400/20'
      } ${className || ''}`}
      title={`Theme: ${cfg.label}`}
    >
      <Icon size={12} />
      <span className="text-[10px] font-mono">{cfg.label}</span>
    </button>
  );
}

export { themeConfig };
