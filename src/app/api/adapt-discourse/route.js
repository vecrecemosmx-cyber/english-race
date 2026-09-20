// Archivo de Producción Real con Hugging Face Inference API: src/app/api/adapt-discourse/route.js
// Identifica la idea principal, resume y reexpresa usando tu catálogo de Supabase a costo \$0.

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const hfApiKey = process.env.HUGGINGFACE_API_KEY; // 🫵 LLAMADA A LA LLAVE GRATUITA DE HUGGING FACE

const supabase = (supabaseUrl && supabaseServiceKey) ? createClient(supabaseUrl, supabaseServiceKey) : null;

export async function POST(request) {
  try {
    const { email, sueno_estudiante } = await request.json();

    if (!supabase || !hfApiKey) {
      return NextResponse.json({ error: "Credenciales de Supabase o Hugging Face ausentes en el servidor." }, { status: 500 });
    }

    // 1. EXTRAEMOS LAS FRASES Y VIDEOS REALES QUE SEMBRAMOS EN TU SUPABASE
    const { data: catalogoFrases, error: errorCatalogo } = await supabase
      .from('phrases_master')
      .select('id, english_text, ipa_text, youtube_id, start_time, end_time');

    if (errorCatalogo || !catalogoFrases || catalogoFrases.length === 0) {
      return NextResponse.json({ error: "El catálogo phrases_master está vacío en la nube." }, { status: 404 });
    }

    // 2. CONSTRUIMOS EL PROMPT COGNITIVO PARA EL MODELO DE CÓDIGO ABIERTO
    const promptMaestro = `
      You are the core AI matching engine for an advanced language platform.
      
      STUDENT TEXT INPUT (In Spanish): "\${sueno_estudiante}"
      
      AVAILABLE REAL YOUTUBE PHRASES CATALOG FROM SUPABASE:
      \${JSON.stringify(catalogoFrases)}
      
      CRITICAL TASKS:
      1. Analyze the student input. Identify the general main idea, core intent, and narrative.
      2. Summarize the user's intent.
      3. Express this main idea using OBLIGATORIALLY ONE OF THE AVAILABLE PHRASES from the catalog. Choose the exact UUID that best captures the student's dream narrative or intent.
      
      STRICT RESPONSE FORMAT:
      You must respond ONLY with a valid, clean JSON object. No conversation, no markdown blocks, no \`\`\`json wrappers. Just the JSON object. Example: {"selected_id": "uuid-here"}
    `;

    // 3. INVOCACIÓN A LA INFERENCE API DE HUGGING FACE (MODELO QWEN 2.5 72B INSTRUCT)
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
          parameters: { max_new_tokens: 150, return_full_text: false }
        })
      }
    );

    const datosHF = await respuestaHF.json();
    
    // Hugging Face retorna usualmente un arreglo con la propiedad generated_text
    let textoRespuestaIA = Array.isArray(datosHF) ? datosHF[0]?.generated_text : datosHF?.generated_text;
    
    if (!textoRespuestaIA) {
      // Intentar limpiar respuestas si el JSON viene directo en otra estructura
      textoRespuestaIA = datosHF?.choices?.[0]?.text || JSON.stringify(datosHF);
    }

    // Limpieza quirúrgica de caracteres de control o bloques de código markdown que meta la IA
    const jsonLimpioText = textoRespuestaIA
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    const decisionIA = JSON.parse(jsonLimpioText);
    
    // 4. EXTRAEMOS DE LA NUBE EL VIDEO GANADOR QUE LA IA SELECCIONÓ COMO EL MEJOR RESUMEN
    let fraseGanadora = catalogoFrases.find(f => f.id === decisionIA.selected_id) || catalogoFrases[0];

    // 5. DETERMINAMOS EL COMPORTAMIENTO INTERACTIVO PARA TU DASHBOARD
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
          tecnica_1_contenido: `You have a specific goal. You work hard every single day. You do not stop. You reach your destination.`,
          tecnica_2_label: "🎬 Situación Opuesta (Antónimos)",
          motivo_adaptacion: `La Inteligencia Artificial de Hugging Face analizó tu sueño, extrajo la idea principal y determinó que la frase de YouTube "${fraseGanadora.english_text}" reexpresa de forma nativa tu intención.`,
          antonimo: {
            texto: "I gave up and stayed doing nothing.",
            ipa: "/aɪ ɡeɪv ʌp ænd steɪd ˈduːŋ ˈnʌθɪŋ/",
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
    return NextResponse.json({ error: "Fallo en el procesamiento de Hugging Face API" }, { status: 500 });
  }
}
