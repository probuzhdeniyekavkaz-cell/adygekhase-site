import type { Metadata } from "next";
import { SITE_URL, VK_URL } from "../../lib/site";
import { formatPostDate, getVkFeed } from "../../lib/vk-feed";
import { Breadcrumbs, InnerFooter, InnerHeader } from "../site-shell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Новости и публикации",
  description: "Новости, события, проекты и публикации Адыгэ Хасэ Краснодарского края.",
  alternates: { canonical: `${SITE_URL}/news/` },
  openGraph: { url: `${SITE_URL}/news/`, type: "website" },
};

export default async function NewsPage() {
  const feed = await getVkFeed();

  return (
    <main className="inner-page news-index">
      <InnerHeader />
      <section className="inner-hero">
        <div className="shell">
          <Breadcrumbs items={[{ label: "Новости" }]} />
          <p className="eyebrow">Публикации</p>
          <h1>Новости Адыгэ Хасэ</h1>
          <p className="inner-lead">События, проекты, встречи и важные материалы организации Краснодарского края.</p>
        </div>
      </section>
      <section className="inner-content news-archive">
        <div className="shell">
          <div className="news-grid">
            {feed.posts.map((post, index) => (
              <article className={`news-card ${index === 0 ? "news-card--wide" : ""}`} key={post.id}>
                <a className="news-media" href={`/news/${post.id}/`} tabIndex={-1}>
                  {post.image ? (
                    <img src={post.image} alt="" loading={index === 0 ? "eager" : "lazy"} referrerPolicy="no-referrer" />
                  ) : (
                    <span className="news-placeholder" aria-hidden="true"><b>АХ</b><i>{String(index + 1).padStart(2, "0")}</i></span>
                  )}
                </a>
                <div className="news-body">
                  <p className="post-meta"><time dateTime={post.date}>{formatPostDate(post.date)}</time></p>
                  <h2><a href={`/news/${post.id}/`}>{post.title}</a></h2>
                  <p>{post.excerpt}</p>
                  <a className="card-link" href={`/news/${post.id}/`} aria-label={`Читать публикацию: ${post.title}`}>Читать <span aria-hidden="true">→</span></a>
                </div>
              </article>
            ))}
          </div>
          <div className="archive-footer">
            <p>{feed.isLive ? "Материалы обновлены из официального сообщества ВКонтакте." : "Показаны сохранённые материалы организации."}</p>
            <a className="text-link" href={VK_URL} target="_blank" rel="noreferrer">Все публикации ВКонтакте ↗</a>
          </div>
        </div>
      </section>
      <InnerFooter />
    </main>
  );
}
