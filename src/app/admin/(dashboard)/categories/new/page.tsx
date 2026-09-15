import { prisma } from "@/lib/prisma";
import { createCategory } from "@/server/actions/categories";
import { CategoryForm } from "@/components/admin/CategoryForm";

export default async function NewCategoryPage() {
  const media = await prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">קטגוריה חדשה</h1>
      <CategoryForm action={createCategory} submitLabel="יצירת קטגוריה" media={media} />
    </div>
  );
}
