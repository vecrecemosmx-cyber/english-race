'use client';

import { signIn, useSession, signOut, SessionProvider } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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

  // 🚀 REGLA BLINDADA: Expulsión garantizada incluso si el servidor o la API fallan
  const handleRequestAccess = async () => {
    if (!session?.user?.email) return;
    setLoadingRequest(true);
    
    // Función interna para arrancar el reloj de expulsión pase lo que pase
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
          console.error("Error al borrar cookies:", e);
        }
        window.location.href = '/'; // Recarga dura del navegador
      }, 5000);
    };

    try {
      console.log("✈️ Intentando registrar correo en la lista de espera...");
      const res = await fetch('/api/request-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session.user.email })
      });
      
      if (!res.ok) {
        console.warn(`Aviso: El servidor respondió con estado ${res.status}. Se procederá con la expulsión de respaldo.`);
      }
    } catch (err) {
      console.error("🚨 Error de conexión con la API de Vercel/Supabase:", err);
    } finally {
      setLoadingRequest(false);
      activarExpulsionForzada(); // 💡 CLAVE: Se ejecuta SIEMPRE, garantizando que el bucle se rompa
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
                  <svg className="h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
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
