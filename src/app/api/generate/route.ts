import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Modelos en orden jerárquico de respaldo (100% gratuitos)
const FALLBACK_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.7-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
];

// Cliente Supabase en servidor
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Función auxiliar para extraer palabras clave de la pasión del alumno
function extractSearchKeywords(input: string): string[] {
  return input
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, '')
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(w => w.length > 3);
}

// Cosechador de 250 a 280 palabras continuas de la transcripción
async function getContiguousTranscriptSegment(passionText: string) {
  const keywords = extractSearchKeywords(passionText);
  let anchorCue: any = null;

  // 1. Buscar una coincidencia temática con las palabras de la pasión
  for (const word of keywords) {
    const { data } = await supabase
      .from('video_transcripts')
      .select('id, video_id, start_time, duration, text')
      .ilike('text', `%${word}%`)
      .limit(1)
      .single();

    if (data) {
      anchorCue = data;
      break;
    }
  }

  // Si no hay coincidencia directa, tomar el primer registro disponible como ancla
  if (!anchorCue) {
    const { data } = await supabase
      .from('video_transcripts')
      .select('id, video_id, start_time, duration, text')
      .order('start_time', { ascending: true })
      .limit(1)
      .single();
    anchorCue = data;
  }

  if (!anchorCue) {
    return null;
  }

  // 2. Extraer fragmentos cronológicos consecutivos a partir del ancla
  const { data: subsequentCues } = await supabase
    .from('video_transcripts')
    .select('id, video_id, start_time, duration, text')
    .eq('video_id', anchorCue.video_id)
    .gte('start_time', anchorCue.start_time)
    .order('start_time', { ascending: true })
    .limit(80);

  if (!subsequentCues || subsequentCues.length === 0) {
    return null;
  }

  // 3. Acumular texto hasta alcanzar el rango de 250 a 280 palabras
  let accumulatedWords: string[] = [];
  let startSeconds = Math.max(0, Math.floor(subsequentCues[0].start_time || 0));
  let endSeconds = startSeconds;

  for (const cue of subsequentCues) {
    const wordsInCue = (cue.text || '').trim().split(/\s+/).filter(Boolean);
    accumulatedWords.push(...wordsInCue);
    endSeconds = Math.floor((cue.start_time || 0) + (cue.duration || 0));

    if (accumulatedWords.length >= 250) {
      // Si nos pasamos de 280, recortamos al límite superior exacto
      if (accumulatedWords.length > 280) {
        accumulatedWords = accumulatedWords.slice(0, 275);
      }
      break;
    }
  }

  return {
    videoId: anchorCue.video_id,
    startSeconds,
    endSeconds,
    wordCount: accumulatedWords.length,
    rawTranscriptText: accumulatedWords.join(' '),
  };
}

export async function POST(req: Request) {
  try {
    const { text, summaryType } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'El texto de meta/pasión es requerido' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Falta la variable GEMINI_API_KEY en las variables de entorno' },
        { status: 500 }
      );
    }

    // 1. Obtener el segmento real de 250-280 palabras de YouTube/Supabase
    console.log(`\n========================================`);
    console.log(`🎯 Buscando video para la pasión: "${text}"`);
    const transcriptSegment = await getContiguousTranscriptSegment(text);

    const sourceContextText = transcriptSegment?.rawTranscriptText 
      ? `TRANSCRIPCIÓN REAL DE VIDEO (250-280 PALABRAS):\n"${transcriptSegment.rawTranscriptText}"`
      : `TEXTO BASE DEL ESTUDIANTE:\n"${text}"`;

    console.log(`✓ Segmento extraído: ${transcriptSegment?.wordCount || 0} palabras del video ${transcriptSegment?.videoId || 'N/A'}`);

    // 2. Prompt con el Filtro Lingüístico Estricto (Sin tecnicismos, sin jerga, sin metáforas)
    const systemPrompt = `
You are an expert American English pedagogue and linguist specialized in teaching native Spanish speakers.
The student has shared their dreams/passions: "${text}".
Here is the authentic spoken audio segment from a related native YouTube video (${transcriptSegment?.wordCount || 260} words):
${sourceContextText}

PEDAGOGICAL & LINGUISTIC RULES (MANDATORY):
1. PLAIN ENGLISH FILTER:
   - Rewrite and summarize what was heard in the video segment using STRICTLY simple, clear, everyday General American English.
   - ABSOLUTELY NO technical jargon or domain-specific complexity.
   - ABSOLUTELY NO slang, confusing colloquialisms, or abstract concepts.
   - ABSOLUTELY NO metaphors or idioms. The meaning must be 100% transparent and literal.
2. FORMATS:
   - "summaryParagraph": A continuous paragraph of 2-3 sentences summarizing the spoken segment in simple plain English.
   - "sentences": Break down the summary into short, simple action sentences for line-by-line study.
3. FOR EACH SENTENCE in "sentences":
   - "id": "phrase_1", "phrase_2", etc.
   - "text": Complete sentence in simple American English.
   - "coreStructure": The anchor lexical frame / fixed [Subject + Verb/Action] base (e.g. "I want to build", "You need to learn").
   - "targetComplement": The specific ending slot of the sentence (e.g. "good projects", "new tools").
   - "ipa": Accurate General American phonetics in IPA format (e.g. "/aɪ wɑːnt tuː bɪld gʊd ˈprɑːdʒɛkts/").
   - "cefrDefinition": Simplified explanation in English ONLY using exclusively basic A1-A2 vocabulary (no Spanish).
   - "collocations": Exactly 5 substitution pattern frames keeping the [Subject + Verb] base intact and varying only the ending with simple everyday words.
   - "layer2":
     - "keyword": core verb or adjective.
     - "partOfSpeech": "verb", "adjective", etc.
     - "semanticCategory": "physical_action_or_creation", "gradable_adjective_adverb", "derived_complex_word", or "noun_object_or_role".
     - "primaryTechnique": {"type": "sensory_mini_story", "title": "Action in Context (Mental Image)", "content": "Vivid sensory description in simple English..."}.
     - "secondaryTechnique": {"type": "opposite_trigger", "title": "Opposite Situation (Contrast)", "oppositeWord": "the true antonym", "contrastPhrases": ["Contrast sentence 1 in plain English.", "Contrast sentence 2."]}.
     - "youtubeContextQuery": Natural query to find this spoken.

Return ONLY the raw JSON object, without markdown formatting.
`;

    let parsedData: any = null;
    let lastErrorDetails: string = '';

    // 3. Cascada de modelos tolerante a saturación 503
    for (const model of FALLBACK_MODELS) {
      try {
        console.log(`Llamando a modelo: ${model}...`);
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          }),
        });

        if (!geminiRes.ok) {
          const errText = await geminiRes.text();
          console.warn(`⚠️ Modelo ${model} no disponible (HTTP ${geminiRes.status}).`);
          lastErrorDetails = errText;
          continue;
        }

        const geminiData = await geminiRes.json();
        const rawContent = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

        if (rawContent) {
          parsedData = JSON.parse(rawContent);
          console.log(`✓ Generación exitosa con: ${model}`);
          break;
        }
      } catch (err: any) {
        console.warn(`⚠️ Excepción con ${model}:`, err.message);
        lastErrorDetails = err.message;
      }
    }

    if (!parsedData) {
      return NextResponse.json(
        { error: 'Ningún modelo de Gemini estuvo disponible temporalmente.', details: lastErrorDetails },
        { status: 502 }
      );
    }

    // Retornamos los datos estructurados + la metadata del segmento de video cosechado
    return NextResponse.json({
      userInputOriginal: text,
      summaryType: summaryType,
      summaryParagraph: parsedData.summaryParagraph,
      sentences: parsedData.sentences,
      videoSegment: transcriptSegment ? {
        videoId: transcriptSegment.videoId,
        startSeconds: transcriptSegment.startSeconds,
        endSeconds: transcriptSegment.endSeconds,
        wordCount: transcriptSegment.wordCount,
        rawTranscript: transcriptSegment.rawTranscriptText,
      } : null,
    });

  } catch (error: any) {
    console.error('Error general en /api/generate:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}