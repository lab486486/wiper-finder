#!/usr/bin/env node
/**
 * Render one splash PNG via @resvg/resvg-js (supports custom fonts).
 * Usage: node scripts/render-splash-frame.mjs <size> <outPath> <fontPath>
 */
import { writeFileSync } from "fs";
import { Resvg } from "@resvg/resvg-js";

const size = Number(process.argv[2]);
const outPath = process.argv[3];
const fontPath = process.argv[4];
const lines = ["자동차 와이퍼", "사이즈 검색기"];

const fontSize = Math.round(size * 0.058);
const lineGap = Math.round(fontSize * 1.35);
const y1 = Math.round(size * 0.44);
const y2 = y1 + lineGap;

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#ffffff"/>
  <text x="${size / 2}" y="${y1}" text-anchor="middle" font-family="SplashFont" font-size="${fontSize}" fill="#0f172a" font-weight="600">${lines[0]}</text>
  <text x="${size / 2}" y="${y2}" text-anchor="middle" font-family="SplashFont" font-size="${fontSize}" fill="#0f172a" font-weight="600">${lines[1]}</text>
</svg>`;

const resvg = new Resvg(svg, {
  fitTo: { mode: "width", value: size },
  font: {
    fontFiles: [fontPath],
    loadSystemFonts: false,
    defaultFontFamily: "SplashFont",
  },
});

writeFileSync(outPath, resvg.render().asPng());
