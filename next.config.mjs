/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,

  async redirects() {
    return [
      {
        source: "/books/bk-002",
        destination: "/books/the-art-of-clarity",
        permanent: true,
      },
      {
        source: "/author/murthy-thevar/",
        destination: "/author/murthy-thevar",
        permanent: true,
      },
      {
        source: "/authors/:path*",
        destination: "/author/:path*",
        permanent: true,
      },
    ];
  },

  images: {
    // Disable image optimization to avoid Vercel usage charges
    unoptimized: true,
    minimumCacheTTL: 31536000, // 1 year cache
    dangerouslyAllowSVG: true,
  },

  // Add headers for SEO and image crawling
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "index, follow",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
      {
        source: "/review/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          {
            key: "X-Robots-Tag",
            value: "index, follow",
          },
        ],
      },
      {
        source: "/author/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, stale-while-revalidate=86400",
          },
          {
            key: "X-Robots-Tag",
            value: "index, follow, max-image-preview:large",
          },
        ],
      },
      {
        source: "/books/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, stale-while-revalidate=86400",
          },
          {
            key: "X-Robots-Tag",
            value: "index, follow, max-image-preview:large",
          },
        ],
      },
      {
        source: "/:path*.jpeg",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          {
            key: "X-Robots-Tag",
            value: "index, follow",
          },
        ],
      },
      {
        source: "/:path*.jpg",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          {
            key: "X-Robots-Tag",
            value: "index, follow",
          },
        ],
      },
      {
        source: "/:path*.png",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          {
            key: "X-Robots-Tag",
            value: "index, follow",
          },
        ],
      },
      {
        source: "/:path*.webp",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          {
            key: "X-Robots-Tag",
            value: "index, follow",
          },
        ],
      },
    ];
  },

  compiler: {
    removeConsole: true,
  },

  experimental: {
    optimizeCss: true,
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },

  // Increase timeout for page generation
  staticPageGenerationTimeout: 120,

  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  swcMinify: true,
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,

  // Skip trailing slash redirect to avoid loops
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
