#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";

const API_KEY = process.env.LOVABLE_API_KEY;
if (!API_KEY) { console.error("Missing LOVABLE_API_KEY"); process.exit(1); }

const MODEL = "google/gemini-2.5-flash";
const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const TARGET = 60;
const BATCH = 12;
const CONCURRENCY = 6;
const PATH = "src/data/questions.json";

const subjects = JSON.parse(readFileSync("src/data/subjects.json", "utf8"));
let all = JSON.parse(readFileSync(PATH, "utf8"));

const seen = new Set(all.map(q => q.question.toLowerCase().replace(/\s+/g," ").trim()));
const counts = new Map();
for (const q of all) {
  const k = `${q.subject}/${q.topic}`;
  counts.set(k, (counts.get(k)||0)+1);
}

const DIFFICULTIES = ["easy", "medium", "hard"];

function prompt(subjectName, topicName, n, difficulty, seedHint) {
  return `Write ${n} ORIGINAL Sri Lankan G.C.E. Ordinary Level (O/L) multiple-choice questions, English medium.
Subject: "${subjectName}". Topic: "${topicName}". Difficulty band: ${difficulty}.
${seedHint}

STRICT RULES:
- Match real Sri Lankan O/L phrasing, calculation style, and curriculum scope ONLY (NOT Cambridge / Edexcel / CBSE).
- Vary sub-skills: definition recall, application, calculation, reasoning, common misconceptions.
- Each question is self-contained, plain text (no images, no LaTeX). Math: x^2, sqrt(2), 3/4, pi, etc.
- Exactly 4 options. Exactly one correct answer. "correct" is the 0-based index.
- "explanation" is 1-3 sentences, pedagogical.
- No duplicates among the ${n}. No paraphrases of well-known past paper items.

Return JSON: {"items":[{"question":"...","options":["a","b","c","d"],"correct":0,"explanation":"...","difficulty":"${difficulty}"}]}`;
}

async function call(p, attempt=1) {
  try {
    const r = await fetch(GATEWAY, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}`, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: "You author original Sri Lankan O/L exam practice items. Respond with strict JSON only." },
          { role: "user", content: p },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (r.status === 429 || r.status >= 500) {
      if (attempt > 6) throw new Error("retry exhausted "+r.status);
      const wait = Math.min(60000, 3000 * Math.pow(1.7, attempt-1));
      await new Promise(r=>setTimeout(r, wait));
      return call(p, attempt+1);
    }
    if (!r.ok) { console.error("HTTP", r.status, (await r.text()).slice(0,200)); return []; }
    const j = await r.json();
    const txt = j?.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(txt);
    return Array.isArray(parsed.items) ? parsed.items : [];
  } catch (e) {
    if (attempt > 6) { console.error("fail", e.message); return []; }
    await new Promise(r=>setTimeout(r, 3000*attempt));
    return call(p, attempt+1);
  }
}

function valid(q) {
  return q && typeof q.question === "string" && Array.isArray(q.options) && q.options.length===4
    && q.options.every(o=>typeof o==="string") && Number.isInteger(q.correct) && q.correct>=0 && q.correct<=3
    && typeof q.explanation==="string";
}

const tasks = [];
for (const s of subjects) {
  for (const t of s.topics) {
    const k = `${s.slug}/${t.slug}`;
    const have = counts.get(k) || 0;
    const need = TARGET - have;
    if (need <= 0) continue;
    // split need across difficulties
    const per = Math.ceil(need / DIFFICULTIES.length);
    for (const d of DIFFICULTIES) {
      let remaining = Math.min(per, need - (tasks.filter(x=>x.k===k).reduce((a,b)=>a+b.n,0)));
      while (remaining > 0) {
        const n = Math.min(BATCH, remaining);
        tasks.push({ k, s, t, n, d });
        remaining -= n;
      }
    }
  }
}

console.log(`Planned ${tasks.length} batches across ${counts.size} topics.`);

let done = 0;
const startedAt = Date.now();
let i = 0;
let writePending = false;
function save() {
  if (writePending) return;
  writePending = true;
  setTimeout(() => {
    writeFileSync(PATH, JSON.stringify(all, null, 2));
    writePending = false;
  }, 1500);
}

async function worker() {
  while (true) {
    const my = i++;
    if (my >= tasks.length) return;
    const task = tasks[my];
    const seedHint = `Generation seed: ${task.k}-${task.d}-${my}. Make these distinct from prior batches.`;
    const items = await call(prompt(task.s.name, task.t.name, task.n, task.d, seedHint));
    let added = 0;
    for (const it of items) {
      if (!valid(it)) continue;
      const key = it.question.toLowerCase().replace(/\s+/g," ").trim();
      if (seen.has(key)) continue;
      seen.add(key);
      all.push({
        subject: task.s.slug,
        topic: task.t.slug,
        question: it.question.trim(),
        options: it.options.map(o=>String(o).trim()),
        correct: it.correct,
        explanation: it.explanation.trim(),
        difficulty: it.difficulty || task.d,
      });
      added++;
    }
    done++;
    const pct = ((done/tasks.length)*100).toFixed(1);
    const elapsed = ((Date.now()-startedAt)/1000).toFixed(0);
    console.log(`[${done}/${tasks.length} ${pct}% ${elapsed}s] ${task.k} ${task.d} +${added}/${task.n}`);
    save();
  }
}

await Promise.all(Array.from({length: CONCURRENCY}, worker));
writeFileSync(PATH, JSON.stringify(all, null, 2));

const finalCounts = {};
for (const q of all) finalCounts[q.subject] = (finalCounts[q.subject]||0)+1;
console.log("DONE. Total:", all.length, "Per subject:", finalCounts);
