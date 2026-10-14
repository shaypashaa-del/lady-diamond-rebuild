import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "fs";
import path from "path";

// Policy: API keys / secrets live only in the server's environment and are
// never sent to the browser. These checks fail the build if that is broken.

const SRC = path.resolve(__dirname, "..");
const SECRET_NAMES = /\b(SMTP_[A-Z]+|RESEND_API_KEY|PAYPAL_CLIENT_SECRET|DATABASE_URL|SESSION_SECRET|DEPLOY_WEBHOOK_SECRET)\b/;

function walk(dir: string, out: string[] = []) {
  for (const name of readdirSync(dir)) {
    if (name === "generated" || name === "node_modules") continue;
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(name) && !/\.test\.tsx?$/.test(name)) out.push(full);
  }
  return out;
}

// Comments may mention variable names; only real code counts.
const stripComments = (t: string) => t.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
const files = walk(SRC).map((f) => ({ f: path.relative(SRC, f), text: readFileSync(f, "utf8") }));
const code = (text: string) => stripComments(text);

describe("secrets stay on the server", () => {
  it("no NEXT_PUBLIC_ variable carries a secret", () => {
    const bad = files.flatMap(({ f, text }) =>
      [...text.matchAll(/NEXT_PUBLIC_[A-Z0-9_]+/g)]
        .map((m) => m[0])
        .filter((n) => /SECRET|PASS|PRIVATE|TOKEN|API_KEY|SMTP|DATABASE/.test(n))
        .map((n) => `${f}: ${n}`)
    );
    expect(bad).toEqual([]);
  });

  it('client components ("use client") read no private env variable', () => {
    const bad = files
      .filter(({ text }) => /^\s*["']use client["']/.test(text))
      .flatMap(({ f, text }) =>
        [...text.matchAll(/process\.env\.([A-Z0-9_]+)/g)]
          .map((m) => m[1])
          .filter((n) => !n.startsWith("NEXT_PUBLIC_") && n !== "NODE_ENV")
          .map((n) => `${f}: process.env.${n}`)
      );
    expect(bad).toEqual([]);
  });

  it("files that read a secret are server-only", () => {
    // prisma.ts is also used by standalone scripts, where "server-only" cannot load.
    const allowed = new Set(["lib/prisma.ts"]);
    const bad = files
      .filter(({ f, text }) => SECRET_NAMES.test(code(text)) && !allowed.has(f.replace(/\\/g, "/")))
      .filter(
        ({ f, text }) =>
          !/import ["']server-only["']/.test(text) &&
          !/^\s*["']use server["']/m.test(text) &&
          !f.replace(/\\/g, "/").startsWith("app/api/")
      )
      .map(({ f }) => f);
    expect(bad).toEqual([]);
  });
});
