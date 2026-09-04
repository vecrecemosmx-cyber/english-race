import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// CONFIGURACIÓN DE CONEXIÓN CON TU BASE DE DATOS REAL
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseId = process.env.NEXT_PUBLIC_SUPABASE_ID;

const supabase = createClient(supabaseUrl, supabaseId);

export async function GET() {
  try {
    // 🚀 CONSULTA REAL A SUPABASE: Trae los correos ordenados del más reciente al más antiguo
    const { data, error } = await supabase
      .from('lista_espera_solicitudes')
      .select('id, email, fecha_solicitud')
      .order('fecha_solicitud', { ascending: false });

    if (error) {
      throw error;
    }

    // Regresa el arreglo con los datos reales al frontend del profesor
    return NextResponse.json({ solicitudes: data }, { status: 200 });

  } catch (error) {
    console.error("🚨 Error crítico al leer la lista de espera:", error.message);
    return NextResponse.json({ error: "No se pudo consultar la base de datos." }, { status: 500 });
  }
}
