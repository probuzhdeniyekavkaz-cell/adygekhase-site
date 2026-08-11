export const SITE_URL = "https://adygekhase.ru";
export const SITE_NAME = "Адыгэ Хасэ Краснодарского края";
export const SITE_DESCRIPTION =
  "Региональный культурно-просветительский центр: новости, проекты, события и контакты Адыгэ Хасэ Краснодарского края.";
export const LOGO_URL = `${SITE_URL}/adyge-khase-logo-fixed.png`;
export const SOCIAL_IMAGE_URL = `${SITE_URL}/og-green.png`;

export const TELEGRAM_URL = "https://t.me/adygkhase";
export const VK_URL = "https://vk.ru/adygkhase";
export const VK_VIDEO_URL = "https://vkvideo.ru/@adygkhase";
export const MAX_URL = "https://max.ru/institute_of_history";

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  alternateName: "Адыгэ Хасэ (Адыгский (Черкесский) Совет)",
  url: SITE_URL,
  logo: LOGO_URL,
  image: SOCIAL_IMAGE_URL,
  description: SITE_DESCRIPTION,
  areaServed: {
    "@type": "AdministrativeArea",
    name: "Краснодарский край",
  },
  sameAs: [VK_URL, VK_VIDEO_URL, MAX_URL],
  location: [
    {
      "@type": "Place",
      name: "Центр Адыгэ Хасэ в Краснодаре",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Краснодар",
        streetAddress: "ул. Бабушкина, 146, 2 этаж, офис 212",
        addressRegion: "Краснодарский край",
        addressCountry: "RU",
      },
    },
    {
      "@type": "Place",
      name: "Центр Адыгэ Хасэ в Армавире",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Армавир",
        streetAddress: "ул. Софьи Перовской, 28",
        addressRegion: "Краснодарский край",
        addressCountry: "RU",
      },
    },
  ],
};

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  inLanguage: ["ru", "tr"],
  publisher: { "@id": `${SITE_URL}/#organization` },
};
