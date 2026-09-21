'use client';

import React, { useEffect, useRef, useState } from 'react';
import { VideoContextData } from '@/types';

// Tipado seguro para la API de YouTube
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YouTubeEmbedProps {
  videoContext?: VideoContextData;
  query: string;
}

export const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({ videoContext, query }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const startSeconds = videoContext?.startSeconds ?? 0;
  const videoId = videoContext?.videoId;
  const targetPhrase = videoContext?.targetPhrase ?? query;

  // Carga segura del script oficial de YouTube Iframe API
  useEffect(() => {
    if (!videoId) return;

    const loadYouTubeApi = () => {
      if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }
    };

    loadYouTubeApi();

    const initPlayer = () => {
      if (!containerRef.current || !window.YT || !window.YT.Player) return;

      // Destruir reproductor anterior si existía para evitar fugas de memoria
      if (playerRef.current) {
        playerRef.current.destroy();
      }

      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: videoId,
        playerVars: {
          start: startSeconds,
          autoplay: 0,
          controls: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
        },
        events: {
          onReady: () => {
            setIsPlayerReady(true);
            playerRef.current.setPlaybackRate(currentSpeed);
          },
          onStateChange: (event: any) => {
            // 1 = Playing, 2 = Paused
            setIsPlaying(event.data === 1);
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [videoId, startSeconds]);

  // Acción: Repetir desde la marca de tiempo inicial (Core YouGlish)
  const handleReplayPhrase = () => {
    if (playerRef.current && isPlayerReady) {
      playerRef.current.seekTo(startSeconds, true);
      playerRef.current.playVideo();
    }
  };

  // Acción: Cambiar velocidad de reproducción (0.75x, 1x, 1.25x)
  const handleSetSpeed = (rate: number) => {
    setCurrentSpeed(rate);
    if (playerRef.current && isPlayerReady) {
      playerRef.current.setPlaybackRate(rate);
    }
  };

  // Enlace directo a YouGlish / YouTube como respaldo
  const youglishUrl = `https://youglish.com/pronounce/${encodeURIComponent(query)}/english/us`;

  return (
    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-900 text-white p-4 shadow-lg">
      {/* Cabecera del Reproductor */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse"></span>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            YouGlish Mode: Contexto Real Hablado
          </h4>
        </div>
        <a
          href={youglishUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-indigo-400 hover:text-indigo-300 transition underline flex items-center gap-1"
        >
          Abrir en YouGlish original ↗
        </a>
      </div>

      {/* Proyección sincronizada de la frase (Subtitle Banner) */}
      <div className="mb-3 rounded-xl bg-slate-800/90 border border-slate-700 p-3 text-center">
        <p className="text-xs text-slate-400 uppercase tracking-widest font-mono mb-1">
          Frase a escuchar en este fragmento:
        </p>
        <p className="text-base md:text-lg font-bold text-amber-300 tracking-wide">
          "{targetPhrase}"
        </p>
      </div>

      {/* Contenedor del Iframe de YouTube */}
      <div className="relative w-full overflow-hidden rounded-xl bg-black aspect-video shadow-inner">
        <div ref={containerRef} className="w-full h-full"></div>
      </div>

      {/* Barra de Controles YouGlish (Repetición y Velocidad) */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
        {/* Botón Repetir Frase */}
        <button
          type="button"
          onClick={handleReplayPhrase}
          disabled={!isPlayerReady}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
        >
          <span>↺ Repetir desde el inicio de la frase</span>
        </button>

        {/* Control de Velocidades */}
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
          <span className="text-[10px] uppercase font-bold text-slate-400 px-2">Velocidad:</span>
          {[0.75, 1, 1.25].map((speed) => (
            <button
              key={speed}
              type="button"
              onClick={() => handleSetSpeed(speed)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                currentSpeed === speed
                  ? 'bg-amber-400 text-slate-900 shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};