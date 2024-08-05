import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import PlausibleProvider from "next-plausible";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Your Digital Menu Effortlessly",
  description:
    "Join our platform and start offering a seamless ordering experience to your customers.",
};
const plausibleDomain = "allrestaurants.menu";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PlausibleProvider domain={plausibleDomain}>
          {children}
        </PlausibleProvider>
      </body>
    </html>
  );
}
