import type { Metadata, Viewport } from "next";
import { Manrope, Newsreader } from "next/font/google";
import type { ReactNode } from "react";
import { ThemeBootScript } from "@/components/providers/ThemeBootScript";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { PwaRegister } from "@/components/providers/PwaRegister";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Meow — wasze małe miejsce do bycia bliżej",
  description: "Meow to wspólna przestrzeń dla pary: koty, rozmowy, gry i spokojniejsze chwile razem.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pl" className={`${manrope.variable} ${newsreader.variable}`} suppressHydrationWarning>
      <head>
        <ThemeBootScript />
        <meta name="theme-color" content="#f1e8e2" />
      </head>
      <body className="bg-[var(--color-cream)] text-[var(--color-ink)] antialiased">
        <ThemeProvider>
          <PwaRegister />
          <div className="meow-app-shell mx-auto flex min-h-dvh w-full max-w-[480px] flex-col bg-[var(--color-cream)]">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
