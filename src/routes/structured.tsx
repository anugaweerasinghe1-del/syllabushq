import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import structuredData from "@/data/structured.json";
import shortData from "@/data/short-answer.json";
import caseData from "@/data/case-studies.json";
import subjectsData from "@/data/subjects.json";

const SITE = "https://syllabushq.lovable.app";

type StructuredPart = { label: string; prompt: string; answer: string; marks: number };
type StructuredQ = { subject: string; topic: string; context: string; parts: StructuredPart[] };
type ShortQ = { subject: string; topic: string; question: string; modelAnswer: string; markingPoints: string[]; marks: number };
type CaseQ = { subject: string; topic: string; title: string; scenario: string; parts: StructuredPart[] };

type Subject = { slug: string; name: string };

const structured = structuredData as StructuredQ[];
const shorts = shortData as ShortQ[];
const cases = caseData as CaseQ[];
const subjects = subjectsData as Subject[];

export const Route = createFileRoute("/structured")({
  head: () => ({
    meta: [
      { title: "Structured papers, short answer & case studies — O/L practice" },
      { name: "description", content: "Original Sri Lankan O/L past-paper-style structured questions, short-answer drills, and Business case studies. All with model answers." },
      { property: "og:title", content: "O/L Structured Papers — SyllabusHQ" },
      { property: "og:url", content: SITE + "/structured" },
    ],
    links: [{ rel: "canonical", href: SITE + "/structured" }],
  }),
  component: StructuredPage,
});

type Tab = "structured" | "short" | "case";

function StructuredPage() {
  const [tab, setTab] = useState<Tab>("structured");
  const [subj, setSubj] = useState<string>("all");

  const filter = <T extends { subject: string }>(items: T[]) =>
    subj === "all" ? items : items.filter((i) => i.subject === subj);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <header className="mb-8 rise">
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-amber">Past-paper style · original</p>
          <h1 className="mt-2 font-display text-5xl text-foreground sm:text-6xl text-balance">Structured papers</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Multi-part structured questions, short-answer drills, and Business case studies — all written in the format and difficulty of real O/L papers, with model answers and mark allocations.
          </p>
        </header>

        <div className="mb-6 flex flex-wrap items-center gap-2">
          <TabBtn active={tab === "structured"} onClick={() => setTab("structured")}>Structured ({structured.length})</TabBtn>
          <TabBtn active={tab === "short"} onClick={() => setTab("short")}>Short answer ({shorts.length})</TabBtn>
          <TabBtn active={tab === "case"} onClick={() => setTab("case")}>Case studies ({cases.length})</TabBtn>
        </div>

        <div className="mb-8 flex flex-wrap gap-2 text-xs">
          <FilterChip active={subj === "all"} onClick={() => setSubj("all")}>All subjects</FilterChip>
          {subjects.map((s) => (
            <FilterChip key={s.slug} active={subj === s.slug} onClick={() => setSubj(s.slug)}>{s.name}</FilterChip>
          ))}
        </div>

        {tab === "structured" && <StructuredList items={filter(structured)} />}
        {tab === "short" && <ShortList items={filter(shorts)} />}
        {tab === "case" && <CaseList items={filter(cases)} />}

        {((tab === "structured" && structured.length === 0) ||
          (tab === "short" && shorts.length === 0) ||
          (tab === "case" && cases.length === 0)) && (
          <div className="glass-panel rounded-xl p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Generating fresh questions… check back in a minute.
            </p>
            <Link to="/" className="mt-4 inline-block text-amber hover:underline">← Back home</Link>
          </div>
        )}
      </main>
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`rounded-lg px-4 py-2 text-sm font-medium transition ${active ? "bg-amber text-[color:var(--bg)]" : "border border-hairline text-foreground hover:bg-secondary"}`}>
      {children}
    </button>
  );
}
function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`rounded-full px-3 py-1 transition ${active ? "border border-amber text-amber" : "border border-hairline text-muted-foreground hover:text-foreground"}`}>
      {children}
    </button>
  );
}

function Reveal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2">
      <button onClick={() => setOpen((o) => !o)} className="text-xs uppercase tracking-wider text-amber hover:underline">
        {open ? "Hide model answer" : "Show model answer"}
      </button>
      {open && <div className="mt-2 rounded-lg border border-hairline bg-secondary/40 p-3 text-sm text-charcoal whitespace-pre-wrap">{children}</div>}
    </div>
  );
}

function subjectName(slug: string) { return subjects.find((s) => s.slug === slug)?.name ?? slug; }

function StructuredList({ items }: { items: StructuredQ[] }) {
  return (
    <ol className="space-y-4">
      {items.map((q, i) => (
        <li key={i} className="glass-panel rounded-xl p-5">
          <p className="text-[10px] uppercase tracking-[0.22em] text-amber">{subjectName(q.subject)}</p>
          <p className="mt-2 text-sm text-charcoal italic">{q.context}</p>
          <ol className="mt-4 space-y-3">
            {q.parts?.map((p, j) => (
              <li key={j}>
                <p className="text-sm text-foreground"><span className="font-num text-muted-foreground mr-2">({p.label})</span>{p.prompt} <span className="ml-2 text-xs text-muted-foreground">[{p.marks} mk]</span></p>
                <Reveal>{p.answer}</Reveal>
              </li>
            ))}
          </ol>
        </li>
      ))}
    </ol>
  );
}

function ShortList({ items }: { items: ShortQ[] }) {
  return (
    <ol className="space-y-4">
      {items.map((q, i) => <ShortItem key={i} q={q} />)}
    </ol>
  );
}

function ShortItem({ q }: { q: ShortQ }) {
  const [val, setVal] = useState("");
  const [show, setShow] = useState(false);
  return (
    <li className="glass-panel rounded-xl p-5">
      <p className="text-[10px] uppercase tracking-[0.22em] text-amber">{subjectName(q.subject)} · {q.marks} marks</p>
      <p className="mt-2 text-sm text-foreground">{q.question}</p>
      <textarea
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder="Write your answer here…"
        rows={3}
        className="mt-3 w-full rounded-lg border border-hairline bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-amber"
      />
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">{val.length} chars</span>
        <button onClick={() => setShow((s) => !s)} className="text-xs uppercase tracking-wider text-amber hover:underline">
          {show ? "Hide" : "Reveal"} model answer
        </button>
      </div>
      {show && (
        <div className="mt-3 rounded-lg border border-hairline bg-secondary/40 p-3 text-sm text-charcoal">
          <p>{q.modelAnswer}</p>
          {q.markingPoints?.length > 0 && (
            <ul className="mt-2 list-disc pl-5 text-xs text-muted-foreground">
              {q.markingPoints.map((p, i) => <li key={i}>{p}</li>)}
            </ul>
          )}
        </div>
      )}
    </li>
  );
}

function CaseList({ items }: { items: CaseQ[] }) {
  return (
    <ol className="space-y-4">
      {items.map((c, i) => (
        <li key={i} className="glass-panel rounded-xl p-5">
          <p className="text-[10px] uppercase tracking-[0.22em] text-amber">{subjectName(c.subject)} · Case study</p>
          <h3 className="mt-2 font-display text-xl text-foreground">{c.title}</h3>
          <p className="mt-2 text-sm text-charcoal italic">{c.scenario}</p>
          <ol className="mt-4 space-y-3">
            {c.parts?.map((p, j) => (
              <li key={j}>
                <p className="text-sm text-foreground"><span className="font-num text-muted-foreground mr-2">({p.label})</span>{p.prompt} <span className="ml-2 text-xs text-muted-foreground">[{p.marks} mk]</span></p>
                <Reveal>{p.answer}</Reveal>
              </li>
            ))}
          </ol>
        </li>
      ))}
    </ol>
  );
}
