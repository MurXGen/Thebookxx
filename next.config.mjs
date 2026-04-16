/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/books/bk-002",
        destination: "/books/the-art-of-clarity",
        permanent: true,
      },
    ];
  },
  images: {
    unoptimized: true,
    minimumCacheTTL: 31536000,
    dangerouslyAllowSVG: true,
  },
  compiler: {
    removeConsole: true,
  },
  experimental: {
    optimizeCss: true, // Optimize CSS delivery
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  plugins: {
    "@fullhuman/postcss-purgecss": {
      content: [
        "./app/**/*.{js,jsx,ts,tsx}",
        "./components/**/*.{js,jsx,ts,tsx}",
        "./pages/**/*.{js,jsx,ts,tsx}",
      ],
      defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
      safelist: [
        "html",
        "body",
        /^bg-/,
        /^text-/,
        /^border-/,
        "active",
        "loaded",
      ],
    },
  },
  swcMinify: true,
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;
