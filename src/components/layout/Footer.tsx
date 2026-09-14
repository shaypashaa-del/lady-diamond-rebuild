import Link from "next/link";
import { footerColumns } from "@/lib/nav-data";

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-14 sm:grid-cols-4 sm:px-8">
        <div>
          <h3 className="text-sm font-semibold tracking-wide">Lady Diamond</h3>
          <p className="mt-3 text-sm text-neutral-500">
            Fine jewelry in gold and silver, designed for everyday wear since 2010.
          </p>
        </div>
        {footerColumns.map((col) => (
          <div key={col.title}>
            <h3 className="text-sm font-semibold uppercase tracking-wide">{col.title}</h3>
            <ul className="mt-3 space-y-2 text-sm text-neutral-500">
              {col.links.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="hover:text-neutral-900">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-neutral-200 py-4">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 text-xs text-neutral-500 sm:flex-row sm:px-8">
          <p>© Since 2010 Lady Diamond Jewels, All Rights Reserved</p>
          <a href="mailto:info@ladydiamondjewels.com" className="hover:text-neutral-900">
            info@ladydiamondjewels.com
          </a>
        </div>
      </div>
    </footer>
  );
}
