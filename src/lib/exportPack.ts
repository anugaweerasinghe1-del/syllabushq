import { mathToPlain } from "./mathPlain";

export type PackQuestion = {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
};

export type PackMeta = {
  subjectName: string;
  topicName: string;
  items: PackQuestion[];
  includeScheme: boolean;
};

export function packFileName(meta: PackMeta, ext: string): string {
  const slug = (s: string) => s.replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `SyllabusHQ-${slug(meta.subjectName)}-${slug(meta.topicName)}-${meta.items.length}Q.${ext}`;
}

const LETTER = (i: number) => String.fromCharCode(65 + i);

/** Browser-only: builds the printable pack as a PDF and triggers a download. */
export async function downloadPackPdf(meta: PackMeta) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const loadFont = async (url: string, fileName: string, family: string, style: "normal" | "bold") => {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Unable to load the PDF font.");
    const bytes = new Uint8Array(await response.arrayBuffer());
    let binary = "";
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
    }
    doc.addFileToVFS(fileName, btoa(binary));
    doc.addFont(fileName, family, style);
  };
  await Promise.all([
    loadFont("/fonts/DejaVuSans.ttf", "DejaVuSans.ttf", "DejaVuSans", "normal"),
    loadFont("/fonts/DejaVuSans-Bold.ttf", "DejaVuSans-Bold.ttf", "DejaVuSans", "bold"),
  ]);
  const M = 56;
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const maxW = W - M * 2;
  const BOTTOM = H - M - 18;
  let y = M;

  const nl = (n = 14) => {
    y += n;
    if (y > BOTTOM) {
      doc.addPage();
      y = M;
    }
  };
  const wrap = (text: string, size: number, style: "normal" | "bold", indent: number) => {
    doc.setFont("DejaVuSans", style);
    doc.setFontSize(size);
    return doc.splitTextToSize(mathToPlain(text), maxW - indent) as string[];
  };
  const write = (text: string, size = 11, style: "normal" | "bold" = "normal", indent = 0) => {
    const lines = wrap(text, size, style, indent);
    const lead = size * 1.35;
    for (const line of lines) {
      if (y > BOTTOM) {
        doc.addPage();
        y = M;
        doc.setFont("DejaVuSans", style);
        doc.setFontSize(size);
      }
      doc.text(line, M + indent, y);
      y += lead;
    }
  };
  /** Height a question block needs, so it is never split across pages. */
  const blockHeight = (q: PackQuestion) => {
    let h = wrap(`Q1. ${q.question}`, 11, "bold", 0).length * 11 * 1.35;
    for (const o of q.options) h += wrap(`A. ${o}`, 10, "normal", 22).length * 10 * 1.35;
    return h + 14;
  };

  doc.setFont("DejaVuSans", "normal");
  doc.setFontSize(9);
  doc.text("Sri Lankan G.C.E. Ordinary Level · Practice Paper", W / 2, y, { align: "center" });
  nl(24);
  doc.setFont("DejaVuSans", "bold");
  doc.setFontSize(20);
  doc.text(meta.subjectName, W / 2, y, { align: "center" });
  nl(18);
  doc.setFont("DejaVuSans", "normal");
  doc.setFontSize(11);
  doc.text(meta.topicName, W / 2, y, { align: "center" });
  nl(22);
  doc.setFontSize(9);
  doc.text("Name: ..............................    Index No: ..............    Date: ..............", M, y);
  nl(18);
  doc.text(
    `Answer all ${meta.items.length} questions. Each question carries 1 mark. Total: ${meta.items.length} marks.`,
    M,
    y,
  );
  nl(10);
  doc.setDrawColor(190);
  doc.line(M, y, W - M, y);
  nl(20);

  meta.items.forEach((q, i) => {
    if (y + blockHeight(q) > BOTTOM) {
      doc.addPage();
      y = M;
    }
    write(`Q${i + 1}. ${q.question}`, 11, "bold");
    y += 3;
    q.options.forEach((o, j) => write(`${LETTER(j)}. ${o}`, 10, "normal", 22));
    nl(16);
  });

  if (meta.includeScheme) {
    doc.addPage();
    y = M;
    doc.setFont("DejaVuSans", "bold");
    doc.setFontSize(15);
    doc.text(`Marking Scheme — ${meta.subjectName} · ${meta.topicName}`, M, y);
    nl(24);
    meta.items.forEach((q, i) => {
      write(`Q${i + 1}. Answer: ${LETTER(q.correct)} — ${q.options[q.correct] ?? ""}`, 10, "bold");
      write(q.explanation, 9, "normal", 22);
      nl(10);
    });
  }

  // Page numbers
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFont("DejaVuSans", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(`${meta.subjectName} · ${meta.topicName}`, M, H - 28);
    doc.text(`Page ${p} of ${pages}`, W - M, H - 28, { align: "right" });
    doc.setTextColor(0);
  }

  doc.save(packFileName(meta, "pdf"));
}

/** Browser-only: builds the same pack as an editable Word document. */
export async function downloadPackDocx(meta: PackMeta) {
  const { Document, Packer, Paragraph, TextRun, AlignmentType, PageBreak, HeadingLevel } =
    await import("docx");
  const { saveAs } = await import("file-saver");

  const p = (text: string, opts: { bold?: boolean; size?: number; indent?: number } = {}) =>
    new Paragraph({
      spacing: { after: 80 },
      indent: opts.indent ? { left: opts.indent } : undefined,
      children: [
        new TextRun({ text: mathToPlain(text), bold: opts.bold, size: opts.size ?? 22, font: "Arial" }),
      ],
    });

  const children: InstanceType<typeof Paragraph>[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "Sri Lankan G.C.E. Ordinary Level · Practice Paper",
          size: 18,
          font: "Arial",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: meta.subjectName, bold: true, size: 40, font: "Arial" })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      children: [new TextRun({ text: meta.topicName, size: 24, font: "Arial" })],
    }),
    p("Name: ..............................   Index No: ..............   Date: .............."),
    p(
      `Answer all ${meta.items.length} questions. Each question carries 1 mark. Total: ${meta.items.length} marks.`,
    ),
  ];

  meta.items.forEach((q, i) => {
    children.push(p(`Q${i + 1}. ${q.question}`, { bold: true }));
    q.options.forEach((o, j) => children.push(p(`${LETTER(j)}. ${o}`, { indent: 360, size: 20 })));
  });

  if (meta.includeScheme) {
    children.push(new Paragraph({ children: [new PageBreak()] }));
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: `Marking Scheme — ${meta.subjectName} · ${meta.topicName}`,
            bold: true,
            size: 30,
            font: "Arial",
          }),
        ],
      }),
    );
    meta.items.forEach((q, i) => {
      children.push(
        p(`Q${i + 1}. Answer: ${LETTER(q.correct)} — ${q.options[q.correct] ?? ""}`, { bold: true }),
      );
      children.push(p(q.explanation, { indent: 360, size: 20 }));
    });
  }

  const doc = new Document({
    styles: { default: { document: { run: { font: "Arial", size: 22 } } } },
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 },
          },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, packFileName(meta, "docx"));
}