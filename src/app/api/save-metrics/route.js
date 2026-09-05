import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Conexión segura usando tus credenciales camufladas (ID) homologadas para Vercel
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseId = process.env.NEXT_PUBLIC_SUPABASE_ID;

const supabase = createClient(supabaseUrl, supabaseId);

export async function POST(request) {
  try {
    const body = await request.json();
    const { studentEmail, practica_activa, palabra, tiempo_total_palabra_segundos, clics_menu, respuestas_exactas } = body;

    // Validación preventiva en el backend
    if (!studentEmail || !palabra) {
      return NextResponse.json({ error: "Datos incompletos para el guardado." }, { status: 400 });
    }

    // 🚀 INYECCIÓN REAL EN SUPABASE
    const { data, error } = await supabase
      .from('metricas_fonicas')
      .insert([
        {
          student_email: studentEmail.toLowerCase().trim(),
          practica_activa: practica_activa,
          palabra: palabra,
          tiempo_total_segundos: parseInt(tiempo_total_palabra_segundos) || 0,
          clics_menu: parseInt(clics_menu) || 0,
          detalles_preguntas: respuestas_exactas || {} // Guardamos el JSON de respuestas de Q1 a Q6
        }
      ]);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, message: "Métricas fónicas inyectadas correctamente en la nube." }, { status: 200 });

  } catch (error) {
    console.error("🚨 Error crítico al guardar métricas reales:", error.message);
    return NextResponse.json({ error: "Error interno del servidor al procesar analíticas." }, { status: 500 });
  }
}
