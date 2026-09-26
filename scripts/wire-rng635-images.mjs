// Wires the real generated photos for RNG-635 (white/rose gold color
// variants + 3 extra gallery angles) into the DB: adds gallery ProductImage
// rows for the angle shots, and sets ProductMaterialOption.imageUrl on the
// white/rose color options so the product page shows the matching photo
// when that color is selected. Yellow already has its photo as the
// product's default image — untouched here.
import { PrismaClient } from "../src/generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const product = await prisma.product.findFirst({
  where: { sku: "RNG-635" },
  include: { images: true, materialOptions: true },
});
if (!product) throw new Error("RNG-635 not found");

const WHITE_URL = "/brand/catalog6/ring-crossover-halo-triple-band-white.jpeg";
const ROSE_URL = "/brand/catalog6/ring-crossover-halo-triple-band-rose.jpeg";
const SIDE_URL = "/brand/catalog6/ring-crossover-halo-triple-band-side.jpeg";
const TOP_URL = "/brand/catalog6/ring-crossover-halo-triple-band-top.jpeg";
const MODEL_URL = "/brand/catalog6/ring-crossover-halo-triple-band-model.jpeg";

// Set the per-color image on the existing material options.
const white = product.materialOptions.find((m) => m.goldColor === "WHITE");
const rose = product.materialOptions.find((m) => m.goldColor === "ROSE");
if (white) await prisma.productMaterialOption.update({ where: { id: white.id }, data: { imageUrl: WHITE_URL } });
if (rose) await prisma.productMaterialOption.update({ where: { id: rose.id }, data: { imageUrl: ROSE_URL } });
console.log("Set material option images:", { white: !!white, rose: !!rose });

// Add gallery images (side/top/on-model) as extra ProductImage rows, each
// needing its own Media row first.
const maxSort = product.images.reduce((max, img) => Math.max(max, img.sortOrder), -1);
const galleryEntries = [
  { url: SIDE_URL, alt: "טבעת הילה משולשת רצועות חוצות — מבט צד" },
  { url: TOP_URL, alt: "טבעת הילה משולשת רצועות חוצות — מבט על" },
  { url: MODEL_URL, alt: "טבעת הילה משולשת רצועות חוצות — על היד" },
];

let sortOrder = maxSort + 1;
for (const entry of galleryEntries) {
  const media = await prisma.mediaAsset.create({
    data: { url: entry.url, filename: entry.url.split("/").pop(), altText: entry.alt },
  });
  await prisma.productImage.create({
    data: { productId: product.id, mediaId: media.id, sortOrder: sortOrder++, altText: entry.alt },
  });
}
console.log(`Added ${galleryEntries.length} gallery images, starting sortOrder ${maxSort + 1}`);

await prisma.$disconnect();
