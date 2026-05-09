// app/layout.tsx
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
  title: "Troy OS",
  description: "A premium web-based operating system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      style={{ overflow: 'hidden' }} // Prevents accidental scrolling on mobile/web
    >
      <body 
        className="bg-black text-white selection:bg-blue-500/30"
        style={{ 
          margin: 0, 
          height: '100vh', 
          width: '100vw', 
          overflow: 'hidden',
          fontFamily: 'var(--font-geist-sans), system-ui, sans-serif'
        }}
      >
        {children}
      </body>
    </html>
  );
}
