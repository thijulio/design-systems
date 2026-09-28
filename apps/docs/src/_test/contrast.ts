/** Contrast for the opaque RGB colors returned by getComputedStyle. */
export function contrastRatio(foreground: string, background: string) {
  function luminance(color: string) {
    const channels = color.match(/[\d.]+/g)?.map(Number);
    if (!channels || channels.length < 3 || (channels[3] ?? 1) !== 1) {
      throw new Error(`Expected an opaque RGB color, received ${color}`);
    }
    const linear = channels.slice(0, 3).map((channel) => {
      const value = channel / 255;
      return value <= 0.04045
        ? value / 12.92
        : ((value + 0.055) / 1.055) ** 2.4;
    });
    return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
  }
  const a = luminance(foreground);
  const b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
