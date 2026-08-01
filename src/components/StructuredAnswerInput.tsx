import { useRef, useState } from "react";
import { Camera, Loader2, Sparkles, X } from "lucide-react";
import { gradeAnswer, type GradeResult } from "@/lib/gradeAnswer.functions";
import { AIGradeCard } from "@/components/AIGradeCard";

/**
 * Reusable answer input for short / structured / essay parts.
 * - Big readable textarea
 * - "Describe your graph" helper (Sri Lankan O/L students typically can't draw on phones)
 * - Optional handwritten / diagram photo upload (sent to the AI marker)
 * - "Mark with AI" calls the strict server-side examiner; never self-score.
 */
export function StructuredAnswerInput({
  question,
  markingScheme,
  totalMarks,
  subject,
  storageKey,
  expectsDiagram,
}: {
  question: string;
  markingScheme: string;
  totalMarks: number;
  subject: string;
  storageKey: string;
  expectsDiagram?: boolean;
}) {
  const [draft, setDraft] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem(storageKey) ?? "";
  });
  const [imageData, setImageData] = useState<{ b64: string; mime: string; name: string } | null>(null);
  const [grading, setGrading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GradeResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function persist(v: string) {
    setDraft(v);
    try { window.localStorage.setItem(storageKey, v); } catch { /* quota */ }
  }

  async function handleFile(file: File) {
    setError(null);
    setCompressing(true);
    try {
      // Modern phone photos are 4-12 MB, far past what the marker accepts.
      // Downscale + re-encode in the browser so ANY photo works.
      const { b64, mime } = await compressImage(file);
      setImageData({ b64, mime, name: file.name || "working.jpg" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't read that image.");
    } finally {
      setCompressing(false);
    }
  }

  async function mark() {
    if (!draft.trim() && !imageData) {
      setError("Write your answer or upload your working before marking.");
      return;
    }
    setGrading(true); setError(null);
    try {
      const res = await gradeAnswer({
        data: {
          subject,
          question,
          markingScheme,
          totalMarks,
          studentAnswer: draft,
          imageBase64: imageData?.b64,
          imageMime: imageData?.mime,
        },
      });
      setResult(res);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Marking failed. Please try again.";
      setError(msg);
    } finally {
      setGrading(false);
    }
  }

  return (
    <div className="mt-3">
      <textarea
        value={draft}
        onChange={(e) => persist(e.target.value)}
        disabled={grading || !!result}
        placeholder={
          expectsDiagram
            ? "Type your method, or describe the graph (axes, intercepts, gradient, shape). Full marks are awarded for an accurate description."
            : "Show your working step by step…"
        }
        className="w-full min-h-[140px] resize-y rounded-xl border border-hairline bg-white/[0.02] p-4 text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:border-foreground/40 focus:outline-none disabled:opacity-60"
      />

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <p className="text-muted-foreground">
          {expectsDiagram
            ? "Can't draw on a phone? Describe your graph in words — the examiner accepts equivalent descriptions for full credit."
            : "Your answer is auto-saved on this device."}
        </p>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
          }}
        />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={grading || !!result}
          className="inline-flex items-center gap-1.5 rounded-md border border-hairline px-2.5 py-1 text-muted-foreground hover:text-foreground disabled:opacity-50"
        >
          <Camera className="h-3 w-3" />
          {imageData ? "Replace photo" : "Attach handwritten working"}
        </button>
      </div>

      {imageData && (
        <div className="mt-2 flex items-center gap-3 rounded-lg border border-hairline bg-white/[0.02] p-2 text-[11px] text-muted-foreground">
          <img
            src={`data:${imageData.mime};base64,${imageData.b64}`}
            alt="Your handwritten working"
            className="h-16 w-16 rounded-md object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-foreground">{imageData.name}</p>
            <p className="mt-0.5">Attached — the examiner will read this alongside your typed answer.</p>
          </div>
          <button
            onClick={() => setImageData(null)}
            disabled={grading}
            aria-label="Remove attached image"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {error && (
        <p className="mt-3 text-xs text-coral">{error}</p>
      )}

      {!result && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={mark}
            disabled={grading}
            className="inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition hover:brightness-110 disabled:opacity-60"
          >
            {grading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Examiner is marking…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Mark with AI examiner
              </>
            )}
          </button>
        </div>
      )}

      {result && <AIGradeCard result={result} />}
    </div>
  );
}