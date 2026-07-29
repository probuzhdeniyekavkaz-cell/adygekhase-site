import type { Metadata } from "next";
import { SITE_URL } from "../../lib/site";
import { ContentPage } from "../site-shell";

export const metadata: Metadata = {
  title: "Направления и проекты",
  description: "Культурные, образовательные, молодёжные и общественные проекты Адыгэ Хасэ Краснодарского края.",
  alternates: { canonical: `${SITE_URL}/projects/` },
};

const directions = [
  ["Культура и язык", "Фольклор, родной язык, танец, история и сохранение нематериального культурного наследия."],
  ["Молодёжные проекты", "Образовательные встречи, дискуссионные клубы, волонтёрство и поддержка инициатив нового поколения."],
  ["Общественный диалог", "Партнёрство с культурными центрами, общественными объединениями и соседними регионами."],
  ["События и просвещение", "Выставки, лекции, творческие встречи и семейные программы в Краснодаре и Армавире."],
];

export default function ProjectsPage() {
  return (
    <ContentPage
      eyebrow="Направления работы"
      title="Сохранять. Просвещать. Объединять."
      lead="Проекты Хасэ связывают культурную память с современной жизнью и охватывают весь Краснодарский край."
    >
      <div className="project-list prose-main">
        {directions.map(([title, text], index) => (
          <article key={title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div><h2>{title}</h2><p>{text}</p></div>
          </article>
        ))}
      </div>
      <aside className="facts-panel">
        <h2>Следите за работой</h2>
        <p>Анонсы новых встреч, отчёты о событиях и публикации организации собраны в разделе новостей.</p>
        <a className="button button--gold" href="/news/">Открыть новости →</a>
      </aside>
    </ContentPage>
  );
}
