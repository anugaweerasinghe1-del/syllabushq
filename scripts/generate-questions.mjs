#!/usr/bin/env node
// One-time content generation for O/L practice site.
// Calls Lovable AI Gateway to generate original MCQs per topic per subject.
// Output: public/questions.json and public/subjects.json

import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";

const API_KEY = process.env.LOVABLE_API_KEY;
if (!API_KEY) {
  console.error("Missing LOVABLE_API_KEY");
  process.exit(1);
}

const MODEL = "google/gemini-3-flash-preview";
const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

const subjects = [
  {
    slug: "mathematics",
    name: "Mathematics",
    topics: [
      { slug: "real-numbers", name: "Real Numbers and Number Bases" },
      { slug: "indices-logarithms", name: "Indices and Logarithms" },
      { slug: "fractions-decimals", name: "Fractions and Decimals" },
      { slug: "percentages", name: "Percentages, Profit and Loss" },
      { slug: "ratio-proportion", name: "Ratio and Proportion" },
      { slug: "algebraic-expressions", name: "Algebraic Expressions" },
      { slug: "factors", name: "Factors of Algebraic Expressions" },
      { slug: "equations", name: "Equations and Inequalities" },
      { slug: "simultaneous-equations", name: "Simultaneous Equations" },
      { slug: "quadratic-equations", name: "Quadratic Equations" },
      { slug: "sets-probability", name: "Sets and Probability" },
      { slug: "perimeter-area", name: "Perimeter and Area" },
      { slug: "volume-surface-area", name: "Volume and Surface Area" },
      { slug: "loci-constructions", name: "Loci and Constructions" },
      { slug: "triangles", name: "Triangles, Parallelograms and Polygons" },
      { slug: "circle-theorems", name: "Circle Theorems" },
      { slug: "trigonometry", name: "Trigonometry" },
      { slug: "pythagoras", name: "Pythagoras Theorem" },
      { slug: "graphs-functions", name: "Graphs and Functions" },
      { slug: "statistics", name: "Statistics" },
      { slug: "matrices", name: "Matrices" },
      { slug: "vectors", name: "Vectors" },
    ],
  },
  {
    slug: "science",
    name: "Science",
    topics: [
      { slug: "matter-classification", name: "Classification of Matter" },
      { slug: "atomic-structure", name: "Atomic Structure and the Periodic Table" },
      { slug: "chemical-bonding", name: "Chemical Bonding" },
      { slug: "acids-bases-salts", name: "Acids, Bases and Salts" },
      { slug: "chemical-reactions", name: "Chemical Reactions" },
      { slug: "metals-non-metals", name: "Metals and Non-Metals" },
      { slug: "organic-chemistry", name: "Introduction to Organic Chemistry" },
      { slug: "motion-forces", name: "Motion and Forces" },
      { slug: "work-energy-power", name: "Work, Energy and Power" },
      { slug: "heat", name: "Heat and Temperature" },
      { slug: "light", name: "Light and Optics" },
      { slug: "sound", name: "Sound and Waves" },
      { slug: "electricity", name: "Electricity and Magnetism" },
      { slug: "electronics", name: "Basic Electronics" },
      { slug: "cells-tissues", name: "Cells and Tissues" },
      { slug: "human-systems", name: "Human Body Systems" },
      { slug: "nutrition-digestion", name: "Nutrition and Digestion" },
      { slug: "respiration-circulation", name: "Respiration and Circulation" },
      { slug: "reproduction", name: "Reproduction and Heredity" },
      { slug: "plants", name: "Plant Structure and Function" },
      { slug: "ecosystems", name: "Ecosystems and Environment" },
      { slug: "microorganisms", name: "Microorganisms and Disease" },
    ],
  },
  {
    slug: "business-accounting",
    name: "Business & Accounting Studies",
    topics: [
      { slug: "human-economic-activities", name: "Human Economic Activities" },
      { slug: "business-environment", name: "Business and its Environment" },
      { slug: "forms-of-business", name: "Forms of Business Organisations" },
      { slug: "production", name: "Production" },
      { slug: "marketing", name: "Marketing" },
      { slug: "money-banking", name: "Money and Banking" },
      { slug: "insurance", name: "Insurance" },
      { slug: "transport-communication", name: "Transport and Communication" },
      { slug: "trade", name: "Internal and International Trade" },
      { slug: "entrepreneurship", name: "Entrepreneurship and Small Business" },
      { slug: "human-resources", name: "Human Resources Management" },
      { slug: "consumer-protection", name: "Consumer Protection" },
      { slug: "intro-accounting", name: "Introduction to Accounting" },
      { slug: "accounting-equation", name: "The Accounting Equation" },
      { slug: "source-documents", name: "Source Documents and Books of Prime Entry" },
      { slug: "double-entry", name: "Double Entry and Ledger Accounts" },
      { slug: "trial-balance", name: "Trial Balance" },
      { slug: "cash-book", name: "Cash Book and Bank Reconciliation" },
      { slug: "control-accounts", name: "Control Accounts" },
      { slug: "adjustments", name: "Adjustments and Rectification of Errors" },
      { slug: "financial-statements", name: "Final Accounts and Financial Statements" },
      { slug: "non-profit-accounting", name: "Accounting for Non-Profit Organisations" },
    ],
  },
];

const QUESTIONS_PER_TOPIC = 5; // 22 topics x 5 = 110 per subject (>=100)

function buildPrompt(subjectName, topicName) {
  return `You are a Sri Lankan G.C.E. Ordinary Level (O/L) exam item writer, English medium.
Generate ${QUESTIONS_PER_TOPIC} ORIGINAL multiple-choice questions for the subject "${subjectName}", topic "${topicName}".

STRICT REQUIREMENTS:
- Entirely original. Do NOT reproduce or closely paraphrase any real past paper question.
- Match Sri Lankan O/L difficulty, phrasing, and format.
- Cover varied sub-skills within the topic (definitions, application, calculation, reasoning).
- Each question has exactly 4 options.
- Exactly one correct answer.
- "correct" is the 0-based index of the correct option.
- "explanation" is 1-3 sentences, clear and pedagogical.
- No images, no diagrams, no LaTeX. Use plain text math (e.g., x^2, sqrt(2), 3/4).
- Keep questions self-contained.

Return ONLY a JSON array of ${QUESTIONS_PER_TOPIC} objects with keys: question, options (array of 4 strings), correct (0-3), explanation. No markdown, no preamble.`;
}

async function callGateway(prompt, attempt = 1) {
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": API_KEY,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    if ((res.status === 429 || res.status >= 500) && attempt < 8) {
      const wait = Math.min(60000, 5000 * Math.pow(1.6, attempt - 1));
      console.warn(`  retry in ${wait}ms (status ${res.status})`);
      await new Promise((r) => setTimeout(r, wait));
      return callGateway(prompt, attempt + 1);
    }
    throw new Error(`Gateway ${res.status}: ${text.slice(0, 200)}`);
  }
  // Small pacing delay to avoid burst rate limits.
  await new Promise((r) => setTimeout(r, 1500));
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content ?? "";
  return content;
}

function extractJsonArray(text) {
  // Sometimes wrapped in {"questions": [...]} due to json_object mode.
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    const m = text.match(/\[[\s\S]*\]/);
    if (!m) throw new Error("No JSON array found");
    parsed = JSON.parse(m[0]);
  }
  if (Array.isArray(parsed)) return parsed;
  for (const k of Object.keys(parsed)) {
    if (Array.isArray(parsed[k])) return parsed[k];
  }
  throw new Error("Parsed JSON has no array");
}

function validateItem(q) {
  return (
    q &&
    typeof q.question === "string" &&
    Array.isArray(q.options) &&
    q.options.length === 4 &&
    q.options.every((o) => typeof o === "string") &&
    Number.isInteger(q.correct) &&
    q.correct >= 0 &&
    q.correct <= 3 &&
    typeof q.explanation === "string"
  );
}

async function genTopic(subject, topic) {
  const prompt = buildPrompt(subject.name, topic.name);
  const raw = await callGateway(prompt);
  const items = extractJsonArray(raw).filter(validateItem);
  return items.map((q) => ({
    subject: subject.slug,
    topic: topic.slug,
    question: q.question.trim(),
    options: q.options.map((o) => String(o).trim()),
    correct: q.correct,
    explanation: q.explanation.trim(),
  }));
}

async function runWithConcurrency(tasks, limit) {
  const results = [];
  let i = 0;
  const workers = Array.from({ length: limit }, async () => {
    while (i < tasks.length) {
      const idx = i++;
      try {
        results[idx] = await tasks[idx]();
      } catch (e) {
        console.error(`Task ${idx} failed:`, e.message);
        results[idx] = [];
      }
    }
  });
  await Promise.all(workers);
  return results;
}

async function main() {
  // Resume support: load existing questions and skip (subject, topic) pairs already covered.
  const existing = existsSync("public/questions.json")
    ? JSON.parse(readFileSync("public/questions.json", "utf8"))
    : [];
  const have = new Map();
  for (const q of existing) {
    const k = `${q.subject}::${q.topic}`;
    have.set(k, (have.get(k) || 0) + 1);
  }
  const all = [...existing];
  for (const subject of subjects) {
    console.log(`\n=== ${subject.name} (${subject.topics.length} topics) ===`);
    const todo = subject.topics.filter(
      (t) => (have.get(`${subject.slug}::${t.slug}`) || 0) < QUESTIONS_PER_TOPIC,
    );
    if (todo.length === 0) {
      console.log(`  (already complete)`);
      continue;
    }
    const tasks = todo.map((t) => async () => {
      const items = await genTopic(subject, t);
      console.log(`  ${t.name}: ${items.length}`);
      return items;
    });
    const batches = await runWithConcurrency(tasks, 1);
    const subjectItems = batches.flat();
    console.log(`  new for ${subject.name}: ${subjectItems.length}`);
    all.push(...subjectItems);
    // Persist after each subject to checkpoint.
    mkdirSync("public", { recursive: true });
    writeFileSync("public/questions.json", JSON.stringify(all, null, 2));
  }

  // Dedupe by question text
  const seen = new Set();
  const deduped = all.filter((q) => {
    const k = q.question.toLowerCase().replace(/\s+/g, " ");
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  mkdirSync("public", { recursive: true });
  writeFileSync("public/questions.json", JSON.stringify(deduped, null, 2));
  writeFileSync(
    "public/subjects.json",
    JSON.stringify(
      subjects.map((s) => ({ slug: s.slug, name: s.name, topics: s.topics })),
      null,
      2,
    ),
  );

  const counts = {};
  for (const q of deduped) counts[q.subject] = (counts[q.subject] || 0) + 1;
  console.log("\n=== DONE ===");
  console.log("Total:", deduped.length);
  console.log("Per subject:", counts);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});