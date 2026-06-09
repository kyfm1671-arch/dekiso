// 🌟 修正ポイント：一番薄い「90」をカットし、文字が見やすく綺麗に映える4段階に変更しました
export const LIGHTNESS_STEPS = [35, 48, 62, 75];

function pickRandomStep() {
  return LIGHTNESS_STEPS[Math.floor(Math.random() * LIGHTNESS_STEPS.length)];
}

export function hslToHex(h, s, l) {
  const sat = s / 100;
  const light = l / 100;
  const c = (1 - Math.abs(2 * light - 1)) * sat;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = light - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  const toHex = (n) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, '0');

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

const HUES = [
  { name: 'red', h: 0, s: 78 },
  { name: 'orange', h: 32, s: 82 },
  { name: 'yellow', h: 54, s: 86 },
  { name: 'pink', h: 340, s: 72 },
  { name: 'green', h: 142, s: 68 },
  { name: 'blue', h: 220, s: 75 },
  { name: 'purple', h: 278, s: 72 },
  { name: 'black', h: 0, s: 0 },
];

function shuffle(list) {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function createColor(hueDef, index) {
  const l = pickRandomStep();

  return {
    id: `color-${index}-${Math.random().toString(36).slice(2, 7)}`,
    name: hueDef.name,
    h: hueDef.h,
    s: hueDef.s,
    l,
    hex: hslToHex(hueDef.h, hueDef.s, l),
  };
}

export function generatePalette() {
  return shuffle(HUES).map((hueDef, index) => createColor(hueDef, index));
}