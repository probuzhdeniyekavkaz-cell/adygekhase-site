import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function readPage(locale = "ru") {
  const path = locale === "tr" ? "pages-dist/tr/index.html" : "pages-dist/index.html";
  return readFile(new URL(path, root), "utf8");
}

function outsideMediaSection(html) {
  const start = html.indexOf('<section class="social-section"');
  const end = html.indexOf('<section class="contacts-section"');
  assert.ok(start >= 0 && end > start, "media section should be present");
  return `${html.slice(0, start)}${html.slice(end)}`;
}

test("renders VK as the publication source in both languages", async () => {
  const [ru, tr] = await Promise.all([readPage("ru"), readPage("tr")]);

  for (const html of [ru, tr]) {
    assert.match(html, /https:\/\/vk\.ru\/wall-214046715_\d+/);
    assert.match(html, /https:\/\/vk\.ru\/adygkhase/);
    assert.match(html, /og-vk\.png/);
    assert.doesNotMatch(outsideMediaSection(html), /Telegram|Телеграм|t\.me/i);
  }

  assert.match(ru, /официального сообщества ВКонтакте/);
  assert.match(tr, /resmî VKontakte topluluğ/);
});

test("keeps Telegram only in the media section", async () => {
  const ru = await readPage("ru");
  const start = ru.indexOf('<section class="social-section"');
  const end = ru.indexOf('<section class="contacts-section"');
  const media = ru.slice(start, end);

  assert.match(media, /https:\/\/t\.me\/adygkhase/);
  assert.match(media, />Telegram</);
  assert.match(media, /https:\/\/vk\.ru\/adygkhase/);
  assert.match(media, /https:\/\/max\.ru\/institute_of_history/);
});
