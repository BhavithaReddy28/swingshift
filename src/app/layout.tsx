import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SwingShift | Golfing for Impact & Prize Draws",
  description:
    "Play golf, track rolling scores, win monthly jackpot draws, and empower charities with 10%+ of your subscription.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} dark`}>
      <body className="min-h-screen bg-transparent text-gray-100 antialiased flex flex-col selection:bg-primary/30 selection:text-orange-200">
        {children}
      </body>
    </html>
  );
}
