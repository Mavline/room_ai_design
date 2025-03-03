import "../styles/globals.css";
import { Metadata } from "next";
import { Toaster } from "react-hot-toast";

let title = "AI solutions for interior design";
let description = "Transform your space with our AI-powered interior design tool. Development by https://acty.dev/";
let ogimage = "/og-image.png";
let sitename = "interiordesgn.com";

export const metadata: Metadata = {
  title,
  description,
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    images: [ogimage],
    title,
    description,
    url: "https://interiordesgn.com",
    siteName: sitename,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    images: [ogimage],
    title,
    description,
  },
  keywords: "interior design, AI, room transformation, home design, acty.dev, AI development",
  authors: [{ name: "Interior Design Team", url: "https://acty.dev/" }],
  referrer: "origin",
  creator: "Acty.dev Team",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        {/* CSS is automatically included by Next.js */}
        <link rel="canonical" href="https://interiordesgn.com" />
        <link rel="alternate" href="https://acty.dev/" title="AI Development" />
      </head>
      <body className="bg-black text-white">
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
