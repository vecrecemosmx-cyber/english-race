import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseId = process.env.NEXT_PUBLIC_SUPABASE_ID;

export async function POST(request) {
  try {
    if (!supabaseUrl || !supabaseId) {
      console.error("🚨 ERROR DE ENTORNO: Faltan llaves de Supabase en save-metrics.");
      return NextResponse.json({ error: "Error de configuración en el servidor." }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseId);
    const body = await request.json();

    const studentEmail = body.studentEmail || "alumno.anonimo@student.com";
    const practica_activa = body.practica_activa || "1";
    const palabra = body.palabra || "Palabra Desconocida";
    const tiempo_total_palabra_segundos = parseInt(body.tiempo_total_palabra_segundos) || 0;
    const clics_menu = parseInt(body.clics_menu) || 0;
    const respuestas_exactas = body.respuestas_exactas || { info: "No se capturaron detalles" };

    // Intentamos la inyección en la base de datos en la nube
    const { data, error } = await supabase
      .from('metricas_fonicas')
      .insert([
        {
          student_email: studentEmail.toLowerCase().trim(),
          practica_activa: String(practica_activa),
          palabra: palabra,
          tiempo_total_segundos: tiempo_total_palabra_segundos,
          clics_menu: clics_menu,
          detalles_preguntas: respuestas_exactas
        }
      ]);

    // 🚀 CLAVE DE AUDITORÍA: Si Supabase rechaza el paquete, extraemos TODA la información del motivo
    if (error) {
      console.error("🚨 Supabase rechazó la inserción. Detalles:", error);
      return NextResponse.json({ 
        error: "Rechazado por la base de datos.",
        mensaje_supabase: error.message,
        codigo_postgresql: error.code,
        detalles_postgre: error.details,
        pista_postgre: error.hint
      }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Métricas guardadas con éxito." }, { status: 200 });

  } catch (error) {
    console.error("🚨 Error crítico interno en save-metrics:", error.message);
    return NextResponse.json({ error: "Error interno del servidor.", detalle: error.message }, { status: 500 });
  }
}
