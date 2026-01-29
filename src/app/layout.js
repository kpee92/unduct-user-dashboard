import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../../public/custom-style.css";
import Providers from "@/store/Providers";
import AuthCookieSync from "@/components/AuthCookieSync";
// Root layout keeps only global providers and styles. Shells are applied per route group.

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Unduct - Crypto Trading Platform",
  description: "Modern cryptocurrency trading platform for secure and fast trading",
  icons: {
    icon: [
      { url: "/unduct.png", type: "image/png", sizes: "32x32" },
      { url: "/unduct.png", type: "image/png", sizes: "16x16" },
    ],
    shortcut: "/unduct.png",
    apple: "/unduct.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Providers>
          <AuthCookieSync />
          {children}
        </Providers>
      </body>
    </html>
  );
}
