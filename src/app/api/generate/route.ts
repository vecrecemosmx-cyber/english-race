import { NextResponse } from 'next/server';

// Modelos en orden jerárquico de respaldo (100% gratuitos)
const FALLBACK_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.7-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
];

export async function POST(req: Request) {
  try {
    const { text, summaryType } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'El texto es requerido' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Falta la variable GEMINI_API_KEY en las variables de entorno' },
        { status: 500 }
      );
    }

    // Prompt estricto con los 10 roles integrados (intacto)
    const systemPrompt = `
You are an expert American English pedagogue and linguist specialized in teaching native Spanish speakers.
The user has shared their dreams, life goals, or passions:
"${text}"

Generate an educational language learning response formatted in STRICT JSON according to these linguistic rules:
1. NARRATIVE PERSON: Maintain the original grammatical person (if input is in first person, write strictly in first person "I want...").
2. SUMMARY:
   - Provide a ${summaryType === 'short' ? 'short (1-2 sentences)' : 'normal (2-3 sentences)'} summary in General American English as a continuous paragraph ("summaryParagraph").
   - Break it down into simple, short sentences ("sentences").
3. FOR EACH SENTENCE in "sentences":
   - "id": "phrase_1", "phrase_2", etc.
   - "text": Complete sentence in American English.
   - "coreStructure": The anchor lexical frame / fixed [Subject + Verb/Action] base (e.g. "I want to build", "I want to explore").
   - "targetComplement": The specific ending slot of the sentence (e.g. "modern software", "different countries").
   - "ipa": Accurate General American phonetics in IPA format (e.g. "/aɪ wɑːnt tuː bɪld ˈmɑːdərn ˈsɔːftwer/").
   - "cefrDefinition": Simplified explanation in English ONLY using exclusively basic A1-A2 vocabulary (no Spanish).
   - "collocations": Exactly 5 substitution pattern frames keeping the [Subject + Verb] base intact and varying only the ending (e.g. ["I want to build software", "I want to build a company", "I want to build a career", "I want to build a project", "I want to build a brand"]).
   - "layer2":
     - "keyword": core verb or adjective.
     - "partOfSpeech": "verb", "adjective", etc.
     - "semanticCategory": "physical_action_or_creation", "gradable_adjective_adverb", "derived_complex_word", or "noun_object_or_role".
     - "primaryTechnique": {"type": "sensory_mini_story", "title": "Action in Context (Mental Image)", "content": "Vivid sensory description in simple English..."}.
     - "secondaryTechnique": {"type": "opposite_trigger", "title": "Opposite Situation (Contrast)", "oppositeWord": "the true antonym", "contrastPhrases": ["Contrast sentence 1 showing true opposite situation.", "Contrast sentence 2."]}.
     - "youtubeContextQuery": Natural YouTube query to find this spoken.

Return ONLY the raw JSON object, without markdown formatting.
`;

    let parsedData: any = null;
    let lastErrorDetails: string = '';

    // Bucle de resiliencia en cascada para soportar saturación 503
    for (const model of FALLBACK_MODELS) {
      try {
        console.log(`Intentando conectar con: ${model}...`);
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
          console.warn(`⚠️ Modelo ${model} no disponible (HTTP ${geminiRes.status}). Detalle:`, errText);
          lastErrorDetails = errText;
          continue; // Pasa automáticamente al siguiente modelo de la lista
        }

        const geminiData = await geminiRes.json();
        const rawContent = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

        if (rawContent) {
          parsedData = JSON.parse(rawContent);
          console.log(`✓ Generación exitosa usando el modelo: ${model}`);
          break; // Terminamos el bucle al tener respuesta exitosa
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

    return NextResponse.json({
      userInputOriginal: text,
      summaryType: summaryType,
      summaryParagraph: parsedData.summaryParagraph,
      sentences: parsedData.sentences,
    });
  } catch (error: any) {
    console.error('Error general en /api/generate:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}