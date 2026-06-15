import type { NextConfig } from "next";

// This injects the variable into the Node environment right as Next.js starts up
if (process.env.NODE_ENV === "development") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const nextConfig: NextConfig = {
   output: 'export', //generate static site, which fails with page[id] dynamic route, so we will stick with server side rendering for now.
   distDir: 'out',
   trailingSlash: true,
   images: {      
      dangerouslyAllowLocalIP: true, // [!code ++]
      remotePatterns: [
         {
            protocol: 'https',
            hostname: 'localhost',
            port: '7275',
            pathname: '/Image/**',
         },
      ],
   },
};

export default nextConfig;
