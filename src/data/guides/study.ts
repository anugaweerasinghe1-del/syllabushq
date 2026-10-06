import type { Guide } from "./types";

export const STUDY_GUIDES: Guide[] = [
  {
    slug: "grade-11-maths",
    category: "study-guide",
    keyword: "grade 11 maths",
    title: "Grade 11 Maths (Sri Lanka): topics, exam links and how to revise",
    metaTitle: "Grade 11 Maths Sri Lanka — Topics, Practice & O/L Tips | SyllabusHQ",
    description:
      "A Grade 11 Mathematics guide for Sri Lankan students: the key O/L topics, how each one is examined, and free English-medium practice questions.",
    readMinutes: 6,
    intro:
      "Grade 11 Maths leads straight into the O/L. Every topic you learn this year can appear in Paper I or Paper II within months. The best way to study it is to learn each topic alongside the way it is examined.",
    sections: [
      {
        h: "Topics and how they are examined",
        table: [
          ["Topic", "Typical O/L use"],
          ["Quadratic equations", "Solve by factorising or formula. Often part of a word problem in Paper II."],
          ["Simultaneous equations", "Short Part A items and word problems."],
          ["Circle theorems", "Angle calculations with reasons."],
          ["Trigonometry", "Heights, distances and angles of elevation."],
          ["Statistics", "Mean from frequency tables and cumulative frequency curves."],
          ["Graphs and functions", "Draw a quadratic graph, then read values and solve equations from it."],
          ["Matrices and vectors", "Short calculations and simple applications."],
        ],
      },
      {
        h: "Revise in topic loops",
        p: [
          "For each topic: learn the method, do 10 short questions, do one structured question, then come back to it two weeks later. That spaced loop is the most reliable way to make a method stick.",
        ],
      },
      {
        h: "Show reasons in geometry",
        p: [
          "In circle and triangle questions, marks often depend on giving the reason, for example 'angles in the same segment are equal'. Learn the reasons word for word along with the theorems.",
        ],
      },
    ],
    faqs: [
      { q: "Is Grade 11 Maths harder than Grade 10?", a: "It builds on Grade 10. Weak Grade 10 algebra is the most common reason students struggle in Grade 11." },
    ],
    cta: { label: "Practise Grade 11 Maths topics", href: "/mathematics" },
    related: ["grade-10-maths", "how-to-get-an-a-for-ol-maths", "ol-maths-past-papers"],
  },
  {
    slug: "grade-10-maths",
    category: "study-guide",
    keyword: "grade 10 maths",
    title: "Grade 10 Maths (Sri Lanka): the foundation for your O/L",
    metaTitle: "Grade 10 Maths Sri Lanka — Key Topics & Free Practice | SyllabusHQ",
    description:
      "The Grade 10 Mathematics topics Sri Lankan students must master for the O/L, with common mistakes and a simple daily practice routine.",
    readMinutes: 5,
    intro:
      "Many O/L maths marks rest on skills first taught in Grade 10. Getting them solid now means Grade 11 feels like building upwards, not patching holes.",
    sections: [
      {
        h: "Core Grade 10 skills",
        ul: [
          "Number: fractions, decimals, percentages, ratio and proportion",
          "Algebra: expanding brackets, factorising, linear equations",
          "Measurement: perimeter, area and volume of solids",
          "Geometry: triangles, parallelograms, angles and polygons",
          "Sets and early probability",
        ],
      },
      {
        h: "Most common Grade 10 mistakes",
        ul: [
          "Sign errors when expanding −(a − b)",
          "Mixing up area units (cm²) and volume units (cm³)",
          "Forgetting to simplify a ratio",
          "Working out a percentage of the wrong amount in profit and loss questions",
        ],
      },
      {
        h: "Daily routine",
        p: [
          "Do ten short questions a day on the topic your class is covering, plus two on an older topic. That takes 20 minutes and keeps everything fresh until the O/L.",
        ],
      },
    ],
    faqs: [
      { q: "Do Grade 10 topics come in the O/L exam?", a: "Yes. The O/L covers the Grade 10 and Grade 11 syllabus together." },
    ],
    cta: { label: "Start Grade 10 Maths practice", href: "/practice/mcq/mathematics" },
    related: ["grade-10-maths-past-papers", "grade-11-maths", "ol-maths-paper-1-part-a"],
  },
  {
    slug: "grade-11-science",
    category: "study-guide",
    keyword: "grade 11 science",
    title: "Grade 11 Science (Sri Lanka): what to focus on before the O/L",
    metaTitle: "Grade 11 Science Sri Lanka — Topics & O/L Revision Guide | SyllabusHQ",
    description:
      "Grade 11 Science for Sri Lankan O/L students: the high-value topics across physics, chemistry and biology, and how to practise for Paper I and Paper II.",
    readMinutes: 6,
    intro:
      "Grade 11 Science pulls physics, chemistry and biology together for the O/L. The challenge is breadth. Here is how to cover it without drowning in it.",
    sections: [
      {
        h: "High-value areas",
        table: [
          ["Area", "Why it matters"],
          ["Electricity and magnetism", "Calculations and circuit diagrams appear often in Paper II."],
          ["Chemical reactions and equations", "Balancing equations, types of reaction, and acids, bases and salts."],
          ["Human body systems", "Essay-length explanations and labelled diagrams."],
          ["Motion, forces and energy", "Formula-based questions with clear-cut marks."],
          ["Ecosystems and environment", "Data reading and food-web questions."],
        ],
      },
      {
        h: "Make a formula and definition bank",
        p: [
          "Keep one page per area with every formula (with units) and every key definition. Review them as flashcards for 10 minutes a day. Recalling them without looking is what makes Paper I questions quick.",
        ],
      },
      {
        h: "Practise across areas",
        p: [
          "Don't revise one area for three weeks straight. Mix them: a mixed MCQ set each week keeps every area active and is much closer to the real Paper I.",
        ],
      },
    ],
    faqs: [
      { q: "How can I remember so many Science facts?", a: "Use spaced repetition: short daily flashcard reviews, with the facts you get wrong shown again sooner." },
    ],
    cta: { label: "Review Science flashcards", href: "/flashcards" },
    related: ["grade-10-science", "how-to-get-an-a-for-ol-science", "ol-science-mcq-strategy"],
  },
  {
    slug: "grade-10-science",
    category: "study-guide",
    keyword: "grade 10 science",
    title: "Grade 10 Science (Sri Lanka): key topics explained simply",
    metaTitle: "Grade 10 Science Sri Lanka — Topics, Notes & Practice | SyllabusHQ",
    description:
      "A clear guide to Grade 10 Science in Sri Lanka: matter, atomic structure, cells, forces and more, with the ideas that keep coming up in the O/L exam.",
    readMinutes: 6,
    intro:
      "Grade 10 Science introduces the big ideas the O/L keeps coming back to. Understanding them well now saves you from memorising them in a rush later.",
    sections: [
      {
        h: "Matter and its classification",
        p: [
          "Matter is classified into pure substances (elements and compounds) and mixtures. An element contains one type of atom. A compound contains two or more elements chemically combined in fixed proportions. A mixture can be separated by physical methods such as filtration or distillation.",
        ],
      },
      {
        h: "Atomic structure",
        p: [
          "An atom has a nucleus of protons and neutrons, surrounded by electrons. The atomic number is the number of protons. In O/L questions you will often write electronic configurations for the first 20 elements, for example sodium (11) as 2, 8, 1.",
        ],
      },
      {
        h: "Cells and tissues",
        p: [
          "Plant cells have a cell wall, chloroplasts and a large vacuole. Animal cells do not. Questions often ask you to label a diagram or to give the function of a part, so learn structure and function together.",
        ],
      },
      {
        h: "Motion and forces",
        p: [
          "Speed = distance ÷ time. Velocity is speed in a given direction, and acceleration is the change in velocity ÷ time. Always give units: m/s for speed and m/s² for acceleration.",
        ],
      },
    ],
    faqs: [
      { q: "Is Grade 10 Science included in the O/L?", a: "Yes. The O/L exam covers both Grade 10 and Grade 11." },
    ],
    cta: { label: "Practise Grade 10 Science topics", href: "/science" },
    related: ["grade-11-science", "ol-science-mcq-strategy", "ol-science-past-papers"],
  },
  {
    slug: "accounting-equation-explained",
    category: "study-guide",
    keyword: "accounting equation",
    title: "The accounting equation explained (O/L Business & Accounting)",
    metaTitle: "Accounting Equation Explained with Examples — O/L | SyllabusHQ",
    description:
      "Assets = Capital + Liabilities, explained step by step with worked Sri Lankan rupee examples, exactly as it is tested in O/L Business & Accounting Studies.",
    readMinutes: 5,
    intro:
      "The accounting equation is the backbone of every accounting question in the O/L. If you can show how any transaction changes it, ledger accounts and the trial balance become much easier.",
    sections: [
      {
        h: "The equation",
        p: [
          "Assets = Capital + Liabilities. Assets are what the business owns. Capital is what the owner has put in. Liabilities are what the business owes to others. Both sides must always be equal.",
        ],
      },
      {
        h: "Worked example",
        table: [
          ["Transaction", "Effect"],
          ["Owner starts business with Rs. 200,000 cash", "Cash +200,000 · Capital +200,000"],
          ["Buys furniture for Rs. 50,000 cash", "Furniture +50,000 · Cash −50,000"],
          ["Buys goods on credit Rs. 30,000", "Stock +30,000 · Creditors +30,000"],
          ["Pays creditor Rs. 10,000", "Cash −10,000 · Creditors −10,000"],
        ],
        p: [
          "After these four transactions: assets are Rs. 220,000 (cash 140,000 + furniture 50,000 + stock 30,000), and capital plus liabilities are Rs. 200,000 + Rs. 20,000 = Rs. 220,000. The equation balances.",
        ],
      },
      {
        h: "Profit, loss and drawings",
        p: [
          "Profit increases capital. Losses and drawings, when the owner takes cash or goods for personal use, reduce it. So the extended form is: Assets = (Capital + Profit − Drawings) + Liabilities.",
        ],
      },
    ],
    faqs: [
      { q: "Does every transaction affect two items?", a: "Yes. That is the idea behind double entry: every transaction has two effects that keep the equation balanced." },
    ],
    cta: { label: "Practise accounting questions", href: "/practice/mcq/business-accounting" },
    related: ["trial-balance-explained", "source-documents-explained", "ol-bas-integrated-case-question"],
  },
  {
    slug: "trial-balance-explained",
    category: "study-guide",
    keyword: "trial balance",
    title: "Trial balance explained: preparing one for O/L accounting",
    metaTitle: "Trial Balance Explained with Example — O/L Accounting | SyllabusHQ",
    description:
      "What a trial balance is, which balances go on the debit and credit side, a worked rupee example and the errors a trial balance cannot find, for Sri Lankan O/L students.",
    readMinutes: 6,
    intro:
      "A trial balance lists the balance of every ledger account on a date. If the debit and credit totals agree, the double entry is arithmetically correct. It is one of the most commonly examined accounting skills at O/L.",
    sections: [
      {
        h: "Which side does each balance go on?",
        table: [
          ["Debit side", "Credit side"],
          ["Assets (cash, bank, furniture, debtors, stock)", "Capital"],
          ["Expenses (rent, salaries, electricity)", "Liabilities (creditors, loans)"],
          ["Purchases, drawings, sales returns", "Sales, purchase returns, income"],
        ],
      },
      {
        h: "Worked example",
        table: [
          ["Account", "Dr / Cr (Rs.)"],
          ["Cash", "Dr 45,000"],
          ["Furniture", "Dr 60,000"],
          ["Purchases", "Dr 80,000"],
          ["Rent", "Dr 15,000"],
          ["Capital", "Cr 120,000"],
          ["Sales", "Cr 70,000"],
          ["Creditors", "Cr 10,000"],
        ],
        p: ["Debit total = 200,000 and credit total = 200,000. The trial balance agrees."],
      },
      {
        h: "Errors a trial balance will NOT show",
        ul: [
          "Error of omission: the transaction was not recorded at all.",
          "Error of commission: the right amount was posted to the wrong person's account.",
          "Error of principle: for example, an asset was recorded as an expense.",
          "Compensating errors: two mistakes that cancel each other out.",
          "Error of original entry: the wrong amount was entered on both sides.",
          "Complete reversal: debit and credit were swapped.",
        ],
      },
    ],
    faqs: [
      { q: "If a trial balance agrees, are the accounts correct?", a: "Not necessarily. Several types of error leave the totals equal." },
    ],
    cta: { label: "Practise trial balance questions", href: "/practice/structured/business-accounting" },
    related: ["accounting-equation-explained", "source-documents-explained", "ol-business-accounting-past-papers"],
  },
  {
    slug: "source-documents-explained",
    category: "study-guide",
    keyword: "source documents accounting",
    title: "Source documents and books of prime entry (O/L accounting)",
    metaTitle: "Source Documents & Books of Prime Entry — O/L Guide | SyllabusHQ",
    description:
      "Invoices, receipts, credit notes and debit notes, and which book of prime entry each one goes into, explained clearly for O/L Business & Accounting Studies.",
    readMinutes: 5,
    intro:
      "Every accounting record starts with a document as evidence. The O/L regularly asks you to match a document to the right book of prime entry, often inside the case question.",
    sections: [
      {
        h: "Matching documents to books",
        table: [
          ["Source document", "Book of prime entry"],
          ["Invoice received (credit purchase)", "Purchases journal"],
          ["Invoice issued (credit sale)", "Sales journal"],
          ["Credit note received", "Purchase returns journal"],
          ["Credit note issued", "Sales returns journal"],
          ["Receipt / cheque counterfoil", "Cash book"],
          ["Other (e.g. credit purchase of an asset)", "General journal"],
        ],
      },
      {
        h: "Credit note vs debit note",
        p: [
          "A credit note is sent by the seller to reduce what the buyer owes, for example when goods are returned. A debit note is sent by the buyer asking for that reduction. In the case question, read carefully to see who sent the document.",
        ],
      },
      {
        h: "Why books of prime entry exist",
        p: [
          "They gather similar transactions together, so that only the totals need posting to the ledger. That saves time and cuts errors. It is a common 2-mark 'state a reason' question.",
        ],
      },
    ],
    faqs: [
      { q: "Are cash sales recorded in the sales journal?", a: "No. The sales journal records credit sales only. Cash sales go in the cash book." },
    ],
    cta: { label: "Practise Business & Accounting MCQs", href: "/practice/mcq/business-accounting" },
    related: ["accounting-equation-explained", "trial-balance-explained", "ol-bas-integrated-case-question"],
  },
];
