'use client';

import React from 'react';
import { Layer2Data } from '@/types';
import { YouTubeEmbed } from './YouTubeEmbed';

interface Layer2AdaptiveProps {
  layer2: Layer2Data;
  onClose: () => void;
}

export const Layer2Adaptive: React.FC<Layer2AdaptiveProps> = ({ layer2, onClose }) => {
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

      {/* Técnica 1: Acción / Mini-Historia Sensorial */}
      <div className="mb-5 bg-white rounded-xl p-4 border border-indigo-100 shadow-sm">
        <h4 className="text-xs font-bold uppercase tracking-wide text-indigo-600 mb-1">
          {layer2.primaryTechnique.title}
        </h4>
        <p className="text-sm text-slate-700 leading-relaxed">
          {layer2.primaryTechnique.content}
        </p>
      </div>

      {/* Técnica 2: Detonador de Situación Opuesta (Polaridad Real) */}
      <div className="mb-5 bg-white rounded-xl p-4 border border-amber-100 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold uppercase tracking-wide text-amber-700">
            {layer2.secondaryTechnique.title}:
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-mono">
            Antonym: {layer2.secondaryTechnique.oppositeWord}
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-2">
          Understanding the real opposite situation anchors the true meaning:
        </p>
        <ul className="space-y-1.5">
          {layer2.secondaryTechnique.contrastPhrases.map((phrase, idx) => (
            <li key={idx} className="text-sm text-slate-800 flex items-start gap-2">
              <span className="text-amber-500 font-bold">•</span>
              <span>"{phrase}"</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Video Contextual YouGlish / YouTube */}
      <YouTubeEmbed 
        videoId={layer2.youtubeVideoId} 
        query={layer2.youtubeContextQuery} 
      />
    </div>
  );
};