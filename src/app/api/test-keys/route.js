import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    explicacion: "Verificación de presencia de llaves en la nube de Vercel",
    url_detectada: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Cargada correctamente" : "❌ VACÍA o inexistente",
    service_key_detectada: process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ Cargada correctamente" : "❌ VACÍA o inexistente",
    longitud_key: process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.length : 0
  });
}
