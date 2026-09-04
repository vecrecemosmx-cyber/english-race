import React from 'react';

// Icono premium de bocina extraído de tu index.html original
export const IconoBocina = () => (
  <svg 
    className="ui-icon w-5 h-5 fill-current" 
    viewBox="0 0 24 24" 
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
  </svg>
);

// Icono premium de nota musical para la reproducción del fonema vocal
export const IconoNota = () => (
  <svg 
    className="ui-icon w-5 h-5 fill-current" 
    viewBox="0 0 24 24" 
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
  </svg>
);

// 🚀 REGLA SOLICITADA: ICONO DE GOOGLE COMPACTO CON COORDENADAS NUMÉRICAS CORREGIDAS
export function IconoGoogle() {
  return (
    <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://w3.org">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18c-.75 1.49-1.18 3.16-1.18 4.94s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}
