import Image from "next/image";
import Link from "next/link";
import { addProductImage, removeProductImage } from "@/server/actions/product-images";

type ImageRow = { id: string; media: { id: string; url: string; filename: string } };
type MediaOption = { id: string; filename: string };

export function ProductImagesManager({
  productId,
  images,
  availableMedia,
}: {
  productId: string;
  images: ImageRow[];
  availableMedia: MediaOption[];
}) {
  return (
    <div className="mt-10 max-w-3xl border-t border-neutral-200 pt-6">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide">תמונות מוצר</h2>

      {images.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-3">
          {images.map((img) => (
            <div key={img.id} className="relative">
              <div className="relative h-24 w-24 overflow-hidden rounded border border-neutral-200 bg-neutral-100">
                <Image src={img.media.url} alt={img.media.filename} fill sizes="96px" className="object-cover" />
              </div>
              <form action={removeProductImage.bind(null, img.id, productId)}>
                <button
                  type="submit"
                  className="mt-1 w-full text-xs text-rose-600 hover:underline"
                >
                  הסרה
                </button>
              </form>
            </div>
          ))}
        </div>
      )}

      {availableMedia.length > 0 ? (
        <form action={addProductImage.bind(null, productId)} className="flex gap-2">
          <select name="mediaId" className="flex-1 border border-neutral-300 px-3 py-2 text-sm">
            {availableMedia.map((m) => (
              <option key={m.id} value={m.id}>
                {m.filename}
              </option>
            ))}
          </select>
          <button type="submit" className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800">
            הוספת תמונה
          </button>
        </form>
      ) : (
        <p className="text-sm text-neutral-400">
          אין תמונות זמינות בספריית המדיה — יש להעלות תמונות תחילה ב
          <Link href="/admin/media" className="underline">
            ניהול מדיה
          </Link>
          .
        </p>
      )}
    </div>
  );
}
