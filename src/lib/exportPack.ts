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
  const M = 56;
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const maxW = W - M * 2;
  let y = M;

  const nl = (n = 14) => {
    y += n;
    if (y > H - M) {
      doc.addPage();
      y = M;
    }
  };
  const write = (text: string, size = 11, style: "normal" | "bold" = "normal", indent = 0) => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(mathToPlain(text), maxW - indent) as string[];
    for (const line of lines) {
      if (y > H - M) {
        doc.addPage();
        y = M;
      }
      doc.text(line, M + indent, y);
      y += size + 4;
    }
  };

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Sri Lankan G.C.E. Ordinary Level · Practice Paper", W / 2, y, { align: "center" });
  nl(24);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(meta.subjectName, W / 2, y, { align: "center" });
  nl(18);
  doc.setFont("helvetica", "normal");
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
    write(`Q${i + 1}. ${q.question}`, 11, "bold");
    q.options.forEach((o, j) => write(`${LETTER(j)}. ${o}`, 10, "normal", 16));
    nl(8);
  });

  if (meta.includeScheme) {
    doc.addPage();
    y = M;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text(`Marking Scheme — ${meta.subjectName} · ${meta.topicName}`, M, y);
    nl(24);
    meta.items.forEach((q, i) => {
      write(`Q${i + 1}. Answer: ${LETTER(q.correct)} — ${q.options[q.correct] ?? ""}`, 10, "bold");
      write(q.explanation, 9, "normal", 16);
      nl(6);
    });
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