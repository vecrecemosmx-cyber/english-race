import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// CONFIGURACIÓN DE CONEXIÓN CON TU BASE DE DATOS REAL
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseId = process.env.NEXT_PUBLIC_SUPABASE_ID;

export async function POST(request) {
  try {
    // 💡 Validación de diagnóstico inicial de variables en el servidor
    if (!supabaseUrl || !supabaseId) {
      console.error("🚨 ERROR DE CONFIGURACIÓN: Faltan las llaves de Supabase en el backend.");
      return NextResponse.json({ error: "Error de configuración en el servidor." }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseId);
    const body = await request.json();
    
    const { id, email } = body;

    // Validación de parámetros obligatorios
    if (!id || !email) {
      return NextResponse.json({ error: "El ID de solicitud y el correo son campos obligatorios." }, { status: 400 });
    }

    const emailLimpio = email.toLowerCase().trim();

    // 🚀 PASO 1: Insertar el correo aprobado en la tabla oficial de usuarios autorizados
    // Nota: Asegúrate de que el nombre de esta tabla coincida con tu tabla de lista blanca en Supabase (ej: 'usuarios_permitidos')
    const { error: errorInsercion } = await supabase
      .from('usuarios_permitidos') 
      .insert([{ email: emailLimpio }]);

    // Manejador específico para el código de error '23505' (correo ya registrado previamente en la lista blanca)
    if (errorInsercion && errorInsercion.code !== '23505') {
      console.error("🚨 Error al insertar en usuarios_permitidos:", errorInsercion.message);
      throw errorInsercion;
    }

    // 🚀 PASO 2: Remover de forma atómica la solicitud procesada de la lista de espera
    const { error: errorEliminacion } = await supabase
      .from('lista_espera_solicitudes')
      .delete()
      .eq('id', id);

    if (errorEliminacion) {
      console.error("🚨 Error al remover la solicitud de la lista de espera:", errorEliminacion.message);
      throw errorEliminacion;
    }

    // Respuesta exitosa para actualizar la interfaz del profesor de inmediato
    return NextResponse.json({ 
      success: true, 
      message: `El usuario ${emailLimpio} fue aprobado y removido de la lista de espera con éxito.` 
    }, { status: 200 });

  } catch (error) {
    console.error("🚨 Error crítico en el endpoint approve-user:", error.message);
    return NextResponse.json({ 
      error: "Ocurrió un error interno al procesar la aprobación.",
      detalle: error.message 
    }, { status: 500 });
  }
}
