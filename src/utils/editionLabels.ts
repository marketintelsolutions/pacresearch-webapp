// Consistent, selectable edition names so admins pick rather than free-type.
const ORDINALS = [
  "First",
  "Second",
  "Third",
  "Fourth",
  "Fifth",
  "Sixth",
  "Seventh",
  "Eighth",
  "Ninth",
  "Tenth",
  "Eleventh",
  "Twelfth",
  "Thirteenth",
  "Fourteenth",
  "Fifteenth",
  "Sixteenth",
  "Seventeenth",
  "Eighteenth",
  "Nineteenth",
  "Twentieth",
];

export const EDITION_LABELS = ORDINALS.map((o) => `${o} Edition`);

/** Label for the nth edition (1-based), falling back for very high numbers. */
export const ordinalEditionLabel = (n: number): string =>
  EDITION_LABELS[n - 1] || `Edition ${n}`;
