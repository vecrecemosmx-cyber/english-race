'use client';

import React, { useState } from 'react';

interface VideoSegmentData {
  videoId: string;
  startSeconds: number;
  endSeconds: number;
  wordCount: number;
  rawTranscript: string;
}

interface MainVideoSegmentPlayerProps {
  segment: VideoSegmentData;
}

export const MainVideoSegmentPlayer: React.FC<MainVideoSegmentPlayerProps> = ({ segment }) => {
  const [currentSeconds, setCurrentSeconds] = useState<number>(segment.startSeconds);
  const [showRawTranscript, setShowRawTranscript] = useState(false);

  // Retroceder 5 segundos dinámico sin bajar del segundo de inicio
  const handleRewind5s = () => {
    setCurrentSeconds((prev) => Math.max(0, prev - 5));
  };

  // Reiniciar desde el inicio exacto del fragmento
  const handleReplaySegment = () => {
    setCurrentSeconds(segment.startSeconds);
  };

  const durationSeconds = Math.max(0, segment.endSeconds - segment.startSeconds);

  return (
    <section className="mb-8 rounded-3xl border-2 transition-all p-5 md:p-7 shadow-2xl bg-slate-950 border-blue-500/30 text-white">
      
      {/* Cabecera del reproductor */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-3 w-3 rounded-full bg-red-500 animate-ping" />
          <h3 className="text-sm md:text-base font-extrabold uppercase tracking-wider text-slate-100">
            🎬 Video Auténtico en Vivo: Escucha el lenguaje real
          </h3>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            {segment.wordCount} palabras habladas
          </span>
          <span className="text-slate-400 font-mono">
            ~{durationSeconds} segundos de audio
          </span>
        </div>
      </div>

      {/* Mensaje de orientación al estudiante */}
      <p className="text-xs md:text-sm text-slate-300 mb-4 leading-relaxed">
        Escucha con atención cómo un orador nativo se comunica sobre tu temática. A continuación descompondremos estas ideas en lenguaje simple para que las estudies y pronuncies.
      </p>

      {/* Contenedor del video con relación de aspecto 16:9 */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border border-slate-800 mb-4">
        <iframe
          key={`${segment.videoId}-${currentSeconds}`}
          src={`https://www.youtube.com/embed/${segment.videoId}?start=${currentSeconds}&autoplay=1&rel=0&modestbranding=1`}
          title="Authentic YouTube Audio Segment"
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      {/* Controles de reproducción interactiva */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleRewind5s}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-sky-300 hover:text-white font-bold text-xs md:text-sm border border-slate-700 transition shadow-sm"
            title="Retrocede 5 segundos"
          >
            <span>⏪ -5s</span>
          </button>

          <button
            type="button"
            onClick={handleReplaySegment}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 active:scale-95 text-slate-950 font-black text-xs md:text-sm shadow-lg shadow-orange-500/20 transition"
            title="Reiniciar el fragmento completo"
          >
            <span>🔁 Repetir fragmento ({segment.startSeconds}s)</span>
          </button>
        </div>

        {/* Botón para ver la transcripción cruda de 250-280 palabras */}
        <button
          type="button"
          onClick={() => setShowRawTranscript(!showRawTranscript)}
          className="text-xs font-semibold px-3.5 py-2 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-900 transition"
        >
          {showRawTranscript ? '▲ Ocultar transcripción cruda' : '📄 Ver lo que dice el video'}
        </button>
      </div>

      {/* Panel desplegable con el texto real del orador */}
      {showRawTranscript && (
        <div className="mt-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs md:text-sm text-slate-300 leading-relaxed italic animate-fadeIn">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1 font-mono not-italic">
            Transcripción exacta cosechada de YouTube:
          </span>
          "{segment.rawTranscript}"
        </div>
      )}

    </section>
  );
};