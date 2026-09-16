"use client";

export function ConfirmDeleteForm({
  action,
  confirmMessage,
  label = "מחיקה",
  className = "text-rose-600 hover:underline",
}: {
  action: () => void | Promise<void>;
  confirmMessage: string;
  label?: string;
  className?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
    >
      <button type="submit" className={className}>
        {label}
      </button>
    </form>
  );
}
