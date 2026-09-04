'use client';

import { signIn, useSession, signOut, SessionProvider } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IconoGoogle } from "../Iconos";
// 🚀 INYECCIÓN REAL: Importamos el cliente oficial de Supabase directamente en el cliente
import { createClient } from '@supabase/supabase-js';

export default function LoginPage() {
  return (
    <SessionProvider>
      <LoginForm />
    </SessionProvider>
  );
}

function LoginForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentSliderIndex, setCurrentSliderIndex] = useState(0);
  
  // ESTADOS DE CONTROL
  const [isAccessDenied, setIsAccessDenied] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [loadingRequest, setLoadingRequest] = useState(false);
  const [countdown, setCountdown] = useState(5);

  // LISTA BLANCA OFICIAL
  const whitelist = [
    "vecrecemosmx@gmail.com",
    "gael.lpzes.9@gmail.com",
    "aguilardefuego@gmail.com",
    "max.ram.car@gmail.com"
  ];

  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      const userEmail = session.user.email.toLowerCase().trim();
      if (!whitelist.includes(userEmail)) {
        setIsAccessDenied(true);
        return;
      }
      if (userEmail === "vecrecemosmx@gmail.com") {
        router.push("/role-selection");
      } else {
        router.push("/student");
      }
    }
  }, [status, session, router]);

  // 🚀 REGLA SOLICITADA: Envío directo a Supabase saltándonos el Error 500 de la API
  const handleRequestAccess = async () => {
    if (!session?.user?.email) return;
    setLoadingRequest(true);

    // Función interna encargada de correr el reloj de expulsión pase lo que pase
    const activarExpulsionForzada = () => {
      setRequestSent(true);
      const interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);

      setTimeout(async () => {
        clearInterval(interval);
        try {
          await signOut({ redirect: false });
        } catch (e) {
          console.error("Error al limpiar sesión:", e);
        }
        window.location.href = '/'; // Forzar recarga dura
      }, 5000);
    };

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseId = process.env.NEXT_PUBLIC_SUPABASE_ID;

      // Intentamos inicializar e inyectar el registro directo en la base de datos en la nube
      if (supabaseUrl && supabaseId) {
        const supabaseDirecto = createClient(supabaseUrl, supabaseId);
        const emailLimpio = session.user.email.toLowerCase().trim();

        const { error } = await supabaseDirecto
          .from('lista_espera_solicitudes')
          .insert([{ email: emailLimpio }]);

        if (error && error.code !== '23505') {
          console.error("Error al registrar en Supabase:", error.message);
        }
      } else {
        console.error("🚨 Las credenciales no están cargadas en el frontend.");
      }
    } catch (err) {
      console.error("🚨 Falló la conexión directa a la base de datos:", err);
    } finally {
      setLoadingRequest(false);
      activarExpulsionForzada(); // Se ejecuta siempre para romper el bucle
    }
  };

  const sliderItems = [
    { text: "Aprende fonemas en inglés de forma interactiva y evalúa tu pronunciación en tiempo real.", bgClass: "bg-slider-azul" },
    { text: "Sigue tu progreso diario y supera nuevos retos adaptados a tu nivel de aprendizaje.", bgClass: "bg-slider-verde" },
    { text: "Practica la escucha activa modulando la velocidad de reproducción de las palabras.", bgClass: "bg-slider-naranja" },
    { text: "Diseñado especialmente para ayudarte a hablar inglés con total seguridad y fluidez.", bgClass: "bg-slider-amarillo" },
    { text: "Una plataforma ágil y moderna respaldada por el seguimiento constante de tus profesores.", bgClass: "bg-slider-gris" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSliderIndex((prevIndex) => (prevIndex + 1) % sliderItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [sliderItems.length]);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <p className="text-lg font-semibold text-slate-600 animate-pulse">Comprobando sesión...</p>
      </div>
    );
  }

  return (
    <div className="plataforma-body flex min-h-screen items-center justify-center p-4">
      <div className="grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl md:grid-cols-12">
        
        <div className="flex flex-col justify-between p-8 md:col-span-5 lg:p-12">
          <div className="flex items-center gap-2">
            <span className="logo font-bold text-xl tracking-tight text-sky-600">English For All</span>
          </div>

          <div className="my-auto py-8">
            {isAccessDenied ? (
              <div className="animate-fade-in flex flex-col gap-4">
                <h1 className="text-2xl font-black text-red-600 uppercase tracking-tight">Acceso Restringido</h1>
                <p className="text-sm font-medium text-slate-600 leading-relaxed">
                  Lo sentimos, tu cuenta <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono text-xs">{session?.user?.email}</code> no está autorizada para ingresar a esta Beta Privada.
                </p>
                
                {requestSent ? (
                  <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl p-4 text-xs font-semibold leading-relaxed shadow-sm">
                    ✓ Procesando solicitud. Tu sesión se cerrará de forma segura en <span className="font-black text-sm text-emerald-600 mx-0.5">{countdown}</span> segundos...
                  </div>
                ) : (
                  <button
                    onClick={handleRequestAccess}
                    disabled={loadingRequest}
                    className="w-full bg-sky-600 text-white font-bold py-3.5 px-4 rounded-2xl hover:bg-sky-700 active:scale-95 transition-all text-sm shadow-md"
                  >
                    {loadingRequest ? "Enviando..." : "Solicitar acceso al administrador"}
                  </button>
                )}
                
                {!requestSent && (
                  <button onClick={() => signOut({ callbackUrl: '/' })} className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase mt-2 text-left transition-colors">
                    ← Cancelar e intentar con otra cuenta
                  </button>
                )}
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold tracking-tight text-slate-800 mb-2">¡Te damos la bienvenida!</h1>
                <p className="text-sm font-medium text-slate-500 mb-8">Inicia sesión de forma segura para comenzar a practicar.</p>
                <button
                  onClick={() => signIn("google")}
                  type="button"
                  className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98]"
                >
                  <IconoGoogle />
                  <span>Continuar con Google</span>
                </button>
              </>
            )}
          </div>

          <div className="text-xs text-slate-400">&copy; {new Date().getFullYear()} English For All.</div>
        </div>

        <div className={`relative hidden flex-col justify-end p-8 transition-colors duration-700 ease-in-out md:col-span-7 md:flex lg:p-12 ${sliderItems[currentSliderIndex].bgClass}`}>
          <div className="absolute inset-0 bg-black/5 pointer-events-none" />
          <div className="relative z-10 max-w-md text-white"><p className="text-2xl font-medium leading-relaxed tracking-wide">"{sliderItems[currentSliderIndex].text}"</p></div>
          <div className="relative z-10 mt-12 flex gap-2">
            {sliderItems.map((_, index) => (
              <button key={index} onClick={() => setCurrentSliderIndex(index)} className={`h-2.5 rounded-full transition-all duration-300 ${index === currentSliderIndex ? "w-8 bg-white" : "w-2.5 bg-white/40"}`} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
