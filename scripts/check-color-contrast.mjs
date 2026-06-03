import { readFileSync } from "node:fs";

const themeSource = readFileSync("lib/theme.ts", "utf8");
const iconPickerSource = readFileSync("components/ui/icon-picker.tsx", "utf8");

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  return [0, 2, 4].map((index) => parseInt(value.slice(index, index + 2), 16));
}

function luminance(hex) {
  const [red, green, blue] = hexToRgb(hex).map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(foreground, background) {
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort(
    (left, right) => right - left
  );
  return (lighter + 0.05) / (darker + 0.05);
}

function readThemeColor(theme, key) {
  const themeMatch = themeSource.match(new RegExp(`${theme}: \\{([\\s\\S]*?)\\n  \\}`));
  if (!themeMatch) {
    throw new Error(`Missing theme ${theme}.`);
  }

  const colorMatch = themeMatch[1].match(new RegExp(`${key}: "([^"]+)"`));
  if (!colorMatch) {
    throw new Error(`Missing ${key} for ${theme}.`);
  }

  return colorMatch[1];
}

const minimumTextContrast = 4.5;
const minimumIconContrast = 3;

for (const theme of ["sterne", "tiere", "galaxy"]) {
  const button = readThemeColor(theme, "button");
  const accentStrong = readThemeColor(theme, "accentStrong");
  const chartSecondary = readThemeColor(theme, "chartSecondary");

  if (contrastRatio("#FFFFFF", button) < minimumTextContrast) {
    throw new Error(`${theme} button does not meet contrast for white text.`);
  }

  if (contrastRatio(accentStrong, "#FFFFFF") < minimumIconContrast) {
    throw new Error(`${theme} accentStrong is too light on white surfaces.`);
  }

  if (contrastRatio(chartSecondary, "#FFFFFF") < minimumIconContrast) {
    throw new Error(`${theme} chartSecondary is too light on white surfaces.`);
  }
}

if (iconPickerSource.includes("bg-[#87CEEB]") || iconPickerSource.includes("color={isSelected ? \"#87CEEB\"")) {
  throw new Error("IconPicker selected state still uses low-contrast sky blue.");
}

console.log("Critical theme and icon picker contrast checks passed.");
