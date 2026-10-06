import type { Guide } from "./types";

export const PAST_PAPER_GUIDES: Guide[] = [
  {
    slug: "ol-past-papers",
    category: "past-papers",
    keyword: "o/l past papers",
    title: "O/L past papers: where to find them and how to actually use them",
    metaTitle: "O/L Past Papers (English Medium) — Free + How to Use Them | SyllabusHQ",
    description:
      "Where to get genuine Sri Lankan G.C.E. O/L past papers in English medium, how to tell real papers from fakes, and a 4-step method that turns each paper into marks.",
    readMinutes: 7,
    intro:
      "Every O/L student is told to 'do past papers'. Very few are told how. Downloading twenty PDFs and skimming them does almost nothing. Sitting one paper properly, marking it honestly and fixing every lost mark does a lot. This guide covers both halves: where genuine papers come from, and what to do once you have one.",
    sections: [
      {
        h: "Where genuine O/L past papers come from",
        p: [
          "Every G.C.E. Ordinary Level paper is set and printed by the Department of Examinations, Sri Lanka. The department is the only source of the real thing. Everything else, from school model papers to tuition class handouts and websites, is either a copy of a department paper or someone's own practice paper.",
          "The SyllabusHQ past paper library only holds papers we have checked against the original department layout. Each one shows its year, its sitting and its medium, so you always know exactly what you are opening.",
        ],
        ul: [
          "Mathematics 2020 (English medium), Papers I and II",
          "Science 2021, sat in 2022 (English medium)",
          "Business & Accounting Studies 2023, sat in 2024 (English medium)",
          "Business & Accounting Studies 2024 (English medium)",
        ],
      },
      {
        h: "How to spot a fake or edited paper",
        p: [
          "Plenty of 'past papers' online are retyped, cut down or mixed with questions from other years. Check three things before you trust one:",
        ],
        ol: [
          "The header. Real papers carry the department's name, the subject code, the paper number (I or II) and the time allowed.",
          "The structure. Count the questions. A Science Paper I always has 40 multiple-choice questions. A Mathematics Paper I has 25 short questions in Part A and 5 structured questions in Part B. If the count is wrong, the paper has been edited.",
          "The instructions. Real papers say exactly how many questions to answer, for example 'answer only three questions from Part B'. Missing instructions usually mean a retyped copy.",
        ],
      },
      {
        h: "The 4-step method: turn one paper into marks",
        ol: [
          "Sit it under real conditions: a timer set to the official time, no notes and no phone. Include the reading time for Mathematics Paper II and Business & Accounting Studies.",
          "Mark it against the marking points, not just the final answer. In Paper II most marks are for method and for each correct point, so a wrong final answer can still earn most of the marks.",
          "Sort every lost mark into one of three reasons: did not know it, knew it but made a careless slip, or ran out of time. Each reason needs a different fix.",
          "Fix it within 48 hours. Re-learn the 'did not know' topics, redo the 'careless' questions from memory, and practise faster methods for the 'time' questions.",
        ],
      },
      {
        h: "How many past papers should you do?",
        p: [
          "Quality matters more than quantity. One paper sat and corrected properly every week, from about four months before the exam, gives you around 15 full papers per subject. That is enough to see every common question type several times.",
          "When you run out of genuine papers, switch to original practice questions written in the same format. SyllabusHQ's practice papers follow the department's section layout and mark allocations, and are always labelled as practice, never as past papers.",
        ],
      },
      {
        h: "Common mistakes students make with past papers",
        ul: [
          "Reading the answers before trying the question. That checks whether you recognise an answer, not whether you can produce one.",
          "Only doing Paper I because it is quicker. Paper II carries more marks in every subject.",
          "Skipping the questions you find hard. Those are exactly the ones that decide an A or a B.",
          "Never timing yourself. Many students lose marks to the clock, not to the content.",
        ],
      },
    ],
    faqs: [
      {
        q: "Are SyllabusHQ past papers free?",
        a: "Yes. You can read, download or sit every paper in the library online for free, with no login.",
      },
      {
        q: "Are SyllabusHQ practice questions real past paper questions?",
        a: "No. Practice questions are original and written in the O/L format. Only the papers in the past paper library are official Department of Examinations papers.",
      },
      {
        q: "Which medium are the papers in?",
        a: "All papers on SyllabusHQ are English medium.",
      },
    ],
    cta: { label: "Open the past paper library", href: "/past-papers" },
    related: ["ol-maths-past-papers", "ol-science-past-papers", "how-to-use-marking-schemes"],
  },
  {
    slug: "ol-maths-past-papers",
    category: "past-papers",
    keyword: "ol maths paper",
    title: "O/L Maths past papers: structure, timing and how to practise each part",
    metaTitle: "O/L Maths Past Papers & Paper Structure (English Medium) | SyllabusHQ",
    description:
      "The real structure of the Sri Lankan O/L Mathematics Paper I and Paper II, how marks are split, and a practice plan for 2023, 2024 and 2025-style maths papers.",
    readMinutes: 8,
    intro:
      "Students search for the 2023 and 2024 O/L maths papers more than for almost anything else. That makes sense, because the maths paper is the one most students worry about. Before you sit any year's paper, though, you need to know how it is built. The structure barely changes from year to year, and once you know it you can plan every minute of the exam.",
    sections: [
      {
        h: "Mathematics Paper I: 2 hours, 100 marks",
        table: [
          ["Part", "What it contains"],
          ["Part A", "25 short questions, 2 marks each (50 marks). Answer all."],
          ["Part B", "5 structured questions, 10 marks each (50 marks). Answer all."],
        ],
        p: [
          "Part A rewards speed and accuracy. Each question tests one skill: a percentage, a factorisation, an angle or a simple probability. Aim for roughly 2 minutes per question, which leaves about 70 minutes for Part B.",
          "You answer on the question paper itself, so show your working in the space given. A correct method with an arithmetic slip can still earn 1 of the 2 marks.",
        ],
      },
      {
        h: "Mathematics Paper II: 3 hours plus 10 minutes reading, 100 marks",
        table: [
          ["Part", "What it contains"],
          ["Part A", "6 questions. Answer any 5, 10 marks each."],
          ["Part B", "6 questions. Answer any 5, 10 marks each."],
        ],
        p: [
          "You answer ten questions in 180 minutes, so about 18 minutes each. Use the 10 minutes of reading time to choose your questions. Do not use it to start working on scrap paper.",
          "Part B questions are longer and often join two topics together, such as a graph with an inequality, or a construction with a locus. Your choice here matters: drop the question whose final part you cannot see how to reach, not simply the one that looks longest.",
        ],
      },
      {
        h: "Topics that appear in almost every maths paper",
        ul: [
          "Percentages, profit and loss, and interest",
          "Factorising and simplifying algebraic expressions",
          "Simultaneous and quadratic equations",
          "Sets and probability, including Venn diagrams and tree diagrams",
          "Perimeter, area, volume and surface area",
          "Circle theorems and triangle and parallelogram theorems",
          "Constructions and loci",
          "Graphs of functions and reading values off a graph",
          "Statistics: mean, frequency tables and cumulative frequency",
        ],
      },
      {
        h: "A practice plan using past maths papers",
        ol: [
          "Weeks 1–4: sit Paper I Part A only, timed at 50 minutes. Write down every topic where you drop marks.",
          "Weeks 5–8: sit full Paper I papers. Practise drilling your weak topics between papers.",
          "Weeks 9–12: sit full Paper II papers including the reading time. Mark them against marking points.",
          "Final month: alternate full Paper I and Paper II papers every few days, and keep a running list of the methods you keep forgetting.",
        ],
      },
      {
        h: "Looking for a specific year's maths paper?",
        p: [
          "The SyllabusHQ library currently holds the 2020 English-medium Mathematics paper, checked against the department original. For other years, use the Department of Examinations or your school's copies, and check the header and question count as described in our past paper guide. For extra practice in exactly the same layout, use SyllabusHQ's original Paper I and Paper II style questions. They are marked point by point the way an examiner would mark them.",
        ],
      },
    ],
    faqs: [
      {
        q: "How long is the O/L maths exam?",
        a: "Paper I is 2 hours. Paper II is 3 hours, with 10 minutes of reading time before it starts.",
      },
      {
        q: "Do I have to answer every question in Paper II?",
        a: "No. You answer 5 of the 6 questions in Part A and 5 of the 6 questions in Part B.",
      },
      {
        q: "Is a calculator allowed?",
        a: "Follow the instructions printed on the official paper and the admission card for your year. Practise without a calculator so you are not caught out.",
      },
    ],
    cta: { label: "Sit the 2020 Maths paper", href: "/past-papers/mathematics-2020" },
    related: ["how-to-get-an-a-for-ol-maths", "ol-maths-paper-1-part-a", "ol-maths-paper-2-strategy"],
  },
  {
    slug: "ol-science-past-papers",
    category: "past-papers",
    keyword: "ol science paper",
    title: "O/L Science past papers: Paper I and II explained, with a practice plan",
    metaTitle: "O/L Science Past Papers & Structure (English Medium) | SyllabusHQ",
    description:
      "How the Sri Lankan O/L Science paper is built: 40 MCQs in Paper I, then structured and essay questions in Paper II, plus how to practise 2022, 2023 and 2024-style papers.",
    readMinutes: 7,
    intro:
      "The O/L Science paper is wide. It covers physics, chemistry and biology in one exam. That means the students who score highest are not always the ones who know most. They are the ones who know the paper format and leave no topic completely untouched.",
    sections: [
      {
        h: "Science Paper I: 1 hour, 40 marks",
        p: [
          "There are 40 multiple-choice questions, 1 mark each, with four alternatives per question. You have 60 minutes, so about 90 seconds per question. Questions mix recall ('which of these is a noble gas?') with short calculations and diagram reading.",
        ],
      },
      {
        h: "Science Paper II: 3 hours, 100 marks",
        table: [
          ["Part", "What it contains"],
          ["Part A — Structured", "Questions 1 to 4. Answer all, 10 marks each."],
          ["Part B — Essay", "Questions 5 to 9. Answer any 3, 20 marks each."],
        ],
        p: [
          "Part A questions are usually built around an experiment, a diagram or a data table, with short sub-parts. Part B essay questions are longer and multi-part, and normally centre on one area, such as electricity, the human body or chemical reactions.",
        ],
      },
      {
        h: "How to choose your three Part B questions",
        ul: [
          "Read all five questions to the end before choosing. The last sub-part is often worth the most.",
          "Prefer questions with calculations if you are confident with formulas. Calculation marks are clear-cut, while description marks depend on how you word things.",
          "Avoid choosing a question just because you liked its first sub-part.",
        ],
      },
      {
        h: "Practice plan for the Science paper",
        ol: [
          "Do 40 MCQs a week, timed at 60 minutes. Note which area (physics, chemistry or biology) your mistakes come from.",
          "Each week, sit one Paper II Part A set of four structured questions in 45 minutes.",
          "Each week, write one Part B essay in 35 minutes and mark it against the marking points.",
          "In the final six weeks, sit full Paper I and Paper II together, back to back.",
        ],
      },
      {
        h: "Searching for the 2022, 2023 or 2024 Science paper?",
        p: [
          "The SyllabusHQ library holds the 2021 Science paper (sat in 2022), checked against the department original. Every year since has followed the same Paper I and II structure, so practising with it, together with our original MCQs and structured questions, prepares you for any recent year.",
        ],
      },
    ],
    faqs: [
      {
        q: "How many MCQs are in O/L Science Paper I?",
        a: "There are 40, worth 1 mark each, and you have 1 hour.",
      },
      {
        q: "How many essay questions do I answer in Science Paper II?",
        a: "Three questions from Part B (questions 5 to 9), each worth 20 marks.",
      },
    ],
    cta: { label: "Sit the 2021 Science paper", href: "/past-papers/science-2021" },
    related: ["ol-science-mcq-strategy", "ol-science-paper-2-essays", "how-to-get-an-a-for-ol-science"],
  },
  {
    slug: "ol-business-accounting-past-papers",
    category: "past-papers",
    keyword: "o/l business and accounting studies past papers",
    title: "O/L Business & Accounting Studies past papers: the full structure",
    metaTitle: "O/L Business & Accounting Studies Past Papers (2023, 2024) | SyllabusHQ",
    description:
      "Free English-medium O/L Business & Accounting Studies past papers for 2023 and 2024, plus a clear breakdown of Paper I MCQs and the Paper II integrated case question.",
    readMinutes: 7,
    intro:
      "Business & Accounting Studies is the O/L subject where structure matters most. Paper II mixes a compulsory case study, business theory and full accounting questions. Students who don't plan their time often run out of it in the accounting section, which is where marks are easiest to earn.",
    sections: [
      {
        h: "Paper I: 40 multiple-choice questions",
        p: [
          "There are 40 questions, 1 mark each, with four alternatives. They cover both halves of the syllabus: business topics such as forms of organisation, marketing, banking and insurance, and accounting topics such as the accounting equation, source documents and ledger entries.",
        ],
      },
      {
        h: "Paper II: 3 hours plus 10 minutes reading",
        table: [
          ["Section", "What it contains"],
          ["Question 1", "Compulsory integrated case question, 20 marks."],
          ["Part I — Business Studies", "Questions 2 to 4. Answer any 2, 8 marks each."],
          ["Part II — Accounting", "Questions 5 to 7. Answer any 2, 12 marks each."],
        ],
      },
      {
        h: "The integrated case question (Question 1)",
        p: [
          "Question 1 describes a small business, often a Sri Lankan sole trader or a small partnership, and asks a run of short questions. Some are about business concepts and some about the accounting records. It is compulsory and worth a third of Paper II, so attempt it first while you are fresh.",
        ],
        ul: [
          "Underline every number in the case as you read. Most of them get used later.",
          "Answer in the context of the case. 'The business can obtain a bank loan' scores less than naming the business from the case and explaining why.",
          "Use the correct terms: 'sole proprietorship', 'current asset', 'credit note', not loose everyday words.",
        ],
      },
      {
        h: "Which papers are in the SyllabusHQ library",
        ul: [
          "Business & Accounting Studies 2023, sat in 2024 (English medium)",
          "Business & Accounting Studies 2024 (English medium)",
        ],
        p: [
          "Both are checked against the department original and can be sat online with a timer or downloaded.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is Question 1 in Business & Accounting Studies Paper II compulsory?",
        a: "Yes. The integrated case question is compulsory and worth 20 marks.",
      },
      {
        q: "How many accounting questions do I answer?",
        a: "Two of the three questions in Part II (questions 5 to 7), each worth 12 marks.",
      },
    ],
    cta: { label: "Sit the 2024 Business & Accounting paper", href: "/past-papers/business-accounting-2024" },
    related: ["ol-bas-integrated-case-question", "accounting-equation-explained", "trial-balance-explained"],
  },
  {
    slug: "ol-model-papers",
    category: "past-papers",
    keyword: "o/l model papers",
    title: "O/L model papers vs past papers: which should you use, and when?",
    metaTitle: "O/L Model Papers — Free Practice in Real O/L Format | SyllabusHQ",
    description:
      "What O/L model papers are, how they differ from real past papers, and how to use both in the final months before the Sri Lankan G.C.E. O/L exam.",
    readMinutes: 5,
    intro:
      "A model paper is a practice paper written by a teacher, a school, a zonal education office or a website in the style of the real O/L exam. A past paper is the real exam from an earlier year. Both are useful, but for different jobs.",
    sections: [
      {
        h: "Past papers: the gold standard",
        p: [
          "Past papers show you exactly how the Department of Examinations words its questions and awards marks. Nothing else is as reliable. The catch is that there are only a limited number, and many students have already seen the recent ones in class.",
        ],
      },
      {
        h: "Model papers: unlimited fresh practice",
        p: [
          "A good model paper copies the real structure: the same number of questions, the same marks and the same time. It gives you questions you have never seen before, and that is the real test of understanding. A poor model paper uses the wrong structure or includes topics outside the O/L syllabus.",
        ],
        ul: [
          "Check the structure matches the official paper (for example 40 MCQs in Science Paper I).",
          "Check the topics are in the NIE syllabus for Grades 10 and 11.",
          "Check that a marking scheme is provided. Without one you cannot learn from your mistakes.",
        ],
      },
      {
        h: "How to combine them",
        ol: [
          "Use past papers to learn the format and to set your benchmark score.",
          "Use model papers to keep practising once you have used up the past papers.",
          "In the last two weeks, go back to past papers so the real wording is fresh in your mind.",
        ],
      },
      {
        h: "SyllabusHQ practice papers",
        p: [
          "SyllabusHQ builds original model-style papers that follow the official section layouts for Mathematics, Science and Business & Accounting Studies. Written answers are marked against marking points. Each paper is clearly labelled as practice, so you never confuse it with an official paper.",
        ],
      },
    ],
    faqs: [
      {
        q: "Are model papers harder than real O/L papers?",
        a: "It varies. Some are harder and some are easier. Judge a model paper by whether its structure and topics match the official paper, not by how difficult it is.",
      },
    ],
    cta: { label: "Start a practice paper", href: "/practice" },
    related: ["ol-past-papers", "ol-study-timetable", "grade-11-past-papers"],
  },
  {
    slug: "grade-11-past-papers",
    category: "past-papers",
    keyword: "grade 11 past papers",
    title: "Grade 11 past papers: how to use them in your O/L year",
    metaTitle: "Grade 11 Past Papers — Maths, Science, Business (English) | SyllabusHQ",
    description:
      "A Grade 11 guide to past papers and term test papers in Sri Lanka: what each type is for, a term-by-term plan, and free English-medium O/L practice.",
    readMinutes: 6,
    intro:
      "Grade 11 is the O/L year. The papers you use change as the year goes on: school term test papers at the start, then real O/L past papers, then full timed exams. Here is how to use each kind well.",
    sections: [
      {
        h: "Three kinds of Grade 11 papers",
        ul: [
          "Term test papers: set by schools or provinces, covering the lessons taught that term. Good for checking you have understood recent lessons.",
          "O/L past papers: the real Department of Examinations exam from earlier years, covering the full Grade 10 and 11 syllabus.",
          "Model papers: practice papers written in the O/L format, useful once you have used up the past papers.",
        ],
      },
      {
        h: "A term-by-term plan",
        table: [
          ["Term", "Focus"],
          ["First term", "Term test papers plus Grade 10 topic revision. Sit Paper I sections of past papers."],
          ["Second term", "Full Paper I past papers, timed. Start Paper II questions topic by topic."],
          ["Third term", "Full Paper I and II together, under exam timing, every week."],
        ],
      },
      {
        h: "Don't forget Grade 10",
        p: [
          "The O/L covers both Grade 10 and Grade 11. Many Grade 11 students only revise what they are learning now and lose easy marks on Grade 10 topics such as sets, basic algebra, fractions and decimals in Maths, or classification of matter and cells in Science. Spend one revision session a week on Grade 10 work.",
        ],
      },
    ],
    faqs: [
      {
        q: "Are O/L past papers the same as Grade 11 papers?",
        a: "No. O/L past papers are the national exam set by the Department of Examinations. Grade 11 term test papers are set by schools or provinces and cover less of the syllabus.",
      },
    ],
    cta: { label: "Browse O/L past papers", href: "/past-papers" },
    related: ["grade-11-maths", "grade-11-science", "ol-study-timetable"],
  },
  {
    slug: "grade-10-maths-past-papers",
    category: "past-papers",
    keyword: "grade 10 maths past papers",
    title: "Grade 10 maths past papers: build your O/L foundation early",
    metaTitle: "Grade 10 Maths Past Papers & Practice (English Medium) | SyllabusHQ",
    description:
      "How Grade 10 students in Sri Lanka should use maths term papers and early O/L practice, plus the Grade 10 topics that keep appearing in the O/L Mathematics exam.",
    readMinutes: 5,
    intro:
      "Grade 10 maths is not a warm-up year. Half the O/L Mathematics syllabus is taught in it, and those topics turn up in Paper I and Paper II every year. Students who practise properly in Grade 10 start Grade 11 far ahead.",
    sections: [
      {
        h: "Use term papers to check lessons, and O/L questions to test depth",
        p: [
          "Grade 10 term test papers show whether you followed the term's lessons. Real O/L questions on the same topics show whether you can use them under exam pressure. Do both: a term paper after each term, and O/L-style questions on each topic as you finish it.",
        ],
      },
      {
        h: "Foundation skills that pay off in Grade 11",
        ul: [
          "Fast, accurate work with fractions, decimals and percentages",
          "Expanding and factorising algebraic expressions",
          "Solving linear equations and simple inequalities",
          "Area and perimeter of composite shapes",
          "Reading and drawing graphs accurately",
        ],
      },
      {
        h: "A 20-minute daily habit",
        p: [
          "Ten short Paper I-style questions a day takes about 20 minutes. Over a school year that adds up to more than 2,000 questions, which is more maths practice than most students do in Grade 11.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can Grade 10 students use O/L past papers?",
        a: "Yes. Do the questions on topics you have already covered, and skip the rest until Grade 11.",
      },
    ],
    cta: { label: "Practise Maths questions", href: "/practice/mcq/mathematics" },
    related: ["grade-10-maths", "ol-maths-past-papers", "ol-maths-paper-1-part-a"],
  },
];
