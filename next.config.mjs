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
};

export default nextConfig;
