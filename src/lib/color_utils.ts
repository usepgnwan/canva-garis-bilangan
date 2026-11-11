export interface PresetColor {
  name: string;
  value: string;
}

export const SOLUTION_COLORS: PresetColor[] = [
  { name: "Sky Blue", value: "#3B82F6" },
  { name: "Teal", value: "#0D9488" },
  { name: "Coral", value: "#F97316" },
  { name: "Purple", value: "#8B5CF6" },
  { name: "Mint Green", value: "#10B981" },
  { name: "Rose Pink", value: "#EC4899" },
];

export const AXIS_COLORS: PresetColor[] = [
  { name: "Dark Gray", value: "#333333" },
  { name: "Black", value: "#000000" },
  { name: "Navy", value: "#1A2B4C" },
  { name: "Dark Green", value: "#1B4332" },
  { name: "Brown", value: "#4A2E18" },
  { name: "Dark Purple", value: "#3D1E4A" },
  { name: "White", value: "#FFFFFF" },
  { name: "Cream", value: "#FFFDD0" },
];

export const BACKGROUND_COLORS: PresetColor[] = [
  { name: "Cream", value: "#FDFBF7" },
  { name: "Light Blue", value: "#E8F4F8" },
  { name: "Mint", value: "#E8F6F0" },
  { name: "Pink", value: "#FCEEEF" },
  { name: "Lavender", value: "#F2EFF9" },
  { name: "Chalkboard", value: "#1C332A" },
  { name: "Dark Navy", value: "#0F172A" },
  { name: "Charcoal", value: "#1E293B" },
];

/**
 * Converts hex color #RRGGBB or #RGB to { r, g, b } in 0..255
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  let cleaned = hex.trim().replace(/^#/, "");
  if (cleaned.length === 3) {
    cleaned = cleaned
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (cleaned.length !== 6) return null;
  const num = parseInt(cleaned, 16);
  if (isNaN(num)) return null;
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Calculates relative luminance according to WCAG 2.1
 */
export function getRelativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5;

  const normalize = (val: number) => {
    const s = val / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };

  const r = normalize(rgb.r);
  const g = normalize(rgb.g);
  const b = normalize(rgb.b);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculates contrast ratio between two hex colors: range 1:1 to 21:1
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getRelativeLuminance(hex1);
  const lum2 = getRelativeLuminance(hex2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Determines whether the background is considered dark
 */
export function isDarkColor(hex: string): boolean {
  return getRelativeLuminance(hex) < 0.25;
}

/**
 * Recommends readable axis color (Dark Gray for light bg, White for dark bg)
 */
export function getReadableAxisColor(bgHex: string): string {
  return isDarkColor(bgHex) ? "#FFFFFF" : "#333333";
}
