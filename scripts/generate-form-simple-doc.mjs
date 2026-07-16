// Generates two SIMPLE Form Structure documents (English & Marathi).
// No tables — only titles, field names, options and conditional logic
// as clean readable paragraphs / bullet lists.
//
// Usage: node scripts/generate-form-simple-doc.mjs

import fs from "node:fs";
import path from "node:path";
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  PageOrientation, LevelFormat, PageBreak,
} from "docx";
import { sections } from "./generate-form-structure-doc.mjs";

const COLORS = {
  primary: "1E3A8A",
  accent:  "0F766E",
  amber:   "B45309",
  muted:   "6B7280",
  text:    "1F2937",
};

const pick = (v, lang) => (typeof v === "string" ? v : v[lang]);

const L = {
  en: {
    docTitle: "Kohli Samaj Vikas Mandal, Nagpur",
    subtitle: "Family Survey — Simple Form Structure",
    tagline: "A clean, readable reference of every section and field in the survey form.",
    language: "Language: English",
    section: "Section",
    group: "Group",
    field: "Field",
    type: "Type",
    options: "Options",
    logic: "Conditional Logic",
    note: "Note",
    noFields: "(No direct fields — see notes above.)",
    toc: "Table of Contents",
  },
  mr: {
    docTitle: "कोहळी समाज विकास मंडळ, नागपूर",
    subtitle: "कुटुंब सर्वेक्षण — सोपी फॉर्म संरचना",
    tagline: "फॉर्म मधील प्रत्येक section व field ची स्वच्छ, वाचनीय संदर्भ मार्गदर्शिका.",
    language: "भाषा: मराठी",
    section: "विभाग",
    group: "गट",
    field: "फील्ड",
    type: "प्रकार",
    options: "पर्याय",
    logic: "जर-तर तर्क",
    note: "टीप",
    noFields: "(थेट fields नाहीत — वरील टिप पहा.)",
    toc: "अनुक्रमणिका",
  },
};

function P(runs, opts = {}) {
  return new Paragraph({
    spacing: { after: opts.after ?? 60, before: opts.before ?? 0 },
    indent: opts.indent,
    alignment: opts.alignment,
    children: runs,
  });
}
const T = (text, opts = {}) => new TextRun({
  text, bold: opts.bold, italics: opts.italics,
  color: opts.color || COLORS.text, size: opts.size,
});

function labelValue(label, value, lang) {
  return P([
    T(`${label}: `, { bold: true, color: COLORS.primary }),
    T(value),
  ], { indent: { left: 360 } });
}

function bulletList(items, lang, opts = {}) {
  return items.map((it) => P([
    T("•  ", { bold: true, color: opts.color || COLORS.muted }),
    T(pick(it, lang), { color: opts.textColor || COLORS.text }),
  ], { indent: { left: 720, hanging: 220 }, after: 40 }));
}

function renderField(f, i, lang) {
  const t = L[lang];
  const nodes = [];
  // Field title line: "1. Field Name"
  nodes.push(P([
    T(`${i}.  `, { bold: true, color: COLORS.accent }),
    T(pick(f.name, lang), { bold: true, color: COLORS.text, size: 24 }),
  ], { before: 120, after: 40, indent: { left: 200 } }));

  // Type
  nodes.push(labelValue(t.type, pick(f.type, lang), lang));

  // Options
  if (f.options && f.options.length) {
    nodes.push(P([T(`${t.options}:`, { bold: true, color: COLORS.primary })],
      { indent: { left: 360 }, after: 20 }));
    nodes.push(...bulletList(f.options, lang));
  }

  // Logic
  if (f.logic && f.logic.length) {
    nodes.push(P([T(`${t.logic}:`, { bold: true, color: COLORS.amber })],
      { indent: { left: 360 }, before: 40, after: 20 }));
    nodes.push(...bulletList(f.logic, lang, { color: COLORS.amber, textColor: COLORS.text }));
  }
  return nodes;
}

function renderGroup(g, lang) {
  const t = L[lang];
  const nodes = [];
  nodes.push(P([
    T(`${t.group}: `, { bold: true, color: COLORS.muted, size: 22 }),
    T(pick(g.title, lang), { bold: true, color: COLORS.accent, size: 26 }),
  ], { before: 200, after: 60 }));

  if (g.notes && g.notes.length) {
    g.notes.forEach((n) => nodes.push(P([
      T(`${t.note}: `, { bold: true, color: COLORS.accent }),
      T(pick(n, lang), { italics: true }),
    ], { indent: { left: 200 }, after: 60 })));
  }

  if (!g.fields || g.fields.length === 0) {
    nodes.push(P([T(t.noFields, { italics: true, color: COLORS.muted })],
      { indent: { left: 200 } }));
  } else {
    g.fields.forEach((f, idx) => nodes.push(...renderField(f, idx + 1, lang)));
  }
  return nodes;
}

function renderSection(s, lang, isFirst) {
  const t = L[lang];
  const nodes = [];
  if (!isFirst) nodes.push(new Paragraph({ children: [new PageBreak()] }));
  nodes.push(new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 200, after: 120 },
    children: [
      T(`${t.section} ${s.badge}:  `, { bold: true, color: COLORS.accent, size: 32 }),
      T(pick(s.title, lang), { bold: true, color: COLORS.primary, size: 34 }),
    ],
  }));
  s.groups.forEach((g) => nodes.push(...renderGroup(g, lang)));
  return nodes;
}

function buildDoc(lang) {
  const t = L[lang];

  const cover = [
    P([T(t.docTitle, { bold: true, color: COLORS.primary, size: 40 })],
      { alignment: AlignmentType.CENTER, before: 800, after: 120 }),
    P([T(t.subtitle, { bold: true, color: COLORS.accent, size: 30 })],
      { alignment: AlignmentType.CENTER, after: 120 }),
    P([T(t.tagline, { italics: true, color: COLORS.muted, size: 22 })],
      { alignment: AlignmentType.CENTER, after: 400 }),
    P([T(t.language, { bold: true, color: COLORS.primary })],
      { alignment: AlignmentType.CENTER }),
    new Paragraph({ children: [new PageBreak()] }),

    new Paragraph({
      heading: HeadingLevel.HEADING_1, spacing: { after: 160 },
      children: [T(t.toc, { bold: true, color: COLORS.primary, size: 32 })],
    }),
    ...sections.map((s) => P([
      T(`${s.badge}.  `, { bold: true, color: COLORS.accent }),
      T(pick(s.title, lang)),
    ], { indent: { left: 240 }, after: 40 })),
    new Paragraph({ children: [new PageBreak()] }),
  ];

  const body = sections.flatMap((s, i) => renderSection(s, lang, i === 0));

  return new Document({
    styles: {
      default: { document: { run: { font: "Nirmala UI", size: 22 } } },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 32, bold: true, font: "Nirmala UI", color: COLORS.primary },
          paragraph: { spacing: { before: 240, after: 140 }, outlineLevel: 0 } },
      ],
    },
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840, orientation: PageOrientation.PORTRAIT },
          margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 },
        },
      },
      children: [...cover, ...body],
    }],
  });
}

async function write(lang, filename) {
  const doc = buildDoc(lang);
  const buf = await Packer.toBuffer(doc);
  const outPath = path.join("/mnt/documents", filename);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, buf);
  console.log("Wrote", outPath, buf.length, "bytes");
}

await write("en", "Survey-Form-Simple-English.docx");
await write("mr", "Survey-Form-Simple-Marathi.docx");
