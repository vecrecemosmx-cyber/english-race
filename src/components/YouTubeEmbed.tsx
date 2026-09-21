'use client';

import React, { useEffect, useRef, useState } from 'react';
import { VideoContextData } from '@/types';

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
  const wrapperRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState<number>(1);

  const startSeconds = videoContext?.startSeconds ?? 0;
  const videoId = videoContext?.videoId;
  const targetPhrase = videoContext?.targetPhrase ?? query;

  // Carga e inicialización segura del reproductor de YouTube
  useEffect(() => {
    if (!videoId) return;

    // Si el reproductor ya existe y está activo, solo cambiamos de video sin reiniciar el DOM
    if (playerRef.current && typeof playerRef.current.cueVideoById === 'function') {
      try {
        playerRef.current.cueVideoById({
          videoId: videoId,
          startSeconds: startSeconds,
        });
        playerRef.current.setPlaybackRate(currentSpeed);
      } catch (e) {
        console.error('Error switching video:', e);
      }
      return;
    }

    // Inyectar el script de YouTube Iframe API si no está en el documento
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      if (!wrapperRef.current || !window.YT || !window.YT.Player) return;

      // Montaje dinámico para evitar conflictos con el DOM de React
      wrapperRef.current.innerHTML = '';
      const mountNode = document.createElement('div');
      mountNode.style.width = '100%';
      mountNode.style.height = '100%';
      wrapperRef.current.appendChild(mountNode);

      playerRef.current = new window.YT.Player(mountNode, {
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
            if (playerRef.current?.setPlaybackRate) {
              playerRef.current.setPlaybackRate(currentSpeed);
            }
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
      // Limpieza segura al desmontar
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [videoId, startSeconds]);

  // 1. Botón: Repetir desde el segundo inicial exacto de la frase
  const handleReplayPhrase = () => {
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      playerRef.current.seekTo(startSeconds, true);
      playerRef.current.playVideo();
    }
  };

  // 2. Botón: Retroceder 5 segundos antes de la frase para captar el contexto previo
  const handleRewind5s = () => {
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      const leadInTime = Math.max(0, startSeconds - 5);
      playerRef.current.seekTo(leadInTime, true);
      playerRef.current.playVideo();
    }
  };

  // 3. Botón: Control de velocidad
  const handleSetSpeed = (rate: number) => {
    setCurrentSpeed(rate);
    if (playerRef.current && typeof playerRef.current.setPlaybackRate === 'function') {
      playerRef.current.setPlaybackRate(rate);
    }
  };

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

      {/* Proyección sincronizada de la frase */}
      <div className="mb-3 rounded-xl bg-slate-800/90 border border-slate-700 p-3 text-center">
        <p className="text-[11px] text-slate-400 uppercase tracking-widest font-mono mb-1">
          Frase a escuchar en este fragmento:
        </p>
        <p className="text-base md:text-lg font-bold text-amber-300 tracking-wide">
          "{targetPhrase}"
        </p>
      </div>

      {/* Contenedor seguro del Iframe */}
      <div className="relative w-full overflow-hidden rounded-xl bg-black aspect-video shadow-inner">
        <div ref={wrapperRef} className="w-full h-full"></div>
      </div>

      {/* Barra de Controles: Repetición, -5s Contexto y Velocidad */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          {/* Botón -5s Contexto Previo */}
          <button
            type="button"
            onClick={handleRewind5s}
            disabled={!isPlayerReady}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 hover:text-white font-bold text-xs border border-slate-700 transition disabled:opacity-50"
            title="Escuchar los 5 segundos previos al inicio de la frase"
          >
            <span>⏪ -5s Contexto previo</span>
          </button>

          {/* Botón Repetir Frase */}
          <button
            type="button"
            onClick={handleReplayPhrase}
            disabled={!isPlayerReady}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
          >
            <span>↺ Repetir frase</span>
          </button>
        </div>

        {/* Selector de Velocidades */}
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
          <span className="text-[10px] uppercase font-bold text-slate-400 px-1.5">Vel:</span>
          {[0.75, 1, 1.25].map((speed) => (
            <button
              key={speed}
              type="button"
              onClick={() => handleSetSpeed(speed)}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition ${
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