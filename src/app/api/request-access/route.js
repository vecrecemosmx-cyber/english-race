import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 🚀 REGLA DE AUTODIAGNÓSTICO: Validamos la lectura de variables en Vercel
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseId = process.env.NEXT_PUBLIC_SUPABASE_ID;

export async function POST(request) {
  try {
    // 💡 Si las variables no están cargando correctamente en Vercel, arrojaremos un error descriptivo inmediato
    if (!supabaseUrl || !supabaseId) {
      console.error("🚨 ERROR CRÍTICO DE ENTORNO: Las variables de Supabase no están llegando al backend.");
      return NextResponse.json({ 
        error: "Error de configuración en el servidor.",
        diagnostico: { url: !!supabaseUrl, id: !!supabaseId }
      }, { status: 500 });
    }

    // Inicializamos el cliente dentro de la petición para asegurar la lectura limpia de las llaves
    const supabase = createClient(supabaseUrl, supabaseId);
    
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "El correo es obligatorio." }, { status: 400 });
    }

    const emailLimpio = email.toLowerCase().trim();

    // INYECCIÓN EN BASE DE DATOS REAL
    const { data, error } = await supabase
      .from('lista_espera_solicitudes')
      .insert([{ email: emailLimpio }]);

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ message: "La solicitud ya había sido registrada anteriormente." }, { status: 200 });
      }
      throw error;
    }

    return NextResponse.json({ message: "Solicitud registrada exitosamente." }, { status: 200 });

  } catch (error) {
    console.error("🚨 Error real atrapado en el catch:", error.message);
    return NextResponse.json({ 
      error: "Ocurrió un error interno al procesar tu solicitud.",
      detalle: error.message 
    }, { status: 500 });
  }
}
