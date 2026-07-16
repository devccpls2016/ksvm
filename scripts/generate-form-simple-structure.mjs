// Generates a simple, plain structure Word file listing every form field.
// Output: /mnt/documents/Survey-Form-Simple-Structure.docx
// Not linked anywhere in the frontend.

import fs from "node:fs";
import path from "node:path";
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType, PageBreak,
} from "docx";

const OUT = "/mnt/documents/Survey-Form-Simple-Structure.docx";

const border = { style: BorderStyle.SINGLE, size: 4, color: "BFBFBF" };
const borders = { top: border, bottom: border, left: border, right: border };

function cell(text, opts = {}) {
  const runs = Array.isArray(text) ? text : [{ text: String(text ?? "") }];
  return new TableCell({
    borders,
    width: { size: opts.width ?? 3120, type: WidthType.DXA },
    shading: opts.shade ? { fill: opts.shade, type: ShadingType.CLEAR } : undefined,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({ children: runs.map(r => new TextRun({ bold: opts.bold, ...r })) })],
  });
}

function fieldTable(rows) {
  const header = new TableRow({
    tableHeader: true,
    children: [
      cell("#", { width: 720, bold: true, shade: "1F4E78" }).let,
    ],
  });
  // rebuild header with white text
  const hCell = (t, w) => new TableCell({
    borders,
    width: { size: w, type: WidthType.DXA },
    shading: { fill: "1F4E78", type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({ children: [new TextRun({ text: t, bold: true, color: "FFFFFF" })] })],
  });
  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      hCell("#", 600),
      hCell("Field Key", 2200),
      hCell("Label", 3200),
      hCell("Type", 1400),
      hCell("Options / Notes", 5040),
    ],
  });

  const bodyRows = rows.map((r, i) => new TableRow({
    children: [
      cell(String(i + 1), { width: 600 }),
      cell([{ text: r.key, font: "Consolas" }], { width: 2200 }),
      cell(r.label, { width: 3200 }),
      cell(r.type, { width: 1400 }),
      cell(r.notes || "-", { width: 5040 }),
    ],
  }));

  return new Table({
    width: { size: 12440, type: WidthType.DXA },
    columnWidths: [600, 2200, 3200, 1400, 5040],
    rows: [headerRow, ...bodyRows],
  });
}

function h1(text) { return new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text, bold: true, size: 32, color: "1F4E78" })], spacing: { before: 300, after: 160 } }); }
function h2(text) { return new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text, bold: true, size: 26, color: "2E75B6" })], spacing: { before: 220, after: 120 } }); }
function p(text, opts = {}) { return new Paragraph({ children: [new TextRun({ text, ...opts })], spacing: { after: 80 } }); }

// ---- Form structure definition (bilingual) ----
const sections = [
  {
    en: "1. Address / Location",
    mr: "१. पत्ता / ठिकाण",
    fields: [
      { key: "village", en: "Village", mr: "गाव", type: "Text" },
      { key: "taluka", en: "Taluka", mr: "तालुका", type: "Text" },
      { key: "district", en: "District", mr: "जिल्हा", type: "Text" },
      { key: "pincode", en: "Pincode", mr: "पिनकोड", type: "Text (6 digit)" },
      { key: "permanent_address.native_district", en: "Native District", mr: "मूळ जिल्हा", type: "Text" },
      { key: "permanent_address.native_taluka", en: "Native Taluka", mr: "मूळ तालुका", type: "Text" },
      { key: "permanent_address.native_village", en: "Native Village", mr: "मूळ गाव", type: "Text" },
      { key: "permanent_address.native_pincode", en: "Native Pincode", mr: "मूळ पिनकोड", type: "Text" },
    ],
  },
  {
    en: "2. Family Head Information",
    mr: "२. कुटुंब प्रमुख माहिती",
    fields: [
      { key: "head_name", en: "Head of family name", mr: "कुटुंब प्रमुखाचे नाव", type: "Text" },
      { key: "head_photo_url", en: "Head photo", mr: "प्रमुखाचा फोटो", type: "Image upload" },
      { key: "mobile", en: "Mobile number", mr: "मोबाईल क्रमांक", type: "Text (10 digit)" },
      { key: "community", en: "Community", mr: "समाज", type: "Text", notes: "Default: कोहळी" },
      { key: "gender", en: "Gender", mr: "लिंग", type: "Dropdown", notes: "Male / Female / Other" },
      { key: "age", en: "Age", mr: "वय", type: "Number" },
      { key: "dob", en: "Date of Birth", mr: "जन्मतारीख", type: "Date" },
      { key: "marital_status", en: "Marital Status", mr: "वैवाहिक स्थिती", type: "Dropdown", notes: "Married / Single / Widow / Divorced" },
      { key: "marriage_type", en: "Marriage Type", mr: "विवाह प्रकार", type: "Dropdown", notes: "Shown if married. Same caste / Inter-caste" },
      { key: "spouse_caste", en: "Spouse Caste", mr: "जोडीदाराची जात", type: "Text", notes: "Shown if inter-caste" },
      { key: "education", en: "Education", mr: "शिक्षण", type: "Cascading dropdown", notes: "Level → sub-fields (stream, degree, year, etc.)" },
      { key: "occupation", en: "Occupation", mr: "व्यवसाय", type: "Cascading dropdown", notes: "Job / Business / Farming / Student etc." },
    ],
  },
  {
    en: "3. Household Items",
    mr: "३. घरातील वस्तू",
    fields: [
      { key: "household_items", en: "Household items owned", mr: "घरातील वस्तू", type: "Multi-select", notes: "TV, Fridge, Washing machine, Bike, Car, etc." },
      { key: "household_item_counts", en: "Item counts", mr: "वस्तूंची संख्या", type: "Number per item" },
    ],
  },
  {
    en: "4. House / Residence",
    mr: "४. घर / निवास",
    fields: [
      { key: "owns_house", en: "Owns house?", mr: "स्वतःचे घर आहे का?", type: "Yes/No" },
      { key: "house_type", en: "House type", mr: "घराचा प्रकार", type: "Dropdown", notes: "Kaccha / Pakka / Semi-pakka" },
      { key: "living_status", en: "Living status", mr: "राहण्याची स्थिती", type: "Dropdown", notes: "Owned / Rented / Ancestral" },
      { key: "gharkul_received", en: "Gharkul received?", mr: "घरकुल मिळाले का?", type: "Yes/No" },
      { key: "gharkul_wanted", en: "Wants Gharkul?", mr: "घरकुल हवे आहे का?", type: "Yes/No" },
      { key: "solar_panel_installed", en: "Solar panel installed?", mr: "सौर पॅनेल बसवले आहे का?", type: "Yes/No" },
      { key: "solar_panel_wanted", en: "Wants solar panel?", mr: "सौर पॅनेल हवे आहे का?", type: "Yes/No" },
    ],
  },
  {
    en: "5. Farmland",
    mr: "५. शेतजमीन",
    fields: [
      { key: "has_farmland", en: "Has farmland?", mr: "शेती आहे का?", type: "Yes/No" },
      { key: "total_farmland", en: "Total farmland (acres)", mr: "एकूण शेती (एकर)", type: "Number" },
      { key: "irrigated_area", en: "Irrigated area", mr: "बागायती क्षेत्र", type: "Number" },
      { key: "dryland_area", en: "Dryland area", mr: "कोरडवाहू क्षेत्र", type: "Number" },
      { key: "kharif_area", en: "Kharif area", mr: "खरीप क्षेत्र", type: "Number" },
      { key: "rabi_area", en: "Rabi area", mr: "रब्बी क्षेत्र", type: "Number" },
      { key: "summer_area", en: "Summer area", mr: "उन्हाळी क्षेत्र", type: "Number" },
      { key: "major_crop_types", en: "Major crop types", mr: "मुख्य पीक प्रकार", type: "Multi-select" },
      { key: "major_crop_types_other", en: "Other crop types", mr: "इतर पीक प्रकार", type: "Text" },
      { key: "crops", en: "Crops list", mr: "पिकांची यादी", type: "Repeatable", notes: "Each entry: season" },
    ],
  },
  {
    en: "6. Irrigation",
    mr: "६. सिंचन",
    fields: [
      { key: "irrigation_sources", en: "Irrigation sources", mr: "सिंचनाचे स्रोत", type: "Multi-select", notes: "Tubewell, Well, Farm pond, Pond, River, Canal" },
      { key: "irrigation_details.<source>.count", en: "Count", mr: "संख्या", type: "Number (per source)" },
      { key: "irrigation_details.<source>.electric", en: "Electric pump", mr: "विद्युत पंप", type: "Checkbox" },
      { key: "irrigation_details.<source>.solar", en: "Solar pump", mr: "सौर पंप", type: "Checkbox" },
      { key: "irrigation_details.<source>.is_kohli_malguzari", en: "Kohli / Malguzari?", mr: "कोहळी / मालगुजारी?", type: "Yes/No" },
      { key: "irrigation_details.<source>.water_free_for_irrigation", en: "Free water for irrigation?", mr: "सिंचनासाठी पाणी मोफत?", type: "Yes/No" },
    ],
  },
  {
    en: "7. Farming Tools",
    mr: "७. शेती अवजारे",
    fields: [
      { key: "farming_tools", en: "Farming tools owned", mr: "शेती अवजारे", type: "Multi-select", notes: "Tractor, Harvester, Rotavator, Cultivator, Tractor trolley" },
      { key: "farming_tools_details.<tool>.has", en: "Has this tool?", mr: "हे अवजार आहे का?", type: "Yes/No" },
      { key: "farming_tools_details.<tool>.count", en: "Count", mr: "संख्या", type: "Number" },
      { key: "farming_tools_details.<tool>.want_to_buy", en: "Wants to buy?", mr: "खरेदी करायचे आहे का?", type: "Yes/No" },
      { key: "farming_tools_details.<tool>.needs_loan", en: "Needs loan?", mr: "कर्ज हवे आहे का?", type: "Yes/No" },
      { key: "farming_tools_details.other_uses", en: "Uses others' tools?", mr: "इतरांची अवजारे वापरतात का?", type: "Yes/No" },
      { key: "farming_tools_details.other_details", en: "Other details", mr: "इतर तपशील", type: "Text" },
    ],
  },
  {
    en: "8. Farm Management",
    mr: "८. शेती व्यवस्थापन",
    fields: [
      { key: "farm_management.has_contract_or_share", en: "Contract / share farming?", mr: "करार / वाटा शेती?", type: "Yes/No" },
      { key: "farm_management.contract_farming_area", en: "Contract farming area", mr: "करार शेती क्षेत्र", type: "Text" },
    ],
  },
  {
    en: "9. Position / Leadership",
    mr: "९. पदे / नेतृत्व",
    fields: [
      { key: "has_position", en: "Holds any position?", mr: "कोणतेही पद आहे का?", type: "Yes/No" },
      { key: "position_data.positions[]", en: "Positions list", mr: "पदांची यादी", type: "Repeatable" },
      { key: "positions[].person_name", en: "Person name", mr: "व्यक्तीचे नाव", type: "Text" },
      { key: "positions[].type", en: "Type", mr: "प्रकार", type: "Dropdown", notes: "Political / Social / Representative" },
      { key: "positions[].status", en: "Status", mr: "स्थिती", type: "Dropdown", notes: "Present / Former" },
      { key: "positions[].political_level", en: "Political level", mr: "राजकीय स्तर", type: "Dropdown" },
      { key: "positions[].party_name", en: "Party name", mr: "पक्षाचे नाव", type: "Dropdown" },
      { key: "positions[].party_name_other", en: "Party name (other)", mr: "इतर पक्ष", type: "Text" },
      { key: "positions[].term_from", en: "Term from", mr: "कार्यकाळ पासून", type: "Date" },
      { key: "positions[].term_to", en: "Term to", mr: "कार्यकाळ पर्यंत", type: "Date" },
      { key: "positions[].representative_type", en: "Representative type", mr: "प्रतिनिधी प्रकार", type: "Dropdown" },
      { key: "positions[].coop_role", en: "Cooperative role", mr: "सहकारी भूमिका", type: "Text" },
      { key: "positions[].coop_org_name", en: "Cooperative organization", mr: "सहकारी संस्था", type: "Text" },
      { key: "positions[].social_org", en: "Social organization", mr: "सामाजिक संस्था", type: "Text" },
      { key: "positions[].social_role", en: "Social role", mr: "सामाजिक भूमिका", type: "Text" },
    ],
  },
  {
    en: "10. Family Members (Repeatable)",
    mr: "१०. कुटुंब सदस्य (पुनरावृत्ती)",
    fields: [
      { key: "members[].name", en: "Name", mr: "नाव", type: "Text" },
      { key: "members[].relationship", en: "Relationship", mr: "नाते", type: "Dropdown" },
      { key: "members[].age", en: "Age", mr: "वय", type: "Number" },
      { key: "members[].dob", en: "Date of Birth", mr: "जन्मतारीख", type: "Date" },
      { key: "members[].gender", en: "Gender", mr: "लिंग", type: "Dropdown" },
      { key: "members[].marital_status", en: "Marital status", mr: "वैवाहिक स्थिती", type: "Dropdown" },
      { key: "members[].marriage_type", en: "Marriage type", mr: "विवाह प्रकार", type: "Dropdown" },
      { key: "members[].spouse_caste", en: "Spouse caste", mr: "जोडीदाराची जात", type: "Text" },
      { key: "members[].education", en: "Education", mr: "शिक्षण", type: "Cascading dropdown" },
      { key: "members[].occupation", en: "Occupation", mr: "व्यवसाय", type: "Cascading dropdown" },
      { key: "members[].job_type", en: "Job type", mr: "नोकरी प्रकार", type: "Dropdown", notes: "Government / Private / Department" },
      { key: "members[].job_place", en: "Job place", mr: "नोकरीचे ठिकाण", type: "Text" },
      { key: "members[].mobile", en: "Mobile", mr: "मोबाईल", type: "Text" },
      { key: "members[].maternal_family.name", en: "Maternal family name", mr: "माहेरचे नाव", type: "Text" },
      { key: "members[].maternal_family.address", en: "Maternal family address", mr: "माहेरचा पत्ता", type: "Text" },
      { key: "members[].maternal_family.mobile", en: "Maternal family mobile", mr: "माहेरचा मोबाईल", type: "Text" },
      { key: "members[].in_laws_family.name", en: "In-laws family name", mr: "सासरचे नाव", type: "Text" },
      { key: "members[].in_laws_family.address", en: "In-laws address", mr: "सासरचा पत्ता", type: "Text" },
      { key: "members[].in_laws_family.mobile", en: "In-laws mobile", mr: "सासरचा मोबाईल", type: "Text" },
      { key: "members[].mahila_bachat_gat.is_member", en: "Mahila bachat gat member?", mr: "महिला बचत गट सदस्य?", type: "Yes/No" },
      { key: "members[].mahila_bachat_gat.wants_to_join", en: "Wants to join?", mr: "सामील व्हायचे आहे का?", type: "Yes/No" },
      { key: "members[].mahila_bachat_gat.has_rural_home_business", en: "Has home business?", mr: "गृहउद्योग आहे का?", type: "Yes/No" },
      { key: "members[].mahila_bachat_gat.business_name", en: "Business name", mr: "व्यवसायाचे नाव", type: "Text" },
      { key: "members[].mahila_bachat_gat.wants_to_start_business", en: "Wants to start business?", mr: "व्यवसाय सुरू करायचा?", type: "Yes/No" },
      { key: "members[].mahila_bachat_gat.desired_business", en: "Desired business", mr: "इच्छित व्यवसाय", type: "Text" },
    ],
  },
  {
    en: "11. Maternal Family (Head)",
    mr: "११. माहेर (प्रमुख)",
    fields: [
      { key: "maternal_family.name", en: "Name", mr: "नाव", type: "Text" },
      { key: "maternal_family.address", en: "Address", mr: "पत्ता", type: "Text" },
      { key: "maternal_family.mobile", en: "Mobile", mr: "मोबाईल", type: "Text" },
    ],
  },
  {
    en: "12. Government Benefits",
    mr: "१२. शासकीय लाभ",
    fields: [
      { key: "benefits_info.ladki_bahin", en: "Ladki Bahin beneficiary?", mr: "लाडकी बहीण लाभार्थी?", type: "Yes/No" },
      { key: "benefits_info.ladki_bahin_count", en: "Beneficiary count", mr: "लाभार्थ्यांची संख्या", type: "Number" },
      { key: "benefits_info.ladki_bahin_regular", en: "Regular installments?", mr: "नियमित हप्ते?", type: "Yes/No" },
      { key: "benefits_info.ladki_bahin_beneficiaries[].name", en: "Beneficiary name", mr: "लाभार्थीचे नाव", type: "Text" },
      { key: "benefits_info.ladki_bahin_beneficiaries[].regular", en: "Regular?", mr: "नियमित?", type: "Yes/No" },
      { key: "benefits_info.ladki_bahin_beneficiaries[].reason", en: "Reason", mr: "कारण", type: "Dropdown" },
      { key: "benefits_info.ladki_bahin_beneficiaries[].reason_other", en: "Other reason", mr: "इतर कारण", type: "Text" },
      { key: "benefits_info.ladki_bahin_non_beneficiaries[].name", en: "Non-beneficiary name", mr: "गैरलाभार्थी नाव", type: "Text" },
      { key: "benefits_info.ladki_bahin_non_beneficiaries[].reason", en: "Reason not benefited", mr: "लाभ न मिळण्याचे कारण", type: "Dropdown" },
      { key: "benefits_info.ladki_bahin_non_beneficiaries[].reason_other", en: "Other reason", mr: "इतर कारण", type: "Text" },
      { key: "benefits_info.critical_illness", en: "Critical illness in family?", mr: "गंभीर आजार आहे का?", type: "Yes/No" },
      { key: "benefits_info.medical_aid_needed", en: "Medical aid needed?", mr: "वैद्यकीय मदत हवी?", type: "Yes/No" },
      { key: "benefits_info.has_sportsperson", en: "Sportsperson in family?", mr: "कुटुंबात खेळाडू आहे का?", type: "Yes/No" },
      { key: "benefits_info.sport_type", en: "Sport type", mr: "खेळाचा प्रकार", type: "Text" },
      { key: "benefits_info.sport_level", en: "Sport level", mr: "खेळाचा स्तर", type: "Dropdown" },
    ],
  },
  {
    en: "13. Employment / Business",
    mr: "१३. रोजगार / व्यवसाय",
    fields: [
      { key: "employment_info.has_entrepreneur", en: "Any entrepreneur in family?", mr: "कुटुंबात उद्योजक आहे का?", type: "Yes/No" },
      { key: "employment_info.entrepreneur_details", en: "Entrepreneur details", mr: "उद्योजक तपशील", type: "Text" },
      { key: "employment_info.entrepreneur_address", en: "Business address", mr: "व्यवसायाचा पत्ता", type: "Text" },
      { key: "employment_info.has_side_business", en: "Any side business?", mr: "जोडधंदा आहे का?", type: "Yes/No" },
      { key: "employment_info.side_business_details", en: "Side business details", mr: "जोडधंदा तपशील", type: "Text" },
    ],
  },
];

function buildDoc(lang) {
  const isEn = lang === "en";
  const title = isEn ? "Survey Form — Simple Structure" : "सर्वेक्षण फॉर्म — साधी रचना";
  const subtitle = isEn
    ? "A plain listing of every section and field in the survey form."
    : "सर्वेक्षण फॉर्ममधील प्रत्येक विभाग व प्रत्येक फील्डची साधी यादी.";

  const children = [
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200, after: 100 },
      children: [new TextRun({ text: title, bold: true, size: 40, color: "1F4E78" })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 300 },
      children: [new TextRun({ text: subtitle, italics: true, size: 22, color: "595959" })] }),
    p(isEn ? `Generated: ${new Date().toLocaleString("en-IN")}` : `तयार केले: ${new Date().toLocaleString("mr-IN")}`,
      { size: 18, color: "808080" }),
    new Paragraph({ children: [new PageBreak()] }),
  ];

  sections.forEach((s, idx) => {
    children.push(h1(isEn ? s.en : s.mr));
    const rows = s.fields.map(f => ({
      key: f.key,
      label: isEn ? f.en : f.mr,
      type: f.type,
      notes: f.notes || "",
    }));
    children.push(fieldTable(rows));
    if (idx < sections.length - 1) {
      children.push(new Paragraph({ children: [new PageBreak()] }));
    }
  });

  return new Document({
    creator: "Kohli Survey App",
    title,
    styles: { default: { document: { run: { font: "Calibri", size: 22 } } } },
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1000, right: 900, bottom: 1000, left: 900 },
        },
      },
      children,
    }],
  });
}

async function main() {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  const enDoc = buildDoc("en");
  const mrDoc = buildDoc("mr");
  const enBuf = await Packer.toBuffer(enDoc);
  const mrBuf = await Packer.toBuffer(mrDoc);
  fs.writeFileSync("/mnt/documents/Survey-Form-Simple-Structure-English.docx", enBuf);
  fs.writeFileSync("/mnt/documents/Survey-Form-Simple-Structure-Marathi.docx", mrBuf);
  console.log("Wrote:");
  console.log("  /mnt/documents/Survey-Form-Simple-Structure-English.docx");
  console.log("  /mnt/documents/Survey-Form-Simple-Structure-Marathi.docx");
}

main().catch(err => { console.error(err); process.exit(1); });
