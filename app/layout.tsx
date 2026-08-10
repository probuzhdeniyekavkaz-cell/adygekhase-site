import type { Metadata } from "next";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, SOCIAL_IMAGE_URL } from "../lib/site";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: SITE_NAME, template: `%s — ${SITE_NAME}` },
    description: SITE_DESCRIPTION,
    alternates: { canonical: SITE_URL },
    icons: {
      icon: [
        { url: "/favicon-adyge-64.png", type: "image/png", sizes: "64x64" },
        { url: "/favicon-adyge.png", type: "image/png", sizes: "512x512" },
      ],
      shortcut: "/favicon-adyge-64.png",
      apple: "/apple-touch-icon.png",
    },
    openGraph: {
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      type: "website",
      locale: "ru_RU",
      url: SITE_URL,
      images: [
        {
          url: SOCIAL_IMAGE_URL,
          width: 1254,
          height: 1254,
          alt: SITE_NAME,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      images: [SOCIAL_IMAGE_URL],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
