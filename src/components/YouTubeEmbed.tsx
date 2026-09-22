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

  const fullSpokenText = videoContext?.fullSpokenText || videoContext?.targetPhrase || query;
  const highlightPhrase = videoContext?.highlightPhrase || videoContext?.targetPhrase || '';

  const renderHighlightedSpokenText = (text: string, highlight: string) => {
    if (!highlight.trim()) return <span>"{text}"</span>;

    const lowerText = text.toLowerCase();
    const lowerHighlight = highlight.toLowerCase();
    const startIndex = lowerText.indexOf(lowerHighlight);

    if (startIndex === -1) return <span>"{text}"</span>;

    const endIndex = startIndex + highlight.length;
    const before = text.slice(0, startIndex);
    const match = text.slice(startIndex, endIndex);
    const after = text.slice(endIndex);

    return (
      <span>
        "{before}
        <span className="bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-md shadow-sm ring-2 ring-amber-300">
          {match}
        </span>
        {after}"
      </span>
    );
  };

  useEffect(() => {
    if (!videoId) return;

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

    // Inyección segura de la API Iframe de YouTube (URL corregida)
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      if (!wrapperRef.current || !window.YT || !window.YT.Player) return;

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
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [videoId, startSeconds]);

  const handleReplayPhrase = () => {
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      playerRef.current.seekTo(startSeconds, true);
      playerRef.current.playVideo();
    }
  };

  const handleRewind5s = () => {
    if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
      const currentTime = playerRef.current.getCurrentTime();
      const newTime = Math.max(0, currentTime - 5);
      playerRef.current.seekTo(newTime, true);
      playerRef.current.playVideo();
    }
  };

  const handleSetSpeed = (rate: number) => {
    setCurrentSpeed(rate);
    if (playerRef.current && typeof playerRef.current.setPlaybackRate === 'function') {
      playerRef.current.setPlaybackRate(rate);
    }
  };

  const youglishUrl = `https://youglish.com/pronounce/${encodeURIComponent(query)}/english/us`;

  return (
    // Marco cinematográfico responsivo (óptimo para modo claro y oscuro)
    <div className="mt-5 w-full rounded-3xl border border-slate-700 bg-slate-950 text-white p-4 md:p-6 shadow-2xl">
      
      {/* Cabecera */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 animate-ping"></span>
          <h4 className="text-xs md:text-sm font-bold uppercase tracking-wider text-slate-200">
            Aparición Exacta en Video (American English)
          </h4>
        </div>
        <a
          href={youglishUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-sky-400 hover:text-sky-300 transition underline flex items-center gap-1 font-semibold"
        >
          Abrir en YouGlish ↗
        </a>
      </div>

      {/* Frase Hablada Sincronizada con resaltado */}
      <div className="mb-4 rounded-2xl bg-slate-900/90 border border-slate-800 p-4 text-center shadow-inner">
        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono mb-2">
          Transcripción hablada (Frase en estudio resaltada):
        </p>
        <p className="text-base md:text-xl text-slate-100 font-medium leading-relaxed">
          {renderHighlightedSpokenText(fullSpokenText, highlightPhrase)}
        </p>
        {videoContext?.contextNote && (
          <p className="text-xs text-slate-400 mt-2 italic">
            ({videoContext.contextNote})
          </p>
        )}
      </div>

      {/* EL REPRODUCTOR: 100% responsivo con relación de aspecto 16:9 */}
      <div className="relative w-full overflow-hidden rounded-2xl bg-black aspect-video shadow-2xl border border-slate-800">
        <div ref={wrapperRef} className="w-full h-full"></div>
      </div>

      {/* Controles Interactivos con Dopamina de Acción */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Botón Dinámico -5s */}
          <button
            type="button"
            onClick={handleRewind5s}
            disabled={!isPlayerReady}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-sky-300 hover:text-white font-bold text-xs md:text-sm border border-slate-700 transition disabled:opacity-50 shadow-sm"
            title="Retrocede 5 segundos a partir del segundo actual"
          >
            <span>⏪ -5s (Punto actual)</span>
          </button>

          {/* Botón Repetir Frase en Ámbar Solar */}
          <button
            type="button"
            onClick={handleReplayPhrase}
            disabled={!isPlayerReady}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:scale-95 text-slate-950 font-black text-xs md:text-sm shadow-lg shadow-orange-500/20 transition disabled:opacity-50"
          >
            <span>↺ Repetir frase</span>
          </button>
        </div>

        {/* Selector de Velocidades */}
        <div className="flex items-center gap-1 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 px-2">Velocidad:</span>
          {[0.75, 1, 1.25].map((speed) => (
            <button
              key={speed}
              type="button"
              onClick={() => handleSetSpeed(speed)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                currentSpeed === speed
                  ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
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