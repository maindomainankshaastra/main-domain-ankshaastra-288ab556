import { cn } from "@/lib/utils";

type Tab = { key: string; label: string };

/** Small pill-style tab switcher shown above an admin page (e.g. Invoice Manager: main sites | Shop). */
export function SiteTabs({
  tabs,
  value,
  onChange,
}: {
  tabs: Tab[];
  value: string;
  onChange: (key: string) => void;
}) {
  return (
    <div role="tablist" className="mb-4 inline-flex flex-wrap gap-1 rounded-lg border border-border bg-muted/40 p-1">
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          role="tab"
          aria-selected={value === t.key}
          onClick={() => onChange(t.key)}
          className={cn(
            "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
            value === t.key
              ? "bg-background text-primary shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
