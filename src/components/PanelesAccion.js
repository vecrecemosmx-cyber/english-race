// Pieza 4 de 5: PANELES INTERACTIVOS DE ACCIÓN Y ANDAMIAJE PROGRESIVO
// Guarda en: src/components/PanelesAccion.js (Longitud segura < 4,000 caracteres)

import React from 'react';
import { IconoMicrofono } from './ui/Iconos';

export function PanelSemaforo({ onSeleccionar }) {
  return (
    <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl flex flex-col gap-4 shadow-xl">
      <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500 text-center block">¿Cómo evalúas tu entendimiento de la frase?</span>
      <div className="grid grid-cols-1 gap-3">
        <button
          onClick={() => onSeleccionar('rojo')}
          className="py-4 px-4 bg-red-950/40 hover:bg-red-950/60 border border-red-900/60 rounded-2xl text-xs font-black uppercase tracking-wider text-red-400 text-center transition-all active:scale-[0.98]"
        >
          🔴 No entiendo la frase.
        </button>
        <button
          onClick={() => onSeleccionar('amarillo')}
          className="py-4 px-4 bg-amber-950/40 hover:bg-amber-950/60 border border-amber-900/60 rounded-2xl text-xs font-black uppercase tracking-wider text-amber-400 text-center transition-all active:scale-[0.98]"
        >
          🟡 Entiendo algo de la frase pero no completamente.
        </button>
        <button
          onClick={() => onSeleccionar('verde')}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-emerald-500/10 transition-all active:scale-[0.98]"
        >
          🟢 La entiendo perfectamente al 100%
        </button>
      </div>
    </div>
  );
}

export function PanelAndamiaje({ 
  frase, capa, setCapa, setReproduciendo, setEstado, auxilio, setAuxilio 
}) {
  return (
    <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl flex flex-col gap-5 shadow-xl">
      {capa === 'nucleo' && (
        <div className="flex flex-col gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <span className="text-[10px] font-black uppercase text-sky-400 tracking-wider block mb-1">CEFR Control (A1 Definition)</span>
            <p className="text-sm font-bold text-slate-200 leading-relaxed">
              Meaning of <span className="text-red-400">"{frase.palabra_clave}"</span>: {frase.cefr_control}
            </p>
          </div>
          {/* REEMPLAZA EL CONTENEDOR DE COLOCACIONES DENTRO DE PanelesAccion.js POR ESTE BLOCK BLINDADO */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <span className="text-[10px] font-black uppercase text-sky-400 tracking-wider block mb-1">Pragmatic Collocations</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {/* Usamos el operador ?. y un array vacío de respaldo para evitar crasheos si Supabase cambia el nombre del campo */}
              {(frase?.colocaciones || frase?.colocaciones_json || []).map((col, idx) => (
                <code key={idx} className="text-xs bg-slate-950 border border-slate-800 text-slate-300 font-mono font-bold px-2 py-1 rounded-xl">
                  {col}
                </code>
              ))}
              {!(frase?.colocaciones || frase?.colocaciones_json) && (
                <span className="text-xs font-semibold text-slate-600 italic">No collocations loaded for this block.</span>
              )}
            </div>
          </div>
        </div>
      )}

      {capa === 'tecnica1' && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[10px] font-black uppercase text-sky-400 tracking-wider block mb-1">Cause & Effect Mini-Story</span>
          <p className="text-sm font-semibold text-slate-300 leading-relaxed italic">"{frase.tecnica_1_contenido}"</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2 border-t border-slate-800/60 pt-4">
        <button onClick={() => setCapa('nucleo')} className={`text-xs font-bold px-3 py-2 rounded-xl border transition-all ${capa === 'nucleo' ? 'bg-sky-950/40 border-sky-500 text-sky-400' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>💡 Core Meaning</button>
        <button onClick={() => { setCapa('tecnica1'); setReproduciendo(false); }} className={`text-xs font-bold px-3 py-2 rounded-xl border transition-all ${capa === 'tecnica1' && !auxilio ? 'bg-sky-950/40 border-sky-500 text-sky-400' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>{frase.tecnica_1_label}</button>
        <button onClick={() => { setCapa('tecnica2'); setReproduciendo(true); }} className={`text-xs font-bold px-3 py-2 rounded-xl border transition-all ${capa === 'tecnica2' ? 'bg-sky-950/40 border-sky-500 text-sky-400' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>{frase.tecnica_2_label}</button>
      </div>

      <div className="border-t border-slate-800/60 pt-4 mt-2 flex flex-col gap-3">
        <span className="text-xs font-extrabold text-slate-400 text-center block">¿Estas herramientas en inglés te aclararon el significado?</span>
        <div className="flex gap-3">
          <button onClick={() => { setEstado('verde'); setReproduciendo(false); setCapa('nucleo'); }} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md">🟢 Sí, volver al video original</button>
          <button onClick={() => setAuxilio(true)} className="py-3 px-4 bg-slate-900 border border-slate-800 text-slate-400 font-bold text-xs uppercase rounded-xl">翻譯 Necesito traducción</button>
        </div>
      </div>

      {auxilio && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col gap-2 mt-2 border-dashed">
          <p className="text-xs font-bold text-slate-400"><strong className="text-slate-200">Traducción:</strong> {frase.significado_es}</p>
          <p className="text-xs text-slate-500 font-medium"><strong className="text-slate-400">Uso Real:</strong> {frase.explicacion_pragmatica}</p>
        </div>
      )}
    </div>
  );
}
