import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak, LevelFormat } from "docx";
import fs from "node:fs";
import { pathToFileURL } from "node:url";

// Load education tree by transpile-free import via dynamic (it's TS). We'll inline the data instead.
const src = fs.readFileSync("src/lib/education-data.ts", "utf8");
// Execute using a tiny hack: strip types & export tokens then eval
const js = src
  .replace(/export\s+/g, "")
  .replace(/:\s*EducationLevel\[\]/g, "")
  .replace(/:\s*string\[\]/g, "")
  .replace(/export type[\s\S]*?};\n/g, "")
  .replace(/type\s+\w+\s*=\s*{[\s\S]*?};\n/g, "");
// Simpler: just require the data by regex extraction is fragile. Instead re-declare minimally by dynamic import via bun.

const FONT = "Calibri";
const P = (text, opts = {}) => new Paragraph({
  spacing: { after: 80 },
  ...opts,
  children: [new TextRun({ text, font: FONT, ...(opts.run || {}) })],
});
const H = (text, level) => new Paragraph({
  heading: level,
  spacing: { before: 240, after: 120 },
  children: [new TextRun({ text, font: FONT, bold: true })],
});
const Bullet = (text, level = 0) => new Paragraph({
  numbering: { reference: "bul", level },
  spacing: { after: 60 },
  children: [new TextRun({ text, font: FONT })],
});

async function main() {
  // Import the data via bun's TS support
  const mod = await import(pathToFileURL(process.cwd() + "/src/lib/education-data.ts").href);
  const { EDUCATION_TREE, INSTITUTION_TYPES } = mod;

  const children = [];
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
    children: [new TextRun({ text: "Education Field – Complete Structure", font: FONT, bold: true, size: 40 })],
  }));
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 240 },
    children: [new TextRun({ text: "Survey Form – Education Section (English)", font: FONT, italics: true, size: 24, color: "555555" })],
  }));

  children.push(H("Overview", HeadingLevel.HEADING_1));
  children.push(P("The Education field captures a respondent's educational background in a cascading (dependent) manner. Selecting a value in one dropdown reveals the next dropdown. The hierarchy is:"));
  children.push(Bullet("Education Level  →  Stream / Group  →  Course  →  Institution Type"));
  children.push(P("Not every level has all four steps. For example, 'Illiterate' has no further dropdowns; 'Pre-Primary / Primary / Secondary' skip the Stream step (single stream). Institution Type is asked only where applicable."));

  children.push(H("Field 1 – Education Level (शिक्षण स्तर)", HeadingLevel.HEADING_1));
  children.push(P("Type: Single-select dropdown"));
  children.push(P("Required: Yes"));
  children.push(P("Available options:"));
  for (const lvl of EDUCATION_TREE) children.push(Bullet(lvl.level));

  children.push(H("Cascading Logic per Education Level", HeadingLevel.HEADING_1));
  children.push(P("Below each Education Level, the sub-fields that appear are listed. Every choice at a lower level opens the next dropdown."));

  for (const lvl of EDUCATION_TREE) {
    children.push(new Paragraph({ children: [new PageBreak()] }));
    children.push(H(lvl.level, HeadingLevel.HEADING_1));

    // Trivial case: single "—" stream (e.g. Illiterate)
    if (lvl.streams.length === 1 && lvl.streams[0].stream === "—") {
      children.push(P("No further dropdowns. Final stored value: " + lvl.streams[0].courses[0] + "."));
      continue;
    }

    // Determine if Stream step is skipped (single stream with real name = still shown; but for Pre-Primary/Primary/Secondary tree has 1 stream)
    const hasMultipleStreams = lvl.streams.length > 1;

    children.push(H(hasMultipleStreams ? "Field 2 – Stream / Group" : "Field 2 – Stream / Group (single option)", HeadingLevel.HEADING_2));
    children.push(P("Type: Single-select dropdown"));
    children.push(P("Options:"));
    for (const s of lvl.streams) children.push(Bullet(s.stream));

    children.push(H("Field 3 – Course (opens after selecting a Stream)", HeadingLevel.HEADING_2));
    for (const s of lvl.streams) {
      children.push(new Paragraph({
        spacing: { before: 120, after: 60 },
        children: [new TextRun({ text: `If Stream = "${s.stream}"  →  Course options:`, font: FONT, bold: true })],
      }));
      for (const c of s.courses) children.push(Bullet(c, 1));
      // Handle "Other (specify)" cases
      if (s.courses.some((c) => c.startsWith("इतर (नमूद करा)") || c === "Other Course" || c === "Other Diploma" || c === "Other Postgraduate" || c === "Other Graduate" || c === "Other")) {
        children.push(new Paragraph({
          spacing: { after: 60 },
          indent: { left: 720 },
          children: [new TextRun({ text: "→ If 'Other' is selected, a free-text input appears for the user to specify the course name.", font: FONT, italics: true, color: "8A6D3B" })],
        }));
      }
    }

    if (lvl.askInstitution) {
      children.push(H("Field 4 – Institution Type (opens after selecting a Course)", HeadingLevel.HEADING_2));
      children.push(P("Type: Single-select dropdown"));
      children.push(P("Options:"));
      for (const t of INSTITUTION_TYPES) children.push(Bullet(t));
    } else {
      children.push(P("Institution Type is NOT asked for this level."));
    }
  }

  children.push(new Paragraph({ children: [new PageBreak()] }));
  children.push(H("Final Stored Value Format", HeadingLevel.HEADING_1));
  children.push(P("All selections are combined into a single pipe-delimited string in this order:"));
  children.push(P("   Level | Stream | Course | Institution"));
  children.push(P("Example: 'पदवी (Graduate) | Engineering (B.Tech) | B.Tech Computer Science | सरकारी (Government)'"));

  const doc = new Document({
    styles: {
      default: { document: { run: { font: FONT, size: 22 } } },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 32, bold: true, font: FONT, color: "1F3864" },
          paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 0 } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 26, bold: true, font: FONT, color: "2E75B6" },
          paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 1 } },
      ],
    },
    numbering: {
      config: [{
        reference: "bul",
        levels: [
          { level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
          { level: 1, format: LevelFormat.BULLET, text: "◦", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 1440, hanging: 360 } } } },
        ],
      }],
    },
    sections: [{
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } },
      children,
    }],
  });

  const buf = await Packer.toBuffer(doc);
  fs.mkdirSync("/mnt/documents", { recursive: true });
  fs.writeFileSync("/mnt/documents/Education-Field-Structure-English.docx", buf);
  console.log("wrote /mnt/documents/Education-Field-Structure-English.docx", buf.length);
}
main();
