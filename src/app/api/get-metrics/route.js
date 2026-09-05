import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// CONFIGURACIÓN DE CONEXIÓN SEGURO USANDO TU VARIABLE ID CAMUFLADA
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseId = process.env.NEXT_PUBLIC_SUPABASE_ID;

const supabase = createClient(supabaseUrl, supabaseId);

export async function GET() {
  try {
    // 🚀 CONSULTA REAL A SUPABASE: Trae todas las métricas de neuroeducación acumuladas
    const { data, error } = await supabase
      .from('metricas_fonicas')
      .select('id, student_email, practica_activa, palabra, tiempo_total_segundos, clics_menu, detalles_preguntas, timestamp')
      .order('timestamp', { ascending: false });

    if (error) {
      throw error;
    }

    // Regresa el arreglo con los datos analíticos reales al frontend del profesor
    return NextResponse.json({ metricas: data }, { status: 200 });

  } catch (error) {
    console.error("🚨 Error crítico al leer el historial de métricas fónicas:", error.message);
    return NextResponse.json({ error: "No se pudo consultar la base de datos de métricas reales." }, { status: 500 });
  }
}
