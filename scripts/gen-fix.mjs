#!/usr/bin/env node
import { writeFileSync, readFileSync } from "node:fs";
const API_KEY = process.env.LOVABLE_API_KEY;
const MODEL = "google/gemini-2.5-flash";
const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const subjects = JSON.parse(readFileSync("src/data/subjects.json", "utf8"));

async function call(prompt) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const r = await fetch(GATEWAY, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: "You are an O/L (Sri Lankan G.C.E. Ordinary Level) exam question author. You ALWAYS respond with valid JSON in the EXACT shape requested." },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
        }),
      });
      if (r.status === 429 || r.status >= 500) { await new Promise(r=>setTimeout(r, 1500*attempt)); continue; }
      const j = await r.json();
      const txt = j?.choices?.[0]?.message?.content ?? "{}";
      return JSON.parse(txt);
    } catch { await new Promise(r=>setTimeout(r, 1500*attempt)); }
  }
  return null;
}

function pickItems(res) {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.items)) return res.items;
  if (Array.isArray(res.questions)) return res.questions;
  if (Array.isArray(res.data)) return res.data;
  // any first array-valued key
  for (const k of Object.keys(res)) if (Array.isArray(res[k])) return res[k];
  return [];
}

function structuredPrompt(subjectName, topicName) {
  return `Create exactly 2 ORIGINAL Sri Lankan O/L structured exam questions for ${subjectName}, topic "${topicName}". Each must have a 1-2 sentence context and 3 sub-parts.

Respond ONLY with this JSON object (use this exact key name "items"):
{"items":[
  {"context":"...","parts":[
    {"label":"a","prompt":"...","answer":"...","marks":2},
    {"label":"b","prompt":"...","answer":"...","marks":3},
    {"label":"c","prompt":"...","answer":"...","marks":4}
  ]},
  {"context":"...","parts":[ ... 3 parts ... ]}
]}`;
}

function casePrompt(topicName) {
  return `Create exactly 2 ORIGINAL Business & Accounting O/L case-study questions for topic "${topicName}". Each = a 4-6 sentence fictional Sri Lankan business scenario (e.g. "Nimal's Bakery in Galle"), then 3 sub-questions. Fully original — do NOT copy past papers.

Respond ONLY with this JSON object (use exact key "items"):
{"items":[
  {"title":"...","scenario":"...","parts":[
    {"label":"a","prompt":"...","answer":"...","marks":3},
    {"label":"b","prompt":"...","answer":"...","marks":4},
    {"label":"c","prompt":"...","answer":"...","marks":5}
  ]},
  {"title":"...","scenario":"...","parts":[ ...3 parts... ]}
]}`;
}

async function run(label, promptFn, topics, extraKeySet) {
  const out = [];
  let i = 0;
  await Promise.all(Array.from({length: 6}, async () => {
    while (true) {
      const my = i++; if (my >= topics.length) return;
      const t = topics[my];
      const res = await call(promptFn(t.subject.name, t.topic.name));
      const items = pickItems(res);
      for (const it of items) {
        out.push({ subject: t.subject.slug, topic: t.topic.slug, ...it });
      }
      console.log(`[${label}] ${t.subject.slug}/${t.topic.slug} → ${items.length}`);
    }
  }));
  return out;
}

const allTopics = subjects.flatMap(s => s.topics.map(t => ({ subject: s, topic: t })));
const businessTopics = allTopics.filter(x => x.subject.slug === "business-accounting");

console.log("Structured...");
const structured = await run("struct", structuredPrompt, allTopics);
writeFileSync("src/data/structured.json", JSON.stringify(structured, null, 2));
console.log(`Wrote ${structured.length} structured.`);

console.log("Case studies...");
const cases = await run("case", (s,t) => casePrompt(t), businessTopics);
writeFileSync("src/data/case-studies.json", JSON.stringify(cases, null, 2));
console.log(`Wrote ${cases.length} case studies.`);
