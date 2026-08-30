/** @type {import('next').NextConfig} */
const nextConfig = {
  // Unificamos el permiso de la IP de desarrollo sin duplicar identificadores
  allowedDevOrigins: ['127.0.0.1']
};

export default nextConfig;
