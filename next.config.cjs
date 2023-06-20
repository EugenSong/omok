module.exports = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Fixes npm packages that depend on `tls`, `net` module
      config.resolve.fallback = {
        ...config.resolve.fallback,
        tls: false,
        net: false,
      };
    }

    return config;
  },
};
