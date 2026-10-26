/**
 * Regenerate the local sharing image with the same fonts and brand as the page.
 * Requires network access to Google's font CDN only when regenerating.
 * This produces a committed PNG; production needs no image API or extra fonts.
 */
import path from "node:path";
import sharp from "sharp";
import React from "react";
import { ImageResponse } from "next/og.js";

const root = process.cwd();
// Fixed sources from Google Fonts, matching the site's next/font families.
const sources = {
  Fraunces: "https://fonts.gstatic.com/s/fraunces/v38/6NUh8FyLNQOQZAnv9bYEvDiIdE9Ea92uemAk_WBq8U_9v0c2Wa0K7iN7hzFUPJH58nib1603gg7S2nfgRYIctxujDg.ttf",
  Archivo: "https://fonts.gstatic.com/s/archivo/v25/k3k6o8UDI-1M0wlSV9XAw6lQkqWY8Q82sJaRE-NWIDdgffTTNDNp8A.ttf",
};
const fonts = Object.fromEntries(await Promise.all(Object.entries(sources).map(async ([family, url]) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Unable to retrieve ${family}: ${response.status}`);
  return [family, await response.arrayBuffer()];
})));

async function textLayer(text, family, size, color, left, top) {
  const response = new ImageResponse(
    React.createElement("div", {
      style: { display: "flex", fontFamily: family, fontSize: size, color, lineHeight: 1.1 },
    }, text),
    {
      width: left > 900 ? 180 : 650,
      height: Math.ceil(size * 1.4),
      fonts: [{ name: family, data: fonts[family], style: "normal", weight: 400 }],
    },
  );
  const input = Buffer.from(await response.arrayBuffer());
  return { input, left, top };
}

// Draw the furthest slab first. Orange ports identify the same request through
// all four planes; opaque faces and vertical risers communicate actual depth.
const slabs = [3, 2, 1, 0].map((index) => {
  const y = 137 + index * 81;
  return `<g>
    <path d="M700 ${y + 55} L907 ${y + 137} L1120 ${y + 81} L1120 ${y + 95} L907 ${y + 151} L700 ${y + 69} Z" fill="#121110" stroke="#49453e" stroke-width="1.2"/>
    <path d="M700 ${y + 55} L913 ${y} L1120 ${y + 81} L907 ${y + 137} Z" fill="#1d1c1a" stroke="#777168" stroke-width="1.2"/>
    <path d="M748 ${y + 58} L913 ${y + 16} L1073 ${y + 79}" fill="none" stroke="#36332e"/>
    <path d="M776 ${y + 72} L912 ${y + 37} L1046 ${y + 89}" fill="none" stroke="#36332e"/>
    <path d="M811 ${y + 84} L912 ${y + 58} L1011 ${y + 97}" fill="none" stroke="#36332e"/>
    <path d="M744 ${y + 73} L760 ${y + 80} L760 ${y + 144}" fill="none" stroke="#fc5f02" stroke-width="2.5"/>
    <ellipse cx="760" cy="${y + 80}" rx="7" ry="3.5" fill="#fc5f02"/>
    <path d="M872 ${y + 83} L913 ${y + 72} L952 ${y + 87} L912 ${y + 98} Z" fill="${index === 0 ? "#fc5f02" : "#3c2a1d"}" stroke="#fc5f02"/>
    <path d="M895 ${y + 86} L910 ${y + 92} L930 ${y + 86}" fill="none" stroke="${index === 0 ? "#0c0b0a" : "#fc5f02"}" stroke-width="2"/>
  </g>`;
}).join("");

const diagram = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#0c0b0a"/>
  ${slabs}
  <path d="M68 579 H1132" stroke="#34312c"/>
  <circle cx="1132" cy="579" r="3" fill="#fc5f02"/>
</svg>`);

const logo = await sharp(path.join(root, "public/media/procemiza/brand/logo-header.png"))
  .resize({ width: 280 }).png().toBuffer();
const title = await Promise.all([
  textLayer("Transforme", "Fraunces", 76, "#f5f2ec", 68, 193),
  textLayer("processo em", "Fraunces", 76, "#f5f2ec", 68, 279),
  textLayer("margem.", "Fraunces", 76, "#f5f2ec", 68, 365),
  textLayer("Automação, integração e sistemas", "Archivo", 25, "#cbc8c0", 71, 493),
  textLayer("para empresas.", "Archivo", 25, "#cbc8c0", 71, 527),
]);
const labels = await Promise.all(["Origens", "Regras", "Integração", "Entrega"].map((label, index) =>
  textLayer(label, "Archivo", 18, "#cbc8c0", 980, 248 + index * 81)));
const output = path.join(root, "public/media/procemiza/og/og-image.png");
await sharp(diagram).composite([{ input: logo, left: 68, top: 69 }, ...title, ...labels])
  .png({ compressionLevel: 9, palette: true, quality: 100 }).toFile(output);
console.log(`Created ${path.relative(root, output)} (1200 × 630).`);
