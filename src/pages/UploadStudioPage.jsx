import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  Film,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Copy,
  ExternalLink,
  Shield,
  Loader2,
  Database,
  RefreshCw,
} from 'lucide-react';
import { showsApi, resolveVideoUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function UploadStudioPage({ onShowUploaded }) {
  const { user, isAdmin } = useAuth();
  const fileInputRef = useRef(null);

  // Upload Form State
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('serial');
  const [description, setDescription] = useState('');
  const [priceBuy, setPriceBuy] = useState(199);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  // Catalog / Hosted Files State
  const [shows, setShows] = useState([]);
  const [loadingShows, setLoadingShows] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchShows = async () => {
    setLoadingShows(true);
    try {
      const res = await showsApi.getAll();
      const list = res.data?.data || res.data?.shows || [];
      setShows(list);
    } catch (err) {
      console.error('Failed to load shows in studio:', err);
    } finally {
      setLoadingShows(false);
    }
  };

  useEffect(() => {
    fetchShows();
  }, []);

  const handleFileSelect = (file) => {
    if (!file) return;
    setSelectedFile(file);
    setUploadError(null);
    setUploadSuccess(null);

    // Auto-generate clean title from filename if empty
    const cleanName = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[._-]+/g, ' ')
      .replace(/(\d+)/g, ' $1 ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!title) {
      setTitle(
        cleanName
          .split(' ')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(' ')
      );
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please select a video file (.mp4, .mkv, .webm)');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    setUploadSuccess(null);

    const formData = new FormData();
    formData.append('video', selectedFile);
    formData.append('title', title.trim() || selectedFile.name);
    formData.append('category', category);
    formData.append('description', description.trim());
    formData.append('priceRent', priceBuy);
    formData.append('priceBuy', priceBuy);

    try {
      const res = await showsApi.uploadLocalVideo(formData, (percent) => {
        setUploadProgress(percent);
      });

      if (res.data?.success) {
        setUploadSuccess(
          `Successfully published "${res.data.show?.title || title}"! It is now live in both Web and Mobile Apps.`
        );
        setSelectedFile(null);
        setTitle('');
        setDescription('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchShows();
        if (onShowUploaded) onShowUploaded();
      } else {
        setUploadError(res.data?.message || 'Upload failed');
      }
    } catch (err) {
      setUploadError(
        err.response?.data?.message || err.message || 'Error uploading video to server'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteShow = async (showId, showTitle) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete "${showTitle}"? This will remove it from MongoDB and FlickTap Mobile App.`
      )
    ) {
      return;
    }

    setDeletingId(showId);
    try {
      await showsApi.deleteShow(showId);
      setShows((prev) => prev.filter((s) => s._id !== showId));
      if (onShowUploaded) onShowUploaded();
    } catch (err) {
      alert(
        'Failed to delete: ' + (err.response?.data?.message || err.message)
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <Shield className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Admin Upload Studio</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Only administrator accounts are authorized to upload and publish movies, TV serials, and streaming episodes.
            </p>
          </div>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
          >
            Back to Home Feed
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-indigo-50 via-white to-purple-50 dark:from-indigo-950/60 dark:via-slate-900 dark:to-purple-950/50 border border-indigo-200 dark:border-indigo-500/20 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
              Admin & Creator Hub
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">• Multi-Platform Instant Sync</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            🎬 FlickTap Upload Studio
          </h1>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 mt-1">
            Upload local `.mp4` video files to host on server. Uploaded content automatically syncs with the <strong className="text-emerald-600 dark:text-emerald-400">Flutter Mobile App</strong> and <strong className="text-indigo-600 dark:text-indigo-400">Web App</strong> in real-time.
          </p>
        </div>

        <button
          onClick={fetchShows}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingShows ? 'animate-spin' : ''}`} />
          <span>Refresh Database</span>
        </button>
      </div>

      {/* 📤 Upload Form Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl">
        <form onSubmit={handleUpload} className="space-y-6">
          {/* Drag & Drop Area */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
              selectedFile
                ? 'border-emerald-500/60 bg-emerald-500/5'
                : 'border-slate-300 hover:border-indigo-500/60 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/mkv,video/webm,video/quicktime"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />

            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
              <UploadCloud className="w-8 h-8" />
            </div>

            {selectedFile ? (
              <div className="space-y-1">
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  📁 Selected: {selectedFile.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Click to replace file
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  Drag & drop your .mp4 video file here, or <span className="text-indigo-600 dark:text-indigo-400 underline">browse</span>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Supports MP4, MKV, WebM, MOV (Up to 1 GB)
                </p>
              </div>
            )}
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Show / Movie Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Jodha Akbar Ep 1 / RRR Full HD"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="serial">📺 TV Serial & Drama</option>
                <option value="movie">🍿 Blockbuster Movie</option>
                <option value="web_series">🎬 Web Originals & Series</option>
              </select>
            </div>

            {/* Price Buy / Unlock Price */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Unlock / Purchase Price (₹)</label>
              <input
                type="number"
                value={priceBuy}
                onChange={(e) => setPriceBuy(Number(e.target.value))}
                min="0"
                placeholder="e.g. 199"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Storyline / Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description of the show or movie..."
                rows="2"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-2 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <div className="flex items-center justify-between text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Uploading video to server & MongoDB...
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Success Banner */}
          {uploadSuccess && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
              <span>{uploadSuccess}</span>
            </div>
          )}

          {/* Error Banner */}
          {uploadError && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isUploading || !selectedFile}
            className="w-full md:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 active:scale-95 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Publishing to Catalog ({uploadProgress}%)...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Upload & Publish to App Catalog</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* 📂 Live Database & Catalog Management Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 dark:text-indigo-400">
              <Database className="w-4 h-4" />
            </div>
            <h2 className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              📂 Live Database Catalog ({shows.length} Shows)
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">Mobile & Web Synchronized</span>
        </div>

        {/* Responsive Table Card */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3.5 px-4 w-16">Poster</th>
                  <th className="py-3.5 px-4">Title & Category</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4">Unlock Price</th>
                  <th className="py-3.5 px-4">Rating</th>
                  <th className="py-3.5 px-4 text-center">Delete Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {loadingShows ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-500">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-500 mb-2" />
                      Loading Database Shows...
                    </td>
                  </tr>
                ) : shows.length > 0 ? (
                  shows.map((show) => (
                    <tr key={show._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      {/* Poster */}
                      <td className="py-3 px-4">
                        <img
                          src={show.thumbnailUrl}
                          alt={show.title}
                          className="w-10 h-14 object-cover rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                          onError={(e) => {
                            e.target.src =
                              'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200';
                          }}
                        />
                      </td>

                      {/* Title & Category */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white text-sm">{show.title}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300">
                            {show.category}
                          </span>
                          {show.isFeatured && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-500/15 text-amber-700 dark:text-amber-300">
                              Featured
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Duration */}
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{show.duration || '45 mins'}</td>

                      {/* Unlock Price */}
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-500/20">
                          ₹{show.priceBuy ?? show.price ?? 199}
                        </span>
                      </td>

                      {/* Rating */}
                      <td className="py-3 px-4 text-amber-600 dark:text-amber-400 font-bold">★ {show.rating || '4.9'}</td>

                      {/* Delete Button */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleDeleteShow(show._id, show.title)}
                          disabled={deletingId === show._id}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-600 dark:text-rose-300 hover:text-white border border-rose-500/20 transition-all font-bold cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                        >
                          {deletingId === show._id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-500">
                      No shows found in database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
