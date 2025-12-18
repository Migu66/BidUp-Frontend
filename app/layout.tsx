import type { Metadata } from "next";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
