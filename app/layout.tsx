import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  const title = "Адыгэ Хасэ Краснодарского края";
  const description =
    "Региональный культурно-просветительский центр: новости, проекты, события и контакты Адыгэ Хасэ Краснодарского края.";

  return {
    title,
    description,
    alternates: { canonical: origin },
    openGraph: {
      title,
      description,
      type: "website",
      locale: "ru_RU",
      url: origin,
      images: [
        {
          url: `${origin}/og-vk.png`,
          width: 1080,
          height: 1080,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${origin}/og-vk.png`],
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
