#!/usr/bin/env node
// Generates structured-paper, short-answer, and Business case-study questions.
// Writes to src/data/structured.json, src/data/short-answer.json, src/data/case-studies.json.
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";

const API_KEY = process.env.LOVABLE_API_KEY;
if (!API_KEY) { console.error("Missing LOVABLE_API_KEY"); process.exit(1); }

const MODEL = "google/gemini-2.5-flash";
const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

const subjects = JSON.parse(readFileSync("src/data/subjects.json", "utf8"));

async function call(prompt) {
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const r = await fetch(GATEWAY, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: "You author original O/L (Sri Lankan G.C.E. Ordinary Level) exam practice content in English medium. Respond with strict JSON only, no commentary." },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
        }),
      });
      if (r.status === 429 || r.status >= 500) { await new Promise(r=>setTimeout(r, 2000*attempt)); continue; }
      const j = await r.json();
      const txt = j?.choices?.[0]?.message?.content ?? "{}";
      return JSON.parse(txt);
    } catch (e) { await new Promise(r=>setTimeout(r, 2000*attempt)); }
  }
  return null;
}

function shortPrompt(subject, topic) {
  return `Write 4 ORIGINAL short-answer practice questions for Sri Lankan O/L ${subject.name}, topic "${topic.name}". Each question should require a 1-3 sentence written answer (NOT multiple choice). Match real O/L exam phrasing and difficulty. Strictly follow the syllabus.
Return JSON: {"items":[{"question":"...","modelAnswer":"...","markingPoints":["...","..."],"marks":2}]}
modelAnswer = concise correct answer (1-3 sentences). markingPoints = 2-4 key ideas a student must mention to earn marks. marks = 2, 3, or 4.`;
}

function structuredPrompt(subject, topic) {
  return `Write 2 ORIGINAL O/L structured-paper questions for Sri Lankan G.C.E. ${subject.name}, topic "${topic.name}". A structured question has a brief context (1-2 sentences) followed by 3-4 sub-parts (a, b, c, d) of increasing difficulty. Follow real O/L paper format. Total marks 8-12 per question.
Return JSON: {"items":[{"context":"...","parts":[{"label":"a","prompt":"...","answer":"...","marks":2},{"label":"b","prompt":"...","answer":"...","marks":3}]}]}`;
}

function casePrompt(topic) {
  return `Write 2 ORIGINAL Business & Accounting O/L case-study questions for topic "${topic.name}". Each case = a 4-6 sentence Sri Lankan business scenario (fictional company/person, e.g. "Nimal's Bakery in Galle"). Then 3 sub-questions testing analysis, calculation, or recommendation. NEVER copy past papers — write fully original scenarios.
Return JSON: {"items":[{"title":"...","scenario":"...","parts":[{"label":"a","prompt":"...","answer":"...","marks":3},{"label":"b","prompt":"...","answer":"...","marks":4},{"label":"c","prompt":"...","answer":"...","marks":5}]}]}`;
}

async function genFor(kind, promptFn, topics, extra={}) {
  const out = [];
  let i = 0;
  await Promise.all(Array.from({length: 4}, async () => {
    while (true) {
      const my = i++; if (my >= topics.length) return;
      const t = topics[my];
      const res = await call(promptFn(t.subject, t.topic));
      const items = res?.items ?? [];
      for (const it of items) {
        out.push({ subject: t.subject.slug, topic: t.topic.slug, ...it, ...extra });
      }
      console.log(`[${kind}] ${t.subject.slug}/${t.topic.slug} → ${items.length}`);
    }
  }));
  return out;
}

const allTopics = subjects.flatMap(s => s.topics.map(t => ({ subject: s, topic: t })));
const businessTopics = allTopics.filter(x => x.subject.slug === "business-accounting");

mkdirSync("src/data", { recursive: true });

console.log("Generating short-answer...");
const shorts = await genFor("short", shortPrompt, allTopics);
writeFileSync("src/data/short-answer.json", JSON.stringify(shorts, null, 2));
console.log(`Wrote ${shorts.length} short-answer questions.`);

console.log("Generating structured...");
const structured = await genFor("struct", structuredPrompt, allTopics);
writeFileSync("src/data/structured.json", JSON.stringify(structured, null, 2));
console.log(`Wrote ${structured.length} structured questions.`);

console.log("Generating case studies (Business only)...");
const cases = await genFor("case", (s,t) => casePrompt(t), businessTopics);
writeFileSync("src/data/case-studies.json", JSON.stringify(cases, null, 2));
console.log(`Wrote ${cases.length} case studies.`);
