const VK_WIDGET_URL = "https://vk.com/widget_community.php?gid=214046715&mode=2&width=640";

export type VkPost = {
  id: string;
  title: string;
  excerpt: string;
  text: string;
  image?: string;
  date: string;
  views?: string;
  url: string;
};

export type VkFeed = {
  subscribers: string;
  posts: VkPost[];
  isLive: boolean;
};

export const fallbackPosts: VkPost[] = [
  {
    id: "2878",
    title: "Поздравляем Кима Схашока с победой на чемпионате России",
    excerpt:
      "Высшая награда и титул трёхкратного чемпиона России по вольной борьбе — заслуженный результат огромной работы и воли к победе.",
    text: "Высшая награда и титул трёхкратного чемпиона России по вольной борьбе — заслуженный результат огромной работы и воли к победе.",
    date: "2026-07-28T16:58:00+03:00",
    url: "https://vk.ru/wall-214046715_2878",
  },
  {
    id: "2876",
    title: "«Легенды российской анимации» в Армавире",
    excerpt:
      "Масштабная мультимедийная выставка пройдёт с 3 по 9 августа в Городском Дворце культуры.",
    text: "Масштабная мультимедийная выставка пройдёт с 3 по 9 августа в Городском Дворце культуры.",
    date: "2026-07-27T16:41:00+03:00",
    url: "https://vk.ru/wall-214046715_2876",
  },
];

export function decodeHtml(value: string) {
  const named: Record<string, string> = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"',
  };

  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (entity, key: string) => {
    if (key.startsWith("#x")) return String.fromCodePoint(Number.parseInt(key.slice(2), 16));
    if (key.startsWith("#")) return String.fromCodePoint(Number.parseInt(key.slice(1), 10));
    return named[key.toLowerCase()] ?? entity;
  });
}

export function htmlToText(value: string) {
  return decodeHtml(
    value
      .replace(/<button\b[^>]*>[\s\S]*?<\/button>/gi, "")
      .replace(/<img\b[^>]*alt=["']([^"']*)["'][^>]*>/gi, "$1")
      .replace(/<br\s*\/?\s*>/gi, "\n")
      .replace(/<\/(?:blockquote|p)>/gi, "\n")
      .replace(/<[^>]+>/g, ""),
  )
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function makeExcerpt(text: string, maxLength = 210) {
  const compact = text.replace(/\s+/g, " ").trim();
  if (compact.length <= maxLength) return compact;
  return `${compact.slice(0, maxLength).replace(/\s+\S*$/, "")}…`;
}

function makeTitle(text: string) {
  const firstLine = text.split(/\n+/).find((line) => line.trim()) ?? text;
  const clean = firstLine.replace(/^[^А-Яа-яA-Za-z0-9«]+/u, "").trim();
  return makeExcerpt(clean || "Публикация Адыгэ Хасэ", 92);
}

const vkMonths: Record<string, number> = {
  января: 1,
  февраля: 2,
  марта: 3,
  апреля: 4,
  мая: 5,
  июня: 6,
  июля: 7,
  августа: 8,
  сентября: 9,
  октября: 10,
  ноября: 11,
  декабря: 12,
};

function parseVkDate(value: string) {
  const text = htmlToText(value).toLowerCase();
  const time = text.match(/(\d{1,2}):(\d{2})/);
  const now = new Date();
  const todayParts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Europe/Moscow",
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    todayParts.find((item) => item.type === type)?.value ?? "01";
  const hour = time?.[1]?.padStart(2, "0") ?? "12";
  const minute = time?.[2] ?? "00";

  if (text.includes("сегодня") || text.includes("вчера")) {
    const date = new Date(`${part("year")}-${part("month")}-${part("day")}T${hour}:${minute}:00+03:00`);
    if (text.includes("вчера")) date.setUTCDate(date.getUTCDate() - 1);
    return date.toISOString();
  }

  const fullDate = text.match(/(\d{1,2})\s+([а-яё]+)\s+(\d{4})/i);
  if (fullDate) {
    const month = vkMonths[fullDate[2].toLowerCase()];
    if (month) {
      return new Date(
        `${fullDate[3]}-${String(month).padStart(2, "0")}-${fullDate[1].padStart(2, "0")}T${hour}:${minute}:00+03:00`,
      ).toISOString();
    }
  }

  return now.toISOString();
}

export function parseVkFeed(html: string): VkFeed {
  const membersHtml = html.match(/id="members_count"[^>]*>([\s\S]*?)<\/a>/i)?.[1] ?? "";
  const subscribers = htmlToText(membersHtml).replace(/\D/g, "") || "3858";
  const blocks = html.match(
    /<div class="wcommunity_post">[\s\S]*?(?=<div class="wcommunity_post">|<script\b|<\/body>)/gi,
  ) ?? [];

  const posts = blocks
    .map((block): VkPost | null => {
      const id = block.match(/href="\/wall-214046715_(\d+)"/i)?.[1];
      const dateHtml = block.match(/class="wcommunity_post_date"[^>]*>([\s\S]*?)<\/a>/i)?.[1];
      const textHtml = block.match(/<div class="wall_post_text"[^>]*>([\s\S]*?)<\/div>/i)?.[1];
      if (!id || !dateHtml || !textHtml) return null;

      const text = htmlToText(textHtml);
      if (!text) return null;
      const image = block.match(/background-image:\s*url\((https:[^)]+)\)/i)?.[1];

      return {
        id,
        title: makeTitle(text),
        excerpt: makeExcerpt(text),
        text,
        image: image ? decodeHtml(image) : undefined,
        date: parseVkDate(dateHtml),
        url: `https://vk.ru/wall-214046715_${id}`,
      };
    })
    .filter((post): post is VkPost => Boolean(post))
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
    .slice(0, 12);

  return {
    subscribers,
    posts: posts.length ? posts : fallbackPosts,
    isLive: posts.length > 0,
  };
}

export async function getVkFeed(): Promise<VkFeed> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(VK_WIDGET_URL, {
      cache: "no-store",
      headers: {
        "Accept-Language": "ru-RU,ru;q=0.9",
        Cookie: "remixlang=0",
        "User-Agent": "Mozilla/5.0 (compatible; AdygeKhaseSite/1.0)",
      },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error("VK feed is unavailable");
    const html = new TextDecoder("windows-1251").decode(await response.arrayBuffer());
    return parseVkFeed(html);
  } catch {
    return { subscribers: "3858", posts: fallbackPosts, isLive: false };
  } finally {
    clearTimeout(timeout);
  }
}

export async function getVkPost(id: string) {
  const feed = await getVkFeed();
  return feed.posts.find((post) => post.id === id);
}

export function formatPostDate(value: string, locale: "ru" | "tr" = "ru") {
  return new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Moscow",
  }).format(new Date(value));
}
