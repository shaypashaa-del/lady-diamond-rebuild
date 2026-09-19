// A purely decorative, ambient touch — a faint gold streak drifting once
// every ~14s. Fixed behind all content (see .shooting-star-layer in
// globals.css) so it never overlaps text or blocks interaction.
export function ShootingStar() {
  return (
    <div className="shooting-star-layer" aria-hidden="true">
      <span className="shooting-star" />
    </div>
  );
}
