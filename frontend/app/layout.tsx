import type React from "react";
import type { Metadata } from "next";
import Script from "next/script";
import { Poppins, Playfair_Display } from "next/font/google";
import { ScrollAnimation } from "@/lib/scroll-animation";
import { AuthProvider } from "@/hooks/useAuth";
import { ToastContainer } from "react-toastify";

// @ts-ignore: side-effect import of global CSS
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://indoglobaltradefair.com"),

  title:
    "Indo Global Trade Fair 2025 - Where Indian Enterprise Meets the World",
  description:
    "Join the premier B2B platform connecting India's MSMEs with global markets. 16 sectors, 400+ exhibitors, 6000+ buyers from 40+ countries.",

  openGraph: {
    images: [
      {
        url: "/logo.webp", // ✅ now resolves to full absolute URL
        width: 1200,
        height: 630,
        alt: "Indo Global Trade Fair Logo",
      },
    ],
  },

  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/logo.webp", sizes: "48x48", type: "image/webp" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
    other: [{ rel: "manifest", url: "/site.webmanifest" }],
  },

  verification: {
    google: "ZMTw3lFcN3OPEx8QZYag7njklj1EHh4bYewTakdW5k0",
  },
  other: {
    "msvalidate.01": "2033D3602319835387E186A9B53A9B5B",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* ✅ Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-N0BCNYHCMM"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-N0BCNYHCMM');
          `}
        </Script>
      </head>

      <body
        className={`${poppins.variable} ${playfair.variable} font-sans antialiased overflow-x-hidden max-w-screen`}
      >
        <AuthProvider>{children}</AuthProvider>

        {/* ✅ React Toastify Global Config */}
        <ToastContainer
          position="top-right"
          autoClose={1500}
          newestOnTop={false}
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />

        <ScrollAnimation />
      </body>
    </html>
  );
}
