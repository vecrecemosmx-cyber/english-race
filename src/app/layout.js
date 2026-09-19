// Archivo de Configuración del Servidor y Estilos
// Ubicación: src/app/layout.js

import './globals.css'; // 🫵 ESTA IMPORTACIÓN CONECTA LA HOJA ANTERIOR

export const metadata = {
  title: 'EFA Global - Inversion Platform',
  description: 'Motor universal de aprendizaje fónico y vocabulario contextual',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        {/* Inyección de la tipografía Comfortaa desde Google Fonts de forma gratuita */}
        <link rel="preconnect" href="https://googleapis.com" />
        <link rel="preconnect" href="https://gstatic.com" crossOrigin="true" />
        <link href="https://googleapis.com/css2?family=Comfortaa:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-slate-900 text-slate-100">
        {children}
      </body>
    </html>
  );
}
