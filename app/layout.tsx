import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/app/context";

export const metadata: Metadata = {
  title: "BidUp",
  description: "Aplicación de subastas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
