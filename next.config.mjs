import withPWAInit from 'next-pwa';

// Inițializăm plugin-ul PWA
const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // Dezactivăm în dev pentru a evita caching agresiv
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurări existente
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Alte configurări Next.js pot fi adăugate aici
};

// Exportăm configurația împachetată în withPWA
export default withPWA(nextConfig);