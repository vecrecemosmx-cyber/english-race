'use client';

import React from 'react';

interface YouTubeEmbedProps {
  videoId?: string;
  query: string;
}

export const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({ videoId, query }) => {
  // Enlace directo de búsqueda estilo YouGlish / YouTube
  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-3 w-3 rounded-full bg-red-500 animate-pulse"></span>
          <h4 className="text-sm font-semibold text-slate-800">
            Contextual Video Proof (Authentic English)
          </h4>
        </div>
        <a
          href={youtubeSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-indigo-600 hover:text-indigo-800 underline flex items-center gap-1"
        >
          Open more examples on YouTube ↗
        </a>
      </div>

      {videoId ? (
        <div className="relative w-full overflow-hidden rounded-lg shadow-sm" style={{ paddingTop: '56.25%' }}>
          <iframe
            className="absolute top-0 left-0 w-full h-full border-0"
            src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`}
            title="Educational Context Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      ) : (
        <div className="p-6 text-center bg-white rounded-lg border border-dashed border-slate-300">
          <p className="text-sm text-slate-600 mb-2">Search spoken occurrences of this phrase:</p>
          <a
            href={youtubeSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-md hover:bg-red-700 transition"
          >
            Watch real native speakers saying: "{query}"
          </a>
        </div>
      )}
    </div>
  );
};