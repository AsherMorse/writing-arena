/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Enable importing .md files as raw strings
    config.module.rules.push({
      test: /\.md$/,
      type: 'asset/source',
    });
    return config;
  },
};

module.exports = nextConfig;

