import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import { SideNav, BottomNav } from "@/components/layout/Nav";
import "./globals.css";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "Deutsch Lernapp",
  description: "Persönliche Deutsch-Lernapp",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#1d4ed8",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={roboto.variable}>
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <div className="flex min-h-screen">
          <SideNav />
          <main className="flex-1 pb-20 md:pb-0 overflow-auto">
            {children}
          </main>
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
