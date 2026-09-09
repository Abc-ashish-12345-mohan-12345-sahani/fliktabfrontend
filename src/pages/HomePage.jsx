import React, { useState, useEffect } from 'react';
import { Sparkles, Film, Tv, Play, Search, AlertCircle, RefreshCw } from 'lucide-react';
import HeroPreviewPlayer from '../components/HeroPreviewPlayer';
import ShowCard from '../components/ShowCard';
import PurchaseModal from '../components/PurchaseModal';
import { showsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function HomePage({ searchQuery, onPlayShow, onOpenLogin }) {
  const { user, isAuthenticated } = useAuth();
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [featuredShow, setFeaturedShow] = useState(null);
  const [purchaseModalShow, setPurchaseModalShow] = useState(null);

  const fetchShows = async () => {
    setLoading(true);
    try {
      const res = await showsApi.getAll();
      const allShows = res.data?.data || res.data?.shows || [];
      setShows(allShows);
      if (allShows.length > 0) {
        // Pick first featured or first show
        const featured = allShows.find((s) => s.isFeatured) || allShows[0];
        setFeaturedShow(featured);
      }
    } catch (err) {
      console.error('Failed to load shows:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShows();
  }, []);

  const genres = ['All', 'Historical', 'Drama', 'Romance', 'Action', 'Thriller'];

  const userEmail = user?.email || '';
  const isPurchased = (show) => {
    if (!show || !userEmail) return false;
    return show.purchasedUsers?.includes(userEmail);
  };

  // Filter shows by search query and genre
  const filteredShows = shows.filter((s) => {
    const matchesSearch =
      !searchQuery ||
      s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.genres?.some((g) => g.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesGenre =
      selectedGenre === 'All' ||
      s.genres?.some((g) => g.toLowerCase() === selectedGenre.toLowerCase());

    return matchesSearch && matchesGenre;
  });

  // Split into categories
  const featuredHits = filteredShows.filter((s) => s.isFeatured || s.rating >= 4.8).slice(0, 6);
  const tvSerials = filteredShows.filter((s) => s.category === 'serial');
  const blockbusterMovies = filteredShows.filter((s) => s.category === 'movie');
  const webSeries = filteredShows.filter((s) => s.category === 'web_series');

  const handleShowPurchased = (showId) => {
    setShows((prev) =>
      prev.map((s) =>
        s._id === showId
          ? { ...s, purchasedUsers: [...(s.purchasedUsers || []), userEmail] }
          : s
      )
    );
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 🌟 1. HERO FEATURED TEASER PLAYER */}
      {featuredShow && (
        <HeroPreviewPlayer
          show={featuredShow}
          isPurchased={isPurchased(featuredShow)}
          onUnlockClick={() => setPurchaseModalShow(featuredShow)}
          onPlayFullClick={() => onPlayShow(featuredShow)}
        />
      )}

      {/* 🏷️ 2. GENRE FILTER CHIPS */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {genres.map((g) => (
          <button
            key={g}
            onClick={() => setSelectedGenre(g)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedGenre === g
                ? 'bg-gradient-to-r from-indigo-600 to-pink-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-white dark:bg-slate-900/80 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-sm'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* ✨ 3. TRENDING & TOP RATED HITS */}
      {featuredHits.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 dark:text-indigo-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                ✨ Trending & Top Rated Hits
              </h2>
            </div>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">{featuredHits.length} Titles</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {featuredHits.map((show) => (
              <ShowCard
                key={show._id}
                show={show}
                isPurchased={isPurchased(show)}
                onSelect={(s) => onPlayShow(s)}
                onUnlock={(s) => setPurchaseModalShow(s)}
              />
            ))}
          </div>
        </section>
      )}

      {/* 📺 4. POPULAR TV SERIALS & DRAMAS */}
      {tvSerials.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-500 dark:text-pink-400">
                <Tv className="w-4 h-4" />
              </div>
              <h2 className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                📺 Popular TV Serials & Daily Dramas
              </h2>
            </div>
            <span className="text-xs text-pink-600 dark:text-pink-400 font-semibold">{tvSerials.length} Series</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {tvSerials.map((show) => (
              <ShowCard
                key={show._id}
                show={show}
                isPurchased={isPurchased(show)}
                onSelect={(s) => onPlayShow(s)}
                onUnlock={(s) => setPurchaseModalShow(s)}
              />
            ))}
          </div>
        </section>
      )}

      {/* 🎬 5. BLOCKBUSTER MOVIES */}
      {blockbusterMovies.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <Film className="w-4 h-4" />
              </div>
              <h2 className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                🎬 Blockbuster Movies & Cinema Hits
              </h2>
            </div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{blockbusterMovies.length} Movies</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {blockbusterMovies.map((show) => (
              <ShowCard
                key={show._id}
                show={show}
                isPurchased={isPurchased(show)}
                onSelect={(s) => onPlayShow(s)}
                onUnlock={(s) => setPurchaseModalShow(s)}
              />
            ))}
          </div>
        </section>
      )}

      {/* 🍿 6. WEB SERIES & CRIME THRILLERS */}
      {webSeries.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                <Film className="w-4 h-4" />
              </div>
              <h2 className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                🍿 Binge-Worthy Web Series & Thrillers
              </h2>
            </div>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">{webSeries.length} Series</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {webSeries.map((show) => (
              <ShowCard
                key={show._id}
                show={show}
                isPurchased={isPurchased(show)}
                onSelect={(s) => onPlayShow(s)}
                onUnlock={(s) => setPurchaseModalShow(s)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {!loading && filteredShows.length === 0 && (
        <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-md">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Shows Found</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
            No video content matched your filter or search query. Try clearing the search bar or uploading videos.
          </p>
          <button
            onClick={() => {
              setSelectedGenre('All');
              fetchShows();
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white cursor-pointer shadow-md"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Purchase Modal */}
      {purchaseModalShow && (
        <PurchaseModal
          show={purchaseModalShow}
          onClose={() => setPurchaseModalShow(null)}
          onPurchased={handleShowPurchased}
          onOpenLogin={onOpenLogin}
        />
      )}
    </div>
  );
}
