import React from 'react';
import { Moon, Sun, Info, Download } from 'lucide-react';
import { usePwaInstall } from '../hooks/usePwaInstall';

interface HeaderProps {
  onOpenAbout: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAbout,
  isDark,
  onToggleTheme,
}) => {
  const { canInstall, promptInstall } = usePwaInstall();

  return (
    <header className="sticky top-0 z-30 bg-[#FAF7F2]/90 dark:bg-[#111513]/90 backdrop-blur-md border-b border-black/[0.05] dark:border-white/[0.06] transition-colors duration-200">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
        {/* Title branding: Free Mindfulness Player */}
        <div className="flex flex-col">
          <span className="text-[11px] font-medium tracking-wider uppercase text-[#426B50] dark:text-[#7EA089]">
            The Free Mindfulness Project
          </span>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1E2621] dark:text-[#F0F4F1]">
            Free Mindfulness Player
          </h1>
        </div>

        {/* Quiet top actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Install App Button if browser supports native prompt */}
          {canInstall && (
            <button
              onClick={promptInstall}
              aria-label="Install app to home screen"
              title="Install app"
              className="px-3 py-1.5 rounded-full bg-[#385944] text-white text-xs font-semibold hover:bg-[#2C4836] active:scale-95 transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
          )}

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={onToggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Light mode' : 'Dark mode'}
            className="p-2.5 rounded-full text-[#4E5D53] dark:text-[#A4B3A8] hover:text-[#1E2621] dark:hover:text-[#FFFFFF] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] active:scale-95 transition-all"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-amber-300" />
            ) : (
              <Moon className="w-5 h-5 text-[#4E5D53]" />
            )}
          </button>

          {/* About Modal */}
          <button
            onClick={onOpenAbout}
            aria-label="About this player"
            title="About & info"
            className="p-2.5 rounded-full text-[#4E5D53] dark:text-[#A4B3A8] hover:text-[#1E2621] dark:hover:text-[#FFFFFF] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] active:scale-95 transition-all"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
