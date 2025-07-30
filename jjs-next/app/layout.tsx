import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { DesktopNav, MobileNav, DashboardBreadcrumb } from "@/components/menu/nav";
import { User } from "lucide-react";
import { SearchInput } from "./(dashboard)/search";
import Providers from "@/components/providers";

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
         {/*<main className="flex min-h-screen w-full flex-col bg-muted/40">*/}
        <main> 
        <DesktopNav />
         <div className="flex flex-col sm:gap-0 sm:py-0 sm:pl-14">
        {/*<div > */}
          {/* <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6"> */}
          <header >
            <MobileNav />
            {/* <DashboardBreadcrumb />
            <SearchInput /> 
            <User />*/}
          </header>
          {/* <main className="grid flex-1 items-start gap-2 p-4 sm:px-6 sm:py-0 md:gap-4 bg-muted/40"> */}
          <main className="">
            {children}
          </main>
        </div>
        <Analytics />
      </main>
       </Providers>
      </body>
      <Analytics />
    </html>
  );
}
