/** @type {import('next').NextConfig} */
const nextConfig = {
  // Netlify deployment optimization
  experimental: {
    optimizeCss: true
  },
  
  webpack: (config, { isServer }) => {
    // Set target for modern JavaScript support
    config.target = isServer ? 'node' : ['web', 'es2020'];
    
    // WASM support
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      topLevelAwait: true,
    };
    
    // Fallback for Node.js modules that don't work in browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        path: false,
        os: false,
        stream: false,
        util: false,
        url: false,
        querystring: false,
        http: false,
        https: false,
        zlib: false
      };
    }
    
    // Handle .wasm files
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async'
    });

    return config;
  }
};

export default nextConfig;