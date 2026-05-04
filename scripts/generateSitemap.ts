import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { VERIFIED_EXERCISES } from '../src/constants/exercises.js';
import { PRESET_ROUTINES } from '../src/constants/presetRoutines.js';
import { slugify } from '../src/utils/slugify.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseUrl = "https://www.stretchingprogram.com";

const staticPages = [
  "/",
  "/stretching-routine",
  "/method",
  "/how-to-stretch",
  "/privacy-policy",
  "/terms",
  "/contact"
];

// Dynamically generate exercise URLs from real data
const exercises = Object.keys(VERIFIED_EXERCISES).map(name => slugify(name));

const exerciseUrls = exercises.map(slug => `
  <url>
    <loc>${baseUrl}/exercise/${slug}</loc>
  </url>
`);

// Dynamically generate routine URLs from presets
const routines = Object.keys(PRESET_ROUTINES);
const routineUrls = routines.map(preset => `
  <url>
    <loc>${baseUrl}/stretching-routine/${preset}</loc>
  </url>
`);

const staticUrls = staticPages.map(path => `
  <url>
    <loc>${baseUrl}${path}</loc>
  </url>
`);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls.join("")}${routineUrls.join("")}${exerciseUrls.join("")}</urlset>`;

const outputPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
fs.writeFileSync(outputPath, sitemap);

console.log("Sitemap generated successfully with", exercises.length, "exercises.");
