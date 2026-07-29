import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/site";
import { getVkFeed } from "../lib/vk-feed";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const feed = await getVkFeed();
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/tr/`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/about/`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/projects/`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/news/`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/contacts/`, changeFrequency: "monthly", priority: 0.7 },
  ];
  return [
    ...staticPages,
    ...feed.posts.map((post) => ({
      url: `${SITE_URL}/news/${post.id}/`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
