// scripts/lib/color-math.mjs
//
// WCAG 2.x relative-luminance / contrast-ratio math, plus a re-implementation
// of Sass's `darken()` (HSL lightness, absolute percentage-point subtraction)
// so the palette-contrast test can resolve `darken($token, N%)` call sites the
// same way `sass --style compressed` would, without a Sass runtime dependency.
// No external deps -- deliberately small and auditable (see AC-049 CI note:
// this is the check itself, so it must not depend on anything hard to audit).

export function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const int = parseInt(full, 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
}

export function rgbToHex({ r, g, b }) {
  const c = (n) => Math.round(n).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

function srgbChannel(c) {
  const cs = c / 255;
  return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
}

// WCAG 2.x relative luminance -- https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
export function relativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const R = srgbChannel(r);
  const G = srgbChannel(g);
  const B = srgbChannel(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

// WCAG 2.x contrast ratio, NOT rounded (callers must not round before
// comparing to a threshold -- AC-026/027 are explicit that 2.999 !== 3).
export function contrastRatio(hexA, hexB) {
  const La = relativeLuminance(hexA);
  const Lb = relativeLuminance(hexB);
  const lighter = Math.max(La, Lb);
  const darker = Math.min(La, Lb);
  return (lighter + 0.05) / (darker + 0.05);
}

function rgbToHsl({ r, g, b }) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s;
  const l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hue2rgb(p, q, t) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

function hslToRgb({ h, s, l }) {
  h /= 360; s /= 100; l /= 100;
  if (s === 0) {
    const v = l * 255;
    return { r: v, g: v, b: v };
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return {
    r: hue2rgb(p, q, h + 1 / 3) * 255,
    g: hue2rgb(p, q, h) * 255,
    b: hue2rgb(p, q, h - 1 / 3) * 255,
  };
}

// Sass's darken($color, $amount): subtracts $amount PERCENTAGE POINTS from
// HSL lightness (clamped to [0,100]). Hue/saturation untouched. This matches
// sass:color's legacy darken() (still what Dart Sass ships as of 4.4.1 --
// the deprecation warns but the math is unchanged).
export function darken(hex, amountPct) {
  const hsl = rgbToHsl(hexToRgb(hex));
  hsl.l = Math.max(0, Math.min(100, hsl.l - amountPct));
  return rgbToHex(hslToRgb(hsl));
}

export function lighten(hex, amountPct) {
  const hsl = rgbToHsl(hexToRgb(hex));
  hsl.l = Math.max(0, Math.min(100, hsl.l + amountPct));
  return rgbToHex(hslToRgb(hsl));
}
