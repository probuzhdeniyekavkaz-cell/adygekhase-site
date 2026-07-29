import { MAX_URL, VK_URL } from "../lib/site";

export function SiteLogo({ compact = false }: { compact?: boolean }) {
  return (
    <span className={compact ? "logo-lockup logo-lockup--compact" : "logo-lockup"}>
      <img src="/adyge-khase-logo-fixed.png" alt="Адыгэ Хасэ Краснодарского края" />
    </span>
  );
}

export function InnerHeader() {
  return (
    <header className="site-header site-header--inner">
      <div className="shell header-inner">
        <a className="brand" href="/" aria-label="Адыгэ Хасэ — на главную"><SiteLogo /></a>
        <nav className="desktop-nav" aria-label="Основная навигация">
          <a href="/about/">Об организации</a>
          <a href="/projects/">Направления</a>
          <a href="/news/">Новости</a>
          <a href="/contacts/">Контакты</a>
        </nav>
        <div className="header-actions">
          <a className="header-cta" href={VK_URL} target="_blank" rel="noreferrer">
            ВКонтакте <span aria-hidden="true">↗</span>
          </a>
        </div>
        <details className="mobile-menu">
          <summary aria-label="Меню">Меню</summary>
          <nav aria-label="Мобильная навигация">
            <a href="/about/">Об организации</a>
            <a href="/projects/">Направления</a>
            <a href="/news/">Новости</a>
            <a href="/contacts/">Контакты</a>
          </nav>
        </details>
      </div>
    </header>
  );
}

export function Breadcrumbs({ items }: { items: Array<{ label: string; href?: string }> }) {
  return (
    <nav className="breadcrumbs" aria-label="Хлебные крошки">
      <a href="/">Главная</a>
      {items.map((item) => (
        <span key={`${item.href ?? "current"}-${item.label}`}>
          <i aria-hidden="true">/</i>
          {item.href ? <a href={item.href}>{item.label}</a> : <b aria-current="page">{item.label}</b>}
        </span>
      ))}
    </nav>
  );
}

export function InnerFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-top">
        <a href="/" aria-label="Адыгэ Хасэ — на главную"><SiteLogo compact /></a>
        <p>Региональный культурно-просветительский центр Краснодарского края</p>
        <div className="footer-links">
          <a href="/about/">Об организации</a>
          <a href="/news/">Новости</a>
          <a href="/contacts/">Контакты</a>
          <a href={VK_URL} target="_blank" rel="noreferrer">ВКонтакте</a>
          <a href={MAX_URL} target="_blank" rel="noreferrer">MAX</a>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© {new Date().getFullYear()} «Адыгэ Хасэ» Краснодарского края</span>
        <span>Официальный сайт организации</span>
      </div>
    </footer>
  );
}

export function ContentPage({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  children: React.ReactNode;
}) {
  return (
    <main className="inner-page">
      <InnerHeader />
      <section className="inner-hero">
        <div className="shell">
          <Breadcrumbs items={[{ label: eyebrow }]} />
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="inner-lead">{lead}</p>
        </div>
      </section>
      <section className="inner-content">
        <div className="shell prose-grid">{children}</div>
      </section>
      <InnerFooter />
    </main>
  );
}
