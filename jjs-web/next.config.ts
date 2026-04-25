import type { NextConfig } from "next";

const nextConfig: NextConfig = {  
  /* config options here */
  images: {
    domains: ['localhost', 'johnandjeri.com', 'encrypted-tbn0.gstatic.com'],
      //  remotePatterns: [new URL('https://localhost:7275/Image/Climbing/rmnp/**')],

     remotePatterns: [
      //https://localhost:7275/Image/Climbing/rmnp/526571JohnBelaying.jpg
      // {
      //   protocol: 'https',
      //   hostname: 'localhost',
      //   port: '7275',
      //   pathname: '/**', // Be as specific as possible
      //  // search: '',
      // },
      // new URL('https://localhost:7275/Image/Climbing/rmnp/**'),
      // //new URL('https://localhost:7275/**'),
      // //http://johnandjeri.com/images/slides/bristol.jpg
      // //http://johnandjeri.com/Albums/image.ashx?imagewidth=500&path=Climbing%2fOuray%2f1253031JohnLead03.jpg%2f
      // {
      //   protocol: 'http',
      //   hostname: 'johnandjeri.com',
      //   port: '',
      //   pathname: '/images/slides/**',
      // },
    ]
  }
};

export default nextConfig;
