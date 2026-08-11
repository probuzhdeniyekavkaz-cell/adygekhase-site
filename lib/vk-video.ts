import cachedVideosJson from "../data/vk-videos.json";
import { decodeHtml, htmlToText } from "./vk-feed";

export const VK_VIDEO_URL = "https://vkvideo.ru/@adygkhase";
export const VK_WIDGET_URL = "https://vk.com/widget_community.php?gid=214046715&mode=2&width=640";

export type VkVideo = {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  views?: string;
  url: string;
};

export type VkVideoFeed = {
  videos: VkVideo[];
  isLive: boolean;
};

const cachedVideos = cachedVideosJson as VkVideo[];

function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return hours
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    : `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function videoTitle(block: string) {
  const postText = block.match(/<div class="wall_post_text"[^>]*>([\s\S]*?)<\/div>/i)?.[1];
  const firstLine = postText ? htmlToText(postText).split(/\n+/).find(Boolean)?.trim() : "";
  if (firstLine) return firstLine.length > 115 ? `${firstLine.slice(0, 112).trim()}…` : firstLine;

  const embedded = block.match(/class="a post_video_title"[^>]*>([\s\S]*?)<\/div>/i)?.[1];
  return embedded ? htmlToText(embedded) : "Видео Адыгэ Хасэ";
}

export function parseVkVideos(html: string): VkVideo[] {
  const blocks = html.match(
    /<div class="wcommunity_post">[\s\S]*?(?=<div class="wcommunity_post">|<script\b|<div class=['"]wcommunity_show_more)/gi,
  ) ?? [];

  return blocks.flatMap((block): VkVideo[] => {
    const id = block.match(/href="\/video-214046715_(\d+)/i)?.[1];
    if (!id) return [];

    const durationSeconds = Number(block.match(/data-duration="(\d+)"/i)?.[1] ?? 0);
    const thumbnail = block.match(/background-image:\s*url\((https:[^)]+)\)/i)?.[1];
    if (!thumbnail) return [];

    const viewsText = block.match(/class="post_video_views_count"[^>]*>([\s\S]*?)<\/div>/i)?.[1];
    return [{
      id,
      title: videoTitle(block),
      thumbnail: decodeHtml(thumbnail),
      duration: durationSeconds ? formatDuration(durationSeconds) : "",
      views: viewsText ? htmlToText(viewsText).replace(/\D/g, "") : undefined,
      url: `https://vkvideo.ru/video-214046715_${id}`,
    }];
  });
}

function mergeVideos(liveVideos: VkVideo[]) {
  const merged = new Map<string, VkVideo>();
  for (const video of [...liveVideos, ...cachedVideos]) {
    if (!merged.has(video.id)) merged.set(video.id, video);
  }
  return [...merged.values()].slice(0, 12);
}

export async function getVkVideos(): Promise<VkVideoFeed> {
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
    if (!response.ok) throw new Error("VK Video feed is unavailable");
    const html = new TextDecoder("windows-1251").decode(await response.arrayBuffer());
    const liveVideos = parseVkVideos(html);
    return { videos: mergeVideos(liveVideos), isLive: liveVideos.length > 0 };
  } catch {
    return { videos: cachedVideos, isLive: false };
  } finally {
    clearTimeout(timeout);
  }
}
