/**
 * Small, dependency-free scale helpers for the HTML/SVG plots. Layout maths
 * only: these never produce a value that is shown as data.
 */

/** Rounded tick values covering [low, high], about `count` intervals. */
export function niceTicks(low: number, high: number, count = 4): number[] {
  let lo = Math.min(low, high);
  let hi = Math.max(low, high);
  if (lo === hi) {
    const pad = Math.abs(lo) * 0.1 || 1;
    lo = Math.max(0, lo - pad);
    hi += pad;
  }
  const raw = (hi - lo) / count;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const normalised = raw / magnitude;
  const step = (normalised < 1.5 ? 1 : normalised < 3 ? 2 : normalised < 7 ? 5 : 10) * magnitude;
  const start = Math.floor(lo / step) * step;
  const end = Math.ceil(hi / step) * step;
  const ticks: number[] = [];
  for (let value = start; value <= end + step / 2; value += step) {
    ticks.push(Number(value.toFixed(10)));
  }
  return ticks;
}

/** Linear position of `value` in [domain0, domain1], as a 0..100 percentage, clamped. */
export function toPercent(value: number, domain: readonly [number, number]): number {
  const [start, end] = domain;
  if (end === start) return 50;
  return Math.max(0, Math.min(100, ((value - start) / (end - start)) * 100));
}

const tickFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

export function formatTick(value: number): string {
  return tickFormatter.format(value);
}
