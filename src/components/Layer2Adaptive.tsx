'use client';

import React, { useEffect, useState } from 'react';
import { Layer2Data, VideoSearchResult } from '@/types';
import { YouTubeEmbed } from './YouTubeEmbed';

interface Layer2AdaptiveProps {
  targetPhrase: string;
  coreStructure?: string;
  targetComplement?: string;
  collocations?: string[];
  layer2: Layer2Data;
  onClose: () => void;
}

export const Layer2Adaptive: React.FC<Layer2AdaptiveProps> = ({
  targetPhrase,
  coreStructure = '',
  targetComplement = '',
  collocations = [],
  layer2,
  onClose,
}) => {
  const [videoResult, setVideoResult] = useState<VideoSearchResult | null>(null);
  const [isSearchingVideo, setIsSearchingVideo] = useState<boolean>(true);

  // Ejecución de la cascada
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
            coreStructure: coreStructure,
            collocations: collocations,
          }),
        });

        const data: VideoSearchResult = await res.json();
        if (isMounted) {
          setVideoResult(data);
        }
      } catch (err) {
        console.error('Error en cascada:', err);
        if (isMounted) {
          setVideoResult({
            found: false,
            matchType: 'none',
            message: 'Error al conectar con el motor de búsqueda.',
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
  }, [targetPhrase, coreStructure, collocations]);

  // Si la búsqueda no arroja nada en vivo pero hay un video verificado de respaldo en layer2:
  const activeVideo = videoResult?.found && videoResult.videoId ? videoResult : (
    layer2.videoContext ? {
      found: true,
      matchType: 'collocation_match' as const,
      matchedPhrase: layer2.videoContext.targetPhrase,
      videoId: layer2.videoContext.videoId,
      startSeconds: layer2.videoContext.startSeconds,
      fullSpokenText: layer2.videoContext.fullSpokenText,
      highlightPhrase: layer2.videoContext.highlightPhrase,
    } : null
  );

  return (
    <div className="mt-6 rounded-3xl border-2 border-indigo-200 bg-gradient-to-b from-indigo-50/70 to-white p-5 md:p-8 shadow-xl transition-all">
      {/* Cabecera */}
      <div className="flex items-center justify-between border-b border-indigo-100 pb-4 mb-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 rounded-full">
            Cognitive Scaffolding (Capa 2)
          </span>
          <span className="text-sm text-slate-600 font-medium">
            Palabra clave: <strong className="text-slate-900">"{layer2.keyword}"</strong> ({layer2.partOfSpeech})
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-xs text-slate-500 hover:text-slate-900 font-bold px-3 py-1.5 rounded-lg hover:bg-slate-100 transition"
        >
          ✕ Cerrar
        </button>
      </div>

      {/* ========================================================================= */}
      {/* PANEL DE VERIFICACIÓN EN TIEMPO REAL: Diagnóstico visible de la lógica    */}
      {/* ========================================================================= */}
      <div className="mb-6 rounded-2xl bg-slate-950 text-slate-200 p-4 font-mono text-xs border border-slate-800 shadow-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2.5">
          <span className="font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <span>🔬</span> Panel de Verificación de Búsqueda (Lógica Activa)
          </span>
          <span className="text-[10px] text-slate-500">Inspección de datos enviados</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
          <div>
            <span className="text-slate-400">1. Frase Completa:</span>{' '}
            <strong className="text-white">"{targetPhrase}"</strong>
          </div>
          <div>
            <span className="text-slate-400">2. Estructura Base:</span>{' '}
            <strong className="text-emerald-400">"{coreStructure || '(Auto-extraída)'}"</strong>
          </div>
          <div>
            <span className="text-slate-400">3. Complemento Final:</span>{' '}
            <strong className="text-indigo-400">"{targetComplement || '(Sin complemento)'}"</strong>
          </div>
          <div>
            <span className="text-slate-400">4. Estado de Búsqueda:</span>{' '}
            <strong className={isSearchingVideo ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}>
              {isSearchingVideo ? 'Buscando en YouTube...' : (activeVideo?.matchType ?? 'Finalizada')}
            </strong>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-900 text-[10px] text-slate-400 truncate">
          <span className="text-slate-500">Colocaciones probadas:</span> {collocations.join(' | ')}
        </div>
      </div>

      {/* Técnica 1: Acción / Mini-Historia */}
      <div className="mb-5 bg-white rounded-2xl p-5 border border-indigo-100 shadow-sm">
        <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1.5">
          {layer2.primaryTechnique.title}
        </h4>
        <p className="text-sm md:text-base text-slate-700 leading-relaxed">
          {layer2.primaryTechnique.content}
        </p>
      </div>

      {/* Técnica 2: Situación Opuesta Real */}
      <div className="mb-5 bg-white rounded-2xl p-5 border border-amber-100 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
            {layer2.secondaryTechnique.title}:
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 font-mono font-bold">
            Antónimo: {layer2.secondaryTechnique.oppositeWord}
          </span>
        </div>
        <ul className="space-y-1.5">
          {layer2.secondaryTechnique.contrastPhrases.map((phrase, idx) => (
            <li key={idx} className="text-sm md:text-base text-slate-800 flex items-start gap-2">
              <span className="text-amber-500 font-bold">•</span>
              <span>"{phrase}"</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ======================================================== */}
      {/* REPRODUCTOR DE VIDEO A PANTALLA COMPLETA                */}
      {/* ======================================================== */}
      {isSearchingVideo && !activeVideo ? (
        <div className="mt-5 p-8 rounded-2xl bg-slate-900 text-white text-center animate-pulse border border-slate-800">
          <div className="inline-block h-8 w-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm font-bold uppercase tracking-widest text-indigo-400">
            Escaneando YouTube en vivo...
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Probando frase exacta, colocaciones de sustitución y estructura básica.
          </p>
        </div>
      ) : activeVideo ? (
        <div className="w-full">
          {/* Alertas Didácticas */}
          {activeVideo.matchType === 'exact_full' && (
            <div className="mb-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <span>✔</span>
              <span>Frase exacta completa localizada en el audio del orador nativo.</span>
            </div>
          )}

          {activeVideo.matchType === 'collocation_match' && (
            <div className="mb-3 p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 flex items-start gap-2.5 shadow-sm">
              <span className="text-base leading-none mt-0.5">ℹ️</span>
              <div>
                <p className="text-xs font-bold">
                  No se encontró la frase exacta, pero se ha encontrado una frase similar:
                </p>
                <p className="text-sm md:text-base font-extrabold text-blue-700 mt-0.5 font-mono">
                  "{activeVideo.matchedPhrase}"
                </p>
              </div>
            </div>
          )}

          {activeVideo.matchType === 'core_structure_only' && (
            <div className="mb-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5 shadow-sm">
              <span className="text-base leading-none mt-0.5">🎯</span>
              <div>
                <p className="text-xs font-bold">
                  Estructura base encontrada en audio real:
                </p>
                <p className="text-sm md:text-base font-extrabold text-amber-700 mt-0.5 font-mono">
                  "{activeVideo.matchedPhrase}"
                </p>
              </div>
            </div>
          )}

          {/* El Reproductor ocupando el ancho total */}
          <YouTubeEmbed
            videoContext={{
              videoId: activeVideo.videoId!,
              startSeconds: activeVideo.startSeconds ?? 0,
              targetPhrase: activeVideo.matchedPhrase || targetPhrase,
              fullSpokenText: activeVideo.fullSpokenText,
              highlightPhrase: activeVideo.highlightPhrase,
              contextNote: activeVideo.matchedPhrase ? `Orador pronunciando: "${activeVideo.matchedPhrase}"` : undefined,
            }}
            query={activeVideo.matchedPhrase || targetPhrase}
          />
        </div>
      ) : (
        <div className="mt-5 p-8 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-center">
          <span className="text-3xl mb-2 block">⚠️</span>
          <p className="font-bold text-base">
            No se encontró ninguna coincidencia en video para esta frase ni para sus colocaciones.
          </p>
        </div>
      )}
    </div>
  );
};