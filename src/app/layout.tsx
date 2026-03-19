import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AccessibilityWidget } from "@/components/accessibility-widget"
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "Xerox Manager",
  description: "Gestão empresarial completa em um só lugar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${plusJakartaSans.variable} antialiased`}
      >
        <div id="seeb-content-wrapper">
          {children}
        </div>
        <AccessibilityWidget />
      </body>
    </html>
  );
}

