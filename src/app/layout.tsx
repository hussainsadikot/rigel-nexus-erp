import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rigel Nexus ERP | Smart Inventory System",
  description: "A comprehensive Full-Stack ERP solution designed for modern inventory management. Features include Real-time Stock Tracking, Purchase Order (PO) Management, Inventory Valuation, and Seamless Traceability for hardware and manufacturing businesses. Built with Next.js, TypeScript, and Tailwind CSS.",
  icons: {
    // FIX: Ahiya aapne banavelu svg link karyu
    icon: "/logo.svg",
    // Jo apple device mate icon rakhvo hoy to (optional):
    // apple: "/logo.svg",
  },
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
        {children}
      </body>
    </html>
  );
}
