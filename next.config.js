/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== 'production';
const nextConfig = {
  output: isDev ? undefined : 'export',
  eslint: { ignoreDuringBuilds: true },
  images: { unoptimized: true },
  experimental: {
    esmExternals: 'loose',
    serverComponentsExternalPackages: ['@linera/client'],
  },
  headers: isDev
    ? async () => ([
      {
        source: '/:path*',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
          { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
        ],
      },
    ])
    : undefined,
  webpack: (config, { isServer }) => {
    config.experiments = {
      ...(config.experiments || {}),
      asyncWebAssembly: true,
    };
    return config;
  },
};

module.exports = nextConfig;
