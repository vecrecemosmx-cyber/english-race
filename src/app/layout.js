// Archivo de Configuración del Servidor y Estilos
// Ubicación: src/app/layout.js
import { Comfortaa } from "next/font/google";
import "./globals.css";

// Cargamos Comfortaa, que es la tipografía redondeada por excelencia en Google Fonts
const fontRedondeada = Comfortaa({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-redondeada",
});

export const metadata = {
  title: 'EFA Global - Inversion Platform',
  description: 'Motor universal de aprendizaje fónico y vocabulario contextual',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${fontRedondeada.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}