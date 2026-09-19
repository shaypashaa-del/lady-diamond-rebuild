// The brand's real, live social accounts (found in the original site's
// footer widget during the WordPress export audit) — not placeholder links.
const SOCIALS = [
  {
    key: "facebook",
    href: "https://www.facebook.com/share/1DvujJtBMS/?mibextid=wwXIfr",
    label: "Facebook",
    path: "M13.5 9H15V6.5h-1.7c-2 0-3.3 1.3-3.3 3.4V11H8v2.5h2v6.5h2.6v-6.5h2l.4-2.5h-2.4v-.9c0-.7.2-1.1 1-1.1Z",
  },
  {
    key: "instagram",
    href: "https://www.instagram.com/lady_di_diamond?stkn=MTZmcHF0cjZ2bmV2cA%3D%3D&utm_source=qr",
    label: "Instagram",
    path: "M12 8.3a3.7 3.7 0 1 0 0 7.4 3.7 3.7 0 0 0 0-7.4Zm0 6.1a2.4 2.4 0 1 1 0-4.8 2.4 2.4 0 0 1 0 4.8ZM16.9 8.2a.86.86 0 1 1-1.72 0 .86.86 0 0 1 1.72 0ZM20 8.4c-.06-1.2-.33-2.27-1.2-3.14C17.93 4.4 16.86 4.12 15.66 4.06 14.4 4 9.6 4 8.34 4.06 7.14 4.12 6.07 4.4 5.2 5.26 4.32 6.13 4.06 7.2 4 8.4 3.94 9.6 3.94 14.4 4 15.6c.06 1.2.32 2.27 1.2 3.14.87.87 1.94 1.14 3.14 1.2 1.26.06 6.06.06 7.32 0 1.2-.06 2.27-.33 3.14-1.2.87-.87 1.14-1.94 1.2-3.14.06-1.2.06-6 0-7.2Zm-1.98 8.4a2.98 2.98 0 0 1-1.68 1.68c-1.16.46-3.92.35-5.2.35s-4.04.1-5.2-.35a2.98 2.98 0 0 1-1.68-1.68c-.46-1.16-.35-3.92-.35-5.2s-.1-4.04.35-5.2A2.98 2.98 0 0 1 6.94 4.7c1.16-.46 3.92-.35 5.2-.35s4.04-.1 5.2.35c.78.3 1.38.9 1.68 1.68.46 1.16.35 3.92.35 5.2s.1 4.04-.35 5.2Z",
  },
  {
    key: "tiktok",
    href: "https://www.tiktok.com/@dianaoriyadiamond",
    label: "TikTok",
    path: "M16.2 4h-2.6v10.6a2.4 2.4 0 1 1-1.7-2.3V9.1a5.1 5.1 0 1 0 4.3 5.05V9.3a6.3 6.3 0 0 0 3.6 1.13V7.9a3.7 3.7 0 0 1-3.6-3.9Z",
  },
  {
    key: "youtube",
    href: "https://youtube.com/@dianairimova5813",
    label: "YouTube",
    path: "M21.3 8.1a2.7 2.7 0 0 0-1.9-1.9C17.7 5.7 12 5.7 12 5.7s-5.7 0-7.4.5A2.7 2.7 0 0 0 2.7 8.1 28 28 0 0 0 2.2 12a28 28 0 0 0 .5 3.9 2.7 2.7 0 0 0 1.9 1.9c1.7.5 7.4.5 7.4.5s5.7 0 7.4-.5a2.7 2.7 0 0 0 1.9-1.9 28 28 0 0 0 .5-3.9 28 28 0 0 0-.5-3.9ZM10 14.7V9.3l4.8 2.7-4.8 2.7Z",
  },
  {
    key: "telegram",
    href: "https://t.me/+DPBiL6bFsd5jMDU0",
    label: "Telegram",
    path: "M20.5 4.6 3.6 11.2c-1.15.46-1.14 1.1-.21 1.38l4.3 1.34 1.66 5.06c.2.55.36.77.73.77.36 0 .52-.16.72-.36l1.75-1.7 3.66 2.7c.67.37 1.16.18 1.33-.62l2.4-11.3c.25-1.03-.35-1.5-1.24-1.19Zm-2.5 3.02-6.9 6.28-.28 3.03-1.4-4.35 8.1-5.4c.4-.25.75-.11.48.16Z",
  },
];

export function SocialLinks({ className }: { className?: string }) {
  return (
    <div className={className}>
      {SOCIALS.map((s) => (
        <a
          key={s.key}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={s.label}
          className="text-ink/50 transition-colors hover:text-gold"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d={s.path} />
          </svg>
        </a>
      ))}
    </div>
  );
}
