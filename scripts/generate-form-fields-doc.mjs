// Generates a professional Word file listing ALL form fields (fields-wise)
// with English + Marathi labels, input type, options, and conditional notes.
// Output: /mnt/documents/Survey-Form-Fields-Reference.docx
import fs from "node:fs";
import path from "node:path";
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType,
  PageOrientation, PageBreak, Footer, PageNumber,
} from "docx";

const OUT_DIR = "/mnt/documents";
const OUT_FILE = path.join(OUT_DIR, "Survey-Form-Fields-Reference.docx");

const COLORS = {
  primary: "1F3A68",
  accent: "2E75B6",
  headerBg: "1F3A68",
  altRow: "F2F6FB",
  border: "B9C7DA",
  note: "8B5E00",
  cond: "5B2A86",
};

const border = { style: BorderStyle.SINGLE, size: 6, color: COLORS.border };
const cellBorders = { top: border, bottom: border, left: border, right: border };

const runBold = (t, opts = {}) => new TextRun({ text: t, bold: true, ...opts });
const run = (t, opts = {}) => new TextRun({ text: t, ...opts });

function p(children, opts = {}) {
  return new Paragraph({ children: Array.isArray(children) ? children : [children], ...opts });
}

function heading(text, level = HeadingLevel.HEADING_1, color = COLORS.primary) {
  return new Paragraph({
    heading: level,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text, bold: true, color, size: level === HeadingLevel.HEADING_1 ? 32 : 26 })],
  });
}

function headerCell(text) {
  return new TableCell({
    borders: cellBorders,
    shading: { fill: COLORS.headerBg, type: ShadingType.CLEAR, color: "auto" },
    margins: { top: 100, bottom: 100, left: 120, right: 120 },
    children: [p([new TextRun({ text, bold: true, color: "FFFFFF", size: 22 })])],
  });
}
function bodyCell(children, alt = false) {
  return new TableCell({
    borders: cellBorders,
    shading: alt ? { fill: COLORS.altRow, type: ShadingType.CLEAR, color: "auto" } : undefined,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: Array.isArray(children) ? children : [children],
  });
}

// Table width (landscape US letter: 15840 - 2*1440 = 12960)
const TABLE_WIDTH = 12960;
const COLS = [900, 3200, 3200, 1800, 3860]; // #, English label, Marathi label, Type, Options/Notes

function fieldsTable(rows) {
  const header = new TableRow({
    tableHeader: true,
    children: [
      headerCell("#"),
      headerCell("Field (English)"),
      headerCell("फील्ड (मराठी)"),
      headerCell("Input Type"),
      headerCell("Options / Notes"),
    ],
  });
  const dataRows = rows.map((r, i) => new TableRow({
    children: [
      bodyCell(p(run(String(i + 1))), i % 2 === 1),
      bodyCell(p(runBold(r.en)), i % 2 === 1),
      bodyCell(p(runBold(r.mr)), i % 2 === 1),
      bodyCell(p(run(r.type, { italics: true, color: COLORS.accent })), i % 2 === 1),
      bodyCell(buildOptionsCell(r), i % 2 === 1),
    ],
  }));
  return new Table({
    width: { size: TABLE_WIDTH, type: WidthType.DXA },
    columnWidths: COLS,
    rows: [header, ...dataRows],
  });
}

function buildOptionsCell(r) {
  const paras = [];
  if (r.options && r.options.length) {
    paras.push(p(runBold("Options:", { size: 18, color: COLORS.primary })));
    r.options.forEach(o => paras.push(p(run("• " + o, { size: 20 }))));
  }
  if (r.notes) {
    paras.push(p(run(r.notes, { size: 20, italics: true, color: COLORS.note })));
  }
  if (r.conditional) {
    paras.push(p([
      runBold("Conditional: ", { size: 18, color: COLORS.cond }),
      run(r.conditional, { size: 20, color: COLORS.cond }),
    ]));
  }
  if (!paras.length) paras.push(p(run("—", { color: "888888" })));
  return paras;
}

function section(titleEn, titleMr, rows) {
  return [
    heading(`${titleEn}  |  ${titleMr}`, HeadingLevel.HEADING_1),
    fieldsTable(rows),
    p(run(""), { spacing: { after: 200 } }),
  ];
}

// ------------ FIELD DEFINITIONS ------------

const SEC_GEO = section("1. Geographic Information", "१. भौगोलिक माहिती", [
  { en: "Village", mr: "गाव", type: "Text" },
  { en: "Taluka", mr: "तालुका", type: "Text" },
  { en: "District", mr: "जिल्हा", type: "Text" },
  { en: "PIN Code", mr: "पिन कोड", type: "Text (6 digits)" },
  { en: "Native District", mr: "मूळ जिल्हा", type: "Text", notes: "Under Permanent Address; may be auto-filled if same as correspondence." },
  { en: "Native Taluka", mr: "मूळ तालुका", type: "Text" },
  { en: "Native Village", mr: "मूळ गाव", type: "Text" },
  { en: "Native PIN Code", mr: "मूळ पिन कोड", type: "Text (6 digits)" },
]);

const SEC_HEAD = section("2. Head of Family Information", "२. कुटुंब प्रमुख माहिती", [
  { en: "Head Name", mr: "कुटुंब प्रमुखाचे नाव", type: "Text" },
  { en: "Head Photo", mr: "कुटुंब प्रमुखाचा फोटो", type: "Image Upload" },
  { en: "Mobile Number", mr: "मोबाईल क्रमांक", type: "Text (10 digits)" },
  { en: "Community", mr: "समाज", type: "Text", notes: "Default: कोहळी" },
  { en: "Gender", mr: "लिंग", type: "Radio", options: ["पुरुष (Male)", "स्त्री (Female)"] },
  { en: "Date of Birth", mr: "जन्मतारीख", type: "Date" },
  { en: "Age", mr: "वय", type: "Number (auto)" },
  { en: "Marital Status", mr: "वैवाहिक स्थिती", type: "Dropdown", options: ["विवाहित (Married)", "अविवाहित (Unmarried)", "विधवा (Widow)", "घटस्फोटित (Divorced)"] },
  { en: "Marriage Type", mr: "विवाहाचा प्रकार", type: "Dropdown", conditional: "Only if Marital Status = विवाहित", options: ["सजातीय (Same caste)", "आंतरजातीय (Inter-caste)"] },
  { en: "Spouse Caste", mr: "पती/पत्नीची जात", type: "Text", conditional: "Only if Marriage Type = आंतरजातीय" },
  { en: "Education", mr: "शिक्षण", type: "Cascading Dropdown", notes: "Level → Stream/Subject → Specialization (see Education module)" },
  { en: "Occupation", mr: "व्यवसाय", type: "Cascading Dropdown", options: ["शेतमजुरी / घरकाम", "सरकारी नौकरी", "खाजगी नौकरी", "पेन्शन धारक", "निराधार / भूमिहीन", "स्वयंरोजगार"], notes: "Job-type sub-field appears for job occupations." },
  { en: "Job Type", mr: "नोकरीचा प्रकार", type: "Dropdown", conditional: "Only if Occupation is a job", options: ["Government", "Private", "Department"] },
]);

const SEC_MEMBERS = section("3. Family Members", "३. कुटुंबातील सदस्य", [
  { en: "Member Name", mr: "सदस्याचे नाव", type: "Text (repeatable)" },
  { en: "Relationship with Head", mr: "कुटुंब प्रमुखाशी नाते", type: "Dropdown", options: ["पत्नी", "पती", "मुलगा", "मुलगी", "वडील", "आई", "भाऊ", "बहीण", "सून", "जावई", "नातू", "नात", "इतर"] },
  { en: "Gender", mr: "लिंग", type: "Radio", options: ["पुरुष", "स्त्री"] },
  { en: "Date of Birth", mr: "जन्मतारीख", type: "Date" },
  { en: "Age", mr: "वय", type: "Number" },
  { en: "Marital Status", mr: "वैवाहिक स्थिती", type: "Dropdown", options: ["विवाहित", "अविवाहित", "विधवा", "घटस्फोटित"] },
  { en: "Marriage Type", mr: "विवाहाचा प्रकार", type: "Dropdown", conditional: "If Marital Status = विवाहित", options: ["सजातीय", "आंतरजातीय"] },
  { en: "Spouse Caste", mr: "पती/पत्नीची जात", type: "Text", conditional: "If Marriage Type = आंतरजातीय" },
  { en: "Education", mr: "शिक्षण", type: "Cascading Dropdown" },
  { en: "Occupation", mr: "व्यवसाय", type: "Cascading Dropdown" },
  { en: "Job Type", mr: "नोकरीचा प्रकार", type: "Dropdown", conditional: "If occupation is a job", options: ["Government", "Private", "Department"] },
  { en: "Job Place", mr: "नोकरीचे ठिकाण", type: "Text" },
  { en: "Mobile Number", mr: "मोबाईल क्रमांक", type: "Text (10 digits)" },
  { en: "Maternal Family — Name", mr: "आजोळ (माहेर) — नाव", type: "Text", conditional: "For female members" },
  { en: "Maternal Family — Address", mr: "आजोळ — पत्ता", type: "Text" },
  { en: "Maternal Family — Mobile", mr: "आजोळ — मोबाईल", type: "Text (10 digits)" },
  { en: "In-Laws Family — Name", mr: "सासर — नाव", type: "Text", conditional: "For married female members" },
  { en: "In-Laws Family — Address", mr: "सासर — पत्ता", type: "Text" },
  { en: "In-Laws Family — Mobile", mr: "सासर — मोबाईल", type: "Text (10 digits)" },
  { en: "Mahila Bachat Gat — Member?", mr: "महिला बचत गट — सदस्य आहे का?", type: "Yes/No", conditional: "For female members" },
  { en: "Wants to join Bachat Gat?", mr: "बचत गटात सामील व्हायचे आहे का?", type: "Yes/No", conditional: "If not currently a member" },
  { en: "Has rural home business?", mr: "ग्रामीण गृह उद्योग आहे का?", type: "Yes/No" },
  { en: "Business Name", mr: "उद्योगाचे नाव", type: "Text", conditional: "If has home business" },
  { en: "Wants to start business?", mr: "उद्योग सुरू करायचा आहे का?", type: "Yes/No" },
  { en: "Desired Business", mr: "इच्छित उद्योग", type: "Text", conditional: "If wants to start" },
]);

const SEC_POSITION = section("4. Positions Held", "४. धारण केलेले पद", [
  { en: "Has any position?", mr: "कोणतेही पद आहे का?", type: "Yes/No" },
  { en: "Person Name", mr: "व्यक्तीचे नाव", type: "Text (repeatable per position)" },
  { en: "Position Type", mr: "पदाचा प्रकार", type: "Dropdown", options: ["राजकीय (Political)", "सामाजिक (Social)", "लोकप्रतिनिधी (People's Representative)"] },
  { en: "Status", mr: "स्थिती", type: "Radio", options: ["आजी (Current)", "माजी (Former)"] },
  { en: "Political Level", mr: "राजकीय स्तर", type: "Dropdown", conditional: "If Position Type = राजकीय", options: ["प्रदेश पदाधिकारी", "जिल्हा पदाधिकारी", "तालुका पदाधिकारी", "गाव पदाधिकारी"] },
  { en: "Political Party", mr: "राजकीय पक्ष", type: "Dropdown", conditional: "If Position Type = राजकीय", options: ["भारतीय जनता पक्ष (BJP)", "भारतीय राष्ट्रीय काँग्रेस (INC)", "राष्ट्रवादी काँग्रेस पक्ष (NCP)", "राष्ट्रवादी काँग्रेस पक्ष (शरदचंद्र पवार)", "शिवसेना", "शिवसेना (उद्धव बाळासाहेब ठाकरे)", "महाराष्ट्र नवनिर्माण सेना (MNS)", "अपक्ष (Independent)", "इतर (Other)"] },
  { en: "Party Name (Other)", mr: "पक्षाचे नाव (इतर)", type: "Text", conditional: "If Party = इतर" },
  { en: "Term From", mr: "कार्यकाळ पासून", type: "Year Dropdown" },
  { en: "Term To", mr: "कार्यकाळ पर्यंत", type: "Year Dropdown" },
  { en: "Representative Type", mr: "लोकप्रतिनिधी प्रकार", type: "Dropdown", conditional: "If Position Type = लोकप्रतिनिधी", options: ["खासदार", "आमदार", "जिल्हा परिषद सदस्य", "पंचायत समिती सदस्य", "नगरपरिषद सदस्य", "नगरपंचायत", "ग्रामपंचायत", "Co-operative Bank", "Co-operative Society", "कृषी उत्पन्न बाजार समिती", "तालुका खरेदी-विक्री संघ", "पतसंस्था"] },
  { en: "Co-op/Rep Role", mr: "पद / भूमिका", type: "Dropdown", conditional: "Based on Representative Type (e.g. सरपंच, अध्यक्ष, संचालक, सदस्य)" },
  { en: "Co-op Organisation Name", mr: "सहकारी संस्थेचे नाव", type: "Text", conditional: "For cooperative representative types" },
  { en: "Social Organisation", mr: "सामाजिक संस्था", type: "Dropdown", conditional: "If Position Type = सामाजिक", options: ["सामाजिक संस्था (Social Organisation)", "शैक्षणिक संस्था (Educational Institution)"] },
  { en: "Social Role", mr: "सामाजिक भूमिका", type: "Dropdown", options: ["पदाधिकारी", "अध्यक्ष", "उपाध्यक्ष", "सचिव", "सदस्य"] },
]);

const SEC_HOUSE = section("5. House Information", "५. घर विषयक माहिती", [
  { en: "Owns House?", mr: "स्वतःचे घर आहे का?", type: "Yes/No" },
  { en: "House Type", mr: "घराचा प्रकार", type: "Radio", conditional: "If Owns House = Yes", options: ["कच्चा (Kaccha)", "पक्का (Pakka)"] },
  { en: "Living Status", mr: "राहण्याची स्थिती", type: "Radio", conditional: "If Owns House = No", options: ["भाड्याचे (Rented)", "आश्रित (Dependent)"] },
  { en: "Gharkul Received?", mr: "घरकुल मिळाले आहे का?", type: "Yes/No" },
  { en: "Gharkul Wanted?", mr: "घरकुल पाहिजे का?", type: "Yes/No", conditional: "If not received" },
  { en: "Solar Panel Installed?", mr: "सौर ऊर्जा प्रणाली बसविलेली आहे का?", type: "Yes/No" },
  { en: "Solar Panel Wanted?", mr: "सौर ऊर्जा योजनेचा लाभ हवा का?", type: "Yes/No", conditional: "If not installed" },
  { en: "Household Items Owned", mr: "घरातील साहित्य", type: "Multi-select checkbox", options: ["मोबाईल", "टीव्ही", "फ्रिज", "गॅस शेगडी", "कॉम्प्युटर", "सायकल", "दोन चाकी वाहन", "ऑटो", "चार चाकी वाहन"] },
  { en: "Item Counts", mr: "साहित्य संख्या", type: "Number (per item)", notes: "Count entered for each selected household item." },
]);

const SEC_AGRI = section("6. Agriculture Information", "६. शेती विषयक माहिती", [
  { en: "Has Farmland?", mr: "शेती आहे का?", type: "Yes/No" },
  { en: "Total Farmland (acres)", mr: "एकूण शेती (एकर)", type: "Number", conditional: "If Has Farmland = Yes" },
  { en: "Irrigated Area (acres)", mr: "बागायती क्षेत्र (एकर)", type: "Number" },
  { en: "Dryland Area (acres)", mr: "जिरायती क्षेत्र (एकर)", type: "Number" },
  { en: "Kharif Area (acres)", mr: "खरीप क्षेत्र", type: "Number" },
  { en: "Rabi Area (acres)", mr: "रब्बी क्षेत्र", type: "Number" },
  { en: "Summer Area (acres)", mr: "उन्हाळी क्षेत्र", type: "Number" },
  { en: "Major Crop Types", mr: "प्रमुख पीक प्रकार", type: "Multi-select", options: ["धान्य पिके", "कडधान्य पिके", "तेलबिया पिके", "भाजीपाला पिके", "फळबाग", "नगदी पिके", "मसाला पिके", "इतर"] },
  { en: "Other Crop Type", mr: "इतर पीक तपशील", type: "Text", conditional: "If 'इतर' selected" },
  { en: "Crops (season-wise)", mr: "पिके (हंगामनिहाय)", type: "Multi-select (repeatable)", options: ["खरीप", "रब्बी (धान सोडून)", "उन्हाळी (धानासह)", "घेतलेली पिके"] },
  { en: "Irrigation Sources", mr: "सिंचन स्त्रोत", type: "Multi-select", options: ["ट्युबवेल / बोअरवेल", "विहीर", "तलाव (Farm pond)", "तलाव", "नदी", "नहर"] },
  { en: "Irrigation Source — Count", mr: "स्त्रोत संख्या", type: "Number", conditional: "Per selected source" },
  { en: "Powered by Electric?", mr: "विद्युत चलित?", type: "Yes/No", conditional: "Per source" },
  { en: "Powered by Solar?", mr: "सौर चलित?", type: "Yes/No", conditional: "Per source" },
  { en: "Kohli Malguzari Tank?", mr: "कोहळी मालगुजारी तलाव?", type: "Yes/No", conditional: "For तलाव/नदी sources" },
  { en: "Water Free for Irrigation?", mr: "सिंचनासाठी पाणी मोफत?", type: "Yes/No", conditional: "For तलाव/नदी sources" },
  { en: "Farming Tools", mr: "शेती अवजारे", type: "Multi-select", options: ["बैलबंडी", "नांगर", "ट्रॅक्टर", "विहीर", "बोअरवेल"] },
  { en: "Tool — Has?", mr: "अवजार आहे का?", type: "Yes/No", conditional: "Per tool (tractor, harvester, rotavator, cultivator, trolley)" },
  { en: "Tool — Count", mr: "अवजार संख्या", type: "Number", conditional: "If Has = Yes" },
  { en: "Tool — Wants to Buy?", mr: "खरेदी करायचे आहे का?", type: "Yes/No", conditional: "If Has = No" },
  { en: "Tool — Needs Loan?", mr: "कर्जाची गरज आहे का?", type: "Yes/No", conditional: "If wants to buy" },
  { en: "Other Tool Uses?", mr: "इतर अवजारे वापरता का?", type: "Yes/No" },
  { en: "Other Tool Details", mr: "इतर अवजारे तपशील", type: "Text", conditional: "If Yes above" },
  { en: "Contract / Share Farming?", mr: "करार / वाटा शेती करता का?", type: "Yes/No" },
  { en: "Contract Farming Area", mr: "करार शेती क्षेत्र", type: "Text", conditional: "If Yes above" },
]);

const SEC_BENEFITS = section("7. Benefits & Welfare", "७. लाभ व कल्याण", [
  { en: "Ladki Bahin Beneficiary?", mr: "लाडकी बहीण योजना लाभार्थी आहे का?", type: "Yes/No" },
  { en: "Beneficiary Count", mr: "लाभार्थी संख्या", type: "Number", conditional: "If Yes above" },
  { en: "Regular Beneficiary?", mr: "नियमित लाभ मिळतो का?", type: "Yes/No" },
  { en: "Beneficiary — Name", mr: "लाभार्थी — नाव", type: "Text (repeatable)" },
  { en: "Beneficiary — Reason (if irregular)", mr: "अनियमिततेचे कारण", type: "Text / Other" },
  { en: "Non-Beneficiary — Name", mr: "लाभ न मिळालेले — नाव", type: "Text (repeatable)", conditional: "If not a beneficiary" },
  { en: "Non-Beneficiary — Reason", mr: "कारण", type: "Text / Other" },
  { en: "Critical Illness in Family?", mr: "कुटुंबात गंभीर आजार आहे का?", type: "Yes/No" },
  { en: "Medical Aid Needed?", mr: "वैद्यकीय मदत हवी का?", type: "Yes/No", conditional: "If critical illness = Yes" },
  { en: "Sportsperson in Family?", mr: "कुटुंबात खेळाडू आहे का?", type: "Yes/No" },
  { en: "Sport Type", mr: "खेळाचा प्रकार", type: "Text", conditional: "If sportsperson = Yes" },
  { en: "Sport Level", mr: "खेळाचा स्तर", type: "Text", conditional: "If sportsperson = Yes" },
]);

const SEC_EMPLOY = section("8. Employment & Entrepreneurship", "८. रोजगार व उद्योजकता", [
  { en: "Entrepreneur in Family?", mr: "कुटुंबात उद्योजक आहे का?", type: "Yes/No" },
  { en: "Entrepreneur Details", mr: "उद्योजक तपशील", type: "Text", conditional: "If Yes above" },
  { en: "Entrepreneur Address", mr: "उद्योग पत्ता", type: "Text", conditional: "If Yes above" },
  { en: "Any Side Business?", mr: "जोड व्यवसाय आहे का?", type: "Yes/No" },
  { en: "Side Business Details", mr: "जोड व्यवसाय तपशील", type: "Text", conditional: "If Yes above" },
]);

// ------------- COVER -------------
function coverPage() {
  return [
    p([run("")], { spacing: { before: 2000 } }),
    p([new TextRun({ text: "कोहळी समाज विकास मंडळ, नागपूर", bold: true, size: 40, color: COLORS.primary })], { alignment: AlignmentType.CENTER }),
    p([new TextRun({ text: "Kohli Samaj Vikas Mandal, Nagpur", bold: true, size: 28, color: COLORS.accent })], { alignment: AlignmentType.CENTER, spacing: { after: 400 } }),
    p([new TextRun({ text: "Survey Form — Complete Fields Reference", bold: true, size: 36, color: "222222" })], { alignment: AlignmentType.CENTER }),
    p([new TextRun({ text: "सर्वेक्षण फॉर्म — संपूर्ण फील्ड्स संदर्भ", bold: true, size: 28, color: "444444" })], { alignment: AlignmentType.CENTER, spacing: { after: 600 } }),
    p([new TextRun({ text: "Field-wise professional reference — bilingual (English + Marathi)", italics: true, size: 22, color: "555555" })], { alignment: AlignmentType.CENTER }),
    p([new TextRun({ text: `Generated: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}`, size: 20, color: "666666" })], { alignment: AlignmentType.CENTER, spacing: { before: 400 } }),
    p([new PageBreak()]),
  ];
}

function legend() {
  return [
    heading("How to read this document  |  हा दस्तऐवज कसा वाचावा", HeadingLevel.HEADING_2),
    p([run("• "), runBold("Field: "), run("The name of the input, shown in both English and Marathi.")]),
    p([run("• "), runBold("Input Type: "), run("Text, Number, Date, Dropdown, Radio, Checkbox, Yes/No, Image Upload, Cascading Dropdown, or Repeatable group.")]),
    p([run("• "), runBold("Options: "), run("Choices offered to the user (if any).")]),
    p([run("• "), runBold("Conditional: "), run("The field appears only when the specified condition is met.")]),
    p([run("• "), runBold("Repeatable: "), run("The group can be added multiple times (e.g. members, positions, crops).")]),
    p([new PageBreak()]),
  ];
}

// ------------- BUILD DOC -------------
const doc = new Document({
  creator: "Kohli Samaj Vikas Mandal",
  title: "Survey Form Fields Reference",
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, color: COLORS.primary, font: "Arial" },
        paragraph: { spacing: { before: 300, after: 160 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, color: COLORS.accent, font: "Arial" },
        paragraph: { spacing: { before: 220, after: 120 }, outlineLevel: 1 } },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840, orientation: PageOrientation.LANDSCAPE },
        margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 },
      },
    },
    footers: {
      default: new Footer({
        children: [p([
          run("Survey Form Fields Reference  •  Page ", { size: 18, color: "888888" }),
          new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "888888" }),
          run(" of ", { size: 18, color: "888888" }),
          new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, color: "888888" }),
        ], { alignment: AlignmentType.CENTER })],
      }),
    },
    children: [
      ...coverPage(),
      ...legend(),
      ...SEC_GEO,
      ...SEC_HEAD,
      ...SEC_MEMBERS,
      ...SEC_POSITION,
      ...SEC_HOUSE,
      ...SEC_AGRI,
      ...SEC_BENEFITS,
      ...SEC_EMPLOY,
    ],
  }],
});

fs.mkdirSync(OUT_DIR, { recursive: true });
const buf = await Packer.toBuffer(doc);
fs.writeFileSync(OUT_FILE, buf);
console.log("Wrote:", OUT_FILE, buf.length, "bytes");
