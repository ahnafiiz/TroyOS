// app/layout.tsx
import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Inter,
  Montserrat,
  Fira_Code,
  Playfair_Display,
  Syncopate
} from "next/font/google";
import "./globals.css";
import "../styles/theme.css";
import ThemeProvider from '@/components/ThemeProvider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "600", "800"],
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const syncopate = Syncopate({
  variable: "--font-syncopate",
  subsets: ["latin"],
  weight: ["400", "700"],
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
  const fontClasses = [
    geistSans.variable,
    geistMono.variable,
    inter.variable,
    montserrat.variable,
    firaCode.variable,
    playfairDisplay.variable,
    syncopate.variable,
    'antialiased',
    'dark',
  ].join(' ');

  return (
    <html
      lang="en"
      className={fontClasses}
      style={{ overflow: 'hidden' }}
    >
      <head>
<script
  dangerouslySetInnerHTML={{
    __html: `(function() {
      try {
        var raw = localStorage.getItem('troy-os-store');
        if (raw) {
          var parsed = JSON.parse(raw);
          var isDark = parsed?.state?.isDarkMode;
          if (isDark === false) {
            document.documentElement.classList.remove('dark');
          } else {
            document.documentElement.classList.add('dark');
          }
        } else {
          // No store yet — default to dark (matches your store default)
          document.documentElement.classList.add('dark');
        }
      } catch(e) {
        document.documentElement.classList.add('dark');
      }
    })();`,
  }}
/>
      </head>
      <body
        className="bg-black text-white selection:bg-blue-500/30"
        style={{
          margin: 0,
          height: '100vh',
          width: '100vw',
          overflow: 'hidden',
          fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
        }}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}