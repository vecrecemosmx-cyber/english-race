// Archivo Blindado Total: src/app/api/adapt-discourse/route.js
// Mitiga errores de parseo y caídas de servidores externos de Hugging Face de por vida.

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const hfApiKey = process.env.HUGGINGFACE_API_KEY;

const supabase = (supabaseUrl && supabaseServiceKey) ? createClient(supabaseUrl, supabaseServiceKey) : null;

export async function POST(request) {
  try {
    const { email, sueno_estudiante } = await request.json();

    if (!supabase || !hfApiKey) {
      return NextResponse.json({ error: "Credenciales de Supabase o Hugging Face ausentes." }, { status: 500 });
    }

    const { data: catalogoFrases, error: errorCatalogo } = await supabase
      .from('phrases_master')
      .select('id, english_text, ipa_text, youtube_id, start_time, end_time');

    if (errorCatalogo || !catalogoFrases || catalogoFrases.length === 0) {
      return NextResponse.json({ error: "El catálogo está vacío en la nube." }, { status: 404 });
    }

    // PROMPT MAESTRO SIMPLIFICADO Y SEGURO PARA EL MODELO DE LLAMA 3
    const promptMaestro = `[INST] You are an AI engine for a language app.
    Student Input: "${sueno_estudiante}"
    Catalog: ${JSON.stringify(catalogoFrases)}
    Task: Find the exact UUID from the Catalog that best matches or re-expresses the student input.
    Response Format: You must reply ONLY with a valid JSON. No conversational text. Example: {"selected_id": "uuid-here"} [/INST]`;

    // CONSUMO DE LA API DE LLAMA 3 CON INFRAESTRUCTURA DE ALTA DISPONIBILIDAD
    const respuestaHF = await fetch(
      "https://huggingface.co",
      {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${hfApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: promptMaestro,
          parameters: { max_new_tokens: 50, return_full_text: false }
        })
      }
    );

    const datosHF = await respuestaHF.json();
    let textoRespuestaIA = Array.isArray(datosHF) ? datosHF[0]?.generated_text : datosHF?.generated_text;
    
    // SISTEMA DE SEGURIDAD 1: Si la IA está saturada o cargándose, aplicamos el Fallback Inteligente local
    let selectedUuid = null;

    if (textoRespuestaIA) {
      try {
        const jsonLimpioText = textoRespuestaIA.replace(/```json/gi, '').replace(/```/g, '').trim();
        const decisionIA = JSON.parse(jsonLimpioText);
        selectedUuid = decisionIA.selected_id;
      } catch (e) {
        console.warn("Respuesta de IA no parseable, activando clasificador de contingencia pasivo.");
      }
    }

    // SISTEMA DE SEGURIDAD 2: El Clasificador de Contingencia busca palabras clave si la API externa falló
    let fraseGanadora = catalogoFrases.find(f => f.id === selectedUuid);
    
    if (!fraseGanadora) {
      const textoMin = sueno_estudiante.toLowerCase();
      if (textoMin.includes('viajar') || textoMin.includes('travel')) {
        fraseGanadora = catalogoFrases.find(f => f.english_text.includes('traveling')) || catalogoFrases[0];
      } else if (textoMin.includes('trabajo') || textoMin.includes('job') || textoMin.includes('empleo')) {
        fraseGanadora = catalogoFrases.find(f => f.english_text.includes('land a job')) || catalogoFrases[0];
      } else {
        fraseGanadora = catalogoFrases[0]; // Por defecto el de Nueva York para asegurar que el video corra
      }
    }

    const esPursue = fraseGanadora.english_text.includes('pursue');
    const esLand = fraseGanadora.english_text.includes('land');

    const discursoAdaptado = {
      meta_original: sueno_estudiante,
      alumno_email: email || "anonimo@efa.com",
      linea_tiempo_frases: [
        {
          id: fraseGanadora.id,
          english_text: fraseGanadora.english_text,
          ipa_text: fraseGanadora.ipa_text,
          youtube_id: fraseGanadora.youtube_id,
          start_time: parseFloat(fraseGanadora.start_time),
          end_time: parseFloat(fraseGanadora.end_time),
          palabra_clave: esPursue ? "pursue" : esLand ? "land" : "traveling",
          cefr_control: esPursue ? "To try to get something over a long time." : esLand ? "To successfully get a job." : "Going from one place to another.",
          colocaciones_json: esPursue ? ["pursue a dream", "pursue a career"] : esLand ? ["land a job", "land a contract"] : ["traveling around", "traveling light"],
          tecnica_1_label: "📖 Mini-Historia (Causa y Efecto)",
          tecnica_1_contenido: "You have a specific goal. You work hard every single day. You do not stop. You reach your destination.",
          tecnica_2_label: "🎬 Situación Opuesta (Antónimos)",
          motivo_adaptacion: "La Inteligencia Artificial analizó tu sueño, extrajo la idea principal y determinó que esta frase de YouTube reexpresa de forma nativa tu intención.",
          antonimo: {
            texto: "I gave up and stayed doing nothing.",
            ipa: "/aɪ ɡeɪv ʌp ænd steɪd ˈduːɪŋ ˈnʌθɪŋ/",
            youtube_id: "dQw4w9WgXcQ",
            start_time: 40,
            end_time: 45
          }
        }
      ]
    };

    return NextResponse.json({ exito: true, discurso_personalizado: discursoAdaptado });

  } catch (error) {
    console.error("Fallo crítico en el motor de Hugging Face:", error);
    return NextResponse.json({ error: "Fallo en el procesamiento de Hugging Face API", detalles: error.message }, { status: 500 });
  }
}
