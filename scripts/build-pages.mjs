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

function makeStatic(html, locale = "ru") {
  const isTurkish = locale === "tr";
  const structuredData = [];
  const preserved = html.replace(
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi,
    (script) => {
      const token = `<!--JSONLD-${structuredData.length}-->`;
      structuredData.push(script);
      return token;
    },
  );
  let result = preserved
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<link\b[^>]*rel=["'](?:modulepreload|preload)["'][^>]*as=["']script["'][^>]*>/gi, "")
    .replaceAll('href="/?lang=tr#top"', 'href="/tr/#top"')
    .replaceAll("https://adygekhase.ru/?lang=tr", "https://adygekhase.ru/tr/")
    .replaceAll("https://127.0.0.1:3199/?lang=tr", "https://adygekhase.ru/tr/")
    .replaceAll("https://127.0.0.1:3199", "https://adygekhase.ru")
    .replaceAll("http://adygekhase.ru", "https://adygekhase.ru")
    .replaceAll("http://127.0.0.1:3199", "https://adygekhase.ru")
    .replaceAll(
      "Лента загружается из официального сообщества ВКонтакте и обновляется при каждом посещении сайта.",
      "Лента автоматически обновляется из официального сообщества ВКонтакте несколько раз в день.",
    )
    .replaceAll(
      "Yayınlar resmî VKontakte topluluğundan Rusça olarak alınır ve site her ziyaret edildiğinde güncellenir.",
      "Yayınlar resmî VKontakte topluluğundan Rusça olarak alınır ve günde birkaç kez otomatik güncellenir.",
    );

  structuredData.forEach((script, index) => {
    result = result.replace(`<!--JSONLD-${index}-->`, script);
  });

  const headEnd = result.indexOf("</head>");
  if (headEnd >= 0) {
    const head = result.slice(0, headEnd);
    let body = result.slice(headEnd);
    const lateMetadata = [
      ...(body.match(/<title>[\s\S]*?<\/title>/gi) ?? []),
      ...(body.match(/<meta\b[^>]*>/gi) ?? []),
      ...(body.match(/<link\b[^>]*rel=["'](?:canonical|icon)["'][^>]*>/gi) ?? []),
    ];
    for (const tag of lateMetadata) body = body.replace(tag, "");
    result = `${head}${lateMetadata.join("")}${body}`;
  }

  if (isTurkish) {
    result = result.replace('<html lang="ru">', '<html lang="tr">');
  }

  return `<!doctype html>\n${result.replace(/^<!doctype html>/i, "").trim()}\n`;
}

async function cacheRemoteImages(htmlByLocale) {
  const matches = [...new Set(
    Object.values(htmlByLocale).flatMap((html) =>
      html.match(/https:\/\/[^"'()\s<>]+(?:userapi\.com|okcdn\.ru)\/[^"'()\s<>]+/g) ?? [],
    ),
  )];
  if (!matches.length) return htmlByLocale;

  const mediaDir = path.join(output, "media");
  await mkdir(mediaDir, { recursive: true });
  const replacements = new Map();

  await Promise.all(matches.map(async (url) => {
    try {
      const response = await fetch(url.replaceAll("&amp;", "&"), {
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
    cached = cached.replaceAll('content="/media/', 'content="https://adygekhase.ru/media/');
    cached = cached.replaceAll('"image":["/media/', '"image":["https://adygekhase.ru/media/');
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
  const initialTargets = [
    { key: "", requestPath: "/", locale: "ru" },
    { key: "tr", requestPath: "/?lang=tr", locale: "tr" },
    { key: "about", requestPath: "/about/", locale: "ru" },
    { key: "projects", requestPath: "/projects/", locale: "ru" },
    { key: "news", requestPath: "/news/", locale: "ru" },
    { key: "contacts", requestPath: "/contacts/", locale: "ru" },
  ];
  const initialResponses = await Promise.all(
    initialTargets.map((target) => fetch(`${origin}${target.requestPath}`, { headers: requestHeaders })),
  );
  if (initialResponses.some((response) => !response.ok)) throw new Error("Page rendering failed");
  const initialHtml = await Promise.all(initialResponses.map((response) => response.text()));
  const newsHtml = initialHtml[initialTargets.findIndex((target) => target.key === "news")];
  const postIds = [...new Set([...newsHtml.matchAll(/href=["']\/news\/(\d+)\//g)].map((match) => match[1]))];
  const articleTargets = postIds.map((id) => ({ key: `news/${id}`, requestPath: `/news/${id}/`, locale: "ru" }));
  const articleResponses = await Promise.all(
    articleTargets.map((target) => fetch(`${origin}${target.requestPath}`, { headers: requestHeaders })),
  );
  if (articleResponses.some((response) => !response.ok)) throw new Error("Article rendering failed");
  const articleHtml = await Promise.all(articleResponses.map((response) => response.text()));
  const allTargets = [...initialTargets, ...articleTargets];
  const renderedPages = Object.fromEntries(
    allTargets.map((target, index) => [
      target.key || "home",
      makeStatic(index < initialHtml.length ? initialHtml[index] : articleHtml[index - initialHtml.length], target.locale),
    ]),
  );

  await cp(path.join(root, "public"), output, { recursive: true });
  await mkdir(path.join(output, "_next"), { recursive: true });
  await cp(path.join(root, ".next", "static"), path.join(output, "_next", "static"), { recursive: true });
  const staticHtml = await cacheRemoteImages(renderedPages);
  for (const target of allTargets) {
    const key = target.key || "home";
    const targetDir = target.key ? path.join(output, target.key) : output;
    await mkdir(targetDir, { recursive: true });
    await writeFile(path.join(targetDir, "index.html"), staticHtml[key]);
  }
  await writeFile(path.join(output, "404.html"), staticHtml.home);
  await writeFile(path.join(output, "CNAME"), "adygekhase.ru\n");
  await writeFile(path.join(output, ".nojekyll"), "");
  await writeFile(
    path.join(output, "robots.txt"),
    "User-agent: *\nAllow: /\nSitemap: https://adygekhase.ru/sitemap.xml\n",
  );
  await writeFile(
    path.join(output, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${allTargets.map((target) => {
      const route = target.key ? `/${target.key}/` : "/";
      const priority = target.key === "" ? "1.0" : target.key === "news" ? "0.9" : target.key.startsWith("news/") ? "0.7" : "0.8";
      const changefreq = target.key === "" || target.key === "news" ? "daily" : "monthly";
      return `<url><loc>https://adygekhase.ru${route}</loc><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
    }).join("")}</urlset>\n`,
  );

  const builtRu = await readFile(path.join(output, "index.html"), "utf8");
  if (!builtRu.includes("Адыгэ Хасэ") || !builtRu.includes("50 000+")) {
    throw new Error("Static output validation failed");
  }
} finally {
  server.kill("SIGTERM");
}
