import { Jost, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "./providers";

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "Shilpalay - Fashion & Lifestyle E-commerce",
    template: "%s | Shilpalay",
  },
  description: "Discover premium fashion and lifestyle products at Shilpalay. Shop the latest trends in clothing, accessories, home décor, and more. Your one-stop destination for quality fashion and lifestyle essentials.",
  keywords: [
    "fashion",
    "lifestyle",
    "e-commerce",
    "clothing",
    "accessories",
    "home décor",
    "jewellery",
    "shopping",
    "online store",
    "fashion store",
  ],
  authors: [{ name: "Shilpalay" }],
  creator: "Shilpalay",
  publisher: "Shilpalay",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Shilpalay",
    title: "Shilpalay - Fashion & Lifestyle E-commerce",
    description: "Discover premium fashion and lifestyle products at Shilpalay. Shop the latest trends in clothing, accessories, home décor, and more.",
    images: [
      {
        url: "/logo/logo.png",
        width: 1200,
        height: 630,
        alt: "Shilpalay Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shilpalay - Fashion & Lifestyle E-commerce",
    description: "Discover premium fashion and lifestyle products at Shilpalay.",
    images: ["/logo/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/logo/favicon_io/favicon.ico", sizes: "any" },
      { url: "/logo/favicon_io/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/logo/favicon_io/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/logo/favicon_io/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/logo/favicon_io/site.webmanifest",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo/favicon_io/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/logo/favicon_io/apple-touch-icon.png" />
        <link rel="manifest" href="/logo/favicon_io/site.webmanifest" />
      </head>
      <body
        className={`${jost.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
