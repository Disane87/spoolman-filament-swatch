import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const apiUrl =
  "https://api.github.com/repos/Donkie/SpoolmanDB/contents/filaments";
const outputDir = path.resolve("public", "external-filaments");

const res = await fetch(apiUrl, {
  headers: {
    "User-Agent": "spoolman-filament-swatch",
    Accept: "application/vnd.github+json",
  },
});

if (!res.ok) {
  throw new Error(`GitHub API error ${res.status}`);
}

const entries = await res.json();
const files = entries
  .filter((entry) => entry.name && entry.name.endsWith(".json"))
  .map((entry) => ({
    name: entry.name,
    downloadUrl: entry.download_url,
  }));

await mkdir(outputDir, { recursive: true });

const downloads = await Promise.all(
  files.map(async (file) => {
    const dataRes = await fetch(file.downloadUrl);
    if (!dataRes.ok) {
      throw new Error(`Download error ${dataRes.status} for ${file.name}`);
    }
    const json = await dataRes.json();
    await writeFile(
      path.join(outputDir, file.name),
      JSON.stringify(json, null, 2),
      "utf-8",
    );
    return file.name;
  }),
);

await writeFile(
  path.join(outputDir, "index.json"),
  JSON.stringify(downloads, null, 2),
  "utf-8",
);

console.log(`Downloaded ${downloads.length} filament files.`);
