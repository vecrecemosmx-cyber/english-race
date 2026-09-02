'use client';

import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";

export default function LoginPage() {
  const [currentSliderIndex, setCurrentSliderIndex] = useState(0);

  // Configuración de los testimonios o mensajes del slider con sus clases de color de globals.css
  const sliderItems = [
    {
      text: "Aprende fonemas en inglés de forma interactiva y evalúa tu pronunciación en tiempo real.",
      bgClass: "bg-slider-azul",
    },
    {
      text: "Sigue tu progreso diario y supera nuevos retos adaptados a tu nivel de aprendizaje.",
      bgClass: "bg-slider-verde",
    },
    {
      text: "Practica la escucha activa modulando la velocidad de reproducción de las palabras.",
      bgClass: "bg-slider-naranja",
    },
    {
      text: "Diseñado especialmente para ayudarte a hablar inglés con total seguridad y fluidez.",
      bgClass: "bg-slider-amarillo",
    },
    {
      text: "Una plataforma ágil y moderna respaldada por el seguimiento constante de tus profesores.",
      bgClass: "bg-slider-gris",
    }
  ];

  // Cambiar de slide automáticamente cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSliderIndex((prevIndex) => (prevIndex + 1) % sliderItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [sliderItems.length]);

  // Manejador para el botón de inicio de sesión con Google
  const handleGoogleSignIn = () => {
    // Redirige automáticamente al alumno o profesor tras autenticarse con éxito
    signIn("google", { callbackUrl: "/student" });
  };

  return (
    <div className="plataforma-body flex min-h-screen items-center justify-center p-4">
      <div className="grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl md:grid-cols-12">
        
        {/* COLUMNA IZQUIERDA: Formulario de Login (5 columnas) */}
        <div className="flex flex-col justify-between p-8 md:col-span-5 lg:p-12">
          {/* Encabezado / Logo */}
          <div className="flex items-center gap-2">
            <span className="logo font-bold text-xl tracking-tight text-sky-600">
              English For All
            </span>
          </div>

          {/* Bloque Central del Login */}
          <div className="my-auto py-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-800 mb-2">
              ¡Te damos la bienvenida!
            </h1>
            <p className="text-sm font-medium text-slate-500 mb-8">
              Inicia sesión para comenzar a practicar o revisar tus métricas.
            </p>

            {/* Botón de Autenticación con Google */}
            <button
              onClick={handleGoogleSignIn}
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98]"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" width="24" height="24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span>Continuar con Google</span>
            </button>
          </div>

          {/* Pie de página del Login */}
          <div className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} English For All. Todos los derechos reservados.
          </div>
        </div>

        {/* COLUMNA DERECHA: Slider de Contenido Dinámico (7 columnas) */}
        <div className={`relative hidden flex-col justify-end p-8 transition-colors duration-700 ease-in-out md:col-span-7 md:flex lg:p-12 ${sliderItems[currentSliderIndex].bgClass}`}>
          
          {/* Capa sutil de patrón visual sobre el fondo */}
          <div className="absolute inset-0 bg-black/5 pointer-events-none" />

          {/* Contenedor del Texto del Slider */}
          <div className="relative z-10 max-w-md text-white animate-fade-in">
            <p className="text-2xl font-medium leading-relaxed tracking-wide drop-shadow-sm transition-all duration-500">
              "{sliderItems[currentSliderIndex].text}"
            </p>
          </div>

          {/* Indicadores de Posición Inferiores (Dots) */}
          <div className="relative z-10 mt-12 flex gap-2">
            {sliderItems.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSliderIndex(index)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  index === currentSliderIndex ? "w-8 bg-white" : "w-2.5 bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`Ir al slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}