import Image from "next/image";
import { Link } from "@/i18n/navigation";

// A persistent brand mark fixed to the page's left edge — mirrors the
// WhatsApp button on the right, sized up gradually from mobile to desktop.
export function FloatingLogoBadge() {
  return (
    <Link
      href="/"
      aria-label="Lady Diamond"
      className="fixed bottom-4 left-4 z-40 flex h-12 w-12 items-center justify-center border border-gold-soft bg-paper shadow-[0_6px_20px_-4px_rgba(0,0,0,0.2)] transition-transform hover:scale-105 sm:bottom-5 sm:left-5 sm:h-16 sm:w-16"
    >
      <Image
        src="/brand/logo.png"
        alt="Lady Diamond"
        width={54}
        height={44}
        className="h-8 w-auto sm:h-11"
      />
    </Link>
  );
}
