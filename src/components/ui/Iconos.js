// Pieza 2 de 5: COMPONENTES VECTORIALES PREMIUM REUTILIZABLES
// Guarda en: src/components/ui/Iconos.js (Longitud segura < 5500 caracteres)

import React from 'react';

export const IconoBocina = () => (
  <svg className="w-5 h-5 fill-current inline-block align-middle" viewBox="0 0 24 24">
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
  </svg>
);

export const IconoMicrofono = () => (
  <svg className="w-5 h-5 fill-current inline-block align-middle" viewBox="0 0 24 24">
    <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
  </svg>
);

export const IconoFlecha = ({ direccion }) => (
  <svg className={`w-5 h-5 stroke-current transition-transform duration-200 ${direccion === 'izq' ? 'rotate-180' : ''}`} fill="none" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);
