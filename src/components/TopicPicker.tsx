import { useState, useMemo } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown, Check, Layers, Search } from "lucide-react";
import type { Topic } from "@/lib/content";

/**
 * Premium dark topic picker. Replaces the long chip rail.
 * - Searchable
 * - Multi-select with counts
 * - "Mix of everything" + "Balanced (recommended)" toggles
 */
export function TopicPicker({
  topics,
  counts,
  value,
  onChange,
  balanced,
  onBalancedChange,
}: {
  topics: Topic[];
  counts: Map<string, number>;
  value: string[]; // selected topic slugs (empty = mix of everything)
  onChange: (next: string[]) => void;
  balanced: boolean;
  onBalancedChange: (next: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const available = useMemo(
    () => topics.filter((t) => (counts.get(t.slug) ?? 0) > 0),
    [topics, counts],
  );
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return available;
    return available.filter((t) => t.name.toLowerCase().includes(q));
  }, [available, query]);

  const totalQs = useMemo(
    () => available.reduce((acc, t) => acc + (counts.get(t.slug) ?? 0), 0),
    [available, counts],
  );

  const isMix = value.length === 0;
  const summary = isMix
    ? `Mix of everything · ${totalQs} questions`
    : value.length === 1
      ? topics.find((t) => t.slug === value[0])?.name ?? "1 topic"
      : `${value.length} topics selected`;

  function toggle(slug: string) {
    const next = value.includes(slug)
      ? value.filter((s) => s !== slug)
      : [...value, slug];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="group flex w-full items-center justify-between gap-3 rounded-xl border border-hairline bg-white/[0.02] px-4 py-3.5 text-left text-sm text-foreground transition hover:border-hairline-strong hover:bg-white/[0.04]"
          >
            <span className="flex items-center gap-3">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{summary}</span>
            </span>
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition ${open ? "rotate-180" : ""}`}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={6}
          className="w-[min(540px,90vw)] border-hairline bg-[color:var(--surface-2)] p-0 shadow-2xl"
        >
          <div className="flex items-center gap-2 border-b border-hairline px-3 py-2.5">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search topics…"
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
            />
            {value.length > 0 && (
              <button
                onClick={() => onChange([])}
                className="text-[11px] text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>
          <div className="max-h-[320px] overflow-auto py-1.5">
            <Row
              active={isMix}
              label="Mix of everything"
              count={totalQs}
              onClick={() => onChange([])}
              accent
            />
            <div className="my-1 h-px bg-hairline/60" />
            {filtered.map((t) => (
              <Row
                key={t.slug}
                active={value.includes(t.slug)}
                label={t.name}
                count={counts.get(t.slug) ?? 0}
                onClick={() => toggle(t.slug)}
              />
            ))}
            {filtered.length === 0 && (
              <p className="px-4 py-6 text-center text-xs text-muted-foreground">
                No topics match “{query}”.
              </p>
            )}
          </div>
          <div className="flex items-center justify-between border-t border-hairline px-3 py-2.5">
            <p className="text-[11px] text-muted-foreground">
              {value.length === 0 ? "Defaults to all topics" : `${value.length} selected`}
            </p>
            <button
              onClick={() => setOpen(false)}
              className="rounded-md bg-foreground px-3 py-1.5 text-[11px] font-semibold text-background"
            >
              Done
            </button>
          </div>
        </PopoverContent>
      </Popover>

      <label className="flex cursor-pointer items-center justify-between rounded-xl border border-hairline bg-white/[0.02] px-4 py-3">
        <span>
          <span className="block text-sm font-medium text-foreground">
            Balanced sampling
          </span>
          <span className="block text-[11px] text-muted-foreground">
            Spread questions evenly across the chosen topics.
          </span>
        </span>
        <input
          type="checkbox"
          checked={balanced}
          onChange={(e) => onBalancedChange(e.target.checked)}
          className="h-4 w-4 accent-foreground"
        />
      </label>
    </div>
  );
}

function Row({
  active,
  label,
  count,
  onClick,
  accent,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
  accent?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm transition ${
        active
          ? "bg-white/[0.06] text-foreground"
          : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
      }`}
    >
      <span className="flex items-center gap-3">
        <span
          className={`inline-flex h-4 w-4 items-center justify-center rounded-[5px] border ${
            active ? "border-foreground bg-foreground text-background" : "border-hairline-strong"
          }`}
        >
          {active && <Check className="h-3 w-3" />}
        </span>
        <span className={accent ? "font-medium" : ""}>{label}</span>
      </span>
      <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
        {count}
      </span>
    </button>
  );
}