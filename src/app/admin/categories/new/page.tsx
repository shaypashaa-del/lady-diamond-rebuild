import { createCategory } from "@/server/actions/categories";
import { CategoryForm } from "@/components/admin/CategoryForm";

export default function NewCategoryPage() {
  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">קטגוריה חדשה</h1>
      <CategoryForm action={createCategory} submitLabel="יצירת קטגוריה" />
    </div>
  );
}
