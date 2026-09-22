import fs from 'fs';
import path from 'path';
import { YoutubeTranscript } from 'youtube-transcript';

// 1. Carga automática de variables de entorno (.env.local o .env)
function loadEnv() {
  try {
    const envFile = fs.existsSync('.env.local') ? '.env.local' : fs.existsSync('.env') ? '.env' : null;
    if (envFile) {
      const content = fs.readFileSync(path.resolve(process.cwd(), envFile), 'utf-8');
      content.split('\n').forEach((line) => {
        const [key, ...vals] = line.split('=');
        if (key && vals.length > 0) {
          process.env[key.trim()] = vals.join('=').trim().replace(/^["']|["']$/g, '');
        }
      });
    }
  } catch (e) {
    console.warn('Advertencia al cargar archivo de entorno.');
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ ERROR: Faltan las variables de Supabase en .env o .env.local');
  process.exit(1);
}

// 2. Videos de inglés americano cotidiano verificado (Stanford, TED, Hábitos, Historias reales)
const DAILY_LIFE_VIDEOS = [
  { id: 'PX8i8fcC5NQ', title: 'Reid Hoffman - Stanford (Decisions & Work)' },
  { id: 'JnfBXjWm7hc', title: 'Daily Habits & Trying New Things' },
  { id: 'iCvmsMzlF7o', title: 'Everyday Motivation and Work' },
  { id: 'UF8uR6Z6KLc', title: 'Steve Jobs - Life Storytelling' },
  { id: '7NXxT1yA9oM', title: 'Workplace and Career Communication' }
];

// 3. Inserción a Supabase vía REST API
async function uploadBatchToSupabase(records) {
  const endpoint = `${SUPABASE_URL}/rest/v1/video_transcripts`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(records),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Fallo en Supabase: ${errorText}`);
  }
}

// 4. Orquestador
async function runIngestion() {
  console.log('🚀 Iniciando Ingestión con youtube-transcript...');
  console.log(`🎯 Destino Supabase: ${SUPABASE_URL}`);

  let totalInserted = 0;

  for (let i = 0; i < DAILY_LIFE_VIDEOS.length; i++) {
    const video = DAILY_LIFE_VIDEOS[i];
    console.log(`\n[${i + 1}/${DAILY_LIFE_VIDEOS.length}] Descargando subtítulos: "${video.title}" (${video.id})...`);

    try {
      // Llamada directa y confiable
      const transcript = await YoutubeTranscript.fetchTranscript(video.id);

      if (!transcript || transcript.length === 0) {
        console.log(`  ⚠️ Sin subtítulos disponibles para este video.`);
        continue;
      }

      // Limpieza y estructuración para Supabase
      const cleanRecords = [];
      for (const item of transcript) {
        let cleanText = item.text
          .replace(/\[.*?\]/g, '')
          .replace(/[♪♫]/g, '')
          .replace(/&amp;/g, '&')
          .replace(/&#39;/g, "'")
          .replace(/&quot;/g, '"')
          .replace(/\n/g, ' ')
          .trim();

        if (cleanText.length > 3) {
          cleanRecords.push({
            video_id: video.id,
            // La librería entrega offset en milisegundos o segundos según la versión; normalizamos a segundos:
            start_seconds: item.offset > 10000 ? parseFloat((item.offset / 1000).toFixed(2)) : parseFloat(item.offset.toFixed(2)),
            duration: item.duration > 1000 ? parseFloat((item.duration / 1000).toFixed(2)) : parseFloat(item.duration.toFixed(2)),
            phrase_text: cleanText,
            speaker_title: 'American Native Speaker',
          });
        }
      }

      console.log(`  ➔ ${cleanRecords.length} frases limpias extraídas. Guardando en Supabase...`);

      // Subida en bloques de 200 filas
      const CHUNK_SIZE = 200;
      for (let c = 0; c < cleanRecords.length; c += CHUNK_SIZE) {
        const chunk = cleanRecords.slice(c, c + CHUNK_SIZE);
        await uploadBatchToSupabase(chunk);
      }

      totalInserted += cleanRecords.length;
      console.log(`  ✔ Guardado exitoso. Total en base de datos: ${totalInserted} frases.`);
    } catch (err) {
      console.log(`  ⚠️ Error al procesar este video: ${err.message}`);
    }

    // Pausa preventiva de 1.5 segundos
    await new Promise((r) => setTimeout(r, 1500));
  }

  console.log(`\n🎉 ¡Proceso finalizado! Total de frases nativas guardadas en tu Supabase: ${totalInserted}`);
}

runIngestion();