'use client';

import React, { useEffect, useState } from 'react';
import { Layer2Data, VideoSearchResult } from '@/types';
import { YouTubeEmbed } from './YouTubeEmbed';

interface Layer2AdaptiveProps {
  targetPhrase: string;
  collocations?: string[];
  layer2: Layer2Data;
  onClose: () => void;
}

export const Layer2Adaptive: React.FC<Layer2AdaptiveProps> = ({
  targetPhrase,
  collocations = [],
  layer2,
  onClose,
}) => {
  const [videoResult, setVideoResult] = useState<VideoSearchResult | null>(null);
  const [isSearchingVideo, setIsSearchingVideo] = useState<boolean>(true);

  // Ejecutar la búsqueda en cascada al abrir la Capa 2
  useEffect(() => {
    let isMounted = true;

    async function executeSearch() {
      setIsSearchingVideo(true);
      setVideoResult(null);

      try {
        const res = await fetch('/api/video-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phrase: targetPhrase,
            collocations: collocations,
          }),
        });

        const data: VideoSearchResult = await res.json();
        if (isMounted) {
          setVideoResult(data);
        }
      } catch (err) {
        console.error('Error buscando video en cascada:', err);
        if (isMounted) {
          setVideoResult({
            found: false,
            matchType: 'none',
            message: 'Error al conectar con el motor de búsqueda de video.',
          });
        }
      } finally {
        if (isMounted) {
          setIsSearchingVideo(false);
        }
      }
    }

    executeSearch();

    return () => {
      isMounted = false;
    };
  }, [targetPhrase, collocations]);

  return (
    <div className="mt-6 rounded-2xl border-2 border-indigo-200 bg-gradient-to-b from-indigo-50/70 to-white p-6 shadow-md transition-all">
      <div className="flex items-center justify-between border-b border-indigo-100 pb-3 mb-4">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 rounded-full">
            Cognitive Scaffolding (Capa 2)
          </span>
          <span className="text-sm text-slate-500 font-medium">
            Focus keyword: <strong className="text-slate-800">"{layer2.keyword}"</strong> ({layer2.partOfSpeech})
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-xs text-slate-500 hover:text-slate-800 font-medium px-2 py-1 rounded hover:bg-slate-100 transition"
        >
          ✕ Close
        </button>
      </div>

      {/* Técnica 1: Acción / Mini-Historia */}
      <div className="mb-5 bg-white rounded-xl p-4 border border-indigo-100 shadow-sm">
        <h4 className="text-xs font-bold uppercase tracking-wide text-indigo-600 mb-1">
          {layer2.primaryTechnique.title}
        </h4>
        <p className="text-sm text-slate-700 leading-relaxed">
          {layer2.primaryTechnique.content}
        </p>
      </div>

      {/* Técnica 2: Situación Opuesta Real */}
      <div className="mb-5 bg-white rounded-xl p-4 border border-amber-100 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold uppercase tracking-wide text-amber-700">
            {layer2.secondaryTechnique.title}:
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-mono">
            Antonym: {layer2.secondaryTechnique.oppositeWord}
          </span>
        </div>
        <ul className="space-y-1.5">
          {layer2.secondaryTechnique.contrastPhrases.map((phrase, idx) => (
            <li key={idx} className="text-sm text-slate-800 flex items-start gap-2">
              <span className="text-amber-500 font-bold">•</span>
              <span>"{phrase}"</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ======================================================== */}
      {/* SECCIÓN DE VIDEO: MANEJO DE LOS 3 ESTADOS EN PANTALLA    */}
      {/* ======================================================== */}
      {isSearchingVideo ? (
        // Estado Cargando: Escaneando YouTube
        <div className="mt-5 p-6 rounded-2xl bg-slate-900 text-white text-center animate-pulse border border-slate-800">
          <div className="inline-block h-6 w-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mb-2"></div>
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-400">
            Escaneando YouTube en tiempo real...
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Buscando hablantes nativos que pronuncien la frase exacta o una colocación similar.
          </p>
        </div>
      ) : videoResult?.found && videoResult.videoId ? (
        <div>
          {/* ESTADO B: Aviso cuando se recurre a una colocación similar */}
          {videoResult.matchType === 'collocation_match' && (
            <div className="mt-5 mb-2 p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 flex items-start gap-2.5">
              <span className="text-base leading-none mt-0.5">ℹ️</span>
              <div>
                <p className="text-xs font-bold">
                  No se encontró la frase exacta, pero se ha encontrado una frase similar:
                </p>
                <p className="text-sm font-extrabold text-blue-700 mt-0.5 font-mono">
                  "{videoResult.matchedPhrase}"
                </p>
              </div>
            </div>
          )}

          {/* ESTADO A: Frase exacta (sin aviso de alerta) */}
          {videoResult.matchType === 'exact_phrase' && (
            <div className="mt-5 mb-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <span>✔</span>
              <span>Frase exacta localizada en el audio del orador nativo.</span>
            </div>
          )}

          {/* Reproductor con el Video Real Dinámico */}
          <YouTubeEmbed
            videoContext={{
              videoId: videoResult.videoId,
              startSeconds: videoResult.startSeconds ?? 0,
              targetPhrase: videoResult.matchedPhrase || targetPhrase,
              fullSpokenText: videoResult.fullSpokenText,
              highlightPhrase: videoResult.highlightPhrase,
            }}
            query={videoResult.matchedPhrase || targetPhrase}
          />
        </div>
      ) : (
        // ESTADO C: Ninguna coincidencia encontrada
        <div className="mt-5 p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-center">
          <span className="text-2xl mb-2 block">⚠️</span>
          <p className="font-bold text-sm">
            No se encontró ninguna coincidencia en video para esta frase ni para sus colocaciones.
          </p>
          <p className="text-xs text-amber-800 mt-1">
            Ningún video con subtítulos oficiales en YouTube contiene estas combinaciones exactas en su audio.
          </p>
        </div>
      )}
    </div>
  );
};