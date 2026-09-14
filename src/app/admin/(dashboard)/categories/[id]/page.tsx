import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateCategory } from "@/server/actions/categories";
import { CategoryForm } from "@/components/admin/CategoryForm";
import type { LocalizedText } from "@/lib/i18n-content";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">עריכת קטגוריה</h1>
      <CategoryForm
        action={updateCategory.bind(null, category.id)}
        submitLabel="שמירת שינויים"
        initial={{
          slug: category.slug,
          name: category.name as LocalizedText,
          description: category.description as LocalizedText | null,
          sortOrder: category.sortOrder,
        }}
      />
    </div>
  );
}
