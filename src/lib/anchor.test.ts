import { describe, expect, it } from 'vitest';

import { place } from './anchor';

const viewport = { width: 1000, height: 800 };
const panel = { width: 200, height: 100 };

describe('place', () => {
  it('opens below the trigger, 8px away, aligned to its start', () => {
    const anchor = { top: 100, left: 300, width: 40, height: 40 };

    expect(place(anchor, panel, { side: 'bottom', viewport })).toEqual({ top: 148, left: 300 });
  });

  it('aligns to the trigger end, as the top bar menus do', () => {
    const anchor = { top: 100, left: 900, width: 40, height: 40 };

    expect(place(anchor, panel, { side: 'bottom', align: 'end', viewport })).toEqual({
      top: 148,
      left: 740,
    });
  });

  it('flips above the trigger near the bottom edge', () => {
    const anchor = { top: 720, left: 300, width: 40, height: 40 };

    expect(place(anchor, panel, { side: 'bottom', viewport }).top).toBe(612);
  });

  it('stays inside the viewport sideways', () => {
    const anchor = { top: 100, left: 950, width: 40, height: 40 };

    expect(place(anchor, panel, { side: 'bottom', viewport }).left).toBe(792);
  });

  it('opens to the right of a rail link, centred, and flips left at the edge', () => {
    expect(
      place(
        { top: 100, left: 12, width: 40, height: 36 },
        { width: 80, height: 24 },
        {
          side: 'right',
          viewport,
        },
      ),
    ).toEqual({ top: 106, left: 60 });

    expect(
      place(
        { top: 100, left: 950, width: 40, height: 36 },
        { width: 80, height: 24 },
        {
          side: 'right',
          viewport,
        },
      ).left,
    ).toBe(862);
  });
});
