import { createCanvas, loadImage } from "canvas";
import fs from "fs";

const size = 512;
const canvas = createCanvas(size, size);
const ctx = canvas.getContext("2d");

// White background
ctx.fillStyle = "#ffffff";
ctx.fillRect(0, 0, size, size);

// Load logo and draw centered with padding
const img = await loadImage("./public/logo.png");
const padding = 80;
const maxW = size - padding * 2;
const maxH = size - padding * 2;
const scale = Math.min(maxW / img.width, maxH / img.height);
const w = img.width * scale;
const h = img.height * scale;
const x = (size - w) / 2;
const y = (size - h) / 2;
ctx.drawImage(img, x, y, w, h);

fs.writeFileSync("./public/pwa-icon.png", canvas.toBuffer("image/png"));
console.log("Done: public/pwa-icon.png");
