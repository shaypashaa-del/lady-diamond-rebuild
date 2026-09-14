"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { primaryNav } from "@/lib/nav-data";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-40 border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-8">
        <Link href="/" className="flex flex-col items-center leading-none">
          <span className="text-lg font-semibold tracking-[0.2em]">LADY DIAMOND</span>
          <span className="text-[10px] tracking-[0.3em] text-neutral-500">SINCE 2010</span>
        </Link>

        <div className="flex items-center gap-4">
          <button aria-label="Search" className="hidden sm:inline-flex text-neutral-700 hover:text-black">
            <Search size={18} />
          </button>
          <Link href="/account" aria-label="Account" className="hidden sm:inline-flex text-neutral-700 hover:text-black">
            <User size={18} />
          </Link>
          <Link href="/cart" aria-label="Cart" className="hidden sm:inline-flex text-neutral-700 hover:text-black">
            <ShoppingBag size={18} />
          </Link>
          <button
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="text-neutral-800 hover:text-black"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <nav className="relative flex h-full w-full max-w-sm flex-col overflow-y-auto bg-white p-6 shadow-xl">
            <button
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="mb-8 self-end text-neutral-700 hover:text-black"
            >
              <X size={22} />
            </button>

            <ul className="space-y-6 text-sm tracking-wide">
              {primaryNav.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="font-medium uppercase text-neutral-900"
                  >
                    {item.name}
                  </Link>
                  {item.mega && (
                    <ul className="mt-3 space-y-2 border-l border-neutral-200 pl-4 text-neutral-500">
                      {item.mega.map((cat) => (
                        <li key={cat.name}>
                          <Link href={cat.href} onClick={() => setOpen(false)}>
                            {cat.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>

            <div className="mt-auto flex items-center gap-4 border-t border-neutral-200 pt-6 sm:hidden">
              <Link href="/account" onClick={() => setOpen(false)} className="flex items-center gap-2 text-sm">
                <User size={16} /> Account
              </Link>
              <Link href="/cart" onClick={() => setOpen(false)} className="flex items-center gap-2 text-sm">
                <ShoppingBag size={16} /> Cart
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
