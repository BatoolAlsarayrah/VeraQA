type Box = { top: number; left: number; width: number; height: number };
type Size = { width: number; height: number };

type Options = {
  side: 'bottom' | 'right';
  align?: 'start' | 'end';
  gap?: number;
  margin?: number;
  viewport: Size;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

export function place(anchor: Box, panel: Size, options: Options) {
  const { side, align = 'start', gap = 8, margin = 8, viewport } = options;
  const right = anchor.left + anchor.width;
  const bottom = anchor.top + anchor.height;

  if (side === 'right') {
    const fits = right + gap + panel.width <= viewport.width - margin;
    return {
      left: fits ? right + gap : anchor.left - gap - panel.width,
      top: clamp(
        anchor.top + (anchor.height - panel.height) / 2,
        margin,
        viewport.height - margin - panel.height,
      ),
    };
  }

  const fitsBelow = bottom + gap + panel.height <= viewport.height - margin;
  const fitsAbove = anchor.top - gap - panel.height >= margin;
  return {
    top: fitsBelow || !fitsAbove ? bottom + gap : anchor.top - gap - panel.height,
    left: clamp(
      align === 'end' ? right - panel.width : anchor.left,
      margin,
      viewport.width - margin - panel.width,
    ),
  };
}
