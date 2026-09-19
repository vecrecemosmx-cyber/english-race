// Pieza 1 de 2: ENDPOINT PARA SEMBRAR DATOS INICIALES VECTORIALES EN SUPABASE
// Guardar exactamente en: src/app/api/seed-data/route.js (Longitud segura)

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Función utilitaria para emular la dimensión vectorial exacta (384 posiciones)
// requerida por pgvector para la frase de ejemplo.
function generarEmbeddingFijoEjemplo() {
  const vector = new Array(384).fill(0).map((_, i) => {
    // Generamos coeficientes normalizados para simular la semántica de "metas/sueños/viajes"
    return Math.cos(i * 0.15) * 0.03;
  });
  return vector;
}

export async function GET() {
  try {
    // 1. INYECTAR LA PALABRA CLAVE EN 'words_master'
    // Primero verificamos si la palabra 'pursue' ya existe para evitar duplicados
    const { data: palabraExistente } = await supabase
      .from('words_master')
      .select('id')
      .eq('lexical_form', 'pursue')
      .single();

    let wordId = palabraExistente?.id;

    if (!wordId) {
      const { data: nuevaPalabra, error: errorPalabra } = await supabase
        .from('words_master')
        .insert({
          language_iso: 'en-US',
          lexical_form: 'pursue',
          cefr_level: 'B2',
          ipa_transcription: '/pərˈsuː/'
        })
        .select()
        .single();

      if (errorPalabra) throw errorPalabra;
      wordId = nuevaPalabra.id;
    }

    // 2. INYECTAR EL RECURSO DE ANDAMIAJE EN 'word_scaffolding'
    const { error: errorAndamiaje } = await supabase
      .from('word_scaffolding')
      .upsert({
        word_id: wordId,
        tecnica_principal: 'historia',
        cefr_definition: 'To try to get something over a long time.',
        colocaciones_json: JSON.stringify(["pursue a dream", "pursue a goal", "pursue a career"]),
        mini_historia: "You want to be a doctor. You study for 7 years. You do not stop. You pursue your dream.",
        antonimo_texto: "I am staying in my hometown forever and quitting my dreams.",
        antonimo_ipa: "/aɪ æm ˈsteɪɪŋ ɪn maɪ ˈhoʊmtaʊn fərˈɛvər ænd ˈkwɪtɪŋ maɪ driːmz/",
        antonimo_youtube_id: "dQw4w9WgXcQ",
        antonimo_start_time: 40.00,
        antonimo_end_time: 45.00
      }, { onConflict: 'word_id' });

    if (errorAndamiaje) throw errorAndamiaje;

    // 3. INYECTAR LA FRASE MAESTRA EN 'phrases_master' CON SU EMBEDDING VECTORIAL
    const embeddingFrase = generarEmbeddingFijoEjemplo();
    
    const { data: nuevaFrase, error: errorFrase } = await supabase
      .from('phrases_master')
      .insert({
        language_iso: 'en-US',
        english_text: "I am planning to move to New York soon to pursue my career goals.",
        ipa_text: "/aɪ æm ˈplænɪŋ tuː muːv tuː njuː jɔːrk suːn tuː pərˈsuː maɪ kəˈrɪr ɡoʊlz/",
        youtube_id: "7OMThS-S8iI",
        start_time: 25.00,
        end_time: 30.00,
        semantic_embedding: embeddingFrase // 🫵 Aquí se inyecta la matriz vectorial nativa
      })
      .select()
      .single();

    if (errorFrase) throw errorFrase;

    // 4. VINCULAR LA RELACIÓN MEDIANTE TOKENS EN 'phrase_tokens'
    const { error: errorToken } = await supabase
      .from('phrase_tokens')
      .insert({
        phrase_id: nuevaFrase.id,
        word_id: wordId,
        position_index: 10, // Posición aproximada de la palabra 'pursue' en la frase
        token_text: "pursue"
      });

    if (errorToken) throw errorToken;

    // 5. INYECTAR LA TRADUCCIÓN POLIMÓRFICA EN 'lexicon_translations'
    const { error: errorTraduccion } = await supabase
      .from('lexicon_translations')
      .insert({
        phrase_id: nuevaFrase.id,
        target_language_iso: 'es-MX',
        significado_completo: "Planeo mudarme a Nueva York pronto para perseguir mis metas profesionales.",
        explicacion_uso: "Se usa para expresar metas estructuradas en desarrollo. 'Move to' es el estándar casual nativo americano."
      });

    if (errorTraduccion) throw errorTraduccion;

    return NextResponse.json({ 
      exito: true, 
      mensaje: "Semilla inyectada con éxito en Supabase Cluster",
      datos_mapeados: { word_id: wordId, phrase_id: nuevaFrase.id }
    });

  } catch (error) {
    console.error("Error en la siembra de datos:", error);
    return NextResponse.json({ error: "Fallo al poblar las tablas maestros vectoriales", detalles: error.message }, { status: 500 });
  }
}
