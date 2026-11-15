import { GemAccent, type Stone } from "@/components/gem/GemAccent";

// Specks of gold that drift down behind a dark page header. Fixed positions (not
// random) so server and client markup match.
const FLECKS = [
  { l: "8%", s: 6, d: 11, o: -2 },
  { l: "21%", s: 4, d: 14, o: -7 },
  { l: "34%", s: 7, d: 12, o: -4 },
  { l: "52%", s: 4, d: 15, o: -9 },
  { l: "66%", s: 6, d: 10, o: -5 },
  { l: "79%", s: 5, d: 13, o: -1 },
  { l: "91%", s: 4, d: 12, o: -8 },
];

/** Live gemstone plus drifting gold, for the dark header band of a page. */
export function GemBackdrop({ stone = "diamond" }: { stone?: Stone }) {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(221,170,93,0.2)_0%,transparent_65%)]"
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {FLECKS.map((f, i) => (
          <span
            key={i}
            className="gold-fleck"
            style={{ left: f.l, width: f.s, height: f.s, animationDuration: `${f.d}s`, animationDelay: `${f.o}s` }}
          />
        ))}
      </div>
      <div className="gem-slot relative mx-auto mb-3 w-28 sm:w-32 lg:absolute lg:end-[7%] lg:top-1/2 lg:mb-0 lg:w-60 lg:-translate-y-1/2">
        <GemAccent stone={stone} className="w-full" />
      </div>
    </>
  );
}
