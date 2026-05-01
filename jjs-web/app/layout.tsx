import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import Providers from "@/components/providers";
import TopHeader from "@/components/menu/top-header";
import { RootContextProvider }  from "@/components/context/RootContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "John & Jeri",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-900`}
      >
        <Providers>
          <RootContextProvider>
            <div className="min-h-screen flex flex-col">
              <TopHeader />
              <main className="flex-1 w-full mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                {children}
              </main>
              <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-600 px-4 mt-auto">
                <p>© 2006 - {new Date().getFullYear()} johnandjeri.com. All rights reserved.</p>
              </footer>
            </div>
            <Analytics />
          </RootContextProvider>
        </Providers>
      </body>
    </html>
  );
}
