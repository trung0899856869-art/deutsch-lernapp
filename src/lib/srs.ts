// SM-2 Spaced Repetition System algorithm

export interface SrsState {
  interval: number;    // days until next review
  repetition: number;  // number of successful reviews
  efactor: number;     // ease factor (≥ 1.3)
  dueDate: string;     // ISO date string (YYYY-MM-DD)
}

// Quality: 0-5 (0-2 = fail, 3-5 = pass)
export type Quality = 0 | 1 | 2 | 3 | 4 | 5;

export function toLocalDateString(d: Date): string {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + Math.round(days));
  return toLocalDateString(d);
}

/**
 * Compute the next SRS state after a review.
 * Returns the new state to persist.
 */
export function computeNextSrs(state: SrsState, quality: Quality): SrsState {
  let { interval, repetition, efactor } = state;

  if (quality >= 3) {
    // Successful recall
    if (repetition === 0) {
      interval = 1;
    } else if (repetition === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * efactor);
    }
    repetition += 1;
  } else {
    // Failed recall — reset repetitions, restart intervals
    repetition = 0;
    interval = 1;
  }

  // Update ease factor
  efactor = efactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (efactor < 1.3) efactor = 1.3;

  return {
    interval,
    repetition,
    efactor,
    dueDate: addDays(interval),
  };
}

/**
 * Initial SRS state for a newly added vocabulary entry.
 */
export function initialSrsState(): Omit<SrsState, "dueDate"> & { dueDate: string } {
  return {
    interval: 1,
    repetition: 0,
    efactor: 2.5,
    dueDate: addDays(0), // due today
  };
}

/**
 * Returns true if the card is due for review today or earlier.
 */
export function isDue(dueDate: string): boolean {
  return dueDate <= toLocalDateString(new Date());
}
