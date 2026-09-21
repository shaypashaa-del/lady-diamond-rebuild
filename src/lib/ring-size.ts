// Ring size <-> inner-diameter conversion, US sizing.
//
// Anchored at the widely-published reference point (US size 7 = 17.3mm inner
// diameter) with a constant 0.8mm-per-whole-size progression. Cross-checked
// against two independent published conversion tables (each mm value came
// out within +/-0.2mm of this formula across the full 3-13 range) — accurate
// enough for an on-screen sizing aid, where the screen-calibration step
// itself is the larger source of error anyway.
const REF_SIZE = 7;
const REF_DIAMETER_MM = 17.3;
const MM_PER_SIZE = 0.8;

export function usSizeToDiameterMm(size: number): number {
  return REF_DIAMETER_MM + (size - REF_SIZE) * MM_PER_SIZE;
}

export function diameterMmToUsSize(diameterMm: number): number {
  const raw = REF_SIZE + (diameterMm - REF_DIAMETER_MM) / MM_PER_SIZE;
  return Math.round(raw * 2) / 2; // nearest half size
}

export function circumferenceMmToUsSize(circumferenceMm: number): number {
  return diameterMmToUsSize(circumferenceMm / Math.PI);
}

export function usSizeToCircumferenceMm(size: number): number {
  return usSizeToDiameterMm(size) * Math.PI;
}

// Reference ranges for the two quick-reference tables — same continuous mm
// scale, widened beyond the narrowest "typical" range since real finger
// sizes vary more than a narrow chart implies (a chart that stops at a
// common size can wrongly read as "that's the largest/smallest size that
// exists"). Sizes above/below this range are still real and orderable —
// see the note shown under the tables.
export const WOMEN_RING_SIZES = [3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10];
export const MEN_RING_SIZES = [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14, 14.5, 15];

// ISO/IEC 7810 ID-1 — the standard size for credit/debit cards worldwide
// (including Israel), used as the on-screen calibration reference since
// nearly everyone has one on hand and it needs no special equipment.
export const STANDARD_CARD_WIDTH_MM = 85.6;
export const STANDARD_CARD_HEIGHT_MM = 53.98;
