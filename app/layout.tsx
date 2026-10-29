import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/lib/site";

import "./globals.css";
import "./art.css";
import "./components.css";
import "./landing.css";
import "./docs.css";

/**
 * One typeface for the whole site, which is what a terminal has.
 *
 * JetBrains Mono is the face ascii.rest cuts its glyph-completeness font from,
 * so the box-drawing and block characters the art is made of land on exactly
 * the metrics the library draws for.
 */
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  generator: "Next.js",
  keywords: [
    "Tripon",
    "ralt",
    "compiled language",
    "systems programming",
    "embedded",
    "firmware",
    "microcontrollers",
    "compiler",
    "C99",
    "x86-64",
    "no undefined behavior",
  ],
  authors: [{ name: "TriponOSS", url: site.org }],
  creator: "TriponOSS",
  publisher: "TriponOSS",
  category: "technology",
  classification: "Developer documentation",
  referrer: "origin-when-cross-origin",
  formatDetection: { telephone: false, address: false, email: false },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: site.url,
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#090c11",
  colorScheme: "dark",
};

/**
 * What the site is, in the one shape search engines read without being told.
 * `SoftwareSourceCode` is the honest type: the artifact is a language and its
 * compiler, and both live in a public repository.
 */
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      url: site.url,
      name: site.name,
      description: site.description,
      inLanguage: "en",
      publisher: { "@id": `${site.url}/#org` },
    },
    {
      "@type": "Organization",
      "@id": `${site.url}/#org`,
      name: "TriponOSS",
      url: site.org,
      sameAs: [site.repo],
    },
    {
      "@type": "SoftwareSourceCode",
      "@id": `${site.url}/#tripon`,
      name: "Tripon",
      description: site.description,
      programmingLanguage: "Tripon",
      runtimePlatform: "C99, x86-64",
      codeRepository: site.repo,
      license: "https://opensource.org/licenses/MIT",
      isPartOf: { "@id": `${site.url}/#website` },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={mono.variable}>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </body>
    </html>
  );
}
