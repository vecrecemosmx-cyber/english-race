/** @type {import('next').NextConfig} */
const nextConfig = {
  // Unificamos el permiso de la IP de desarrollo sin duplicar identificadores
  allowedDevOrigins: ['https://english-race-2ehz.vercel.app']
};

export default nextConfig;
// Forzando despliegue limpio en vercel
