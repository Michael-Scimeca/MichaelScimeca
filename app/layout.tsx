import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-lora",
});

export const metadata: Metadata = {
  title: "Michael Scimeca | Full-Stack Web Developer & AI Automation Specialist",
  description: "Full-stack web developer and AI automation specialist helping startups and brands create beautiful, high-performing digital products. Expert in WordPress, HTML, CSS, JavaScript, Next.js, and AI automation.",
  keywords: [
    "web developer",
    "full-stack developer",
    "AI automation",
    "Next.js developer",
    "WordPress developer",
    "JavaScript developer",
    "React developer",
    "Michael Scimeca",
    "Mikey Scimeca",
    "web design",
    "digital products",
    "UI/UX design"
  ],
  authors: [{ name: "Michael Scimeca" }],
  creator: "Michael Scimeca",
  publisher: "Michael Scimeca",
  metadataBase: new URL('https://michaelscimeca.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://michaelscimeca.com",
    title: "Michael Scimeca | Full-Stack Web Developer & AI Automation Specialist",
    description: "Full-stack web developer and AI automation specialist helping startups and brands create beautiful, high-performing digital products.",
    siteName: "Michael Scimeca Portfolio",
    images: [
      {
        url: "/profile.jpg",
        width: 1200,
        height: 630,
        alt: "Michael Scimeca - Web Developer & AI Automation Specialist",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Michael Scimeca | Full-Stack Web Developer & AI Automation Specialist",
    description: "Full-stack web developer and AI automation specialist helping startups and brands create beautiful, high-performing digital products.",
    images: ["/profile.jpg"],
    creator: "@mikeyscimeca",
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
  verification: {
    google: "G-K1EFNGT352",
  },
  category: "Technology",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* Google Analytics */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-K1EFNGT352"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-3X3QCH0C86');
        `}
      </Script>
      <body 
        className={`${inter.variable} ${lora.variable} font-sans`}
      >
        {children}
      </body>
    </html>
  );
}

