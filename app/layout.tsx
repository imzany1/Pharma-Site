import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { CartProvider } from "./context/CartContext";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "PharmaCorp | Advancing Global Health",
  description: "Innovation in pharmaceuticals and healthcare solutions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="antialiased min-h-screen bg-background text-foreground font-sans"
      >
        <Providers>
          <CartProvider>
            {children}
            <Analytics />
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}

