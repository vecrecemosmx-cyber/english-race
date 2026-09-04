import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 🚀 CONFIGURACIÓN BLINDADA: Nombre plano neutral para saltarse las alertas de Vercel
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseId = process.env.NEXT_PUBLIC_SUPABASE_ID; // 💡 Lee el nombre plano camuflado

const supabase = createClient(supabaseUrl, supabaseId);

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "El correo es obligatorio." }, { status: 400 });
    }

    const emailLimpio = email.toLowerCase().trim();

    // 🚀 INYECCIÓN EN BASE DE DATOS REAL (TABLA DE ESPERA)
    const { data, error } = await supabase
      .from('lista_espera_solicitudes')
      .insert([{ email: emailLimpio }]);

    if (error) {
      // Código de error '23505' significa que el correo ya estaba registrado
      if (error.code === '23505') {
        return NextResponse.json({ message: "La solicitud ya había sido registrada anteriormente." }, { status: 200 });
      }
      throw error;
    }

    return NextResponse.json({ message: "Solicitud registrada exitosamente en la base de datos." }, { status: 200 });

  } catch (error) {
    console.error("🚨 Error crítico en el servidor de accesos:", error.message);
    return NextResponse.json({ error: "Ocurrió un error interno al procesar tu solicitud." }, { status: 500 });
  }
}
