/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Stub out Node.js native modules that sodium-native pulls in.
      // These are never used in the browser but crash webpack/XDR.
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        os: false,
        stream: false,
        buffer: false,
      };

      // Replace sodium-native with an empty module in browser builds
      config.resolve.alias = {
        ...config.resolve.alias,
        'sodium-native': false,
        'require-addon': false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
