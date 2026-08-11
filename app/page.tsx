import type { Metadata } from "next";
import { headers } from "next/headers";
import {
  MAX_URL,
  SITE_URL,
  TELEGRAM_URL,
  VK_VIDEO_URL,
  VK_URL,
  organizationJsonLd,
  websiteJsonLd,
} from "../lib/site";
import { getVkFeed, htmlToText } from "../lib/vk-feed";
import { getVkVideos } from "../lib/vk-video";

const TELEGRAM_HANDLE = "adygkhase";
const TELEGRAM_FEED_URL = `https://t.me/s/${TELEGRAM_HANDLE}`;

export const dynamic = "force-dynamic";

type Locale = "ru" | "tr";

const copy = {
  ru: {
    skip: "Перейти к содержанию",
    homeLabel: "Адыгэ Хасэ — на главную",
    nav: ["Об организации", "Направления", "Публикации", "Видео", "Соцсети", "Контакты"],
    menu: "Меню",
    region: "Краснодарский край",
    heroTitle: "Культура, которая",
    heroAccent: "объединяет поколения",
    heroLead: "Региональный культурно-просветительский центр: сохраняем наследие, поддерживаем молодёжь и создаём пространство для диалога.",
    latestNews: "Последние новости",
    learnMore: "Узнать о Хасэ",
    factsLabel: "Кратко об организации",
    monthlySocialReach: "охватов в социальных сетях ежемесячно",
    centers: "центра в крае",
    generations: "живая связь поколений",
    fromVk: "из ВКонтакте",
    latestPost: "Последняя публикация",
    views: "просмотров",
    newsFallback: "Новости Адыгэ Хасэ",
    readVk: "Читать во ВКонтакте",
    aboutEyebrow: "Об организации",
    aboutTitle: "Дом культуры, знаний и общего дела",
    aboutIntro: "«Адыгэ Хасэ» объединяет людей, которым важно сохранять адыгский язык, историю и традиции — и передавать их дальше в живом, современном формате.",
    organizationDescription: "Общественная организация — региональный культурно-просветительский центр Краснодарского края «Адыгэ Хасэ (Адыгский (Черкесский) Совет)».",
    sourceLive: "Публикации обновлены из официального сообщества ВКонтакте",
    sourcePaused: "Показаны сохранённые публикации; ВКонтакте временно недоступен",
    workEyebrow: "Направления работы",
    workTitle: "Сохранять. Просвещать. Объединять.",
    workLead: "От встреч с носителями традиций до современных образовательных проектов — работа Хасэ охватывает весь край.",
    directions: [
      ["Культура и язык", "Вечера фольклора, история, родной язык, танец и проекты по сохранению нематериального наследия."],
      ["Молодёжные проекты", "Дискуссионные клубы, образовательные встречи, волонтёрство и поддержка инициатив нового поколения."],
      ["Общественный диалог", "Партнёрство с культурными центрами, общественными объединениями и соседними регионами."],
      ["События и просвещение", "Выставки, лекции, творческие встречи, семейные программы и открытые мероприятия в Армавире и Краснодаре."],
    ],
    publications: "Публикации",
    newsTitle: "Сейчас в Хасэ",
    allVk: "Все публикации ВКонтакте",
    read: "Читать",
    readPost: "Читать публикацию",
    feedStatus: "Лента загружается из официального сообщества ВКонтакте и обновляется при каждом посещении сайта.",
    videoEyebrow: "VK Видео",
    videoTitle: "Смотрите Адыгэ Хасэ",
    videoLead: "Интервью, лекции, встречи и видеорассказы о культуре, истории и людях адыгского мира.",
    allVideos: "Все видео канала",
    watchVideo: "Смотреть видео",
    videoSourceLive: "Новые ролики автоматически появляются здесь из официального канала VK Видео.",
    videoSourcePaused: "Показана сохранённая подборка канала; автоматическое обновление продолжится после восстановления связи с VK Видео.",
    mediaEyebrow: "Медиа Адыгэ Хасэ",
    socialTitle: "Ищите нас в различных социальных сетях",
    socialLead: "Общее число подписчиков медиа «Адыгэ Хасэ» Краснодарского края — свыше 50 000 человек, а ежемесячный охват превышает один миллион. Следите за новостями, проектами и встречами там, где вам удобно.",
    audienceLabel: "Аудитория медиа Адыгэ Хасэ",
    mediaSubscribers: "подписчиков медиасети",
    reachValue: "1 млн+",
    monthlyReach: "охватов ежемесячно",
    subscriber: "подписчиков",
    vk: "ВКонтакте",
    organizationChannel: "Канал организации",
    openChannel: "Открыть канал",
    contactEyebrow: "Будем на связи",
    contactTitle: "Приходите в Хасэ",
    contactLead: "Узнавайте о встречах и новых проектах во ВКонтакте. Двери наших центров открыты для тех, кому близки культура, просвещение и общее дело.",
    subscribe: "Открыть ВКонтакте",
    armavir: "Армавир",
    armavirAddress: "ул. Софьи Перовской, 28",
    krasnodar: "Краснодар",
    krasnodarAddress: "ул. Бабушкина, 146",
    office: "2 этаж, офис 212",
    map: "Открыть на карте",
    footerDescription: "Региональный культурно-просветительский центр Краснодарского края",
    top: "Наверх",
    copyright: "«Адыгэ Хасэ» Краснодарского края",
    footerSource: "Информация и публикации: официальное сообщество ВКонтакте",
  },
  tr: {
    skip: "İçeriğe geç",
    homeLabel: "Adıge Hase — ana sayfa",
    nav: ["Kurum hakkında", "Çalışma alanları", "Yayınlar", "Videolar", "Sosyal medya", "İletişim"],
    menu: "Menü",
    region: "Krasnodar Bölgesi",
    heroTitle: "Kuşakları birleştiren",
    heroAccent: "yaşayan kültür",
    heroLead: "Bölgesel kültür ve eğitim merkezi: mirasımızı koruyor, gençleri destekliyor ve diyalog için alan yaratıyoruz.",
    latestNews: "Son haberler",
    learnMore: "Hase hakkında",
    factsLabel: "Kurum hakkında kısa bilgi",
    monthlySocialReach: "sosyal ağlarda aylık erişim",
    centers: "bölgesel merkez",
    generations: "kuşaklar arasında canlı bağ",
    fromVk: "VKontakte'den · Rusça",
    latestPost: "Son yayın",
    views: "görüntülenme",
    newsFallback: "Adıge Hase haberleri",
    readVk: "VKontakte'de oku",
    aboutEyebrow: "Kurum hakkında",
    aboutTitle: "Kültürün, bilginin ve ortak emeğin evi",
    aboutIntro: "Adıge Hase; Adıge dilini, tarihini ve geleneklerini yaşatmak ve onları çağdaş, canlı bir biçimde gelecek kuşaklara aktarmak isteyen insanları bir araya getirir.",
    organizationDescription: "Adıge Hase (Adıge/Çerkes Konseyi), Krasnodar Bölgesi'nde faaliyet gösteren bölgesel bir kültür ve eğitim merkezi ile sivil toplum kuruluşudur.",
    sourceLive: "Yayınlar resmî VKontakte topluluğundan güncellendi",
    sourcePaused: "Kayıtlı yayınlar gösteriliyor; VKontakte'ye geçici olarak ulaşılamıyor",
    workEyebrow: "Çalışma alanları",
    workTitle: "Korumak. Öğretmek. Birleştirmek.",
    workLead: "Gelenek taşıyıcılarıyla buluşmalardan çağdaş eğitim projelerine kadar Hase'nin çalışmaları tüm bölgeyi kapsar.",
    directions: [
      ["Kültür ve dil", "Folklor geceleri, tarih, ana dil, dans ve somut olmayan kültürel mirası koruma projeleri."],
      ["Gençlik projeleri", "Tartışma kulüpleri, eğitim buluşmaları, gönüllülük ve yeni kuşağın girişimlerine destek."],
      ["Toplumsal diyalog", "Kültür merkezleri, sivil toplum kuruluşları ve komşu bölgelerle iş birliği."],
      ["Etkinlikler ve eğitim", "Armavir ve Krasnodar'da sergiler, konferanslar, yaratıcı buluşmalar, aile programları ve halka açık etkinlikler."],
    ],
    publications: "Yayınlar",
    newsTitle: "Hase'de bugün",
    allVk: "VKontakte'deki tüm yayınlar",
    read: "Oku",
    readPost: "Yayını oku",
    feedStatus: "Yayınlar resmî VKontakte topluluğundan Rusça olarak alınır ve site her ziyaret edildiğinde güncellenir.",
    videoEyebrow: "VK Video",
    videoTitle: "Adıge Hase'yi izleyin",
    videoLead: "Adıge dünyasının kültürü, tarihi ve insanları hakkında röportajlar, konferanslar, buluşmalar ve video anlatıları.",
    allVideos: "Kanaldaki tüm videolar",
    watchVideo: "Videoyu izle",
    videoSourceLive: "Yeni videolar resmî VK Video kanalından otomatik olarak burada yayınlanır.",
    videoSourcePaused: "Kanalın kayıtlı seçkisi gösteriliyor; VK Video bağlantısı yeniden kurulduğunda otomatik güncelleme sürecek.",
    mediaEyebrow: "Adıge Hase Medyası",
    socialTitle: "Bizi farklı sosyal ağlarda bulun",
    socialLead: "Krasnodar Bölgesi Adıge Hase medya ağının toplam abone sayısı 50.000'i, aylık erişimi ise bir milyonu aşmaktadır. Haberleri, projeleri ve buluşmaları size en uygun platformdan takip edin.",
    audienceLabel: "Adıge Hase medya kitlesi",
    mediaSubscribers: "medya ağı abonesi",
    reachValue: "1 milyon+",
    monthlyReach: "aylık erişim",
    subscriber: "abone",
    vk: "VKontakte",
    organizationChannel: "Kurumun kanalı",
    openChannel: "Kanalı aç",
    contactEyebrow: "İletişimde kalalım",
    contactTitle: "Hase'ye bekliyoruz",
    contactLead: "Buluşmalar ve yeni projeler için VKontakte topluluğumuzu takip edin. Kültüre, eğitime ve ortak çalışmaya değer veren herkese merkezlerimizin kapıları açıktır.",
    subscribe: "VKontakte'yi aç",
    armavir: "Armavir",
    armavirAddress: "Sofya Perovskaya Cd. 28",
    krasnodar: "Krasnodar",
    krasnodarAddress: "Babuşkina Cd. 146",
    office: "2. kat, ofis 212",
    map: "Haritada aç",
    footerDescription: "Krasnodar Bölgesi bölgesel kültür ve eğitim merkezi",
    top: "Yukarı",
    copyright: "Krasnodar Bölgesi Adıge Hase",
    footerSource: "Bilgi ve yayın kaynağı: resmî VKontakte topluluğu",
  },
} as const;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const locale: Locale = params.lang === "tr" ? "tr" : "ru";
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = host.startsWith("localhost") ? `${protocol}://${host}` : SITE_URL;
  const title = locale === "tr" ? "Krasnodar Bölgesi Adıge Hase" : "Адыгэ Хасэ Краснодарского края";
  const description = locale === "tr"
    ? "Krasnodar Bölgesi Adıge Hase kültür ve eğitim merkezinin haberleri, projeleri, etkinlikleri ve iletişim bilgileri."
    : "Региональный культурно-просветительский центр: новости, проекты, события и контакты Адыгэ Хасэ Краснодарского края.";
  const url = locale === "tr" ? `${origin}/?lang=tr` : origin;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: { ru: origin, tr: `${origin}/?lang=tr` },
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale === "tr" ? "tr_TR" : "ru_RU",
      url,
      images: [{ url: `${origin}/og-green.png`, width: 1254, height: 1254, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [`${origin}/og-green.png`] },
  };
}

async function getTelegramSubscribers(locale: Locale) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(TELEGRAM_FEED_URL, {
      cache: "no-store",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; AdygeKhaseSite/1.0)" },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error("Telegram counter is unavailable");
    const html = await response.text();
    const rawCount = html.match(
      /<span class="counter_value">([^<]+)<\/span>\s*<span class="counter_type">subscribers<\/span>/i,
    )?.[1];
    if (!rawCount) throw new Error("Telegram subscriber count is unavailable");
    return htmlToText(rawCount).replace(/тыс\.?/gi, locale === "tr" ? "bin" : "тыс.");
  } catch {
    return locale === "tr" ? "2,1 bin+" : "2,1 тыс.+";
  } finally {
    clearTimeout(timeout);
  }
}

function formatDate(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Moscow",
  }).format(new Date(value));
}

function Logo({ compact = false, locale = "ru" }: { compact?: boolean; locale?: Locale }) {
  return (
    <span className={compact ? "logo-lockup logo-lockup--compact" : "logo-lockup"}>
      <img
        src="/adyge-khase-logo-fixed.png"
        alt={locale === "tr" ? "Krasnodar Bölgesi Adıge Hase" : "Адыгэ Хасэ Краснодарского края"}
      />
    </span>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const params = await searchParams;
  const locale: Locale = params.lang === "tr" ? "tr" : "ru";
  const t = copy[locale];
  const [feed, videoFeed, telegramSubscribers] = await Promise.all([
    getVkFeed(),
    getVkVideos(),
    getTelegramSubscribers(locale),
  ]);
  const vkSubscribers = new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "ru-RU").format(
    Number(feed.subscribers),
  );
  const [featured, ...recentPosts] = feed.posts;

  return (
    <main lang={locale}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([organizationJsonLd, websiteJsonLd]).replace(/</g, "\\u003c"),
        }}
      />
      <a className="skip-link" href="#content">{t.skip}</a>

      <header className="site-header">
        <div className="shell header-inner">
          <a className="brand" href={locale === "tr" ? "/?lang=tr#top" : "/#top"} aria-label={t.homeLabel}><Logo locale={locale} /></a>
          <nav className="desktop-nav" aria-label={locale === "tr" ? "Ana navigasyon" : "Основная навигация"}>
            <a href="#about">{t.nav[0]}</a>
            <a href="#work">{t.nav[1]}</a>
            <a href="#news">{t.nav[2]}</a>
            <a href="#videos">{t.nav[3]}</a>
            <a href="#social">{t.nav[4]}</a>
            <a href="#contacts">{t.nav[5]}</a>
          </nav>
          <div className="header-actions">
            <div className="language-switch" aria-label="Language / Язык">
              <a className={locale === "ru" ? "is-active" : ""} href="/#top" lang="ru">RU</a>
              <a className={locale === "tr" ? "is-active" : ""} href="/?lang=tr#top" lang="tr">TR</a>
            </div>
            <a className="header-cta" href={VK_URL} target="_blank" rel="noreferrer">
              {t.vk} <span aria-hidden="true">↗</span>
            </a>
          </div>
          <details className="mobile-menu">
            <summary aria-label={t.menu}>{t.menu}</summary>
            <nav aria-label={locale === "tr" ? "Mobil navigasyon" : "Мобильная навигация"}>
              <a href="#about">{t.nav[0]}</a>
              <a href="#work">{t.nav[1]}</a>
              <a href="#news">{t.nav[2]}</a>
              <a href="#videos">{t.nav[3]}</a>
              <a href="#social">{t.nav[4]}</a>
              <a href="#contacts">{t.nav[5]}</a>
            </nav>
          </details>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-pattern" aria-hidden="true" />
        <div className="shell hero-grid" id="content">
          <div className="hero-copy">
            <p className="eyebrow">{t.region}</p>
            <h1>{t.heroTitle}<span>{t.heroAccent}</span></h1>
            <p className="hero-lead">{t.heroLead}</p>
            <div className="hero-actions">
              <a className="button button--light" href="#news">{t.latestNews}</a>
              <a className="text-link text-link--light" href="#about">{t.learnMore} <span aria-hidden="true">↓</span></a>
            </div>
            <div className="hero-facts" aria-label={t.factsLabel}>
              <div><strong>{t.reachValue}</strong><span>{t.monthlySocialReach}</span></div>
              <div><strong>2</strong><span>{t.centers}</span></div>
              <div><strong>∞</strong><span>{t.generations}</span></div>
            </div>
          </div>

          <article className="featured-card">
            <div className="featured-media">
              {featured?.image ? (
                <img src={featured.image} alt="" referrerPolicy="no-referrer" />
              ) : (
                <div className="featured-placeholder" aria-hidden="true">
                  <span>{locale === "tr" ? "Adıge" : "Адыгэ"}</span>
                  <strong>{locale === "tr" ? "Hase" : "Хасэ"}</strong>
                </div>
              )}
              <span className="live-badge"><i aria-hidden="true" /> {t.fromVk}</span>
            </div>
            <div className="featured-body">
              <p className="post-meta">
                {featured ? formatDate(featured.date, locale) : t.latestPost}
                {featured?.views ? <span>{featured.views} {t.views}</span> : null}
              </p>
              <h2>{featured?.title ?? t.newsFallback}</h2>
              <p>{featured?.excerpt}</p>
              <a href={featured ? `/news/${featured.id}/` : VK_URL}>{t.readPost} <span aria-hidden="true">→</span></a>
            </div>
          </article>
        </div>
      </section>

      <section className="about-section" id="about">
        <div className="shell about-grid">
          <div className="section-heading">
            <p className="eyebrow eyebrow--dark">{t.aboutEyebrow}</p>
            <h2>{t.aboutTitle}</h2>
          </div>
          <div className="about-copy">
            <p className="about-intro">{t.aboutIntro}</p>
            <p>{t.organizationDescription}</p>
            <div className="source-note">
              <span className={feed.isLive ? "source-dot" : "source-dot source-dot--paused"} />
              {feed.isLive ? t.sourceLive : t.sourcePaused}
            </div>
          </div>
        </div>
      </section>

      <section className="work-section" id="work">
        <div className="shell">
          <div className="section-topline">
            <div>
              <p className="eyebrow eyebrow--dark">{t.workEyebrow}</p>
              <h2>{t.workTitle}</h2>
            </div>
            <p>{t.workLead}</p>
          </div>

          <div className="direction-grid">
            <article className="direction-card direction-card--primary">
              <span className="direction-number">01</span><div className="direction-symbol" aria-hidden="true">Ӏ</div>
              <h3>{t.directions[0][0]}</h3>
              <p>{t.directions[0][1]}</p>
            </article>
            <article className="direction-card">
              <span className="direction-number">02</span><div className="direction-symbol" aria-hidden="true">◎</div>
              <h3>{t.directions[1][0]}</h3>
              <p>{t.directions[1][1]}</p>
            </article>
            <article className="direction-card">
              <span className="direction-number">03</span><div className="direction-symbol" aria-hidden="true">◇</div>
              <h3>{t.directions[2][0]}</h3>
              <p>{t.directions[2][1]}</p>
            </article>
            <article className="direction-card">
              <span className="direction-number">04</span><div className="direction-symbol" aria-hidden="true">✦</div>
              <h3>{t.directions[3][0]}</h3>
              <p>{t.directions[3][1]}</p>
            </article>
          </div>
        </div>
      </section>

      <section className="news-section" id="news">
        <div className="shell">
          <div className="section-topline section-topline--news">
            <div><p className="eyebrow eyebrow--dark">{t.publications}</p><h2>{t.newsTitle}</h2></div>
            <a className="text-link" href="/news/">{locale === "tr" ? "Tüm haberler" : "Все новости"} <span aria-hidden="true">→</span></a>
          </div>

          <div className="news-grid">
            {recentPosts.slice(0, 6).map((post, index) => (
              <article className={`news-card ${index === 0 ? "news-card--wide" : ""}`} key={post.id}>
                <a className="news-media" href={`/news/${post.id}/`} tabIndex={-1}>
                  {post.image ? (
                    <img src={post.image} alt="" loading="lazy" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="news-placeholder" aria-hidden="true"><b>{locale === "tr" ? "AH" : "АХ"}</b><i>{String(index + 1).padStart(2, "0")}</i></span>
                  )}
                </a>
                <div className="news-body">
                  <p className="post-meta">{formatDate(post.date, locale)}{post.views ? <span>{post.views} {t.views}</span> : null}</p>
                  <h3><a href={`/news/${post.id}/`}>{post.title}</a></h3>
                  <p>{post.excerpt}</p>
                  <a className="card-link" href={`/news/${post.id}/`} aria-label={`${t.readPost}: ${post.title}`}>
                    {t.read} <span aria-hidden="true">→</span>
                  </a>
                </div>
              </article>
            ))}
          </div>
          <p className="feed-status"><span aria-hidden="true">↻</span> {t.feedStatus}</p>
        </div>
      </section>

      <section className="video-section" id="videos">
        <div className="shell">
          <div className="section-topline section-topline--video">
            <div>
              <p className="eyebrow">{t.videoEyebrow}</p>
              <h2>{t.videoTitle}</h2>
            </div>
            <div className="video-intro">
              <p>{t.videoLead}</p>
              <a className="text-link text-link--light" href={VK_VIDEO_URL} target="_blank" rel="noreferrer">
                {t.allVideos} <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>

          <div className="video-grid">
            {videoFeed.videos.slice(0, 6).map((video, index) => (
              <article className={`video-card ${index === 0 ? "video-card--wide" : ""}`} key={video.id}>
                <a href={video.url} target="_blank" rel="noreferrer" aria-label={`${t.watchVideo}: ${video.title}`}>
                  <span className="video-media">
                    <img src={video.thumbnail} alt="" loading="lazy" referrerPolicy="no-referrer" />
                    <span className="video-play" aria-hidden="true">▶</span>
                    {video.duration ? <span className="video-duration">{video.duration}</span> : null}
                  </span>
                  <span className="video-body">
                    <strong>{video.title}</strong>
                    <span className="video-meta">
                      <span>{t.watchVideo}</span>
                      {video.views ? <span>{video.views} {t.views}</span> : null}
                    </span>
                  </span>
                </a>
              </article>
            ))}
          </div>

          <p className="video-feed-status">
            <span className={videoFeed.isLive ? "source-dot" : "source-dot source-dot--paused"} aria-hidden="true" />
            {videoFeed.isLive ? t.videoSourceLive : t.videoSourcePaused}
          </p>
        </div>
      </section>

      <section className="social-section" id="social">
        <div className="shell social-grid">
          <div className="social-copy">
            <p className="eyebrow">{t.mediaEyebrow}</p>
            <h2>{t.socialTitle}</h2>
            <p>{t.socialLead}</p>
            <div className="media-metrics" aria-label={t.audienceLabel}>
              <div>
                <strong>50 000+</strong>
                <span>{t.mediaSubscribers}</span>
              </div>
              <div>
                <strong>{t.reachValue}</strong>
                <span>{t.monthlyReach}</span>
              </div>
            </div>
          </div>

          <div className="social-list">
            <a href={TELEGRAM_URL} target="_blank" rel="noreferrer">
              <span className="social-mark social-mark--telegram" aria-hidden="true">T</span>
              <span className="social-name"><b>Telegram</b><small>@adygkhase</small></span>
              <strong>{telegramSubscribers}<small> {t.subscriber}</small></strong>
              <i aria-hidden="true">↗</i>
            </a>
            <a href={VK_URL} target="_blank" rel="noreferrer">
              <span className="social-mark social-mark--vk" aria-hidden="true">VK</span>
              <span className="social-name"><b>{t.vk}</b><small>vk.ru/adygkhase</small></span>
              <strong>{vkSubscribers}<small> {t.subscriber}</small></strong>
              <i aria-hidden="true">↗</i>
            </a>
            <a href={MAX_URL} target="_blank" rel="noreferrer">
              <span className="social-mark social-mark--max" aria-hidden="true">M</span>
              <span className="social-name"><b>MAX</b><small>{t.organizationChannel}</small></span>
              <span className="social-follow">{t.openChannel}</span>
              <i aria-hidden="true">↗</i>
            </a>
          </div>
        </div>
      </section>

      <section className="contacts-section" id="contacts">
        <div className="shell contacts-grid">
          <div className="contacts-copy">
            <p className="eyebrow">{t.contactEyebrow}</p>
            <h2>{t.contactTitle}</h2>
            <p>{t.contactLead}</p>
            <a className="button button--gold" href={VK_URL} target="_blank" rel="noreferrer">{t.subscribe} <span aria-hidden="true">↗</span></a>
          </div>
          <div className="address-list">
            <article>
              <span>01</span>
              <div><p>{t.armavir}</p><h3>{t.armavirAddress}</h3>
                <a href="https://yandex.ru/maps/?text=Армавир%2C%20улица%20Софьи%20Перовской%2C%2028" target="_blank" rel="noreferrer">{t.map} ↗</a>
              </div>
            </article>
            <article>
              <span>02</span>
              <div><p>{t.krasnodar}</p><h3>{t.krasnodarAddress}</h3><small>{t.office}</small>
                <a href="https://yandex.ru/maps/?text=Краснодар%2C%20улица%20Бабушкина%2C%20146" target="_blank" rel="noreferrer">{t.map} ↗</a>
              </div>
            </article>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="shell footer-top">
          <Logo compact locale={locale} />
          <p>{t.footerDescription}</p>
          <div className="footer-links">
            <a href="/about/">{locale === "tr" ? "Kurum" : "Об организации"}</a>
            <a href="/news/">{locale === "tr" ? "Haberler" : "Новости"}</a>
            <a href="#videos">{t.nav[3]}</a>
            <a href="/contacts/">{locale === "tr" ? "İletişim" : "Контакты"}</a>
            <a href={VK_URL} target="_blank" rel="noreferrer">{t.vk}</a>
            <a href={VK_VIDEO_URL} target="_blank" rel="noreferrer">VK Видео</a>
            <a href={MAX_URL} target="_blank" rel="noreferrer">MAX</a>
            <a href="#top">{t.top} ↑</a>
          </div>
        </div>
        <div className="shell footer-bottom">
          <span>© {new Date().getFullYear()} {t.copyright}</span>
          <span>{t.footerSource}</span>
        </div>
      </footer>
    </main>
  );
}
