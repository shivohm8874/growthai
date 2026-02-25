import type { Metadata } from "next";
import { Rajdhani, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Growthai - Total Autonomous Growth Engine",
  description: "Shifting human operations to machine precision. One engine for SEO, SMO, GMB, Web Dev, CRO & Content.",
  keywords: ["Growthai", "AI", "SEO", "Automation", "Growth Engine", "Marketing"],
  authors: [{ name: "Growthai Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Growthai - Total Autonomous Growth Engine",
    description: "Shifting human operations to machine precision.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          src="https://code.iconify.design/1/1.0.7/iconify.min.js"
          strategy="afterInteractive"
        />
      </head>
      <body
        className={`${rajdhani.variable} ${inter.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
