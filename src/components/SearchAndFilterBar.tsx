import React, { useState, useEffect } from 'react';
import { Search, X, Heart, Download, SlidersHorizontal } from 'lucide-react';
import { CATEGORIES } from '../data/meditations';
import { SectionCategory, DurationFilter, VoiceFilter } from '../types';

interface SearchAndFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: SectionCategory;
  onSelectCategory: (cat: SectionCategory) => void;
  selectedDuration: DurationFilter;
  onSelectDuration: (dur: DurationFilter) => void;
  selectedVoice: VoiceFilter;
  onSelectVoice: (v: VoiceFilter) => void;
  showFavoritesOnly: boolean;
  onToggleFavoritesOnly: () => void;
  showOfflineOnly: boolean;
  onToggleOfflineOnly: () => void;
  favoritesCount: number;
  downloadedCount: number;
}

export const SearchAndFilterBar: React.FC<SearchAndFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  selectedDuration,
  onSelectDuration,
  selectedVoice,
  onSelectVoice,
  showFavoritesOnly,
  onToggleFavoritesOnly,
  showOfflineOnly,
  onToggleOfflineOnly,
  favoritesCount,
  downloadedCount,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(typeof window !== 'undefined' && window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const hasActiveAdvanced = selectedDuration !== 'all' || selectedVoice !== 'all';

  return (
    <div className="space-y-3.5">
      {/* Search Input Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#7A8A7F] dark:text-[#7D9183] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={isMobile ? 'Search...' : 'Search meditations (e.g. breath, body scan)...'}
            className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white dark:bg-[#1A211D] border border-stone-200/80 dark:border-white/[0.08] text-sm text-[#1E2621] dark:text-[#E8EFEA] placeholder:text-[#88988D] focus:outline-none focus:ring-2 focus:ring-[#385944]/30 dark:focus:ring-[#6F9B7E]/30 transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-[#7A8A7F] hover:text-[#1E2621] dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Saved (Favorites) Toggle */}
        <button
          onClick={onToggleFavoritesOnly}
          aria-pressed={showFavoritesOnly}
          className={`h-11 px-3.5 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
            showFavoritesOnly
              ? 'bg-[#E5DFD5] dark:bg-[#2A352E] text-[#1E2621] dark:text-white ring-1 ring-[#385944]/30'
              : 'bg-white dark:bg-[#1A211D] text-[#4E5E52] dark:text-[#A7B6AB] border border-stone-200/80 dark:border-white/[0.08] hover:bg-stone-50 dark:hover:bg-white/[0.03]'
          }`}
          title="Show saved favorites"
        >
          <Heart className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-rose-500 text-rose-500' : 'text-[#7A8A7F]'}`} />
          <span className="hidden sm:inline">Saved</span>
          {favoritesCount > 0 && <span className="text-[11px] font-bold">({favoritesCount})</span>}
        </button>

        {/* Offline Toggle */}
        <button
          onClick={onToggleOfflineOnly}
          aria-pressed={showOfflineOnly}
          className={`h-11 px-3.5 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
            showOfflineOnly
              ? 'bg-[#E5DFD5] dark:bg-[#2A352E] text-[#1E2621] dark:text-white ring-1 ring-[#385944]/30'
              : 'bg-white dark:bg-[#1A211D] text-[#4E5E52] dark:text-[#A7B6AB] border border-stone-200/80 dark:border-white/[0.08] hover:bg-stone-50 dark:hover:bg-white/[0.03]'
          }`}
          title="Show downloaded offline meditations"
        >
          <Download className={`w-3.5 h-3.5 ${showOfflineOnly ? 'text-[#385944] dark:text-[#7EA089]' : 'text-[#7A8A7F]'}`} />
          <span className="hidden sm:inline">Offline</span>
          {downloadedCount > 0 && <span className="text-[11px] font-bold">({downloadedCount})</span>}
        </button>

        {/* Filter Expand Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`h-11 w-11 rounded-2xl flex items-center justify-center transition-all shrink-0 ${
            showFilters || hasActiveAdvanced
              ? 'bg-[#31523D] dark:bg-[#436C52] text-white shadow-xs'
              : 'bg-white dark:bg-[#1A211D] text-[#4E5E52] dark:text-[#A7B6AB] border border-stone-200/80 dark:border-white/[0.08] hover:bg-stone-50 dark:hover:bg-white/[0.03]'
          }`}
          title="Filter length and narrator"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Round, Calm Category Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all shrink-0 ${
                isSelected
                  ? 'bg-[#31523D] dark:bg-[#436C52] text-white shadow-sm'
                  : 'bg-white dark:bg-[#1A211D] text-[#4E5E52] dark:text-[#B5C4B9] border border-stone-200/80 dark:border-white/[0.07] hover:bg-stone-50 dark:hover:bg-white/[0.03]'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`ml-1.5 text-[10px] ${isSelected ? 'text-white/80' : 'text-[#88988D]'}`}>
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Optional Filter Panel for Length & Narrator */}
      {showFilters && (
        <div className="p-4 bg-white dark:bg-[#1A211D] rounded-2xl border border-stone-200/80 dark:border-white/[0.08] space-y-3 animate-fadeIn">
          {/* Duration */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[#4E5E52] dark:text-[#A7B6AB]">
              Duration
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {(
                [
                  { id: 'all', label: 'Any length' },
                  { id: 'under5', label: '< 5 min' },
                  { id: '5to15', label: '5–15 min' },
                  { id: '15to30', label: '15–30 min' },
                  { id: 'over30', label: '30+ min' },
                ] as const
              ).map((d) => (
                <button
                  key={d.id}
                  onClick={() => onSelectDuration(d.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    selectedDuration === d.id
                      ? 'bg-[#31523D] dark:bg-[#436C52] text-white'
                      : 'bg-stone-100 dark:bg-[#252F28] text-[#4E5E52] dark:text-[#A7B6AB] hover:text-[#1E2621]'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Voice */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2.5 border-t border-stone-100 dark:border-white/[0.06]">
            <span className="text-xs font-semibold text-[#4E5E52] dark:text-[#A7B6AB]">
              Narrator
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'christina', label: 'Christina' },
                  { id: 'paddy', label: 'Paddy' },
                  { id: 'peter', label: 'Peter' },
                  { id: 'bells', label: 'Bells only' },
                ] as const
              ).map((v) => (
                <button
                  key={v.id}
                  onClick={() => onSelectVoice(v.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    selectedVoice === v.id
                      ? 'bg-[#31523D] dark:bg-[#436C52] text-white'
                      : 'bg-stone-100 dark:bg-[#252F28] text-[#4E5E52] dark:text-[#A7B6AB] hover:text-[#1E2621]'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
