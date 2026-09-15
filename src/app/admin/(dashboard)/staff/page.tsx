import { prisma } from "@/lib/prisma";
import { requireSuperAdminSession } from "@/lib/auth/guards";
import { updateStaffRole, deleteStaffUser } from "@/server/actions/staff";
import { CreateStaffForm } from "@/components/admin/CreateStaffForm";

export default async function AdminStaffPage() {
  const session = await requireSuperAdminSession();

  const staff = await prisma.user.findMany({
    where: { role: { in: ["SUPER_ADMIN", "ADMIN", "STORE_MANAGER"] } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <h1 className="mb-2 text-xl font-semibold">ניהול צוות</h1>
      <p className="mb-6 text-sm text-neutral-500">
        רק מנהל-על (Super Admin) יכול להוסיף אנשי צוות חדשים או לשנות תפקידים.
      </p>

      <div className="mb-8 overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-right text-xs text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">שם</th>
              <th className="px-4 py-3 font-medium">אימייל</th>
              <th className="px-4 py-3 font-medium">תפקיד</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {staff.map((user) => (
              <tr key={user.id} className="border-b border-neutral-100 last:border-0">
                <td className="px-4 py-3 font-medium">
                  {user.name} {user.id === session.userId && <span className="text-xs text-neutral-400">(את/ה)</span>}
                </td>
                <td className="px-4 py-3" dir="ltr">{user.email}</td>
                <td className="px-4 py-3">
                  <form action={updateStaffRole.bind(null, user.id)} className="flex items-center gap-2">
                    <select name="role" defaultValue={user.role} className="border border-neutral-300 px-2 py-1 text-xs">
                      <option value="SUPER_ADMIN">מנהל על</option>
                      <option value="ADMIN">מנהל</option>
                      <option value="STORE_MANAGER">מנהל חנות</option>
                    </select>
                    <button type="submit" className="text-xs text-blue-600 hover:underline">
                      עדכון
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3">
                  {user.id !== session.userId && (
                    <form action={deleteStaffUser.bind(null, user.id)}>
                      <button type="submit" className="text-xs text-rose-600 hover:underline">
                        הסרה
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CreateStaffForm />
    </div>
  );
}
