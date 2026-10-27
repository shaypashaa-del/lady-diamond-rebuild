"use client";

// Last-resort error screen (a failure in the root layout itself). Plain light page with
// the error detail, so a failure never shows up as an unexplained black screen.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="he" dir="rtl">
      <body style={{ margin: 0, background: "#ffffff", color: "#171717", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ maxWidth: 360, margin: "0 auto", padding: "64px 20px", textAlign: "center" }}>
          <p style={{ fontSize: 11, letterSpacing: "0.35em", color: "#b08d3c" }}>LADY DIAMOND</p>
          <h1 style={{ fontSize: 20, margin: "12px 0 8px" }}>משהו השתבש</h1>
          <p style={{ fontSize: 14, color: "#525252" }}>אפשר לנסות שוב. אם זה חוזר, שלחו צילום מסך של ההודעה.</p>
          <button
            type="button"
            onClick={() => reset()}
            style={{ marginTop: 20, minHeight: 44, padding: "0 24px", background: "#171717", color: "#fff", border: 0, borderRadius: 4, fontSize: 14 }}
          >
            נסו שוב
          </button>
          <p dir="ltr" style={{ marginTop: 24, fontSize: 11, color: "#737373", wordBreak: "break-word" }}>
            {error.message}
            {error.digest ? ` · Digest: ${error.digest}` : ""}
          </p>
        </div>
      </body>
    </html>
  );
}
