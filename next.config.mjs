/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',

  // ❌ remove distDir (default hi rehne do)
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },

  // ❌ remove basePath and assetPrefix — handled by Apache
  basePath: '',
  assetPrefix: '',

  trailingSlash: true,
};

export default nextConfig;
