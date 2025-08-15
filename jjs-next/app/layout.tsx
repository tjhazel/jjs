import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { User } from "lucide-react";
import Providers from "@/components/providers";
import TopHeader from "@/components/menu/top-header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "John, Jeri, and Sidney",
  description: "A modern take on a legacy site",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
         <Providers>
          <main className="flex min-h-screen w-full flex-col bg-muted/40">
            <div className="min-h-screen flex flex-col">
              <TopHeader />
              <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
               {children}
              </main>
              <footer className="border-t border-gray-200 py-4 text-center text-xs sm:text-sm text-gray-500 px-4">
                © 2006 - {new Date().getFullYear()} johnandjeri.com. All rights reserved.
              </footer>
            </div>
            <Analytics />
          </main>
       </Providers>
      </body>
      <Analytics />
    </html>
  );
}
