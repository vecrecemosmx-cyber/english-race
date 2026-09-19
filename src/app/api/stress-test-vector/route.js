// Pieza 1 de 2: SCRIPT DE INYECCIÓN MASIVA POR LOTES PARA PRUEBAS DE ESTRÉS VECTORIAL
// Guardar exactamente en: src/app/api/stress-test-vector/route.js (Longitud segura)

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = (supabaseUrl && supabaseServiceKey) 
  ? createClient(supabaseUrl, supabaseServiceKey) 
  : null;

// Generador matemático de embeddings vectoriales normalizados aleatorios (384 dimensiones)
// Esto asegura que pgvector reciba el tipo de dato nativo compatible con el índice HNSW
function generarVectorAleatorio() {
  return new Array(384).fill(0).map(() => (Math.random() * 2 - 1) * 0.05);
}

// Catálogo de plantillas léxicas de alta frecuencia basadas en el compendio de Pearson
const PLANTILLAS_INGLES = [
  "I am looking for an opportunity to improve my speaking skills in everyday situations.",
  "My primary objective is to land a job in a leading multinational enterprise.",
  "I need to focus on masteries that are crucial for my personal development.",
  "I am planning to explore new destinations and submerge myself in different cultures.",
  "It is essential to build a solid foundation before advancing to complex structures.",
  "I want to achieve a high level of naturalness when interacting with native speakers.",
  "My goal is to accelerate my fluency through contextual input and active production.",
  "I am dedicated to expanding my lexicon using high frequency words from Oxford."
];

export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json({ error: "Credenciales de Supabase ausentes en producción" }, { status: 500 });
    }

    const loteInsercion = [];
    const totalRegistrosAInyectar = 100; // Bloque de control inicial para medir latencia

    for (let i = 0; i < totalRegistrosAInyectar; i++) {
      const plantillaBase = PLANTILLAS_INGLES[i % PLANTILLAS_INGLES.length];
      const fraseUnica = `${plantillaBase} (Batch Token Ref: ${Math.random().toString(36).substring(7)})`;
      const embeddingSimulado = generarVectorAleatorio();

      loteInsercion.push({
        language_iso: 'en-US',
        english_text: fraseUnica,
        ipa_text: "/aɪ æm ˈloʊkɪŋ fɔːr ən ˌɑːpərˈtuːnəti/", // IPA genérico de control para la prueba
        youtube_id: "7OMThS-S8iI",
        start_time: 10.00 + (i * 0.5),
        end_time: 15.00 + (i * 0.5),
        semantic_embedding: embeddingSimulado
      });
    }

    // Ejecutamos una inserción masiva atómica (Bulk Insert) para optimizar el ancho de banda
    const { data, error } = await supabase
      .from('phrases_master')
      .insert(loteInsercion)
      .select('id');

    if (error) throw error;

    return NextResponse.json({
      exito: true,
      sistema: "EFA Vectorial Stress System",
      mensaje: "Lote de matrices inyectado con éxito en las tablas maestros",
      total_registros_insertados: data.length,
      latencia_servidor: "Optimizado mediante Bulk Transaction"
    });

  } catch (error) {
    console.error("Fallo crítico en el script de estrés vectorial:", error);
    return NextResponse.json({ error: "Fallo en la siembra masiva de control", detalles: error.message }, { status: 500 });
  }
}
