const CONTRAST_FLARE = 0.05;
const MINIMUM_TEXT_CONTRAST = 4.5;
const COLOR_ADJUSTMENT_STEPS = 100;
const LIGHT_FOREGROUND = "#ffffff";

function parseHexColor(value: string | undefined): [number, number, number] | undefined {
  const hex = value?.trim().replace(/^#/, "");
  if (!hex || !/^[0-9a-f]{3,8}$/i.test(hex)) return undefined;
  const rgb = hex.length <= 4 ? hex.slice(0, 3).replace(/./g, (channel) => channel + channel) : hex.slice(0, 6);
  if (rgb.length !== 6) return undefined;
  const channel = (offset: number) => Number.parseInt(rgb.slice(offset, offset + 2), 16) / 255;
  return [channel(0), channel(2), channel(4)];
}

export function relativeLuminance(value: string | undefined): number | undefined {
  const rgb = parseHexColor(value);
  if (!rgb) return undefined;
  const linear = (channel: number) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  const [red, green, blue] = rgb;
  return 0.2126 * linear(red) + 0.7152 * linear(green) + 0.0722 * linear(blue);
}

export function contrastRatio(first: number, second: number): number {
  const [lighter, darker] = first > second ? [first, second] : [second, first];
  return (lighter + CONTRAST_FLARE) / (darker + CONTRAST_FLARE);
}

export function mixHexColors(base: string, tint: string, weight: number): string {
  const baseChannels = parseHexColor(base);
  const tintChannels = parseHexColor(tint);
  if (!baseChannels || !tintChannels) return base;
  return `#${baseChannels.map((channel, index) =>
    Math.round((channel * (1 - weight) + tintChannels[index] * weight) * 255).toString(16).padStart(2, "0"),
  ).join("")}`;
}

function opaqueTextColor(color: string, background: string): string {
  const hex = color.trim().replace(/^#/, "");
  if (!/^(?:[0-9a-f]{4}|[0-9a-f]{8})$/i.test(hex)) return color;
  const alphaHex = hex.length === 4 ? hex[3].repeat(2) : hex.slice(6);
  return mixHexColors(background, color, Number.parseInt(alphaHex, 16) / 255);
}

export function readableTextColor(foreground: string, background: string): string {
  const color = opaqueTextColor(foreground, background);
  const surfaceLuminance = relativeLuminance(background);
  const textLuminance = relativeLuminance(color);
  if (surfaceLuminance === undefined || textLuminance === undefined) return color;
  if (contrastRatio(textLuminance, surfaceLuminance) >= MINIMUM_TEXT_CONTRAST) return color;
  const target = contrastRatio(0, surfaceLuminance) > contrastRatio(1, surfaceLuminance) ? "#000000" : LIGHT_FOREGROUND;
  for (let step = 1; step <= COLOR_ADJUSTMENT_STEPS; step += 1) {
    const adjusted = mixHexColors(color, target, step / COLOR_ADJUSTMENT_STEPS);
    const luminance = relativeLuminance(adjusted) ?? textLuminance;
    if (contrastRatio(luminance, surfaceLuminance) >= MINIMUM_TEXT_CONTRAST) return adjusted;
  }
  return target;
}
