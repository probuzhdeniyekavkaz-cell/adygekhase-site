import { readFile, writeFile } from "node:fs/promises";

const widgetUrl = "https://vk.com/widget_community.php?gid=214046715&mode=2&width=640";
const cachePath = new URL("../data/vk-videos.json", import.meta.url);

function decodeHtml(value) {
  const named = { amp: "&", apos: "'", gt: ">", lt: "<", nbsp: " ", quot: '"' };
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (entity, key) => {
    if (key.startsWith("#x")) return String.fromCodePoint(Number.parseInt(key.slice(2), 16));
    if (key.startsWith("#")) return String.fromCodePoint(Number.parseInt(key.slice(1), 10));
    return named[key.toLowerCase()] ?? entity;
  });
}

function htmlToText(value) {
  return decodeHtml(value
    .replace(/<button\b[^>]*>[\s\S]*?<\/button>/gi, "")
    .replace(/<img\b[^>]*alt=["']([^"']*)["'][^>]*>/gi, "$1")
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<[^>]+>/g, ""))
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s+/g, "\n")
    .trim();
}

function formatDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return hours
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    : `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function parseVideos(html) {
  const blocks = html.match(/<div class="wcommunity_post">[\s\S]*?(?=<div class="wcommunity_post">|<script\b|<div class=['"]wcommunity_show_more)/gi) ?? [];
  return blocks.flatMap((block) => {
    const id = block.match(/href="\/video-214046715_(\d+)/i)?.[1];
    const thumbnail = block.match(/background-image:\s*url\((https:[^)]+)\)/i)?.[1];
    if (!id || !thumbnail) return [];
    const postText = block.match(/<div class="wall_post_text"[^>]*>([\s\S]*?)<\/div>/i)?.[1];
    const embeddedTitle = block.match(/class="a post_video_title"[^>]*>([\s\S]*?)<\/div>/i)?.[1];
    const firstLine = postText ? htmlToText(postText).split(/\n+/).find(Boolean)?.trim() : "";
    const title = firstLine || (embeddedTitle ? htmlToText(embeddedTitle) : "Видео Адыгэ Хасэ");
    const seconds = Number(block.match(/data-duration="(\d+)"/i)?.[1] ?? 0);
    const viewsText = block.match(/class="post_video_views_count"[^>]*>([\s\S]*?)<\/div>/i)?.[1];
    return [{
      id,
      title: title.length > 115 ? `${title.slice(0, 112).trim()}…` : title,
      thumbnail: decodeHtml(thumbnail),
      duration: seconds ? formatDuration(seconds) : "",
      views: viewsText ? htmlToText(viewsText).replace(/\D/g, "") : undefined,
      url: `https://vkvideo.ru/video-214046715_${id}`,
    }];
  });
}

const response = await fetch(widgetUrl, {
  headers: {
    "Accept-Language": "ru-RU,ru;q=0.9",
    Cookie: "remixlang=0",
    "User-Agent": "Mozilla/5.0 (compatible; AdygeKhaseSite/1.0)",
  },
});
if (!response.ok) throw new Error(`VK widget returned ${response.status}`);
const html = new TextDecoder("windows-1251").decode(await response.arrayBuffer());
const liveVideos = parseVideos(html);
const cachedVideos = JSON.parse(await readFile(cachePath, "utf8"));
const merged = new Map();
for (const video of [...liveVideos, ...cachedVideos]) {
  if (!merged.has(video.id)) merged.set(video.id, video);
}
await writeFile(cachePath, `${JSON.stringify([...merged.values()].slice(0, 30), null, 2)}\n`);
console.log(`VK Video: найдено ${liveVideos.length}, сохранено ${merged.size}`);
