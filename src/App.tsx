import React, { useState, useEffect, useMemo } from 'react';
import { AudioProvider, useAudio } from './context/AudioContext';
import { Header } from './components/Header';
import { SearchAndFilterBar } from './components/SearchAndFilterBar';
import { TrackCard } from './components/TrackCard';
import { MiniPlayer } from './components/MiniPlayer';
import { FullPlayerModal } from './components/FullPlayerModal';
import { AboutModal } from './components/AboutModal';
import { MEDITATIONS } from './data/meditations';
import { SectionCategory, DurationFilter, VoiceFilter } from './types';
import { RefreshCw, ExternalLink, Leaf } from 'lucide-react';

function MeditationAppContent() {
  const {
    favorites,
    cachedTrackIds,
    currentTrack,
  } = useAudio();

  // Dark / Light Theme
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('meditation_player_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('meditation_player_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('meditation_player_theme', 'light');
    }
  }, [isDark]);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SectionCategory>('All');
  const [selectedDuration, setSelectedDuration] = useState<DurationFilter>('all');
  const [selectedVoice, setSelectedVoice] = useState<VoiceFilter>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showOfflineOnly, setShowOfflineOnly] = useState(false);

  // About Modal
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  // Filter logic
  const filteredTracks = useMemo(() => {
    return MEDITATIONS.filter((track) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = track.title.toLowerCase().includes(q);
        const matchDesc = track.description.toLowerCase().includes(q);
        const matchSubtitle = (track.subtitle || '').toLowerCase().includes(q);
        const matchVoice = track.voiceLabel.toLowerCase().includes(q);
        const matchSection = track.section.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchSubtitle && !matchVoice && !matchSection) {
          return false;
        }
      }

      // 2. Category
      if (selectedCategory !== 'All' && track.section !== selectedCategory) {
        return false;
      }

      // 3. Duration Filter
      if (selectedDuration !== 'all') {
        const mins = track.durationMinutes;
        if (selectedDuration === 'under5' && mins >= 5) return false;
        if (selectedDuration === '5to15' && (mins < 5 || mins > 15)) return false;
        if (selectedDuration === '15to30' && (mins <= 15 || mins > 30)) return false;
        if (selectedDuration === 'over30' && mins <= 30) return false;
      }

      // 4. Voice / Narrator Filter
      if (selectedVoice !== 'all') {
        if (selectedVoice === 'christina' && track.narrator !== 'Christina') return false;
        if (selectedVoice === 'paddy' && track.narrator !== 'Paddy') return false;
        if (selectedVoice === 'peter' && track.narrator !== 'Peter') return false;
        if (selectedVoice === 'bells' && track.narrator !== 'Bells') return false;
      }

      // 5. Favorites Filter
      if (showFavoritesOnly && !favorites.includes(track.id)) {
        return false;
      }

      // 6. Offline Downloaded Filter
      if (showOfflineOnly && !cachedTrackIds.includes(track.id)) {
        return false;
      }

      return true;
    });
  }, [
    searchQuery,
    selectedCategory,
    selectedDuration,
    selectedVoice,
    showFavoritesOnly,
    showOfflineOnly,
    favorites,
    cachedTrackIds,
  ]);

  const shouldGroupSections =
    selectedCategory === 'All' &&
    !searchQuery.trim() &&
    selectedDuration === 'all' &&
    selectedVoice === 'all' &&
    !showFavoritesOnly &&
    !showOfflineOnly;

  const sectionOrder: SectionCategory[] = [
    'Body Scan',
    'Mindful Movement',
    'Sitting Meditation',
    '5 minutes or less',
    'Silence with Bells',
    '10 minute practices',
  ];

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedDuration('all');
    setSelectedVoice('all');
    setShowFavoritesOnly(false);
    setShowOfflineOnly(false);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#111513] text-[#232B25] dark:text-[#E6ECE8] flex flex-col font-sans transition-colors duration-200">
      {/* Calm Header */}
      <Header
        onOpenAbout={() => setIsAboutModalOpen(true)}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
      />

      {/* Main Content Area */}
      <main className={`flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6 ${currentTrack ? 'pb-28 sm:pb-32' : 'pb-16'}`}>
        {/* Serene Tree Canopy Image inspired by user's photograph */}
        <div className="relative w-full h-28 sm:h-36 rounded-3xl overflow-hidden shadow-xs border border-stone-200/60 dark:border-white/[0.06]">
          <img
            src="/canopy-banner.jpg"
            alt="Sunlit green leaves and tree branches"
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Search & Round Filter Bar */}
        <SearchAndFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedDuration={selectedDuration}
          onSelectDuration={setSelectedDuration}
          selectedVoice={selectedVoice}
          onSelectVoice={setSelectedVoice}
          showFavoritesOnly={showFavoritesOnly}
          onToggleFavoritesOnly={() => setShowFavoritesOnly(!showFavoritesOnly)}
          showOfflineOnly={showOfflineOnly}
          onToggleOfflineOnly={() => setShowOfflineOnly(!showOfflineOnly)}
          favoritesCount={favorites.length}
          downloadedCount={cachedTrackIds.length}
        />

        {/* Quiet status line */}
        <div className="flex items-center justify-between text-xs text-[#5E6F63] dark:text-[#9FB1A5] font-medium px-1">
          <span>
            {filteredTracks.length} {filteredTracks.length === 1 ? 'practice' : 'practices'}
          </span>
          {(searchQuery || selectedCategory !== 'All' || selectedDuration !== 'all' || selectedVoice !== 'all' || showFavoritesOnly || showOfflineOnly) && (
            <button
              onClick={handleResetFilters}
              className="text-[#385944] dark:text-[#7EA089] hover:underline flex items-center gap-1 font-semibold"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset filters</span>
            </button>
          )}
        </div>

        {/* Tracks List */}
        {filteredTracks.length === 0 ? (
          <div className="p-8 sm:p-12 text-center rounded-3xl bg-white dark:bg-[#181F1A] border border-stone-200/70 dark:border-white/[0.06] space-y-3">
            <p className="text-sm font-bold text-[#1E2621] dark:text-[#EDF3EF]">
              No meditations found matching your search.
            </p>
            <p className="text-xs text-[#6E7F73] dark:text-[#90A295]">
              Try clearing filters or search terms.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-full bg-[#31523D] dark:bg-[#436C52] text-white text-xs font-semibold shadow-xs active:scale-95 transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : shouldGroupSections ? (
          // Grouped by Section
          <div className="space-y-8">
            {sectionOrder.map((sectionName) => {
              const tracksInSection = filteredTracks.filter((t) => t.section === sectionName);
              if (tracksInSection.length === 0) return null;

              return (
                <section key={sectionName} className="space-y-3">
                  <div className="flex items-baseline justify-between border-b border-black/[0.05] dark:border-white/[0.06] pb-2 px-1">
                    <h2 className="text-base sm:text-lg font-bold tracking-tight text-[#1E2621] dark:text-[#EDF3EF]">
                      {sectionName}
                    </h2>
                    <span className="text-xs text-[#6E7F73] dark:text-[#90A295] font-medium">
                      {tracksInSection.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
                    {tracksInSection.map((track) => (
                      <TrackCard key={track.id} track={track} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          // Flat List
          <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
            {filteredTracks.map((track) => (
              <TrackCard key={track.id} track={track} />
            ))}
          </div>
        )}

        {/* Serene Footer with user requested copy */}
        <footer className="pt-8 pb-4 text-center border-t border-black/[0.05] dark:border-white/[0.06] space-y-4">
          {/* Half-height version of the tree canopy image */}
          <div className="relative w-full h-14 sm:h-18 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs border border-stone-200/60 dark:border-white/[0.06]">
            <img
              src="/canopy-banner.jpg"
              alt="Sunlit green leaves canopy"
              className="w-full h-full object-cover object-bottom"
            />
          </div>

          <p className="text-xs sm:text-sm text-[#4E5E53] dark:text-[#A7B6AB] max-w-lg mx-auto font-medium leading-relaxed">
            We hope this app supports your practice. Feedback or comments are welcome:{' '}
            <a
              href="mailto:app@freemindfulness.org"
              className="text-[#385944] dark:text-[#7EA089] underline hover:opacity-85 font-semibold"
            >
              app@freemindfulness.org
            </a>
          </p>

          <div className="flex items-center justify-center gap-3 text-xs">
            <a
              href="https://www.freemindfulness.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#385944] dark:text-[#7EA089] hover:underline inline-flex items-center gap-1 font-semibold"
            >
              <Leaf className="w-3.5 h-3.5" />
              <span>freemindfulness.org</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </footer>
      </main>

      {/* Persistent Mini Player at Bottom */}
      <MiniPlayer />

      {/* Full Immersive Player Sheet Modal */}
      <FullPlayerModal />

      {/* About & Info Modal */}
      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AudioProvider>
      <MeditationAppContent />
    </AudioProvider>
  );
}
