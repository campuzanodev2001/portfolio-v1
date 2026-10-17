import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import NeonCursor from "@/components/NeonCursor";
import ScrollProgress from "@/components/ScrollProgress";
import BootLoader from "@/components/BootLoader";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const portfolioUrl = "https://portfolio-v1-navy-pi.vercel.app";

export const metadata: Metadata = {
  title: "Daniel Campuzano — Frontend Engineer | React · Next.js · TypeScript",
  description:
    "Frontend Engineer with 5+ years of experience. Specializing in React, Next.js, TypeScript and Tailwind. Building fast, pixel-perfect, and scalable interfaces. Open to freelance and remote positions.",
  authors: [{ name: "Daniel Campuzano" }],
  keywords: [
    "Frontend Engineer",
    "React",
    "Next.js",
    "TypeScript",
    "Tailwind CSS",
    "Framer Motion",
    "Firebase",
    "Frontend Developer",
    "UI Engineer",
    "Daniel Campuzano",
  ],
  metadataBase: new URL(portfolioUrl),
  alternates: {
    canonical: portfolioUrl,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    url: portfolioUrl,
    title: "Daniel Campuzano — Frontend Engineer | React · Next.js · TypeScript",
    description:
      "Frontend Engineer with 5+ years of experience. Specializing in React, Next.js, TypeScript and Tailwind. Building fast, pixel-perfect, and scalable interfaces. Open to freelance and remote positions.",
    images: [
      {
        url: "/daniel.jpg",
        width: 600,
        height: 600,
        alt: "Daniel Campuzano — Frontend Engineer",
      },
    ],
    siteName: "Daniel Campuzano — Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Daniel Campuzano — Frontend Engineer | React · Next.js · TypeScript",
    description:
      "Frontend Engineer with 5+ years of experience. Specializing in React, Next.js, TypeScript and Tailwind. Building fast, pixel-perfect, and scalable interfaces. Open to freelance and remote positions.",
    images: ["/daniel.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${spaceGrotesk.variable} ${inter.variable}`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
        <meta name="theme-color" content="#00dddd" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Daniel Campuzano",
              jobTitle: "Frontend Engineer",
              url: "https://portfolio-v1-navy-pi.vercel.app",
              image: "https://portfolio-v1-navy-pi.vercel.app/daniel.jpg",
              email: "danicampu56@gmail.com",
              sameAs: [
                "https://github.com/TioDanx",
                "https://www.linkedin.com/in/daniel-campuzano-7149552b7",
              ],
              knowsAbout: [
                "React",
                "Next.js",
                "TypeScript",
                "Tailwind CSS",
                "Framer Motion",
                "Firebase",
              ],
              description:
                "Frontend Engineer with 5+ years of experience building fast, pixel-perfect, and scalable interfaces. Open to freelance and remote positions.",
            }),
          }}
        />
      </head>
      <body className="antialiased">
        <BootLoader />
        <NeonCursor />
        <ScrollProgress />
        <div className="scanline-overlay" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
