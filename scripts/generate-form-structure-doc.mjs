// Generates public/form-structure.docx describing every section, field,
// dropdown, and conditional branch of the Kohli Samaj survey form.
// Content is provided in Marathi and English side-by-side.

import fs from "node:fs";
import path from "node:path";
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  PageOrientation, BorderStyle, LevelFormat,
} from "docx";

const H = (text, level = HeadingLevel.HEADING_1) =>
  new Paragraph({ heading: level, children: [new TextRun({ text })] });

const P = (text, opts = {}) =>
  new Paragraph({
    spacing: { after: 80 },
    children: [new TextRun({ text, ...opts })],
  });

const B = (text) => P(text, { bold: true });

const BULLET = (text, level = 0) =>
  new Paragraph({
    numbering: { reference: "bullets", level },
    children: [new TextRun({ text })],
  });

// Bilingual line: Marathi label / English label
const BI = (mr, en, level = 0) =>
  new Paragraph({
    numbering: { reference: "bullets", level },
    children: [
      new TextRun({ text: mr, bold: true }),
      new TextRun({ text: "  —  " }),
      new TextRun({ text: en, italics: true, color: "555555" }),
    ],
  });

// A "field" line with type description in gray
const FIELD = (mr, en, type, level = 0) =>
  new Paragraph({
    numbering: { reference: "bullets", level },
    children: [
      new TextRun({ text: `${mr}  `, bold: true }),
      new TextRun({ text: `(${en}) `, italics: true, color: "555555" }),
      new TextRun({ text: `— ${type}`, color: "777777" }),
    ],
  });

const NOTE = (mr, en) =>
  new Paragraph({
    spacing: { before: 60, after: 120 },
    border: {
      left: { style: BorderStyle.SINGLE, size: 12, color: "4F46E5", space: 8 },
    },
    children: [
      new TextRun({ text: "टीप / Note: ", bold: true, color: "4F46E5" }),
      new TextRun({ text: mr }),
      new TextRun({ text: "  •  " }),
      new TextRun({ text: en, italics: true, color: "555555" }),
    ],
  });

const SP = () => new Paragraph({ spacing: { after: 120 }, children: [new TextRun("")] });

const SECTION = (badge, mr, en) => [
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 320, after: 120 },
    children: [new TextRun({ text: `${badge}.  ${mr}  /  ${en}`, bold: true, color: "1E3A8A" })],
  }),
];

const SUB = (mr, en) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 80 },
    children: [
      new TextRun({ text: mr, bold: true }),
      new TextRun({ text: "  /  " }),
      new TextRun({ text: en, italics: true, color: "555555" }),
    ],
  });

const IF = (cond) =>
  new Paragraph({
    spacing: { before: 60, after: 40 },
    children: [
      new TextRun({ text: "▸ जर / IF: ", bold: true, color: "B45309" }),
      new TextRun({ text: cond }),
    ],
  });

// ---------- Content ----------

const doc = new Document({
  numbering: {
    config: [{
      reference: "bullets",
      levels: [
        { level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
        { level: 1, format: LevelFormat.BULLET, text: "◦", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 1200, hanging: 360 } } } },
        { level: 2, format: LevelFormat.BULLET, text: "▪", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 1680, hanging: 360 } } } },
      ],
    }],
  },
  styles: {
    default: { document: { run: { font: "Nirmala UI", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 30, bold: true, font: "Nirmala UI", color: "1E3A8A" },
        paragraph: { spacing: { before: 280, after: 140 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Nirmala UI", color: "0F766E" },
        paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 1 } },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 },
      },
    },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "कोहळी समाज विकास मंडळ, नागपूर", bold: true, size: 36, color: "1E3A8A" })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "कुटुंब सर्वेक्षण फॉर्म संरचना (Form Structure Guide)", bold: true, size: 28 })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        children: [new TextRun({ text: "Marathi + English  •  प्रत्येक section, field, dropdown option आणि conditional (जर-तर) branch सहित", italics: true, color: "555555" })],
      }),

      // Legend
      SUB("वापर मार्गदर्शक", "How to read this document"),
      BULLET("प्रत्येक फील्ड मराठी नावासोबत English translation दिलेली आहे."),
      BULLET("Each field lists its input type (Text / Number / Dropdown / Radio / Checkbox / Date / Photo / Multi-select)."),
      BULLET("जर-तर (▸ IF) ओळी — dropdown / radio मधून एखादा पर्याय निवडल्यावर कोणते नवीन fields उघडतात ते दर्शवितात."),
      BULLET("Options / dropdown values are listed as indented bullets under each field."),

      // ============ SECTION A ============
      ...SECTION("A", "भौगोलिक माहिती", "Geographic Information"),
      SUB("पत्रव्यवहाराचा पत्ता", "Correspondence Address"),
      FIELD("जिल्हा", "District", "Text"),
      FIELD("तालुका", "Taluka", "Text"),
      FIELD("गाव *", "Village (required)", "Text"),
      FIELD("पिनकोड", "Pincode", "Text"),

      SUB("मूळ वस्ती", "Permanent Address"),
      BULLET("Checkbox: 'पत्रव्यवहाराचा पत्ता हा मूळ वस्तीसाठी समान आहे' / 'Same as Correspondence Address'"),
      IF("checkbox checked — खालील चारही fields auto-fill होतात व disabled राहतात."),
      FIELD("जिल्हा", "Native District", "Text"),
      FIELD("तालुका", "Native Taluka", "Text"),
      FIELD("मूळ वस्ती (गाव / शहर)", "Native Village / City", "Text"),
      FIELD("पिनकोड", "Native Pincode", "Text"),

      // ============ SECTION B ============
      ...SECTION("B", "कुटुंब प्रमुख माहिती", "Head of Family Information"),
      FIELD("कुटुंब प्रमुखाचा फोटो", "Head of Family Photo", "Camera / Image upload"),
      FIELD("कुटुंब प्रमुखाचे नाव *", "Head of Family Name (required)", "Text"),
      FIELD("मोबाईल क्रमांक", "Mobile Number", "Text"),
      FIELD("समुदाय / जनजाती", "Community / Caste", "Text"),
      FIELD("वैवाहिक स्थिती", "Marital Status", "Dropdown"),
      BULLET("Options: विवाहित (Married), अविवाहित (Unmarried), विधवा (Widow), घटस्फोटित (Divorced)", 1),
      IF("वैवाहिक स्थिती = 'विवाहित' — 'विवाहाचा प्रकार' section उघडते."),
      FIELD("विवाहाचा प्रकार", "Type of Marriage", "Radio", 1),
      BULLET("जातीय विवाह (Same-Caste)", 2),
      BULLET("आंतरजातीय विवाह (Inter-Caste)", 2),
      IF("विवाहाचा प्रकार = 'आंतरजातीय विवाह' — 'जोडीदाराची जात / Spouse's Caste' text field उघडते."),

      FIELD("लिंग", "Gender", "Dropdown (पुरुष / स्त्री)"),
      FIELD("जन्मतारीख", "Date of Birth", "Date picker — Day / Month / Year"),
      FIELD("वय", "Age", "Auto-calculated (read-only) from Date of Birth"),

      SUB("मामेकुळ तपशील", "Maternal Family Details"),
      FIELD("नाव", "Name", "Text"),
      FIELD("संपूर्ण पत्ता", "Full Address", "Text"),
      FIELD("मोबाईल क्रमांक", "Mobile Number", "Text"),

      SUB("शिक्षण (Education) — Cascading Dropdowns", "Education — Cascading Dropdowns"),
      BULLET("Step 1: 'शिक्षण स्तर' निवडा (Choose Education Level). त्यानंतर पुढील dropdowns क्रमाक्रमाने उघडतात."),
      FIELD("शिक्षण स्तर", "Education Level", "Dropdown"),
      BULLET("निरक्षर (Illiterate)", 1),
      BULLET("पूर्व-प्राथमिक (Pre-Primary)", 1),
      BULLET("प्राथमिक (Primary — इयत्ता 1 ते 5)", 1),
      BULLET("माध्यमिक (Secondary — इयत्ता 6 ते 10)", 1),
      BULLET("उच्च माध्यमिक (Higher Secondary — 11 वी / 12 वी)", 1),
      BULLET("पदविका / डिप्लोमा (Diploma)", 1),
      BULLET("पदवी (Graduate)", 1),
      BULLET("पदव्युत्तर (Postgraduate)", 1),
      BULLET("डॉक्टरेट / पीएच.डी. (Doctorate / Ph.D.)", 1),
      BULLET("इतर (Other)", 1),

      IF("Level = 'निरक्षर' — पुढील dropdown उघडत नाही; value = 'निरक्षर'."),
      IF("Level = 'पूर्व-प्राथमिक' — Stream = 'पूर्व-प्राथमिक शिक्षण'; Course dropdown: Nursery / Jr. KG (LKG) / Sr. KG (UKG)."),
      IF("Level = 'प्राथमिक' — Stream = 'इयत्ता 1 ते 5'; Course dropdown: इयत्ता 1 वी … 5 वी."),
      IF("Level = 'माध्यमिक' — Stream = 'इयत्ता 6 ते 10'; Course dropdown: इयत्ता 6 वी … 10 वी (SSC)."),
      IF("Level = 'उच्च माध्यमिक' — Stream dropdown: Arts / Commerce / Science / Vocational; Course dropdown: 11 वी / 12 वी of chosen stream."),
      IF("Level = 'पदविका', 'पदवी', 'पदव्युत्तर', 'डॉक्टरेट' — Stream dropdown (Arts / Commerce / Science / Engineering / Medical / Law इ.) उघडते व त्यानंतर Course dropdown उघडते."),
      IF("Course = 'इतर (नमूद करा)' — free-text input उघडते."),
      IF("Level ≠ 'निरक्षर' आणि Course निवडलेला असल्यास — 'संस्था प्रकार / Institution Type' dropdown उघडते."),

      FIELD("संस्था प्रकार", "Institution Type", "Dropdown"),
      BULLET("सरकारी (Government)", 1),
      BULLET("खाजगी (Private)", 1),
      BULLET("अनुदानित (Aided)", 1),
      BULLET("विना-अनुदानित (Unaided)", 1),
      BULLET("स्वायत्त (Autonomous)", 1),

      SUB("नौकरी / व्यवसाय (Job / Occupation) — Cascading Dropdowns", "Job / Occupation — Cascading Dropdowns"),
      FIELD("मुख्य श्रेणी", "Primary Category", "Dropdown"),
      BULLET("शेतकरी (Farmer)", 1),
      BULLET("शेती + व्यवसाय (Agriculture + Business)", 1),
      BULLET("कृषी मजूर / शेतमजूर (Farm Labour)", 1),
      BULLET("स्वरोजगार (Self Employed)", 1),
      BULLET("व्यवसाय (Business Owner)", 1),
      BULLET("मानधनधारक पदाधिकारी (Honorarium Based Position)", 1),
      BULLET("सरकारी कर्मचारी (Government Employee)", 1),
      BULLET("खाजगी कर्मचारी (Private Employee)", 1),
      BULLET("शिक्षण क्षेत्र (Education Sector)", 1),
      BULLET("वैद्यकीय क्षेत्र (Medical Sector)", 1),
      BULLET("महिला व बाल विकास (Women & Child Development)", 1),
      BULLET("अभियंता (Engineering Sector)", 1),
      BULLET("बँकिंग व वित्तीय क्षेत्र (Banking & Finance)", 1),
      BULLET("न्यायव्यवस्था (Judiciary)", 1),
      BULLET("संरक्षण व सुरक्षा सेवा (Defence & Security)", 1),
      BULLET("निवृत्त / पेन्शनधारक (Retired / Pensioner)", 1),
      BULLET("बेरोजगार (Unemployed)", 1),
      BULLET("परदेशस्थ (NRI)", 1),
      BULLET("इतर (Other)", 1),

      IF("Category = 'शेतकरी' — Farming Types (multi-select), Land Size dropdown, Annual Income, Notes fields उघडतात."),
      IF("Category = 'सरकारी कर्मचारी' — Service Type (राज्य / केंद्र), Class Level (1–4), Designation, Department, Organisation, Posting Place, Annual Income, Experience fields उघडतात."),
      IF("Category = 'खाजगी कर्मचारी' — Sector, Designation, Organisation, Posting Place, Annual Income, Experience fields उघडतात."),
      IF("Category = 'शिक्षण क्षेत्र' — Institution Type, Institution Level, Designation, Branch (Arts/Sci/…), Organisation इ. fields उघडतात."),
      IF("Category = 'वैद्यकीय क्षेत्र' — Institution Type (Govt / Private / Own Setup), Designation, Department, Hospital name / Own Setup address इ. fields उघडतात."),
      IF("Category = 'अभियंता' — Institution Type, Branch (Civil / Mechanical / …), Designation, Organisation, Posting Place इ. उघडतात."),
      IF("Category = 'बँकिंग व वित्तीय क्षेत्र' — Bank Type (RBI / Nationalized / Cooperative / …), Designation, Branch, Organisation इ. उघडतात."),
      IF("Category = 'न्यायव्यवस्था' — Designation (Judge / Advocate / …), Posting Place इ."),
      IF("Category = 'संरक्षण व सुरक्षा सेवा' — Force (Army / Navy / Air Force / BSF / Police / …), Rank dropdown, Posting Place इ."),
      IF("Category = 'व्यवसाय (Business Owner)' — Business Types (multi-select), Business Name, People Employed, Loan Needed → Loan Amount / Loan Purpose fields उघडतात."),
      IF("Category = 'स्वरोजगार' — Self-Employed Types (multi-select — सुतार / लोहार / प्लंबर …), Own Business? → Loan Needed → Loan Amount fields उघडतात."),
      IF("Category = 'शेती + व्यवसाय' — Farming Types + Business Type + संबंधित fields दोन्ही उघडतात."),
      IF("Category = 'मानधनधारक पदाधिकारी' — Position (Sarpanch / Police Patil / Kotwal / …), Organisation, Annual Income fields."),
      IF("Category = 'निवृत्त / पेन्शनधारक' — Retired From (कोणत्या विभागातून), Designation, Pension Amount fields."),
      IF("Category = 'बेरोजगार' — Seeking Job? (Yes/No), Desired Sector, Wants Skill Training?, Desired Business?, Wants Guidance? fields उघडतात."),
      IF("Category = 'परदेशस्थ (NRI)' — Country, City, Contributions to Community (multi-select) fields उघडतात."),
      IF("कोणत्याही dropdown option = 'इतर (Other)' — त्यासाठीचे free-text 'नमूद करा' input उघडते."),

      // ============ SECTION C ============
      ...SECTION("C", "कुटुंबातील सदस्य", "Family Members"),
      P("प्रत्येक सदस्यासाठी 'सदस्य जोडा' बटणावर click करून dialog उघडते. एका कुटुंबात अनेक सदस्य जोडता येतात."),
      FIELD("नाव", "Name", "Text"),
      FIELD("नाते", "Relationship", "Dropdown"),
      BULLET("पत्नी, पती, मुलगा, मुलगी, वडील, आई, भाऊ, बहीण, सून, जावई, नातू, नात, इतर", 1),
      FIELD("वैवाहिक स्थिती", "Marital Status", "Dropdown (विवाहित / अविवाहित / विधवा / घटस्फोटित)"),
      IF("वैवाहिक स्थिती = 'विवाहित' — 'विवाहाचा प्रकार' (जातीय / आंतरजातीय) उघडते; आंतरजातीय ⇒ 'जोडीदाराची जात' text field."),
      FIELD("लिंग", "Gender", "Dropdown (पुरुष / स्त्री)"),
      FIELD("जन्मतारीख", "Date of Birth", "Date picker"),
      FIELD("वय", "Age", "Auto-calculated"),
      FIELD("मोबाईल", "Mobile", "Text"),

      SUB("मामेकुळ तपशील (प्रत्येक सदस्यासाठी)", "Maternal Family (per member)"),
      FIELD("नाव / संपूर्ण पत्ता / मोबाईल क्रमांक", "Name / Full Address / Mobile", "Text"),

      IF("नाते ∈ (मुलगा, मुलगी, भाऊ, बहीण) AND वैवाहिक स्थिती = 'विवाहित' — 'सासुरवाडी' section उघडते."),
      SUB("सासुरवाडी (In-Laws Family)", "In-Laws Family (conditional)"),
      FIELD("नाव / पतीचे नाव", "Name / Husband's Name (for daughter/sister)", "Text"),
      FIELD("संपूर्ण पत्ता", "Full Address", "Text"),
      FIELD("मोबाईल क्रमांक", "Mobile Number", "Text"),

      SUB("शिक्षण व नौकरी / व्यवसाय", "Education & Occupation (same cascading dropdowns as Section B)"),
      BULLET("सदस्यासाठी section B प्रमाणेच cascading Education व Occupation dropdowns."),

      SUB("जर सदस्य महिला असेल — अतिरिक्त प्रश्न", "If Member is Female — additional questions"),
      IF("लिंग = 'स्त्री' — खालील block उघडतो."),
      FIELD("आपण महिला बचत गटाची सदस्य आहात का?", "Are you a member of Mahila Bachat Gat?", "Radio (होय / नाही)"),
      IF("उत्तर = 'नाही' — 'कोहळी समाज महिला बचत गटामध्ये सहभागी व्हायला आवडेल का?' प्रश्न उघडतो (होय / नाही)."),
      FIELD("आपण सध्या ग्रामोद्योग / घरगुती व्यवसाय करता का?", "Do you run any rural / home-based business?", "Radio"),
      IF("उत्तर = 'होय' — 'व्यवसायाचे नाव लिहा' text field उघडते."),
      IF("उत्तर = 'नाही' — 'भविष्यात ग्रामोद्योग सुरू करण्याची इच्छा आहे का?' प्रश्न उघडतो."),
      IF("इच्छा = 'होय' — 'कोणता ग्रामोद्योग सुरू करायचा?' text field उघडते."),

      // ============ SECTION D ============
      ...SECTION("D", "धारण केलेले पद (राजकीय, सामाजिक, लोकप्रतिनिधी)", "Positions Held (Political / Social / Representative)"),
      FIELD("कुटुंबातील कोणी धारण केलेले पद आहे का?", "Anyone in family holding a position?", "Radio (होय / नाही)"),
      IF("उत्तर = 'होय' — 'पद जोडा' बटणाने dialog उघडते; एका कुटुंबात अनेक पदे जोडता येतात."),

      SUB("पद जोडणे — Dialog Fields", "Add Position — Dialog Fields"),
      FIELD("व्यक्तीचे नाव *", "Person's Name", "Dropdown — कुटुंब प्रमुख + सदस्य यांच्यातून"),
      FIELD("पदाचा प्रकार *", "Position Type", "Dropdown — राजकीय / सामाजिक / लोकप्रतिनिधी"),
      FIELD("वर्तमान स्थिती", "Current Status", "Dropdown — आजी / माजी"),

      IF("पदाचा प्रकार = 'राजकीय' — खालील fields उघडतात."),
      FIELD("राजकीय पद", "Political Level", "Dropdown", 1),
      BULLET("प्रदेश पदाधिकारी / जिल्हा पदाधिकारी / तालुका पदाधिकारी / गाव पदाधिकारी", 2),
      FIELD("पक्षाचे नाव", "Party Name", "Text", 1),

      IF("पदाचा प्रकार = 'लोकप्रतिनिधी' — खालील fields उघडतात."),
      FIELD("लोकप्रतिनिधी पद", "Representative Type", "Dropdown", 1),
      BULLET("खासदार, आमदार, जिल्हा परिषद सदस्य, पंचायत समिती, नगरपरिषद, नगरपंचायत, ग्रामपंचायत, Co-operative Bank, Co-operative Society, कृषी उत्पन्न बाजार समिती, तालुका खरेदी-विक्री संघ, पतसंस्था", 2),
      IF("Representative Type निवडल्यावर — त्या पदातील उपलब्ध 'पद / भूमिका' dropdown उघडते (उदा. अध्यक्ष / उपाध्यक्ष / सभापती / सदस्य / सरपंच / उपसरपंच / पोलीस पाटील / कोतवाल इ.)."),
      IF("Representative Type ∈ (Co-operative Bank, Co-operative Society, पतसंस्था) — 'संस्थेचे नाव / पतसंस्थेचे नाव' text field उघडते."),
      IF("भूमिका (coop_role) निवडल्यावर — 'कार्यकाळ (Period)' साठी वर्ष-पासून व वर्ष-पर्यंत dropdowns आणि 'पक्षाचे नाव' dropdown उघडते."),
      FIELD("पक्षाचे नाव", "Party Name", "Dropdown", 1),
      BULLET("BJP, INC, NCP, NCP (शरदचंद्र पवार), Shiv Sena, Shiv Sena (उद्धव ठाकरे), MNS, अपक्ष (Independent), इतर (Other)", 2),
      IF("पक्षाचे नाव = 'इतर (Other)' — 'पक्षाचे नाव लिहा' text field उघडते."),

      IF("पदाचा प्रकार = 'सामाजिक' — खालील fields उघडतात."),
      FIELD("संस्था", "Organisation", "Dropdown — सामाजिक संस्था / शैक्षणिक संस्था", 1),
      IF("संस्था निवडल्यावर — 'पद' dropdown उघडतो: पदाधिकारी / अध्यक्ष / उपाध्यक्ष / सचिव / सदस्य."),

      // ============ SECTION E ============
      ...SECTION("E", "कौटुंबिक आवश्यक गरजा (घरातील वापराच्या वस्तू)", "Household Items & Basic Needs"),
      FIELD("घरातील वस्तू (एकापेक्षा अधिक निवडा)", "Household Items (multi-select)", "Checkboxes"),
      BULLET("मोबाईल, टीव्ही, फ्रिज, गॅस शेगडी, कॉम्प्युटर, सायकल, दोन चाकी वाहन, ऑटो, चार चाकी वाहन", 1),
      IF("एखादी वस्तू निवडल्यावर — त्या वस्तूची 'संख्या' निवडण्यासाठी 1–10 dropdown उघडते."),

      FIELD("तुमच्या घरी सौर ऊर्जा (Solar Panel) प्रणाली बसविण्यात आलेली आहे का?", "Is Solar Panel installed at home?", "Radio (होय / नाही)"),
      IF("उत्तर = 'नाही' — 'तुम्हाला सौर ऊर्जा योजनेचा लाभ घ्यायचा आहे का?' Radio field उघडतो."),

      // ============ SECTION F ============
      ...SECTION("F", "घर विषयक माहिती", "House Information"),
      FIELD("स्वतःचे घर आहे काय?", "Do you own a house?", "Radio (होय / नाही)"),
      IF("उत्तर = 'होय' — 'घराचा प्रकार' dropdown उघडते: कच्चा / पक्का."),
      IF("उत्तर = 'नाही' — 'राहण्याची स्थिती' dropdown उघडते: भाड्याचे / आश्रित."),
      IF("उत्तर = 'नाही' — 'तुम्हाला घरकुल योजनेचा लाभ मिळाला आहे का?' Radio उघडते."),
      IF("घरकुल मिळाला = 'नाही' — 'तुम्हाला घरकुल योजनेचा लाभ घ्यायचा आहे का?' Radio उघडते."),

      // ============ SECTION G ============
      ...SECTION("G", "शेती विषयक माहिती", "Agriculture Information"),
      FIELD("शेतजमीन आहे काय?", "Do you have farmland?", "Radio (होय / नाही)"),
      IF("उत्तर = 'होय' — खालील सर्व शेती-संबंधित sections उघडतात."),

      SUB("शेती तपशील", "Farm Details"),
      FIELD("एकूण शेती", "Total Farmland", "Dropdown"),
      BULLET("< 1 एकर, 1–5 एकर, 5–10 एकर, 10–20 एकर, > 20 एकर", 1),

      SUB("पीक प्रकाराविषयी माहिती", "Crops (repeatable)"),
      P("'पीक जोडा' बटणाने एकाहून अधिक पिके जोडता येतात."),
      FIELD("पिक हंगाम", "Crop Season", "Dropdown"),
      BULLET("खरीप, रब्बी (धान सोडून), उन्हाळी (धानासह), घेतलेली पिके", 1),

      SUB("क्षेत्र (एकरमध्ये)", "Area (in acres)"),
      FIELD("ओलिताखालील क्षेत्र", "Irrigated Area", "Number"),
      FIELD("कोरडवाहू क्षेत्र", "Dryland Area", "Number"),

      SUB("हंगामनिहाय लागवड क्षेत्र", "Season-wise Cultivated Area"),
      FIELD("खरीप हंगामाखालील क्षेत्र", "Kharif Area (acres)", "Number"),
      FIELD("रब्बी हंगामाखालील क्षेत्र (धान सोडून)", "Rabi Area — excluding paddy (acres)", "Number"),
      FIELD("उन्हाळी हंगामाखालील क्षेत्र (धानासह)", "Summer Area — including paddy (acres)", "Number"),

      SUB("प्रमुख पीक प्रकार", "Major Crop Types (multi-select)"),
      BULLET("धान्य पिके, कडधान्य पिके, तेलबिया पिके, भाजीपाला पिके, फळबाग, नगदी पिके, मसाला पिके, इतर"),
      IF("'इतर' निवडल्यास — 'इतर पीक प्रकार' text field उघडते."),

      SUB("सिंचनाचे साधन", "Irrigation Sources"),
      P("प्रत्येक source साठी checkbox + 'संख्या' (1–20) dropdown."),
      BULLET("ट्युबवेल / बोअरवेल — checkbox निवडल्यास 'विद्युत पंप' / 'सौर पंप' checkboxes उघडतात."),
      BULLET("विहीर — checkbox निवडल्यास 'विद्युत पंप' / 'सौर पंप' checkboxes उघडतात."),
      BULLET("शेततलाव — फक्त संख्या."),
      BULLET("तलाव — निवडल्यास 'हा तलाव कोहळी समाजाच्या मालगुजारीचे तलाव आहे का?' (होय / नाही) प्रश्न उघडतो."),
      IF("मालगुजारीचे तलाव = 'होय' — 'सिंचनासाठी या तलावाचे पाणी मोफत उपलब्ध होते का?' (होय / नाही) उघडते."),
      BULLET("नदी — फक्त संख्या."),
      BULLET("नहर — फक्त संख्या."),

      SUB("शेती विषयक साधने", "Farming Tools / Equipment"),
      P("प्रत्येक साधनासाठी 'आहे / नाही' प्रश्न. 'होय' → संख्या. 'नाही' → 'घ्यायची इच्छा आहे का?' → 'होय' → 'कर्जाची आवश्यकता आहे का?'"),
      BULLET("1. ट्रॅक्टर"),
      BULLET("2. हार्वेस्टर (Harvestor)"),
      BULLET("3. रोटावेटर (Rotavator)"),
      BULLET("4. कल्टिवेटर (Cultivator)"),
      BULLET("5. ट्रॅक्टर ट्रॉली (Tractor Trolley)"),
      BULLET("6. इतर आधुनिक कृषी अवजारे वापरता का? (होय / नाही) — 'होय' असल्यास 'कृपया नमूद करा' text field उघडते."),

      SUB("शेती व्यवस्थापन प्रकार", "Farm Management Type"),
      FIELD("आपण ठेक्याने (Contract) किंवा बटाईने (Share Cropping) शेती करता का?", "Do you practice Contract / Share Cropping?", "Radio"),
      IF("उत्तर = 'होय' — 'ठेक्याने / बटाईने केलेल्या शेतीचे क्षेत्र (एकरमध्ये)' number field उघडते."),

      // ============ SECTION H ============
      ...SECTION("H", "सामाजिक व आर्थिक लाभार्थी माहिती", "Social & Economic Beneficiary Information"),

      SUB("1. मुख्यमंत्री लाडकी बहीण योजना", "Ladki Bahin Yojana"),
      FIELD("आपल्या घरामध्ये 'मुख्यमंत्री लाडकी बहीण योजना' चे लाभार्थी आहेत का?", "Any Ladki Bahin beneficiary in the family?", "Radio (होय / नाही)"),
      NOTE("लाभार्थी / बिगर-लाभार्थी fields फक्त कुटुंबातील 'लिंग = स्त्री' असलेल्या नावांमधूनच निवडता येतात.",
           "Dropdowns only show female members (head + members with gender = स्त्री)."),
      IF("उत्तर = 'होय' — 'लाभार्थी सदस्य निवडा' dropdown (केवळ स्त्री नावे) उघडते. 'Add' करून एकाहून अधिक स्त्रियांची निवड करता येते."),
      BULLET("प्रत्येक निवडलेल्या स्त्रीसाठी — 'या योजनेचा लाभ नियमितपणे मिळतो का?' (होय / नाही)"),
      IF("नियमित लाभ = 'नाही' — 'लाभ मिळत नसल्यास मुख्य कारण' dropdown उघडते."),
      BULLET("KYC पूर्ण नाही / KYC प्रलंबित", 1),
      BULLET("आधार कार्ड व बँक खाते लिंक नाही", 1),
      BULLET("बँक खात्यात DBT सक्रिय नाही", 1),
      BULLET("अर्जाची पडताळणी प्रलंबित", 1),
      BULLET("अर्जातील माहिती/कागदपत्रांमध्ये त्रुटी", 1),
      BULLET("बँक खाते निष्क्रिय / बंद / चुकीचे", 1),
      BULLET("इतर — free-text 'कारण नमूद करा' input उघडते", 1),
      IF("उत्तर = 'नाही' (बिगर-लाभार्थी) — 'बिगर-लाभार्थी सदस्य निवडा' dropdown (स्त्री नावे) उघडते; प्रत्येकीसाठी 'कारण' dropdown वरील सारखेच."),

      SUB("2. दुर्धर आजार (Critical Illness)", "Critical Illness"),
      FIELD("आपल्या कुटुंबात दुर्धर आजाराने बाधित रुग्ण आहे का? (Cancer / Heart / Kidney इ.)", "Any critical illness patient (Cancer / Heart / Kidney etc.)?", "Radio"),
      IF("उत्तर = 'होय' — 'वैद्यकीय सहाय्याची आवश्यकता आहे का?' Radio उघडते."),

      SUB("3. खेळाडू (Sportsperson)", "Sportsperson"),
      FIELD("राज्य / राष्ट्रीय / आंतरराष्ट्रीय स्तरावरील खेळाडू आहेत का?", "Any State/National/International sportsperson?", "Radio"),
      IF("उत्तर = 'होय' — 'खेळाचा प्रकार' (text) व 'स्तर' (Dropdown: State / National / International) उघडतात."),

      // ============ SECTION I ============
      ...SECTION("I", "उद्योजक / स्वयंरोजगार व रोजगार माहिती", "Entrepreneur / Self-employment & Employment"),

      SUB("1. उद्योजक / स्वयंरोजगार", "Entrepreneur / Self-employment"),
      FIELD("आपल्या कुटुंबातील सदस्य उद्योजक / स्वयंरोजगारात कार्यरत आहेत का?", "Any entrepreneur / self-employed member?", "Radio"),
      IF("उत्तर = 'होय' — 'तपशील व व्यवसायाचा पत्ता नमूद करा' Textarea उघडते."),

      SUB("2. जोडधंदा / अतिरिक्त व्यवसाय", "Side Business"),
      FIELD("आपल्या कुटुंबात जोडधंदा / अतिरिक्त व्यवसाय (Side Business) आहे का?", "Does the family run a side business?", "Radio"),
      IF("उत्तर = 'होय' — 'व्यवसायाचे स्वरूप व तपशील नमूद करा' Textarea उघडते."),

      // ============ TRANSLATE TOGGLE ============
      ...SECTION("★", "अतिरिक्त वैशिष्ट्ये", "Additional Features"),
      SUB("Google Translate Toggle", "Language toggle"),
      BULLET("Form च्या वर उजव्या कोपऱ्यात 'English / मराठी' button. Click केल्यावर संपूर्ण form Google Translate द्वारे English मध्ये / परत मराठीत भाषांतरित होते."),
      BULLET("जतन (Save) होणारा data नेहमी मूळ मराठी keys मध्येच saved होतो — translation फक्त प्रदर्शनासाठी."),

      SP(),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 240 },
        children: [new TextRun({ text: "— समाप्त / End of Document —", italics: true, color: "888888" })],
      }),
    ],
  }],
});

const outDir = path.resolve("public");
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, "form-structure.docx");
Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(outPath, buf);
  console.log("Wrote", outPath, buf.length, "bytes");
});
