import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const output = path.join(root, "pages-dist");
const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");
const standalone = path.join(root, ".next", "standalone");
const port = "3199";

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit", ...options });
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with ${code ?? signal}`));
    });
  });
}

async function waitForServer(url) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("The local render server did not start");
}

function makeStatic(html, locale) {
  const isTurkish = locale === "tr";
  let result = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<link\b[^>]*rel=["'](?:modulepreload|preload)["'][^>]*as=["']script["'][^>]*>/gi, "")
    .replaceAll('href="/?lang=tr#top"', 'href="/tr/#top"')
    .replaceAll("https://adygekhase.ru/?lang=tr", "https://adygekhase.ru/tr/")
    .replaceAll("https://127.0.0.1:3199/?lang=tr", "https://adygekhase.ru/tr/")
    .replaceAll("https://127.0.0.1:3199", "https://adygekhase.ru")
    .replaceAll("http://adygekhase.ru", "https://adygekhase.ru")
    .replaceAll("http://127.0.0.1:3199", "https://adygekhase.ru")
    .replaceAll(
      "Лента загружается напрямую из публичного канала и обновляется при каждом посещении сайта.",
      "Лента автоматически обновляется из официального Telegram-канала несколько раз в день.",
    )
    .replaceAll(
      "Yayınlar resmî Telegram kanalından Rusça olarak alınır ve site her ziyaret edildiğinde güncellenir.",
      "Yayınlar resmî Telegram kanalından Rusça olarak alınır ve günde birkaç kez otomatik güncellenir.",
    );

  if (isTurkish) {
    result = result.replace('<html lang="ru">', '<html lang="tr">');
  }

  return `<!doctype html>\n${result.replace(/^<!doctype html>/i, "").trim()}\n`;
}

async function cacheTelegramImages(htmlByLocale) {
  const matches = [...new Set(
    Object.values(htmlByLocale).flatMap((html) =>
      html.match(/https:\/\/cdn\d*\.telesco\.pe\/file\/[A-Za-z0-9_-]+(?:\.[A-Za-z0-9]+)?/g) ?? [],
    ),
  )];
  if (!matches.length) return htmlByLocale;

  const mediaDir = path.join(output, "media");
  await mkdir(mediaDir, { recursive: true });
  const replacements = new Map();

  await Promise.all(matches.map(async (url) => {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; AdygeKhaseSite/1.0)" },
      });
      if (!response.ok) return;
      const contentType = response.headers.get("content-type") ?? "image/jpeg";
      const extension = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
      const name = `${createHash("sha256").update(url).digest("hex").slice(0, 18)}.${extension}`;
      await writeFile(path.join(mediaDir, name), Buffer.from(await response.arrayBuffer()));
      replacements.set(url, `/media/${name}`);
    } catch {}
  }));

  return Object.fromEntries(Object.entries(htmlByLocale).map(([locale, html]) => {
    let cached = html;
    for (const [remote, local] of replacements) cached = cached.replaceAll(remote, local);
    return [locale, cached];
  }));
}

await rm(output, { recursive: true, force: true });
await run(process.execPath, [nextBin, "build"], { cwd: root });

await mkdir(path.join(standalone, ".next"), { recursive: true });
await cp(path.join(root, "public"), path.join(standalone, "public"), { recursive: true });
await cp(path.join(root, ".next", "static"), path.join(standalone, ".next", "static"), { recursive: true });

const server = spawn(process.execPath, [path.join(standalone, "server.js")], {
  cwd: standalone,
  env: { ...process.env, HOSTNAME: "127.0.0.1", PORT: port },
  stdio: "inherit",
});

try {
  const origin = `http://127.0.0.1:${port}`;
  await waitForServer(origin);
  const requestHeaders = { Host: "adygekhase.ru", "X-Forwarded-Proto": "https" };
  const [ruResponse, trResponse] = await Promise.all([
    fetch(`${origin}/`, { headers: requestHeaders }),
    fetch(`${origin}/?lang=tr`, { headers: requestHeaders }),
  ]);
  if (!ruResponse.ok || !trResponse.ok) throw new Error("Page rendering failed");

  const [ruHtml, trHtml] = await Promise.all([ruResponse.text(), trResponse.text()]);
  await mkdir(path.join(output, "tr"), { recursive: true });
  await cp(path.join(root, "public"), output, { recursive: true });
  await mkdir(path.join(output, "_next"), { recursive: true });
  await cp(path.join(root, ".next", "static"), path.join(output, "_next", "static"), { recursive: true });
  const staticHtml = await cacheTelegramImages({
    ru: makeStatic(ruHtml, "ru"),
    tr: makeStatic(trHtml, "tr"),
  });
  await writeFile(path.join(output, "index.html"), staticHtml.ru);
  await writeFile(path.join(output, "tr", "index.html"), staticHtml.tr);
  await writeFile(path.join(output, "404.html"), staticHtml.ru);
  await writeFile(path.join(output, "CNAME"), "adygekhase.ru\n");
  await writeFile(path.join(output, ".nojekyll"), "");
  await writeFile(
    path.join(output, "robots.txt"),
    "User-agent: *\nAllow: /\nSitemap: https://adygekhase.ru/sitemap.xml\n",
  );
  await writeFile(
    path.join(output, "sitemap.xml"),
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://adygekhase.ru/</loc></url><url><loc>https://adygekhase.ru/tr/</loc></url></urlset>\n',
  );

  const builtRu = await readFile(path.join(output, "index.html"), "utf8");
  if (!builtRu.includes("Адыгэ Хасэ") || !builtRu.includes("50 000+")) {
    throw new Error("Static output validation failed");
  }
} finally {
  server.kill("SIGTERM");
}
