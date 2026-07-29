import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SITE_NAME, SITE_URL, SOCIAL_IMAGE_URL } from "../../../lib/site";
import { formatPostDate, getVkPost } from "../../../lib/vk-feed";
import { Breadcrumbs, InnerFooter, InnerHeader } from "../../site-shell";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const post = await getVkPost(id);
  if (!post) return { title: "Публикация не найдена", robots: { index: false, follow: true } };

  const canonical = `${SITE_URL}/news/${post.id}/`;
  const image = post.image ?? SOCIAL_IMAGE_URL;
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url: canonical,
      publishedTime: post.date,
      images: [{ url: image, alt: post.title }],
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.excerpt, images: [image] },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { id } = await params;
  const post = await getVkPost(id);
  if (!post) notFound();

  const canonical = `${SITE_URL}/news/${post.id}/`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "@id": `${canonical}#article`,
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    mainEntityOfPage: canonical,
    image: [post.image ?? SOCIAL_IMAGE_URL],
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/adyge-khase-logo-fixed.png` },
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Главная", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Новости", item: `${SITE_URL}/news/` },
      { "@type": "ListItem", position: 3, name: post.title, item: canonical },
    ],
  };

  return (
    <main className="inner-page article-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLd, breadcrumbJsonLd]).replace(/</g, "\\u003c") }} />
      <InnerHeader />
      <article>
        <header className="article-header">
          <div className="shell article-shell">
            <Breadcrumbs items={[{ label: "Новости", href: "/news/" }, { label: post.title }]} />
            <p className="eyebrow">Публикация Адыгэ Хасэ</p>
            <h1>{post.title}</h1>
            <p className="article-date"><time dateTime={post.date}>{formatPostDate(post.date)}</time></p>
          </div>
        </header>
        <div className="shell article-shell article-content">
          {post.image ? <img className="article-image" src={post.image} alt={post.title} referrerPolicy="no-referrer" /> : null}
          <div className="article-text">
            {post.text.split(/\n{2,}/).map((paragraph, index) => <p key={`${post.id}-${index}`}>{paragraph}</p>)}
          </div>
          <div className="article-actions">
            <a className="button button--gold" href={post.url} target="_blank" rel="noreferrer">Оригинал во ВКонтакте ↗</a>
            <a className="text-link" href="/news/">← Все новости</a>
          </div>
        </div>
      </article>
      <InnerFooter />
    </main>
  );
}
