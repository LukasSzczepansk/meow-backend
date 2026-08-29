import type { ReactNode } from "react";

export function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-4 py-10 text-center">
      <div className="mb-1 opacity-90">{icon}</div>
      <h3 className="text-[15px] font-semibold text-[var(--color-ink)]">{title}</h3>
      <p className="mt-1.5 max-w-[30ch] text-[12.5px] leading-relaxed text-[var(--color-ink-soft)]">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
