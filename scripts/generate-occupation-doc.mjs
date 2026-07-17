import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak, LevelFormat } from "docx";
import fs from "node:fs";
import { pathToFileURL } from "node:url";

const FONT = "Calibri";

const P = (text, opts = {}) => new Paragraph({
  spacing: { after: 80 },
  ...opts,
  children: [new TextRun({ text, font: FONT, ...(opts.run || {}) })],
});
const H1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 240, after: 120 },
  children: [new TextRun({ text, font: FONT, bold: true })],
});
const H2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 200, after: 100 },
  children: [new TextRun({ text, font: FONT, bold: true })],
});
const H3 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_3,
  spacing: { before: 160, after: 80 },
  children: [new TextRun({ text, font: FONT, bold: true })],
});
const Bullet = (text, level = 0) => new Paragraph({
  numbering: { reference: "bul", level },
  spacing: { after: 40 },
  children: [new TextRun({ text, font: FONT })],
});
const Note = (text) => new Paragraph({
  spacing: { after: 80 },
  indent: { left: 360 },
  children: [new TextRun({ text, font: FONT, italics: true, color: "8A6D3B" })],
});
const Field = (name, type = "Single-select dropdown", required = "Yes") => [
  new Paragraph({
    spacing: { before: 120, after: 40 },
    children: [
      new TextRun({ text: "Field: ", font: FONT, bold: true }),
      new TextRun({ text: name, font: FONT, bold: true, color: "1F3864" }),
    ],
  }),
  new Paragraph({ spacing: { after: 20 }, children: [
    new TextRun({ text: "Type: ", font: FONT, bold: true }),
    new TextRun({ text: type, font: FONT }),
  ]}),
  new Paragraph({ spacing: { after: 60 }, children: [
    new TextRun({ text: "Required: ", font: FONT, bold: true }),
    new TextRun({ text: required, font: FONT }),
  ]}),
];

const OPTS = (label, list, level = 0) => {
  const arr = [];
  if (label) arr.push(new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: label, font: FONT, bold: true })] }));
  for (const o of list) arr.push(Bullet(o, level));
  return arr;
};

async function main() {
  const mod = await import(pathToFileURL(process.cwd() + "/src/lib/occupation-data.ts").href);
  const {
    PRIMARY_CATEGORIES, FARMING_TYPES, LAND_SIZES, BUSINESS_TYPES, SELF_EMPLOYED_TYPES,
    HONORARIUM_POSITIONS, GOVT_SERVICE_TYPES, GOVT_CLASSES, GOVT_CLASS_DESIGNATIONS,
    EDU_INSTITUTION_TYPES, EDU_LEVELS_NON_UNIVERSITY, EDU_LEVELS_UNIVERSITY, EDU_DESIGNATIONS_BY_LEVEL,
    MED_INSTITUTION_TYPES, MED_HOSPITAL_TYPES, medDesignationsForType,
    WCD_DESIGNATIONS, ENG_INSTITUTION_TYPES, ENG_BRANCHES, engDesignationsForBranch,
    BANK_TYPES, BANK_DESIGNATIONS_BY_TYPE, JUDICIARY_DESIGNATIONS,
    DEFENCE_FORCES, MILITARY_RANKS, POLICE_RANKS, CENTRAL_ARMED_FORCES_RANKS,
    PRIVATE_SECTORS, RETIRED_FROM, NRI_CONTRIBUTIONS, INCOME_RANGES,
    LOAN_AMOUNT_OPTIONS, LOAN_PURPOSE_OPTIONS,
  } = mod;

  const c = [];
  // Cover
  c.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 },
    children: [new TextRun({ text: "Job / Occupation Field – Complete Structure", font: FONT, bold: true, size: 40 })] }));
  c.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 240 },
    children: [new TextRun({ text: "Survey Form – Occupation Section (English)", font: FONT, italics: true, size: 24, color: "555555" })] }));

  // Overview
  c.push(H1("Overview"));
  c.push(P("The Job / Occupation field (नौकरी / व्यवसाय) captures the respondent's occupation using a cascading structure. Selecting the top-level category opens a set of dependent fields specific to that category. Common fields such as Annual Income, Experience (Years), and Notes appear across most categories."));
  c.push(P("Structure: Primary Category → Category-specific fields → Common fields."));

  // Primary category
  c.push(H1("Field 1 – Primary Category (मुख्य श्रेणी)"));
  c.push(...Field("Primary Category"));
  c.push(...OPTS("Options:", PRIMARY_CATEGORIES));
  c.push(Note("Selecting a category reveals the dependent fields listed below. Each category is described on its own section."));

  // Common lists
  c.push(H1("Common Reference Lists"));
  c.push(H3("Loan Amount Options"));
  for (const o of LOAN_AMOUNT_OPTIONS) c.push(Bullet(o));
  c.push(Note("If 'इतर' (Other) is chosen, a free-text input appears to specify the amount."));
  c.push(H3("Loan Purpose Options"));
  for (const o of LOAN_PURPOSE_OPTIONS) c.push(Bullet(o));
  c.push(Note("If 'इतर' (Other) is chosen, a free-text input appears to specify the purpose."));
  c.push(H3("Annual Income Ranges"));
  for (const o of INCOME_RANGES) c.push(Bullet(o));

  const section = (title) => { c.push(new Paragraph({ children: [new PageBreak()] })); c.push(H1(title)); };

  // 1. Farmer
  section("Category 1 – शेतकरी (Farmer)");
  c.push(...Field("Farming Types (शेतीचे प्रकार)", "Multi-select checkboxes"));
  c.push(...OPTS("Options:", FARMING_TYPES));
  c.push(...Field("Land Size (जमीनीचा आकार)"));
  c.push(...OPTS("Options:", LAND_SIZES));
  c.push(...Field("Annual Income (वार्षिक उत्पन्न)"));
  c.push(...OPTS("Options:", INCOME_RANGES));
  c.push(...Field("Notes (इतर तपशील)", "Free-text", "No"));

  // 2. Farmer + Business
  section("Category 2 – शेती + व्यवसाय (Agriculture + Business)");
  c.push(...Field("Farming Types", "Multi-select checkboxes"));
  c.push(...OPTS("Options:", FARMING_TYPES));
  c.push(...Field("Land Size"));
  c.push(...OPTS("Options:", LAND_SIZES));
  c.push(...Field("Business Type (व्यवसायाचा प्रकार)"));
  c.push(...OPTS("Options:", BUSINESS_TYPES));
  c.push(Note("If Business Type = 'इतर (Other)', a free-text input appears to specify the business."));
  c.push(...Field("Business Name (व्यवसायाचे नाव)", "Free-text", "No"));
  c.push(...Field("Annual Income"));
  c.push(...OPTS("Options:", INCOME_RANGES));

  // 3. Farm labour
  section("Category 3 – कृषी मजूर / शेतमजूर (Farm Labour)");
  c.push(...Field("Annual Income"));
  c.push(...OPTS("Options:", INCOME_RANGES));
  c.push(...Field("Notes", "Free-text", "No"));

  // 4. Self Employed
  section("Category 4 – स्वरोजगार (Self Employed)");
  c.push(...Field("Self Employed Trades (कौशल्य / कामाचे प्रकार)", "Multi-select checkboxes"));
  c.push(...OPTS("Options:", SELF_EMPLOYED_TYPES));
  c.push(Note("If 'इतर (Other)' is chosen, a free-text input appears to specify the trade."));
  c.push(...Field("Experience in Years (अनुभव)", "Free-text (number)", "No"));
  c.push(...Field("Annual Income"));
  c.push(...OPTS("Options:", INCOME_RANGES));
  c.push(...Field("Do you want to start your own business? (स्वतःचा व्यवसाय सुरू करायचा आहे का?)"));
  c.push(Bullet("होय (Yes)")); c.push(Bullet("नाही (No)"));
  c.push(Note("If Yes → opens: Loan Needed? → Loan Amount (with 'Other' free-text)."));
  c.push(...Field("Loan Needed? (कर्जाची गरज आहे का?)"));
  c.push(Bullet("होय (Yes)")); c.push(Bullet("नाही (No)"));
  c.push(...Field("Loan Amount (आवश्यक रक्कम)"));
  for (const o of LOAN_AMOUNT_OPTIONS) c.push(Bullet(o));

  // 5. Business Owner
  section("Category 5 – व्यवसाय (Business Owner)");
  c.push(...Field("Business Types (व्यवसाय प्रकार)", "Multi-select checkboxes"));
  c.push(...OPTS("Options:", BUSINESS_TYPES));
  c.push(...Field("Business Name (व्यवसायाचे नाव)", "Free-text", "No"));
  c.push(...Field("People Employed (रोजगार दिलेल्या व्यक्ती)", "Free-text (number)", "No"));
  c.push(...Field("Annual Income"));
  c.push(...OPTS("Options:", INCOME_RANGES));
  c.push(...Field("Loan Needed? (कर्जाची गरज आहे का?)"));
  c.push(Bullet("होय (Yes)")); c.push(Bullet("नाही (No)"));
  c.push(Note("If Yes → opens Loan Amount and Loan Purpose (both with 'Other' free-text)."));
  c.push(...Field("Loan Amount"));
  for (const o of LOAN_AMOUNT_OPTIONS) c.push(Bullet(o));
  c.push(...Field("Loan Purpose (कर्जाचा उद्देश)"));
  for (const o of LOAN_PURPOSE_OPTIONS) c.push(Bullet(o));

  // 6. Honorarium
  section("Category 6 – मानधनधारक पदाधिकारी (Honorarium Based Position)");
  c.push(...Field("Designation (पदनाम)"));
  c.push(...OPTS("Options:", HONORARIUM_POSITIONS));
  c.push(Note("If 'Other (इतर)' is selected → free-text input for designation name."));
  c.push(...Field("Posting Place / Ward / Village (कार्यरत ठिकाण)", "Free-text", "No"));
  c.push(...Field("Annual Income"));
  c.push(...OPTS("Options:", INCOME_RANGES));

  // 7. Government Employee
  section("Category 7 – सरकारी कर्मचारी (Government Employee)");
  c.push(...Field("Service Type (सेवा प्रकार)"));
  c.push(...OPTS("Options:", GOVT_SERVICE_TYPES));
  c.push(...Field("Class Level (वर्ग)"));
  c.push(...OPTS("Options:", GOVT_CLASSES));
  c.push(H3("Field: Designation (पदनाम) – depends on Class Level"));
  for (const cls of GOVT_CLASSES) {
    c.push(new Paragraph({ spacing: { before: 120, after: 60 },
      children: [new TextRun({ text: `If Class = "${cls}" → Designation options:`, font: FONT, bold: true })] }));
    for (const d of GOVT_CLASS_DESIGNATIONS[cls]) c.push(Bullet(d, 1));
  }
  c.push(Note("If Designation = 'Other …' → free-text input to specify designation."));
  c.push(...Field("Organisation / Department (विभाग / कार्यालय)", "Free-text", "No"));
  c.push(...Field("Posting Place (कार्यरत ठिकाण)", "Free-text", "No"));
  c.push(...Field("Experience (Years)", "Free-text (number)", "No"));
  c.push(...Field("Annual Income"));
  c.push(...OPTS("Options:", INCOME_RANGES));

  // 8. Private Employee
  section("Category 8 – खाजगी कर्मचारी (Private Employee)");
  c.push(...Field("Sector (क्षेत्र)"));
  c.push(...OPTS("Options:", PRIVATE_SECTORS));
  c.push(...Field("Designation (पदनाम)", "Free-text", "No"));
  c.push(...Field("Organisation / Company (कंपनी / संस्था)", "Free-text", "No"));
  c.push(...Field("Posting Place", "Free-text", "No"));
  c.push(...Field("Experience (Years)", "Free-text (number)", "No"));
  c.push(...Field("Annual Income"));
  c.push(...OPTS("Options:", INCOME_RANGES));

  // 9. Education
  section("Category 9 – शिक्षण क्षेत्र (Education Sector)");
  c.push(...Field("Institution Type (संस्था प्रकार)"));
  c.push(...OPTS("Options:", EDU_INSTITUTION_TYPES));
  c.push(Note("If 'Other (इतर)' → free-text input to specify institution type."));
  c.push(H3("Field: Institution Level (शैक्षणिक स्तर) – depends on Institution Type"));
  c.push(new Paragraph({ spacing: { before: 120, after: 60 },
    children: [new TextRun({ text: "If Institution Type = 'University (विद्यापीठ)' → Level options:", font: FONT, bold: true })] }));
  for (const o of EDU_LEVELS_UNIVERSITY) c.push(Bullet(o, 1));
  c.push(new Paragraph({ spacing: { before: 120, after: 60 },
    children: [new TextRun({ text: "For all other institution types → Level options:", font: FONT, bold: true })] }));
  for (const o of EDU_LEVELS_NON_UNIVERSITY) c.push(Bullet(o, 1));
  c.push(Note("If 'Other (इतर)' → free-text input to specify level."));
  c.push(H3("Field: Designation (पदनाम) – depends on Institution Level"));
  for (const lvl of Object.keys(EDU_DESIGNATIONS_BY_LEVEL)) {
    c.push(new Paragraph({ spacing: { before: 120, after: 60 },
      children: [new TextRun({ text: `If Level = "${lvl}" → Designation options:`, font: FONT, bold: true })] }));
    for (const d of EDU_DESIGNATIONS_BY_LEVEL[lvl]) c.push(Bullet(d, 1));
  }
  c.push(Note("If Designation = 'Other (इतर)' → free-text input."));
  c.push(...Field("Organisation / Institution Name", "Free-text", "No"));
  c.push(...Field("Posting Place", "Free-text", "No"));
  c.push(...Field("Experience (Years)", "Free-text (number)", "No"));
  c.push(...Field("Annual Income"));
  c.push(...OPTS("Options:", INCOME_RANGES));

  // 10. Medical
  section("Category 10 – वैद्यकीय क्षेत्र (Medical Sector)");
  c.push(...Field("Institution Type (संस्था प्रकार)"));
  c.push(...OPTS("Options:", MED_INSTITUTION_TYPES));
  c.push(Note("If 'Other (इतर)' → free-text input."));
  c.push(H3("Field: Designation (पदनाम) – depends on Institution Type"));
  for (const t of MED_INSTITUTION_TYPES) {
    const list = medDesignationsForType(t);
    if (!list.length) continue;
    c.push(new Paragraph({ spacing: { before: 120, after: 60 },
      children: [new TextRun({ text: `If Institution Type = "${t}" → Designation options:`, font: FONT, bold: true })] }));
    for (const d of list) c.push(Bullet(d, 1));
  }
  c.push(Note("If Designation = 'Other (इतर)' → free-text input."));
  c.push(H3("Additional fields based on Institution Type"));
  c.push(P("If Institution Type is Government Hospital, Private Hospital, PHC, or Medical College:"));
  c.push(Bullet("Hospital Name (रुग्णालयाचे नाव) – free-text"));
  c.push(Bullet("Department / Unit (विभाग) – free-text"));
  c.push(Bullet("Place of Posting (कार्यरत ठिकाण) – free-text"));
  c.push(P("If Institution Type = 'Own Setup (स्वतःचे क्लिनिक / रुग्णालय / लॅब)':"));
  c.push(Bullet("Setup Name (क्लिनिक / रुग्णालय / लॅब नाव)"));
  c.push(Bullet("Full Address (संपूर्ण पत्ता)"));
  c.push(Bullet("City / Village (शहर / गाव)"));
  c.push(Bullet("District (जिल्हा)"));
  c.push(Bullet("PIN Code (पिन कोड)"));
  c.push(...Field("Experience (Years)", "Free-text (number)", "No"));
  c.push(...Field("Annual Income"));
  c.push(...OPTS("Options:", INCOME_RANGES));

  // 11. WCD
  section("Category 11 – महिला व बाल विकास (Women & Child Development)");
  c.push(...Field("Designation (पदनाम)"));
  c.push(...OPTS("Options:", WCD_DESIGNATIONS));
  c.push(Note("If 'Other (इतर)' → free-text input."));
  c.push(...Field("Organisation / Centre Name", "Free-text", "No"));
  c.push(...Field("Posting Place", "Free-text", "No"));
  c.push(...Field("Experience (Years)", "Free-text (number)", "No"));
  c.push(...Field("Annual Income"));
  c.push(...OPTS("Options:", INCOME_RANGES));

  // 12. Engineering
  section("Category 12 – अभियंता (Engineering Sector)");
  c.push(...Field("Institution Type"));
  c.push(...OPTS("Options:", ENG_INSTITUTION_TYPES));
  c.push(...Field("Branch (शाखा)"));
  c.push(...OPTS("Options:", ENG_BRANCHES));
  c.push(Note("If Branch = 'Other (इतर)' → free-text input."));
  c.push(H3("Field: Designation (पदनाम) – depends on Branch"));
  const shownBranches = ["Civil Engineering (स्थापत्य अभियंता)", "Computer Engineering (संगणक अभियंता)", "Other (इतर)"];
  for (const b of shownBranches) {
    const list = engDesignationsForBranch(b);
    c.push(new Paragraph({ spacing: { before: 120, after: 60 },
      children: [new TextRun({ text: `If Branch = "${b}" → Designation options:`, font: FONT, bold: true })] }));
    for (const d of list) c.push(Bullet(d, 1));
  }
  c.push(Note("Core (non-IT) branches share one designation list; IT branches (Computer, IT, Software, Network) share an IT designation list."));
  c.push(...Field("Organisation / Company", "Free-text", "No"));
  c.push(...Field("Posting Place", "Free-text", "No"));
  c.push(...Field("Experience (Years)", "Free-text (number)", "No"));
  c.push(...Field("Annual Income"));
  c.push(...OPTS("Options:", INCOME_RANGES));

  // 13. Banking
  section("Category 13 – बँकिंग व वित्तीय क्षेत्र (Banking & Finance)");
  c.push(...Field("Bank / Institution Type (संस्था प्रकार)"));
  c.push(...OPTS("Options:", BANK_TYPES));
  c.push(Note("If 'Other (इतर)' → free-text input."));
  c.push(H3("Field: Designation (पदनाम) – depends on Bank Type"));
  for (const t of Object.keys(BANK_DESIGNATIONS_BY_TYPE)) {
    c.push(new Paragraph({ spacing: { before: 120, after: 60 },
      children: [new TextRun({ text: `If Bank Type = "${t}" → Designation options:`, font: FONT, bold: true })] }));
    for (const d of BANK_DESIGNATIONS_BY_TYPE[t]) c.push(Bullet(d, 1));
  }
  c.push(...Field("Organisation / Branch Name", "Free-text", "No"));
  c.push(...Field("Posting Place", "Free-text", "No"));
  c.push(...Field("Experience (Years)", "Free-text (number)", "No"));
  c.push(...Field("Annual Income"));
  c.push(...OPTS("Options:", INCOME_RANGES));

  // 14. Judiciary
  section("Category 14 – न्यायव्यवस्था (Judiciary)");
  c.push(...Field("Designation (पदनाम)"));
  c.push(...OPTS("Options:", JUDICIARY_DESIGNATIONS));
  c.push(Note("If 'Other (इतर)' → free-text input."));
  c.push(...Field("Court / Chamber Name (न्यायालय / कक्ष)", "Free-text", "No"));
  c.push(...Field("Posting Place", "Free-text", "No"));
  c.push(...Field("Experience (Years)", "Free-text (number)", "No"));
  c.push(...Field("Annual Income"));
  c.push(...OPTS("Options:", INCOME_RANGES));

  // 15. Defence
  section("Category 15 – संरक्षण व सुरक्षा सेवा (Defence & Security)");
  c.push(...Field("Force / Service (दल)"));
  c.push(...OPTS("Options:", DEFENCE_FORCES));
  c.push(Note("If 'Other (इतर)' → free-text input."));
  c.push(H3("Field: Rank (हुद्दा / रँक) – depends on Force"));
  c.push(new Paragraph({ spacing: { before: 120, after: 60 },
    children: [new TextRun({ text: "If Force = Indian Army / Navy / Air Force → Military Ranks:", font: FONT, bold: true })] }));
  for (const r of MILITARY_RANKS) c.push(Bullet(r, 1));
  c.push(new Paragraph({ spacing: { before: 120, after: 60 },
    children: [new TextRun({ text: "If Force = Maharashtra Police / SRPF / GRP / RPF → Police Ranks:", font: FONT, bold: true })] }));
  for (const r of POLICE_RANKS) c.push(Bullet(r, 1));
  c.push(new Paragraph({ spacing: { before: 120, after: 60 },
    children: [new TextRun({ text: "If Force = BSF / CRPF / CISF / ITBP / SSB / Assam Rifles / Coast Guard → Central Armed Forces Ranks:", font: FONT, bold: true })] }));
  for (const r of CENTRAL_ARMED_FORCES_RANKS) c.push(Bullet(r, 1));
  c.push(Note("If Rank = 'Other (इतर)' → free-text input."));
  c.push(...Field("Posting Place", "Free-text", "No"));
  c.push(...Field("Experience (Years)", "Free-text (number)", "No"));
  c.push(...Field("Annual Income"));
  c.push(...OPTS("Options:", INCOME_RANGES));

  // 16. Retired
  section("Category 16 – निवृत्त / पेन्शनधारक (Retired / Pensioner)");
  c.push(...Field("Retired From (पूर्वीचा विभाग)"));
  c.push(...OPTS("Options:", RETIRED_FROM));
  c.push(Note("If 'इतर (Other)' → free-text input."));
  c.push(...Field("Last Designation / Post (शेवटचे पद)", "Free-text", "No"));
  c.push(...Field("Annual Pension / Income"));
  c.push(...OPTS("Options:", INCOME_RANGES));

  // 17. Unemployed
  section("Category 17 – बेरोजगार (Unemployed)");
  c.push(...Field("Currently Seeking Job? (सध्या नोकरी शोधत आहात का?)"));
  c.push(Bullet("होय (Yes)")); c.push(Bullet("नाही (No)"));
  c.push(Note("If Yes → opens 'Desired Sector' free-text field."));
  c.push(...Field("Desired Sector / Job Field (इच्छित रोजगार क्षेत्र)", "Free-text", "No"));
  c.push(...Field("Want Skill Training? (कौशल्य प्रशिक्षण हवे का?)"));
  c.push(Bullet("होय (Yes)")); c.push(Bullet("नाही (No)"));
  c.push(...Field("Interested to Start Own Business? (स्वतःचा व्यवसाय सुरू करायचा आहे का?)"));
  c.push(Bullet("होय (Yes)")); c.push(Bullet("नाही (No)"));
  c.push(Note("If Yes → opens 'Desired Business' and 'Want Guidance' fields."));
  c.push(...Field("Which Business? (कोणता व्यवसाय)", "Free-text", "No"));
  c.push(...Field("Want Guidance / Mentorship? (मार्गदर्शन हवे का?)"));
  c.push(Bullet("होय (Yes)")); c.push(Bullet("नाही (No)"));

  // 18. NRI
  section("Category 18 – परदेशस्थ (NRI)");
  c.push(...Field("Country (देश)", "Free-text", "No"));
  c.push(...Field("City (शहर)", "Free-text", "No"));
  c.push(...Field("Organisation / Company", "Free-text", "No"));
  c.push(...Field("Designation", "Free-text", "No"));
  c.push(...Field("Ways of Contribution (योगदानाचे मार्ग)", "Multi-select checkboxes", "No"));
  c.push(...OPTS("Options:", NRI_CONTRIBUTIONS));
  c.push(...Field("Notes", "Free-text", "No"));

  // 19. Other
  section("Category 19 – इतर (Other)");
  c.push(...Field("Please specify occupation (कृपया व्यवसाय नमूद करा)", "Free-text", "Yes"));
  c.push(...Field("Organisation / Workplace", "Free-text", "No"));
  c.push(...Field("Posting Place", "Free-text", "No"));
  c.push(...Field("Annual Income"));
  c.push(...OPTS("Options:", INCOME_RANGES));
  c.push(...Field("Notes", "Free-text", "No"));

  // Storage format
  c.push(new Paragraph({ children: [new PageBreak()] }));
  c.push(H1("Stored Value Format"));
  c.push(P("All selections for the Occupation field are combined into a single JSON string containing only the filled keys. Example:"));
  c.push(P('{"category":"सरकारी कर्मचारी (Government Employee)","serviceType":"राज्य शासन (State Government)","classLevel":"Class 2 Officer (वर्ग 2 अधिकारी)","designation":"Tahsildar (तहसीलदार)","organisation":"Revenue Dept","postingPlace":"Pune","annualIncome":"5 – 10 लाख (5–10 Lakh)"}'));

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
        { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 24, bold: true, font: FONT, color: "365F91" },
          paragraph: { spacing: { before: 160, after: 80 }, outlineLevel: 2 } },
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
      children: c,
    }],
  });

  const buf = await Packer.toBuffer(doc);
  fs.mkdirSync("/mnt/documents", { recursive: true });
  fs.writeFileSync("/mnt/documents/Occupation-Field-Structure-English.docx", buf);
  console.log("wrote /mnt/documents/Occupation-Field-Structure-English.docx", buf.length);
}
main();
