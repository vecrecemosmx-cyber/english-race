// Archivo Orquestador Maestro Conectado al Ecosistema de Red: src/app/student/page.js
// Cumple con el límite de 5,500 caracteres del PRD y el blindaje interactivo de Tailwind.

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { IconoFlecha, IconoMicrofono } from '@/components/ui/Iconos';
import { PanelSemaforo, PanelAndamiaje } from '@/components/PanelesAccion';
import { useRecorder } from '@/hooks/useRecorder';

export default function PlataformaInversionEducativa() {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [panelModo, setPanelModo] = useState('practicar'); 
  const [leccionActiva, setLeccionActiva] = useState(null);
  const [sueñoTexto, setSueñoTexto] = useState('');
  const [procesandoProgreso, setProcesandoProgreso] = useState(false);
  
  // 🍿 INICIALIZACIÓN VIVA: Empieza en nulo esperando la respuesta del Motor de IA Vectorial
  const [fraseActual, setFraseActual] = useState(null);
  const [motivoAdaptacion, setMotivoAdaptacion] = useState('');
  
  const [estadoSemaforo, setEstadoSemaforo] = useState(null); 
  const [capaAndamiaje, setCapaAndamiaje] = useState('nucleo'); 
  const [reproduciendoAntonimo, setReproduciendoAntonimo] = useState(false);
  const [auxilioEspañol, setAuxilioEspañol] = useState(false);
  const [velocidadVideo, setVelocidadVideo] = useState(1.0);
  
  const iframeRef = useRef(null);
  const { grabando, audioBlobUrl, iniciarGrabacion, detenerGrabacion, setAudioBlobUrl } = useRecorder();

  // Sincronización pasiva para controlar la velocidad del reproductor de YouTube
  useEffect(() => {
    if (iframeRef.current && fraseActual) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'setPlaybackRate', args: [velocidadVideo] }), '*'
      );
    }
  }, [velocidadVideo, fraseActual, reproduciendoAntonimo]);

  // LLAMADA HTTP POST REAL AL MOTOR DE IA VECTORIAL EN SUPABASE
  const dispararProcesamientoSueño = async (e) => {
    e.preventDefault();
    if (!sueñoTexto.trim()) return;
    
    setProcesandoProgreso(true);
    setFraseActual(null);
    setEstadoSemaforo(null);

    try {
      const respuesta = await fetch('/api/adapt-discourse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: "alumno_mvp@efa.com",
          sueno_estudiante: sueñoTexto
        })
      });

      const datos = await respuesta.json();

      // Busca esto dentro de tu src/app/student/page.js y cámbialo para capturar el elemento 0:
      if (datos.exito && datos.discurso_personalizado?.linea_tiempo_frases?.length > 0) {
        const fraseExtraida = datos.discurso_personalizado.linea_tiempo_frases[0]; // 🫵 SE AGREGA EL [0] AQUÍ
        setFraseActual(fraseExtraida);
        setMotivoAdaptacion(fraseExtraida.motivo_adaptacion);
      } else {
        alert("⚠️ El motor vectorial no encontró coincidencias óptimas en este lote.");
      }
    } catch (err) {
      console.error("Fallo de red al conectar con el Motor de IA:", err);
      alert("❌ Error de comunicación con el clúster de Supabase.");
    } finally {
      setProcesandoProgreso(false);
    }
  };

  const idVideoActivo = reproduciendoAntonimo ? fraseActual?.antonimo?.youtube_id : fraseActual?.youtube_id;
  const tiempoInicioActivo = reproduciendoAntonimo ? fraseActual?.antonimo?.start_time : fraseActual?.start_time;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex overflow-hidden">
      
      {/* MENÚ RETRÁCTIL */}
      <aside className={`bg-slate-950 border-r border-slate-800 flex flex-col justify-between transition-all duration-300 ${sidebarVisible ? 'w-64 p-5' : 'w-0 p-0 overflow-hidden border-r-0'}`}>
        <div className="flex flex-col gap-6">
          <span className="font-black text-lg tracking-wider text-sky-500">EFA GLOBAL</span>
          <nav className="flex flex-col gap-2">
            <button onClick={() => setPanelModo('split')} className="w-full text-left py-3 px-4 rounded-xl font-bold text-sm bg-slate-900 border border-slate-800 hover:bg-slate-800">📖 Lecciones</button>
            <button onClick={() => { setPanelModo('practicar'); }} className="w-full text-left py-3 px-4 rounded-xl font-bold text-sm bg-sky-600 text-white font-black shadow-lg">🎯 Practicar</button>
          </nav>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="bg-slate-950 border-b border-slate-800 h-16 flex items-center justify-between px-6">
          <button onClick={() => setSidebarVisible(!sidebarVisible)} className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400"><IconoFlecha direccion={sidebarVisible ? 'izq' : 'der'} /></button>
          <div className="text-xs font-mono font-bold text-sky-400 bg-sky-950 px-3 py-1.5 rounded-full border border-sky-900 tracking-wider">Modo Inmersión Conectado</div>
        </header>

{/*// Pieza 2 de 2: MAQUETACIÓN DEL DASHBOARD DE INMERSIÓN DINÁMICA CON CONEXIÓN EN RED
// Guarda en: src/app/student/page.js (Longitud segura menor que 4,000 caracteres)*/}

        <div className="flex-1 flex overflow-hidden">
          {/* PANEL IZQUIERDO: LECCIONES CONCEPTUALES (SOLO EN VISTA SPLIT) */}
          {panelModo === 'split' && (
            <div className="w-1/2 bg-slate-950 border-r border-slate-800 p-6 overflow-y-auto flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <span className="text-xs font-extrabold uppercase bg-sky-950 text-sky-400 px-2.5 py-1 rounded border border-sky-800">Módulo 1</span>
                <button onClick={() => setPanelModo('practicar')} className="text-xs font-black uppercase text-slate-500">[✕ Cerrar]</button>
              </div>
              <h2 className="text-xl font-black text-slate-100">Chunks de Fluidez Instantánea</h2>
              <p className="text-sm text-slate-400 leading-relaxed bg-slate-900/50 p-4 rounded-2xl border border-slate-800/40">
                Los nativos americanos hablan en bloques de palabras. Memorizar estructuras integrales elimina la necesidad de procesar reglas gramaticales frías de forma mecánica.
              </p>
            </div>
          )}

          {/* PANEL DERECHO: INTERFAZ ADAPTATIVA DE YOUTUBE */}
          <div className={`${panelModo === 'split' ? 'w-1/2' : 'w-full'} flex flex-col overflow-y-auto p-6 gap-6 transition-all duration-300`}>
            
            {/* TEXTAREA COLECTORA DE SUEÑOS (DISPARADOR DEL MOTOR DE IA VECTORIAL) */}
            <form onSubmit={dispararProcesamientoSueño} className="bg-slate-950 border border-slate-800 p-6 rounded-3xl flex flex-col gap-4 shadow-xl">
              <h3 className="text-base font-black text-slate-100">Introduce tu Sueño, Meta o Actividad Favorita</h3>
              <textarea 
                value={sueñoTexto} 
                onChange={(e) => setSueñoTexto(e.target.value)} 
                placeholder="Ej. Quiero viajar a Nueva York y trabajar en una empresa de tecnología..." 
                className="w-full h-20 bg-slate-900 border border-slate-800 rounded-2xl p-4 text-sm font-semibold text-slate-200 resize-none focus:outline-none focus:border-sky-500" 
              />
              <button type="submit" disabled={procesandoProgreso} className="w-full py-3.5 bg-sky-600 hover:bg-sky-500 font-black text-sm uppercase rounded-xl shadow-lg transition-all">
                {procesandoProgreso ? "🧠 Consultando Matrices Vectoriales..." : "🚀 Iniciar Ruta Personalizada"}
              </button>
            </form>

            {/* AVISO PEDAGÓGICO DE ADAPTACIÓN DISCURSIVA */}
            {fraseActual && motivoAdaptacion && (
              <div className="bg-sky-950/40 border border-sky-900/60 p-4 rounded-2xl animate-fade-in">
                <p className="text-xs font-bold text-sky-300 leading-relaxed"><strong className="text-white">Andamiaje de Identidad:</strong> {motivoAdaptacion}</p>
              </div>
            )}

            {/* EL REPRODUCTOR DE INMERSIÓN VIVO (SÓLO APARECE SI SUPABASE DEVUELVE EL REGISTRO) */}
            {fraseActual && (
              <div className="flex flex-col gap-6 animate-fade-in">
                <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 flex flex-col gap-4 shadow-xl">
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black">
                    {idVideoActivo && (
                      <iframe ref={iframeRef} className="w-full h-full border-0" src={`https://youtube.com{idVideoActivo}?enablejsapi=1&autoplay=1&controls=1&rel=0&start=${tiempoInicioActivo}`} allow="autoplay; encrypted-media" allowFullScreen />
                    )}
                  </div>
                  <div className="flex items-center gap-3 justify-end bg-slate-900 p-3 rounded-2xl border border-slate-800/60">
                    <input type="range" min="0.75" max="1.25" step="0.25" value={velocidadVideo} onChange={(e) => setVelocidadVideo(parseFloat(e.target.value))} className="w-24 accent-sky-500 h-1.5 rounded-lg cursor-pointer" />
                    <span className="text-xs font-mono font-black text-sky-400">{velocidadVideo.toFixed(2)}x</span>
                  </div>
                  <div className="py-2 border-t border-slate-800/80 mt-2 text-center">
                    <p className="text-lg sm:text-xl font-black text-slate-100">{fraseActual.english_text}</p>
                    <p className="font-mono text-[11px] font-bold text-slate-500 mt-2">{fraseActual.ipa_text}</p>
                  </div>
                </div>

                {!estadoSemaforo && <PanelSemaforo onSeleccionar={setEstadoSemaforo} />}
                
                {estadoSemaforo === 'rojo' && (
                  <PanelAndamiaje frase={fraseActual} capa={capaAndamiaje} setCapa={setCapaAndamiaje} setReproduciendo={setReproduciendoAntonimo} setEstado={setEstadoSemaforo} auxilio={auxilioEspañol} setAuxilio={setAuxilioEspañol} />
                )}

                {estadoSemaforo === 'verde' && (
                  <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl flex flex-col gap-4 shadow-xl">
                    <h4 className="text-sm font-black text-slate-100 uppercase">🎙️ Clonación de Pronunciación Activa</h4>
                    <div className="flex items-center gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800/60">
                      <button onClick={grabando ? detenerGrabacion : iniciarGrabacion} className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all ${grabando ? 'bg-red-600 border-red-500 text-white animate-pulse' : 'bg-slate-950 border-slate-800 text-slate-400'}`}><IconoMicrofono /></button>
                      <div className="flex-1 flex flex-col gap-1.5">
                        <span className="text-[10px] font-black uppercase text-slate-500">{grabando ? "🔴 Grabando..." : audioBlobUrl ? "✨ Audio listo" : "Esperando..."}</span>
                        {audioBlobUrl && <audio src={audioBlobUrl} controls className="h-8 accent-sky-500" />}
                      </div>
                    </div>
                    <button onClick={() => { setFraseActual(null); setSueñoTexto(''); setEstadoSemaforo(null); setAudioBlobUrl(null); }} className="w-full py-4 bg-sky-600 font-black text-xs uppercase rounded-xl shadow-md">Siguiente Frase Reto ➔</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
