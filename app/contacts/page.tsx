import type { Metadata } from "next";
import { SITE_URL, VK_URL } from "../../lib/site";
import { ContentPage } from "../site-shell";

export const metadata: Metadata = {
  title: "Контакты и адреса",
  description: "Адреса центров Адыгэ Хасэ в Краснодаре и Армавире, ссылки на официальные страницы организации.",
  alternates: { canonical: `${SITE_URL}/contacts/` },
};

export default function ContactsPage() {
  return (
    <ContentPage
      eyebrow="Контакты"
      title="Приходите в Хасэ"
      lead="Двери наших центров открыты для тех, кому близки культура, просвещение и общее дело."
    >
      <div className="location-cards prose-main">
        <article>
          <span>Краснодар</span>
          <h2>ул. Бабушкина, 146</h2>
          <p>2 этаж, офис 212</p>
          <a className="text-link" href="https://yandex.ru/maps/?text=Краснодар%2C%20улица%20Бабушкина%2C%20146" target="_blank" rel="noreferrer">Открыть на карте ↗</a>
        </article>
        <article>
          <span>Армавир</span>
          <h2>ул. Софьи Перовской, 28</h2>
          <a className="text-link" href="https://yandex.ru/maps/?text=Армавир%2C%20улица%20Софьи%20Перовской%2C%2028" target="_blank" rel="noreferrer">Открыть на карте ↗</a>
        </article>
      </div>
      <aside className="facts-panel">
        <h2>Новости и связь</h2>
        <p>Актуальные объявления и материалы публикуются в официальном сообществе ВКонтакте.</p>
        <a className="button button--gold" href={VK_URL} target="_blank" rel="noreferrer">Открыть ВКонтакте ↗</a>
      </aside>
    </ContentPage>
  );
}
