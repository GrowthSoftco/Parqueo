import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Modo servidor: la app consulta Neon/Prisma en el servidor.
  // (El export estático para Electron se reactiva luego, apuntando a la API.)
};

export default nextConfig;
