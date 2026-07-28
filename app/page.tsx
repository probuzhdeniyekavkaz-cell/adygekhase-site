const CHANNEL_HANDLE = "adygkhase";
const CHANNEL_URL = `https://t.me/${CHANNEL_HANDLE}`;
const CHANNEL_FEED_URL = `https://t.me/s/${CHANNEL_HANDLE}`;
const VK_URL = "https://vk.ru/adygkhase";
const VK_WIDGET_URL = "https://vk.com/widget_community.php?gid=214046715&mode=3&width=320";
const MAX_URL = "https://max.ru/institute_of_history";

export const dynamic = "force-dynamic";

type TelegramPost = {
  id: string;
  title: string;
  excerpt: string;
  text: string;
  image?: string;
  date: string;
  views?: string;
  url: string;
};

type TelegramFeed = {
  description: string;
  subscribers: string;
  posts: TelegramPost[];
  isLive: boolean;
};

const fallbackDescription =
  "Общественная организация — региональный культурно-просветительский центр Краснодарского края «Адыгэ Хасэ (Адыгский (Черкесский) Совет)».";

const fallbackPosts: TelegramPost[] = [
  {
    id: "3601",
    title: "Адыги — деятели и участники основания Адыгеи",
    excerpt:
      "История Шахан-Гирея Хакурате — одного из создателей и первого руководителя Адыгеи.",
    text: "История Шахан-Гирея Хакурате — одного из создателей и первого руководителя Адыгеи.",
    date: "2026-07-27T19:53:29+00:00",
    url: "https://t.me/adygkhase/3601",
  },
  {
    id: "3600",
    title: "«Легенды российской анимации» в Армавире",
    excerpt:
      "Масштабная мультимедийная выставка пройдёт с 3 по 9 августа в Городском Дворце культуры.",
    text: "Масштабная мультимедийная выставка пройдёт с 3 по 9 августа в Городском Дворце культуры.",
    date: "2026-07-27T13:35:41+00:00",
    url: "https://t.me/adygkhase/3600",
  },
];

function decodeHtml(value: string) {
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

function htmlToText(value: string) {
  return decodeHtml(
    value
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

function parseTelegramFeed(html: string): TelegramFeed {
  const descriptionHtml =
    html.match(/<div class="tgme_channel_info_description">([\s\S]*?)<\/div>/i)?.[1] ?? "";
  const description = htmlToText(descriptionHtml) || fallbackDescription;
  const subscriberMatch = html.match(
    /<span class="counter_value">([^<]+)<\/span>\s*<span class="counter_type">subscribers<\/span>/i,
  );
  const subscribers = subscriberMatch ? htmlToText(subscriberMatch[1]) : "2,1 тыс.";
  const blocks =
    html.match(
      /<div class="tgme_widget_message_wrap[\s\S]*?(?=<div class="tgme_widget_message_wrap|<\/section>)/gi,
    ) ?? [];

  const posts = blocks
    .map((block): TelegramPost | null => {
      const id = block.match(/data-post="adygkhase\/(\d+)"/i)?.[1];
      const textHtml = block.match(
        /<div class="tgme_widget_message_text[^>]*>([\s\S]*?)<\/div>/i,
      )?.[1];
      const date = block.match(/<time datetime="([^"]+)"/i)?.[1];
      if (!id || !textHtml || !date) return null;

      const text = htmlToText(textHtml);
      if (!text) return null;
      const image = block.match(
        /tgme_widget_message_(?:photo_wrap|video_thumb)[^>]*style="[^"]*background-image:url\(['"]?(https:[^'")]+)["']?\)/i,
      )?.[1];
      const views = block.match(/<span class="tgme_widget_message_views">([^<]+)<\/span>/i)?.[1];

      return {
        id,
        title: makeTitle(text),
        excerpt: makeExcerpt(text),
        text,
        image: image ? decodeHtml(image) : undefined,
        date,
        views: views ? htmlToText(views) : undefined,
        url: `${CHANNEL_URL}/${id}`,
      };
    })
    .filter((post): post is TelegramPost => Boolean(post))
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
    .slice(0, 7);

  return {
    description,
    subscribers,
    posts: posts.length ? posts : fallbackPosts,
    isLive: posts.length > 0,
  };
}

async function getTelegramFeed(): Promise<TelegramFeed> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6500);

  try {
    const response = await fetch(CHANNEL_FEED_URL, {
      cache: "no-store",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; AdygeKhaseSite/1.0)" },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error("Telegram feed is unavailable");
    return parseTelegramFeed(await response.text());
  } catch {
    return {
      description: fallbackDescription,
      subscribers: "2,1 тыс.",
      posts: fallbackPosts,
      isLive: false,
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function getVkSubscribers() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(VK_WIDGET_URL, {
      cache: "no-store",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; AdygeKhaseSite/1.0)" },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error("VK widget is unavailable");
    const html = await response.text();
    const rawCount = html.match(/id="members_count">\s*([\d,.\s]+)/i)?.[1] ?? "";
    const digits = rawCount.replace(/\D/g, "");
    if (!digits) throw new Error("VK subscriber count is unavailable");
    return new Intl.NumberFormat("ru-RU").format(Number(digits));
  } catch {
    return "3,8 тыс.+";
  } finally {
    clearTimeout(timeout);
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Moscow",
  }).format(new Date(value));
}

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className={compact ? "logo-lockup logo-lockup--compact" : "logo-lockup"}>
      <img src="/adyge-khase-logo.png" alt="Адыгэ Хасэ Краснодарского края" />
    </span>
  );
}

export default async function Home() {
  const [feed, vkSubscribers] = await Promise.all([
    getTelegramFeed(),
    getVkSubscribers(),
  ]);
  const [featured, ...recentPosts] = feed.posts;

  return (
    <main>
      <a className="skip-link" href="#content">Перейти к содержанию</a>

      <header className="site-header">
        <div className="shell header-inner">
          <a className="brand" href="#top" aria-label="Адыгэ Хасэ — на главную"><Logo /></a>
          <nav className="desktop-nav" aria-label="Основная навигация">
            <a href="#about">Об организации</a>
            <a href="#work">Направления</a>
            <a href="#news">Публикации</a>
            <a href="#social">Соцсети</a>
            <a href="#contacts">Контакты</a>
          </nav>
          <a className="header-cta" href={CHANNEL_URL} target="_blank" rel="noreferrer">
            Telegram <span aria-hidden="true">↗</span>
          </a>
          <details className="mobile-menu">
            <summary aria-label="Открыть меню">Меню</summary>
            <nav aria-label="Мобильная навигация">
              <a href="#about">Об организации</a>
              <a href="#work">Направления</a>
              <a href="#news">Публикации</a>
              <a href="#social">Соцсети</a>
              <a href="#contacts">Контакты</a>
            </nav>
          </details>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-pattern" aria-hidden="true" />
        <div className="shell hero-grid" id="content">
          <div className="hero-copy">
            <p className="eyebrow">Краснодарский край</p>
            <h1>Культура, которая<span>объединяет поколения</span></h1>
            <p className="hero-lead">
              Региональный культурно-просветительский центр: сохраняем наследие,
              поддерживаем молодёжь и создаём пространство для диалога.
            </p>
            <div className="hero-actions">
              <a className="button button--light" href="#news">Последние новости</a>
              <a className="text-link text-link--light" href="#about">Узнать о Хасэ <span aria-hidden="true">↓</span></a>
            </div>
            <div className="hero-facts" aria-label="Кратко об организации">
              <div><strong>{feed.subscribers}</strong><span>подписчиков в Telegram</span></div>
              <div><strong>2</strong><span>центра в крае</span></div>
              <div><strong>∞</strong><span>живая связь поколений</span></div>
            </div>
          </div>

          <article className="featured-card">
            <div className="featured-media">
              {featured?.image ? (
                <img src={featured.image} alt="" referrerPolicy="no-referrer" />
              ) : (
                <div className="featured-placeholder" aria-hidden="true"><span>Адыгэ</span><strong>Хасэ</strong></div>
              )}
              <span className="live-badge"><i aria-hidden="true" /> из Telegram</span>
            </div>
            <div className="featured-body">
              <p className="post-meta">
                {featured ? formatDate(featured.date) : "Последняя публикация"}
                {featured?.views ? <span>{featured.views} просмотров</span> : null}
              </p>
              <h2>{featured?.title ?? "Новости Адыгэ Хасэ"}</h2>
              <p>{featured?.excerpt}</p>
              <a href={featured?.url ?? CHANNEL_URL} target="_blank" rel="noreferrer">Читать в Telegram <span aria-hidden="true">↗</span></a>
            </div>
          </article>
        </div>
      </section>

      <section className="about-section" id="about">
        <div className="shell about-grid">
          <div className="section-heading">
            <p className="eyebrow eyebrow--dark">Об организации</p>
            <h2>Дом культуры, знаний и общего дела</h2>
          </div>
          <div className="about-copy">
            <p className="about-intro">
              «Адыгэ Хасэ» объединяет людей, которым важно сохранять адыгский язык,
              историю и традиции — и передавать их дальше в живом, современном формате.
            </p>
            <p>{feed.description}</p>
            <div className="source-note">
              <span className={feed.isLive ? "source-dot" : "source-dot source-dot--paused"} />
              {feed.isLive
                ? "Информация обновлена из официального Telegram-канала"
                : "Показана сохранённая информация; Telegram временно недоступен"}
            </div>
          </div>
        </div>
      </section>

      <section className="work-section" id="work">
        <div className="shell">
          <div className="section-topline">
            <div>
              <p className="eyebrow eyebrow--dark">Направления работы</p>
              <h2>Сохранять. Просвещать. Объединять.</h2>
            </div>
            <p>
              От встреч с носителями традиций до современных образовательных проектов —
              работа Хасэ охватывает весь край.
            </p>
          </div>

          <div className="direction-grid">
            <article className="direction-card direction-card--primary">
              <span className="direction-number">01</span><div className="direction-symbol" aria-hidden="true">Ӏ</div>
              <h3>Культура и язык</h3>
              <p>Вечера фольклора, история, родной язык, танец и проекты по сохранению нематериального наследия.</p>
            </article>
            <article className="direction-card">
              <span className="direction-number">02</span><div className="direction-symbol" aria-hidden="true">◎</div>
              <h3>Молодёжные проекты</h3>
              <p>Дискуссионные клубы, образовательные встречи, волонтёрство и поддержка инициатив нового поколения.</p>
            </article>
            <article className="direction-card">
              <span className="direction-number">03</span><div className="direction-symbol" aria-hidden="true">◇</div>
              <h3>Общественный диалог</h3>
              <p>Партнёрство с культурными центрами, общественными объединениями и соседними регионами.</p>
            </article>
            <article className="direction-card">
              <span className="direction-number">04</span><div className="direction-symbol" aria-hidden="true">✦</div>
              <h3>События и просвещение</h3>
              <p>Выставки, лекции, творческие встречи, семейные программы и открытые мероприятия в Армавире и Краснодаре.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="news-section" id="news">
        <div className="shell">
          <div className="section-topline section-topline--news">
            <div><p className="eyebrow eyebrow--dark">Публикации</p><h2>Сейчас в Хасэ</h2></div>
            <a className="text-link" href={CHANNEL_URL} target="_blank" rel="noreferrer">Все публикации в Telegram <span aria-hidden="true">↗</span></a>
          </div>

          <div className="news-grid">
            {recentPosts.slice(0, 6).map((post, index) => (
              <article className={`news-card ${index === 0 ? "news-card--wide" : ""}`} key={post.id}>
                <a className="news-media" href={post.url} target="_blank" rel="noreferrer" tabIndex={-1}>
                  {post.image ? (
                    <img src={post.image} alt="" loading="lazy" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="news-placeholder" aria-hidden="true"><b>АХ</b><i>{String(index + 1).padStart(2, "0")}</i></span>
                  )}
                </a>
                <div className="news-body">
                  <p className="post-meta">{formatDate(post.date)}{post.views ? <span>{post.views} просмотров</span> : null}</p>
                  <h3><a href={post.url} target="_blank" rel="noreferrer">{post.title}</a></h3>
                  <p>{post.excerpt}</p>
                  <a className="card-link" href={post.url} target="_blank" rel="noreferrer" aria-label={`Читать публикацию: ${post.title}`}>
                    Читать <span aria-hidden="true">↗</span>
                  </a>
                </div>
              </article>
            ))}
          </div>
          <p className="feed-status"><span aria-hidden="true">↻</span> Лента загружается напрямую из публичного канала и обновляется при каждом посещении сайта.</p>
        </div>
      </section>

      <section className="social-section" id="social">
        <div className="shell social-grid">
          <div className="social-copy">
            <p className="eyebrow">Медиа Адыгэ Хасэ</p>
            <h2>Ищите нас в различных социальных сетях</h2>
            <p>
              Общее число подписчиков медиа «Адыгэ Хасэ» Краснодарского края — свыше
              50 000 человек, а ежемесячный охват превышает один миллион. Следите за
              новостями, проектами и встречами там, где вам удобно.
            </p>
            <div className="media-metrics" aria-label="Аудитория медиа Адыгэ Хасэ">
              <div>
                <strong>50 000+</strong>
                <span>подписчиков медиасети</span>
              </div>
              <div>
                <strong>1 млн+</strong>
                <span>охватов ежемесячно</span>
              </div>
            </div>
          </div>

          <div className="social-list">
            <a href={CHANNEL_URL} target="_blank" rel="noreferrer">
              <span className="social-mark social-mark--telegram" aria-hidden="true">T</span>
              <span className="social-name"><b>Telegram</b><small>@adygkhase</small></span>
              <strong>{feed.subscribers}<small> подписчиков</small></strong>
              <i aria-hidden="true">↗</i>
            </a>
            <a href={VK_URL} target="_blank" rel="noreferrer">
              <span className="social-mark social-mark--vk" aria-hidden="true">VK</span>
              <span className="social-name"><b>ВКонтакте</b><small>vk.ru/adygkhase</small></span>
              <strong>{vkSubscribers}<small> подписчиков</small></strong>
              <i aria-hidden="true">↗</i>
            </a>
            <a href={MAX_URL} target="_blank" rel="noreferrer">
              <span className="social-mark social-mark--max" aria-hidden="true">M</span>
              <span className="social-name"><b>MAX</b><small>Канал организации</small></span>
              <span className="social-follow">Открыть канал</span>
              <i aria-hidden="true">↗</i>
            </a>
          </div>
        </div>
      </section>

      <section className="contacts-section" id="contacts">
        <div className="shell contacts-grid">
          <div className="contacts-copy">
            <p className="eyebrow">Будем на связи</p>
            <h2>Приходите в Хасэ</h2>
            <p>
              Узнавайте о встречах и новых проектах в Telegram. Двери наших центров
              открыты для тех, кому близки культура, просвещение и общее дело.
            </p>
            <a className="button button--gold" href={CHANNEL_URL} target="_blank" rel="noreferrer">Подписаться на канал <span aria-hidden="true">↗</span></a>
          </div>
          <div className="address-list">
            <article>
              <span>01</span>
              <div><p>Армавир</p><h3>ул. Софьи Перовской, 28</h3>
                <a href="https://yandex.ru/maps/?text=Армавир%2C%20улица%20Софьи%20Перовской%2C%2028" target="_blank" rel="noreferrer">Открыть на карте ↗</a>
              </div>
            </article>
            <article>
              <span>02</span>
              <div><p>Краснодар</p><h3>ул. Бабушкина, 146</h3><small>2 этаж, офис 212</small>
                <a href="https://yandex.ru/maps/?text=Краснодар%2C%20улица%20Бабушкина%2C%20146" target="_blank" rel="noreferrer">Открыть на карте ↗</a>
              </div>
            </article>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="shell footer-top">
          <Logo compact />
          <p>Региональный культурно-просветительский центр Краснодарского края</p>
          <div className="footer-links">
            <a href={CHANNEL_URL} target="_blank" rel="noreferrer">Telegram</a>
            <a href={VK_URL} target="_blank" rel="noreferrer">ВКонтакте</a>
            <a href={MAX_URL} target="_blank" rel="noreferrer">MAX</a>
            <a href="#top">Наверх ↑</a>
          </div>
        </div>
        <div className="shell footer-bottom">
          <span>© {new Date().getFullYear()} «Адыгэ Хасэ» Краснодарского края</span>
          <span>Информация и публикации: официальный Telegram-канал</span>
        </div>
      </footer>
    </main>
  );
}
