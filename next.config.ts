import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  // Keep webpack config for production builds
  webpack(config) {
    const fileLoaderRule = config.module.rules.find(
      (rule: { test?: RegExp }) => rule.test?.toString().includes('.svg')
    );

    if (fileLoaderRule) {
      fileLoaderRule.exclude = /\.svg$/i;
    }

    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            typescript: true,
            icon: true,
            dimensions: false,
            svgProps: {
              fill: 'currentColor',
              stroke: 'currentColor',
            },
            replaceAttrValues: {
              '#000': 'currentColor',
              '#000000': 'currentColor',
              '#fff': 'currentColor',
              '#ffffff': 'currentColor',
            },
            svgo: true,
            svgoConfig: {
              plugins: [
                {
                  name: 'preset-default',
                  params: {
                    overrides: {
                      removeViewBox: false,
                    },
                  },
                },
                'removeDimensions',
              ],
            },
          },
        },
      ],
    });

    return config;
  },
};

export default nextConfig;

// Disable CSP headers entirely in development (and production if not needed)
nextConfig.headers = async () => {
  // Return empty header array to avoid any CSP restrictions during local dev
  return [];
};