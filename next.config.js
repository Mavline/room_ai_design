/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  images: {
    domains: ["upcdn.io", "replicate.delivery"],
  },
  // Disable automatic prefetching of all pages in the background
  experimental: {
    optimizeCss: true, // Optimize CSS loading
  },
  // Reduce the number of unnecessary JavaScript chunks loaded
  webpack: (config, { dev, isServer }) => {
    // Optimize production builds
    if (!dev && !isServer) {
      // Minimize client bundles
      config.optimization.minimize = true;
    }
    return config;
  },
  // Disable automatic preloading of resources
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
};
