// Generates Survey-Form-Complete-Structure.docx (English only)
// into /mnt/documents/. This document combines every section, group,
// field, option, and conditional logic branch into one comprehensive
// professional reference.
//
// Usage: node scripts/generate-form-complete-structure-doc.mjs

import fs from "node:fs";
import path from "node:path";
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  PageOrientation, BorderStyle, Table, TableRow, TableCell,
  WidthType, ShadingType, PageBreak,
} from "docx";
import { sections } from "./generate-form-structure-doc.mjs";

const COLORS = {
  primary: "1E3A8A",
  accent:  "0F766E",
  amber:   "B45309",
  muted:   "6B7280",
  soft:    "F1F5F9",
  band:    "E0E7FF",
  border:  "CBD5E1",
};

const en = (o) => (typeof o === "string" ? o : o?.en ?? "");

function cell(children, opts = {}) {
  const border = { style: BorderStyle.SINGLE, size: 4, color: COLORS.border };
  return new TableCell({
    width: opts.width ? { size: opts.width, type: WidthType.DXA } : undefined,
    borders: { top: border, bottom: border, left: border, right: border },
    shading: opts.fill ? { fill: opts.fill, type: ShadingType.CLEAR } : undefined,
    margins: { top: 90, bottom: 90, left: 140, right: 140 },
    children,
  });
}

function headerRow(labels, widths) {
  return new TableRow({
    tableHeader: true,
    children: labels.map((l, i) => cell(
      [new Paragraph({ children: [new TextRun({ text: l, bold: true, color: "FFFFFF" })] })],
      { width: widths[i], fill: COLORS.primary }
    )),
  });
}

function bulletsInCell(items, opts = {}) {
  if (!items || items.length === 0)
    return [new Paragraph({ children: [new TextRun({ text: "—", color: COLORS.muted })] })];
  return items.map((it) => new Paragraph({
    spacing: { after: 40 },
    indent: { left: 100, hanging: 100 },
    children: [
      new TextRun({ text: "• ", color: opts.color || COLORS.muted, bold: true }),
      new TextRun({ text: en(it), color: opts.color || "1F2937" }),
    ],
  }));
}

function fieldTable(group) {
  const widths = [3200, 1800, 2400, 2400];
  const rows = [headerRow(["Field", "Type", "Options", "Conditional Logic"], widths)];
  group.fields.forEach((f, idx) => {
    const fill = idx % 2 === 0 ? "FFFFFF" : COLORS.soft;
    rows.push(new TableRow({
      children: [
        cell([new Paragraph({ children: [new TextRun({ text: en(f.name), bold: true })] })], { width: widths[0], fill }),
        cell([new Paragraph({ children: [new TextRun({ text: en(f.type), color: COLORS.accent })] })], { width: widths[1], fill }),
        cell(bulletsInCell(f.options), { width: widths[2], fill }),
        cell(bulletsInCell(f.logic, { color: COLORS.amber }), { width: widths[3], fill }),
      ],
    }));
  });
  return new Table({ width: { size: 9800, type: WidthType.DXA }, columnWidths: widths, rows });
}

function renderGroup(group) {
  const nodes = [];
  nodes.push(new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 80 },
    children: [new TextRun({ text: en(group.title), bold: true, color: COLORS.accent })],
  }));
  (group.notes || []).forEach((n) => nodes.push(new Paragraph({
    spacing: { before: 40, after: 100 },
    border: { left: { style: BorderStyle.SINGLE, size: 18, color: COLORS.accent, space: 8 } },
    children: [
      new TextRun({ text: "Note: ", bold: true, color: COLORS.accent }),
      new TextRun({ text: en(n) }),
    ],
  })));
  if (group.fields && group.fields.length) nodes.push(fieldTable(group));
  return nodes;
}

function renderSection(section, isFirst) {
  const nodes = [];
  if (!isFirst) nodes.push(new Paragraph({ children: [new PageBreak()] }));
  nodes.push(new Paragraph({
    spacing: { before: 120, after: 60 },
    shading: { fill: COLORS.band, type: ShadingType.CLEAR },
    children: [new TextRun({
      text: `  ${section.badge}   ${en(section.title)}  `,
      bold: true, size: 32, color: COLORS.primary,
    })],
  }));
  section.groups.forEach((g) => nodes.push(...renderGroup(g)));
  return nodes;
}

const cover = [
  new Paragraph({ spacing: { before: 800, after: 120 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Kohli Samaj Vikas Mandal, Nagpur", bold: true, size: 44, color: COLORS.primary })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 },
    children: [new TextRun({ text: "Family Survey — Complete Form Structure", bold: true, size: 32, color: COLORS.accent })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 },
    children: [new TextRun({
      text: "A complete professional reference of every section, group, field, dropdown option and conditional (if-then) logic branch of the survey form.",
      italics: true, color: COLORS.muted, size: 22,
    })] }),
  new Paragraph({ alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Language: English", bold: true, color: COLORS.primary })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 },
    children: [new TextRun({ text: "Version 2.0", color: COLORS.muted })] }),
  new Paragraph({ children: [new PageBreak()] }),
  new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { after: 120 },
    children: [new TextRun({ text: "Table of Contents", bold: true, color: COLORS.primary })] }),
  ...sections.map((s) => new Paragraph({
    spacing: { after: 40 }, indent: { left: 200 },
    children: [
      new TextRun({ text: `${s.badge}.  `, bold: true, color: COLORS.accent }),
      new TextRun({ text: en(s.title) }),
    ],
  })),
  new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 80 },
    children: [new TextRun({ text: "How to read this document", bold: true, color: COLORS.accent })] }),
  ...[
    "Each section lists its groups and the exact fields shown in the form.",
    "The Type column shows the input type: Text, Number, Dropdown, Radio, Checkbox, Date, Multi-select, Image upload.",
    "The Options column lists dropdown / radio / checkbox values.",
    "The Conditional Logic column shows which additional fields open based on the selected value.",
  ].map((t) => new Paragraph({
    spacing: { after: 40 }, indent: { left: 360, hanging: 220 },
    children: [new TextRun({ text: "•  ", bold: true, color: COLORS.accent }), new TextRun({ text: t })],
  })),
];

const body = sections.flatMap((s, i) => renderSection(s, i === 0));

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Calibri", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Calibri", color: COLORS.primary },
        paragraph: { spacing: { before: 280, after: 140 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Calibri", color: COLORS.accent },
        paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 1 } },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840, orientation: PageOrientation.LANDSCAPE },
        margin: { top: 900, right: 900, bottom: 900, left: 900 },
      },
    },
    children: [...cover, ...body],
  }],
});

const buf = await Packer.toBuffer(doc);
const outPath = path.join("/mnt/documents", "Survey-Form-Complete-Structure.docx");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, buf);
console.log("Wrote", outPath, buf.length, "bytes");
