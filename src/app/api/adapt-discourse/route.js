import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // 1. Obtener de forma segura los datos enviados desde tu frontend
    const body = await request.json();
    
    // Extraemos las variables comunes (puedes ajustar estos nombres según lo que mande tu cliente)
    const { discourse, role, level, prompt, inputs } = body;

    // Construimos un prompt claro para Hugging Face basado en lo que recibimos
    const textToProcess = inputs || prompt || discourse || "Un chico de secundaria compartiendo que le gusta bailar y nadar.";
    const userRole = role || "estudiante de secundaria";
    const userLevel = level || "intermedio";

    const systemInstruction = `Adapta el siguiente discurso para un perfil de ${userRole} con un nivel de inglés/español ${userLevel}. Mantén un tono natural y conversacional.\n\nTexto original: ${textToProcess}`;

    // URL del modelo (puedes cambiarlo por el de tu preferencia, ej: Llama, Mistral, Qwen, etc.)
    const MODEL_URL = "https://huggingface.co";
    
    // 2. Realizar la petición a la API de Hugging Face
    const hfResponse = await fetch(MODEL_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: systemInstruction,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          return_full_text: false
        }
      }),
    });

    // 3. Validar si Hugging Face respondió con un error de infraestructura (404, 500, 503, etc.)
    if (!hfResponse.ok) {
      const errorText = await hfResponse.text();
      console.error("Error crudo detectado desde Hugging Face:", errorText);

      // Cortamos el texto de error si es un HTML gigante para que no rompa el JSON del cliente
      return NextResponse.json(
        { 
          error: "Fallo en el procesamiento de Hugging Face API", 
          detalles: `Status ${hfResponse.status}: ${errorText.substring(0, 150)}...` 
        }, 
        { status: hfResponse.status }
      );
    }

    // 4. Si la respuesta es exitosa (OK 200), parseamos el JSON de forma segura
    const data = await hfResponse.json();
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    // Captura errores de red, JSON malformado del frontend o variables indefinidas
    console.error("Error crítico en /api/adapt-discourse/route.js:", error);
    return NextResponse.json(
      { error: "Error interno en el servidor", detalles: error.message }, 
      { status: 500 }
    );
  }
}
