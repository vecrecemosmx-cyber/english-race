import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Cliente Supabase seguro para el servidor (latencia mínima)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Extrae de 1 a 2 palabras clave significativas de cualquier complemento
function extractKeywords(text: string, count: number = 2): string {
  if (!text) return '';
  const cleanWords = text
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, '')
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 1); // descarta letras sueltas
  
  return cleanWords.slice(0, count).join(' ');
}

// Consulta hiperveloz a la tabla video_transcripts de Supabase
async function queryTranscriptInDB(searchString: string) {
  if (!searchString || searchString.trim().length < 2) return null;

  const { data, error } = await supabase
    .from('video_transcripts')
    .select('id, video_id, start_time, duration, text')
    .ilike('text', `%${searchString}%`)
    .limit(1)
    .single();

  if (error || !data) return null;

  return {
    videoId: data.video_id,
    startSeconds: Math.max(0, Math.floor(data.start_time || 0)),
    fullSpokenText: data.text,
  };
}

export async function POST(req: Request) {
  try {
    const { phrase, coreStructure, collocations } = await req.json();

    if (!phrase || typeof phrase !== 'string') {
      return NextResponse.json({ error: 'La frase es requerida' }, { status: 400 });
    }

    const cleanCore = (coreStructure || phrase.split(' ').slice(0, 3).join(' ')).trim();
    
    // Obtenemos el complemento restante de la frase original
    let complement = '';
    if (phrase.toLowerCase().startsWith(cleanCore.toLowerCase())) {
      complement = phrase.slice(cleanCore.length).trim();
    } else {
      complement = phrase.split(' ').slice(3).join(' ').trim();
    }

    console.log(`\n🔍 Búsqueda de video para frase: "${phrase}"`);
    console.log(`   Núcleo: "${cleanCore}" | Complemento: "${complement}"`);

    // ========================================================================
    // NIVEL 1: CoreStructure + 1 o 2 palabras clave del complemento original
    // ========================================================================
    const complementKeywords = extractKeywords(complement, 2);
    const queryLevel1 = `${cleanCore} ${complementKeywords}`.trim();
    console.log(`[Nivel 1] Buscando en Supabase: "${queryLevel1}"...`);

    const level1Match = await queryTranscriptInDB(queryLevel1);
    if (level1Match) {
      console.log(`✓ [Nivel 1] Encontrado con "${queryLevel1}" en video ${level1Match.videoId} en segundo ${level1Match.startSeconds}`);
      return NextResponse.json({
        found: true,
        matchType: 'exact_full',
        matchedPhrase: queryLevel1,
        videoId: level1Match.videoId,
        startSeconds: level1Match.startSeconds,
        fullSpokenText: level1Match.fullSpokenText,
        highlightPhrase: queryLevel1,
      });
    }

    // ========================================================================
    // NIVEL 2: CoreStructure + 1 o 2 palabras clave de cada colocación
    // ========================================================================
    if (collocations && Array.isArray(collocations) && collocations.length > 0) {
      console.log(`[Nivel 2] Probando variaciones de colocaciones (${collocations.length})...`);

      for (let i = 0; i < collocations.length; i++) {
        const colloc = collocations[i];
        if (!colloc || typeof colloc !== 'string') continue;

        // Extraer complemento de la colocación
        let colVariation = colloc;
        if (colloc.toLowerCase().startsWith(cleanCore.toLowerCase())) {
          colVariation = colloc.slice(cleanCore.length).trim();
        }

        const colKeywords = extractKeywords(colVariation, 2);
        const queryLevel2 = `${cleanCore} ${colKeywords}`.trim();
        console.log(`  ➔ [Nivel 2.${i + 1}] Buscando variación: "${queryLevel2}"...`);

        const level2Match = await queryTranscriptInDB(queryLevel2);
        if (level2Match) {
          console.log(`✓ [Nivel 2] Encontrado con colocación "${queryLevel2}"`);
          return NextResponse.json({
            found: true,
            matchType: 'collocation_match',
            matchedPhrase: queryLevel2,
            videoId: level2Match.videoId,
            startSeconds: level2Match.startSeconds,
            fullSpokenText: level2Match.fullSpokenText,
            highlightPhrase: queryLevel2,
          });
        }
      }
    }

    // ========================================================================
    // NIVEL 3: Red de seguridad - Coincidencia sólo con el CoreStructure
    // ========================================================================
    if (cleanCore && cleanCore.length > 2) {
      console.log(`[Nivel 3] Buscando sólo el CoreStructure: "${cleanCore}"...`);
      const level3Match = await queryTranscriptInDB(cleanCore);

      if (level3Match) {
        console.log(`✓ [Nivel 3] Encontrado ancla acústica: "${cleanCore}"`);
        return NextResponse.json({
          found: true,
          matchType: 'core_structure_only',
          matchedPhrase: cleanCore,
          videoId: level3Match.videoId,
          startSeconds: level3Match.startSeconds,
          fullSpokenText: level3Match.fullSpokenText,
          highlightPhrase: cleanCore,
        });
      }
    }

    // ========================================================================
    // NIVEL 4: Cero coincidencias
    // ========================================================================
    console.log(`✖ No se encontró ninguna coincidencia en la base de datos.`);
    return NextResponse.json({
      found: false,
      matchType: 'none',
      message: 'No se encontró coincidencia en video para esta frase, colocaciones ni estructura base.',
    });

  } catch (error: any) {
    console.error('Error en /api/video-search:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}