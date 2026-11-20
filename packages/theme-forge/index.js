#!/usr/bin/env node
/**
 * AnymousDEX Theme Forge
 *
 * Generates a complete theme JSON from a name, an accent color and an optional
 * background color. No dependencies.
 *
 * Usage:
 *   node packages/theme-forge/index.js --name ember --accent "#FF8A4C"
 *   node packages/theme-forge/index.js --name ice --accent "#4FC3F7" --background "#07101C"
 */

const fs = require("fs");
const path = require("path");

const BASE_THEME = path.join(__dirname, "../../src/assets/themes/nord-plus.json");
const OUTPUT_DIR = path.join(__dirname, "../../src/assets/themes");

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const value = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : "true";
      out[key] = value;
    }
  }
  return out;
}

function hexToRgb(hex) {
  const clean = String(hex).replace("#", "").trim();
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) throw new Error(`Invalid color: ${hex}`);
  return [parseInt(clean.slice(0, 2), 16), parseInt(clean.slice(2, 4), 16), parseInt(clean.slice(4, 6), 16)];
}

function rgbToHex(rgb) {
  return "#" + rgb.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("").toUpperCase();
}

function mix(a, b, amount) {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  return rgbToHex(ca.map((v, i) => v + (cb[i] - v) * amount));
}

function buildPalette(accent, background) {
  const bg = background || mix("#07070C", accent, 0.06);
  return {
    light_black: bg,
    grey: mix(bg, accent, 0.07),
    black: mix(bg, accent, 0.12),
    lightBlack: mix(bg, accent, 0.24),
    terminalBg: mix(bg, accent, 0.04),
    fg: mix("#F2F4F8", accent, 0.10),
    white: mix("#FFFFFF", accent, 0.06),
    lightWhite: mix("#FFFFFF", accent, 0.03),
    cyan: accent,
    lightCyan: mix(accent, "#FFFFFF", 0.30),
    blue: mix(accent, "#4C6FFF", 0.45),
    magenta: mix(accent, "#C05CFF", 0.45),
    red: mix(accent, "#FF4D5E", 0.55),
    green: mix(accent, "#3DDC84", 0.55),
    yellow: mix(accent, "#FFC857", 0.55)
  };
}

function forge(name, accent, background) {
  if (!/^[a-z0-9][a-z0-9-_]*$/i.test(name)) throw new Error("Theme name must be alphanumeric (dashes allowed).");

  const base = JSON.parse(fs.readFileSync(BASE_THEME, "utf8"));
  const palette = buildPalette(accent, background);
  const old = base.colors;

  const mapping = {
    [old.black]: palette.black,
    [old.red]: palette.red,
    [old.green]: palette.green,
    [old.yellow]: palette.yellow,
    [old.blue]: palette.blue,
    [old.magenta]: palette.magenta,
    [old.cyan]: palette.cyan,
    [old.white]: palette.white,
    [old.lightBlack]: palette.lightBlack,
    [old.lightCyan]: palette.lightCyan,
    [old.lightWhite]: palette.lightWhite,
    [old.light_black]: palette.light_black,
    [old.grey]: palette.grey
  };

  let text = JSON.stringify(base, null, 2);
  for (const [from, to] of Object.entries(mapping)) {
    text = text.split(from).join(to);
    text = text.split(from.toLowerCase()).join(to);
  }

  const accentRgb = hexToRgb(palette.cyan);
  const fgRgb = hexToRgb(palette.fg);
  const bgRgb = hexToRgb(palette.light_black);
  text = text.split("rgba(136, 192, 208,").join(`rgba(${accentRgb.join(", ")},`);
  text = text.split("rgba(216, 222, 233,").join(`rgba(${fgRgb.join(", ")},`);
  text = text.split("rgba(46, 52, 64,").join(`rgba(${bgRgb.join(", ")},`);

  const theme = JSON.parse(text);
  theme.colors.r = parseInt(palette.fg.slice(1, 3), 16);
  theme.colors.g = parseInt(palette.fg.slice(3, 5), 16);
  theme.colors.b = parseInt(palette.fg.slice(5, 7), 16);
  theme.globe = { base: palette.black, marker: palette.yellow, pin: palette.cyan, satellite: palette.red };
  theme.terminal.background = palette.terminalBg;
  theme.terminal.foreground = palette.fg;
  theme.terminal.cursor = palette.cyan;
  theme.terminal.cursorAccent = palette.light_black;
  theme.terminal.selection = `rgba(${accentRgb.join(", ")}, 0.28)`;

  const out = path.join(OUTPUT_DIR, name + ".json");
  fs.writeFileSync(out, JSON.stringify(theme, null, 2), "utf8");
  return out;
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.name || !args.accent) {
    console.log("AnymousDEX Theme Forge\n");
    console.log("Usage: node packages/theme-forge/index.js --name <theme> --accent \"#RRGGBB\" [--background \"#RRGGBB\"]\n");
    console.log("Example: node packages/theme-forge/index.js --name aurora --accent \"#59F7C0\"");
    process.exit(args.help ? 0 : 1);
  }

  try {
    const out = forge(args.name, args.accent, args.background);
    console.log(`Theme written to ${out}`);
    console.log("Restart AnymousDEX or switch themes in Settings to load it.");
  } catch (e) {
    console.error("Theme Forge error:", e.message);
    process.exit(1);
  }
}

if (require.main === module) main();

module.exports = { forge, buildPalette, mix };
