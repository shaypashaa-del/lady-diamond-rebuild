import Image from "next/image";
import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/ScrollReveal";

// Diana's real public posts (found on the live @lady_di_diamond profile),
// downloaded and self-hosted here. Instagram's official embed.js widget was
// tried first but is unreliable in practice — frequently blocked by ad
// blockers/privacy extensions and prone to rendering blank — so real static
// thumbnails linking out to the real posts are used instead.
const POSTS = [
  {
    image: "/brand/instagram-post-1.jpg",
    url: "https://www.instagram.com/lady_di_diamond/p/DHBKZHuN9aM/",
  },
  {
    image: "/brand/instagram-post-2.jpg",
    url: "https://www.instagram.com/lady_di_diamond/p/DB8Y5C0oKVp/",
  },
  {
    image: "/brand/instagram-post-3.jpg",
    url: "https://www.instagram.com/lady_di_diamond/p/C9J7NucN7_d/",
  },
];

export function InstagramSection() {
  const t = useTranslations("Home");

  return (
    <section className="py-14 text-center">
      <ScrollReveal>
        <h2 className="text-xl font-semibold uppercase tracking-[0.2em]">{t("instagram")}</h2>
        <span className="gold-rule mt-3" />
        <a
          href="https://www.instagram.com/lady_di_diamond?stkn=MTZmcHF0cjZ2bmV2cA%3D%3D&utm_source=qr"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-xs uppercase tracking-[0.3em] text-ink/50 hover:text-gold-deep"
          dir="ltr"
        >
          @lady_di_diamond
        </a>
      </ScrollReveal>
      <div className="mx-auto mt-6 grid max-w-4xl grid-cols-3 gap-1 px-4 sm:px-8">
        {POSTS.map((post, i) => (
          <ScrollReveal key={post.url} delay={i * 0.1} y={16}>
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block aspect-square overflow-hidden"
            >
              <Image
                src={post.image}
                alt={t("instagramPostAlt")}
                fill
                sizes="(min-width: 640px) 33vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </a>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
