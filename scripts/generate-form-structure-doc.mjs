// Generates two professional Form Structure Guides (English & Marathi)
// into /mnt/documents/ so they appear as downloadable artifacts.
//
// Usage: node scripts/generate-form-structure-doc.mjs

import fs from "node:fs";
import path from "node:path";
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  PageOrientation, BorderStyle, LevelFormat, Table, TableRow, TableCell,
  WidthType, ShadingType, PageBreak,
} from "docx";

// ---------------- CONTENT MODEL (bilingual) ----------------
// Each section: { badge, title:{mr,en}, groups:[{ title:{mr,en}, fields:[...], notes:[...] }] }
// Field: { name:{mr,en}, type:{mr,en}, options?:[{mr,en}], logic?:[{mr,en}] }

const sections = [
  {
    badge: "A",
    title: { mr: "भौगोलिक माहिती", en: "Geographic Information" },
    groups: [
      {
        title: { mr: "पत्रव्यवहाराचा पत्ता", en: "Correspondence Address" },
        fields: [
          { name: { mr: "जिल्हा", en: "District" }, type: { mr: "मजकूर", en: "Text" } },
          { name: { mr: "तालुका", en: "Taluka" }, type: { mr: "मजकूर", en: "Text" } },
          { name: { mr: "गाव *", en: "Village (required)" }, type: { mr: "मजकूर", en: "Text" } },
          { name: { mr: "पिनकोड", en: "Pincode" }, type: { mr: "मजकूर", en: "Text" } },
        ],
      },
      {
        title: { mr: "मूळ वस्ती", en: "Permanent Address" },
        fields: [
          {
            name: { mr: "पत्रव्यवहाराचा पत्ता समान आहे", en: "Same as Correspondence Address" },
            type: { mr: "Checkbox", en: "Checkbox" },
            logic: [{
              mr: "Checkbox निवडल्यास खालील चारही fields auto-fill व disabled होतात.",
              en: "If checked, the four fields below are auto-filled and disabled.",
            }],
          },
          { name: { mr: "मूळ जिल्हा", en: "Native District" }, type: { mr: "मजकूर", en: "Text" } },
          { name: { mr: "मूळ तालुका", en: "Native Taluka" }, type: { mr: "मजकूर", en: "Text" } },
          { name: { mr: "मूळ गाव / शहर", en: "Native Village / City" }, type: { mr: "मजकूर", en: "Text" } },
          { name: { mr: "मूळ पिनकोड", en: "Native Pincode" }, type: { mr: "मजकूर", en: "Text" } },
        ],
      },
    ],
  },
  {
    badge: "B",
    title: { mr: "कुटुंब प्रमुख माहिती", en: "Head of Family Information" },
    groups: [
      {
        title: { mr: "मूळ माहिती", en: "Basic Information" },
        fields: [
          { name: { mr: "कुटुंब प्रमुखाचा फोटो", en: "Head of Family Photo" }, type: { mr: "कॅमेरा / प्रतिमा अपलोड", en: "Camera / Image Upload" } },
          { name: { mr: "कुटुंब प्रमुखाचे नाव *", en: "Head of Family Name (required)" }, type: { mr: "मजकूर", en: "Text" } },
          { name: { mr: "मोबाईल क्रमांक", en: "Mobile Number" }, type: { mr: "मजकूर", en: "Text" } },
          { name: { mr: "समुदाय / जनजाती", en: "Community / Caste" }, type: { mr: "मजकूर", en: "Text" } },
          {
            name: { mr: "वैवाहिक स्थिती", en: "Marital Status" },
            type: { mr: "Dropdown", en: "Dropdown" },
            options: [
              { mr: "विवाहित", en: "Married" },
              { mr: "अविवाहित", en: "Unmarried" },
              { mr: "विधवा", en: "Widow" },
              { mr: "घटस्फोटित", en: "Divorced" },
            ],
            logic: [{
              mr: "'विवाहित' निवडल्यास 'विवाहाचा प्रकार' (जातीय / आंतरजातीय) उघडते; आंतरजातीय ⇒ 'जोडीदाराची जात' text field.",
              en: "If 'Married' → 'Type of Marriage' (Same-caste / Inter-caste) opens; Inter-caste ⇒ 'Spouse's Caste' text field opens.",
            }],
          },
          { name: { mr: "लिंग", en: "Gender" }, type: { mr: "Dropdown", en: "Dropdown" }, options: [{ mr: "पुरुष", en: "Male" }, { mr: "स्त्री", en: "Female" }] },
          { name: { mr: "जन्मतारीख", en: "Date of Birth" }, type: { mr: "Date picker (दिवस / महिना / वर्ष)", en: "Date picker (Day / Month / Year)" } },
          { name: { mr: "वय", en: "Age" }, type: { mr: "स्वयं-गणना (read-only)", en: "Auto-calculated (read-only)" } },
        ],
      },
      {
        title: { mr: "मामेकुळ तपशील", en: "Maternal Family Details" },
        fields: [
          { name: { mr: "नाव", en: "Name" }, type: { mr: "मजकूर", en: "Text" } },
          { name: { mr: "संपूर्ण पत्ता", en: "Full Address" }, type: { mr: "मजकूर", en: "Text" } },
          { name: { mr: "मोबाईल क्रमांक", en: "Mobile Number" }, type: { mr: "मजकूर", en: "Text" } },
        ],
      },
      {
        title: { mr: "शिक्षण (Cascading Dropdowns)", en: "Education (Cascading Dropdowns)" },
        notes: [{
          mr: "पायरी: शिक्षण स्तर → शाखा / गट → अभ्यासक्रम → संस्था प्रकार.",
          en: "Flow: Education Level → Stream / Group → Course → Institution Type.",
        }],
        fields: [
          {
            name: { mr: "शिक्षण स्तर", en: "Education Level" },
            type: { mr: "Dropdown", en: "Dropdown" },
            options: [
              { mr: "निरक्षर", en: "Illiterate" },
              { mr: "पूर्व-प्राथमिक", en: "Pre-Primary" },
              { mr: "प्राथमिक (इयत्ता 1–5)", en: "Primary (Std 1–5)" },
              { mr: "माध्यमिक (इयत्ता 6–10)", en: "Secondary (Std 6–10)" },
              { mr: "उच्च माध्यमिक (11 वी / 12 वी)", en: "Higher Secondary (Std 11 / 12)" },
              { mr: "पदविका / डिप्लोमा", en: "Diploma" },
              { mr: "पदवी", en: "Graduate" },
              { mr: "पदव्युत्तर", en: "Postgraduate" },
              { mr: "डॉक्टरेट / पीएच.डी.", en: "Doctorate / Ph.D." },
              { mr: "इतर", en: "Other" },
            ],
            logic: [
              { mr: "'निरक्षर' — पुढील dropdown उघडत नाही; value = 'निरक्षर'.", en: "'Illiterate' — no further dropdowns; value = 'Illiterate'." },
              { mr: "'पूर्व-प्राथमिक' — Course: Nursery / Jr. KG (LKG) / Sr. KG (UKG).", en: "'Pre-Primary' — Course: Nursery / Jr. KG (LKG) / Sr. KG (UKG)." },
              { mr: "'प्राथमिक' — Course: इयत्ता 1 वी ते 5 वी.", en: "'Primary' — Course: Std 1st to 5th." },
              { mr: "'माध्यमिक' — Course: इयत्ता 6 वी ते 10 वी (SSC).", en: "'Secondary' — Course: Std 6th to 10th (SSC)." },
              { mr: "'उच्च माध्यमिक' — Stream: Arts / Commerce / Science / Vocational; नंतर 11 वी / 12 वी.", en: "'Higher Secondary' — Stream: Arts / Commerce / Science / Vocational; then Std 11 / 12." },
              { mr: "Diploma / Graduate / PG / Doctorate — Stream (Arts / Commerce / Science / Engineering / Medical / Law इ.) व त्यानंतर Course dropdown.", en: "Diploma / Graduate / PG / Doctorate — Stream (Arts / Commerce / Science / Engineering / Medical / Law etc.) then Course dropdown." },
              { mr: "Course = 'इतर' — free-text 'नमूद करा' input उघडते.", en: "Course = 'Other' — free-text 'Please specify' input opens." },
              { mr: "Level ≠ 'निरक्षर' आणि Course निवडलेले असल्यास — 'संस्था प्रकार' dropdown उघडते.", en: "If Level ≠ 'Illiterate' and Course chosen — 'Institution Type' dropdown opens." },
            ],
          },
          {
            name: { mr: "संस्था प्रकार", en: "Institution Type" },
            type: { mr: "Dropdown", en: "Dropdown" },
            options: [
              { mr: "सरकारी", en: "Government" },
              { mr: "खाजगी", en: "Private" },
              { mr: "अनुदानित", en: "Aided" },
              { mr: "विना-अनुदानित", en: "Unaided" },
              { mr: "स्वायत्त", en: "Autonomous" },
            ],
          },
        ],
      },
      {
        title: { mr: "नौकरी / व्यवसाय (Cascading Dropdowns)", en: "Job / Occupation (Cascading Dropdowns)" },
        fields: [
          {
            name: { mr: "मुख्य श्रेणी", en: "Primary Category" },
            type: { mr: "Dropdown", en: "Dropdown" },
            options: [
              { mr: "शेतकरी", en: "Farmer" },
              { mr: "शेती + व्यवसाय", en: "Agriculture + Business" },
              { mr: "कृषी मजूर / शेतमजूर", en: "Farm Labour" },
              { mr: "स्वरोजगार", en: "Self Employed" },
              { mr: "व्यवसाय", en: "Business Owner" },
              { mr: "मानधनधारक पदाधिकारी", en: "Honorarium Based Position" },
              { mr: "सरकारी कर्मचारी", en: "Government Employee" },
              { mr: "खाजगी कर्मचारी", en: "Private Employee" },
              { mr: "शिक्षण क्षेत्र", en: "Education Sector" },
              { mr: "वैद्यकीय क्षेत्र", en: "Medical Sector" },
              { mr: "महिला व बाल विकास", en: "Women & Child Development" },
              { mr: "अभियंता", en: "Engineering Sector" },
              { mr: "बँकिंग व वित्तीय क्षेत्र", en: "Banking & Finance" },
              { mr: "न्यायव्यवस्था", en: "Judiciary" },
              { mr: "संरक्षण व सुरक्षा सेवा", en: "Defence & Security" },
              { mr: "निवृत्त / पेन्शनधारक", en: "Retired / Pensioner" },
              { mr: "बेरोजगार", en: "Unemployed" },
              { mr: "परदेशस्थ", en: "NRI" },
              { mr: "इतर", en: "Other" },
            ],
            logic: [
              { mr: "'शेतकरी' — Farming Types (multi-select), Land Size, Annual Income, Notes fields उघडतात.", en: "'Farmer' — Farming Types (multi-select), Land Size, Annual Income, Notes fields open." },
              { mr: "'सरकारी कर्मचारी' — Service Type (राज्य / केंद्र), Class (1–4), Designation, Department, Organisation, Posting Place, Income, Experience.", en: "'Government Employee' — Service Type (State / Central), Class (1–4), Designation, Department, Organisation, Posting Place, Income, Experience." },
              { mr: "'खाजगी कर्मचारी' — Sector, Designation, Organisation, Posting Place, Income, Experience.", en: "'Private Employee' — Sector, Designation, Organisation, Posting Place, Income, Experience." },
              { mr: "'शिक्षण क्षेत्र' — Institution Type, Institution Level, Designation, Branch (Arts / Sci …), Organisation.", en: "'Education Sector' — Institution Type, Institution Level, Designation, Branch (Arts / Sci …), Organisation." },
              { mr: "'वैद्यकीय क्षेत्र' — Institution Type (Govt / Private / Own Setup), Designation, Department, Hospital / Own Setup address.", en: "'Medical Sector' — Institution Type (Govt / Private / Own Setup), Designation, Department, Hospital / Own Setup address." },
              { mr: "'अभियंता' — Institution Type, Branch (Civil / Mechanical …), Designation, Organisation, Posting Place.", en: "'Engineering' — Institution Type, Branch (Civil / Mechanical …), Designation, Organisation, Posting Place." },
              { mr: "'बँकिंग व वित्तीय क्षेत्र' — Bank Type (RBI / Nationalized / Cooperative …), Designation, Branch, Organisation.", en: "'Banking & Finance' — Bank Type (RBI / Nationalized / Cooperative …), Designation, Branch, Organisation." },
              { mr: "'न्यायव्यवस्था' — Designation (Judge / Advocate …), Posting Place.", en: "'Judiciary' — Designation (Judge / Advocate …), Posting Place." },
              { mr: "'संरक्षण व सुरक्षा सेवा' — Force (Army / Navy / Air Force / BSF / Police …), Rank, Posting Place.", en: "'Defence & Security' — Force (Army / Navy / Air Force / BSF / Police …), Rank, Posting Place." },
              { mr: "'व्यवसाय' — Business Types (multi), Business Name, People Employed, Loan Needed → Loan Amount / Purpose.", en: "'Business Owner' — Business Types (multi), Business Name, People Employed, Loan Needed → Loan Amount / Purpose." },
              { mr: "'स्वरोजगार' — Self-Employed Types (सुतार / लोहार / प्लंबर …), Own Business? → Loan Needed → Loan Amount.", en: "'Self Employed' — Types (Carpenter / Blacksmith / Plumber …), Own Business? → Loan Needed → Loan Amount." },
              { mr: "'शेती + व्यवसाय' — शेती व व्यवसाय दोन्हीचे fields उघडतात.", en: "'Agriculture + Business' — both farming and business fields open." },
              { mr: "'मानधनधारक पदाधिकारी' — Position (Sarpanch / Police Patil / Kotwal …), Organisation, Income.", en: "'Honorarium Position' — Position (Sarpanch / Police Patil / Kotwal …), Organisation, Income." },
              { mr: "'निवृत्त' — Retired From, Designation, Pension Amount.", en: "'Retired' — Retired From, Designation, Pension Amount." },
              { mr: "'बेरोजगार' — Seeking Job?, Desired Sector, Skill Training?, Desired Business?, Wants Guidance?", en: "'Unemployed' — Seeking Job?, Desired Sector, Skill Training?, Desired Business?, Wants Guidance?" },
              { mr: "'परदेशस्थ' — Country, City, Contributions to Community (multi).", en: "'NRI' — Country, City, Contributions to Community (multi)." },
              { mr: "कोणत्याही dropdown = 'इतर' — त्यासाठीचे 'नमूद करा' free-text input उघडते.", en: "Any dropdown = 'Other' — the corresponding 'Please specify' free-text opens." },
            ],
          },
        ],
      },
    ],
  },
  {
    badge: "C",
    title: { mr: "कुटुंबातील सदस्य", en: "Family Members" },
    groups: [
      {
        title: { mr: "सदस्य जोडणे — Dialog", en: "Add Member — Dialog" },
        notes: [{ mr: "'सदस्य जोडा' बटणाने अनेक सदस्य जोडता येतात.", en: "Use 'Add Member' to add multiple family members." }],
        fields: [
          { name: { mr: "नाव", en: "Name" }, type: { mr: "मजकूर", en: "Text" } },
          {
            name: { mr: "नाते", en: "Relationship" },
            type: { mr: "Dropdown", en: "Dropdown" },
            options: [
              { mr: "पत्नी", en: "Wife" }, { mr: "पती", en: "Husband" },
              { mr: "मुलगा", en: "Son" }, { mr: "मुलगी", en: "Daughter" },
              { mr: "वडील", en: "Father" }, { mr: "आई", en: "Mother" },
              { mr: "भाऊ", en: "Brother" }, { mr: "बहीण", en: "Sister" },
              { mr: "सून", en: "Daughter-in-law" }, { mr: "जावई", en: "Son-in-law" },
              { mr: "नातू", en: "Grandson" }, { mr: "नात", en: "Granddaughter" },
              { mr: "इतर", en: "Other" },
            ],
          },
          {
            name: { mr: "वैवाहिक स्थिती", en: "Marital Status" },
            type: { mr: "Dropdown", en: "Dropdown" },
            options: [{ mr: "विवाहित", en: "Married" }, { mr: "अविवाहित", en: "Unmarried" }, { mr: "विधवा", en: "Widow" }, { mr: "घटस्फोटित", en: "Divorced" }],
            logic: [{ mr: "'विवाहित' — 'विवाहाचा प्रकार' (जातीय / आंतरजातीय); आंतरजातीय ⇒ 'जोडीदाराची जात'.", en: "'Married' — 'Type of Marriage' (Same-caste / Inter-caste); Inter-caste ⇒ 'Spouse's Caste'." }],
          },
          { name: { mr: "लिंग", en: "Gender" }, type: { mr: "Dropdown", en: "Dropdown" }, options: [{ mr: "पुरुष", en: "Male" }, { mr: "स्त्री", en: "Female" }] },
          { name: { mr: "जन्मतारीख", en: "Date of Birth" }, type: { mr: "Date picker", en: "Date picker" } },
          { name: { mr: "वय", en: "Age" }, type: { mr: "स्वयं-गणना", en: "Auto-calculated" } },
          { name: { mr: "मोबाईल", en: "Mobile" }, type: { mr: "मजकूर", en: "Text" } },
        ],
      },
      {
        title: { mr: "मामेकुळ (प्रत्येक सदस्यासाठी)", en: "Maternal Family (per member)" },
        fields: [
          { name: { mr: "नाव / संपूर्ण पत्ता / मोबाईल", en: "Name / Full Address / Mobile" }, type: { mr: "मजकूर", en: "Text" } },
        ],
      },
      {
        title: { mr: "सासुरवाडी (Conditional)", en: "In-Laws Family (Conditional)" },
        notes: [{
          mr: "जर नाते ∈ (मुलगा, मुलगी, भाऊ, बहीण) AND वैवाहिक स्थिती = 'विवाहित' — तर हे section उघडते.",
          en: "If Relationship ∈ (Son, Daughter, Brother, Sister) AND Marital Status = 'Married' — this section opens.",
        }],
        fields: [
          { name: { mr: "नाव / पतीचे नाव", en: "Name / Husband's Name" }, type: { mr: "मजकूर", en: "Text" } },
          { name: { mr: "संपूर्ण पत्ता", en: "Full Address" }, type: { mr: "मजकूर", en: "Text" } },
          { name: { mr: "मोबाईल क्रमांक", en: "Mobile Number" }, type: { mr: "मजकूर", en: "Text" } },
        ],
      },
      {
        title: { mr: "शिक्षण व नौकरी / व्यवसाय", en: "Education & Occupation" },
        notes: [{ mr: "Section B प्रमाणेच cascading Education व Occupation dropdowns.", en: "Same cascading Education and Occupation dropdowns as Section B." }],
        fields: [],
      },
      {
        title: { mr: "स्त्री सदस्यांसाठी अतिरिक्त प्रश्न", en: "Additional Questions for Female Members" },
        notes: [{ mr: "फक्त लिंग = 'स्त्री' असलेल्या सदस्यांसाठी दिसते.", en: "Visible only for members with Gender = Female." }],
        fields: [
          {
            name: { mr: "आपण महिला बचत गटाच्या सदस्य आहात का?", en: "Are you a member of Mahila Bachat Gat?" },
            type: { mr: "Radio (होय / नाही)", en: "Radio (Yes / No)" },
            logic: [{ mr: "'नाही' — 'कोहळी समाज महिला बचत गटामध्ये सहभागी व्हायला आवडेल का?' प्रश्न उघडतो.", en: "'No' — 'Would you like to join Kohli Samaj Mahila Bachat Gat?' opens." }],
          },
          {
            name: { mr: "आपण सध्या ग्रामोद्योग / घरगुती व्यवसाय करता का?", en: "Do you run any rural / home-based business?" },
            type: { mr: "Radio", en: "Radio" },
            logic: [
              { mr: "'होय' — 'व्यवसायाचे नाव लिहा' text field उघडते.", en: "'Yes' — 'Enter business name' text field opens." },
              { mr: "'नाही' — 'भविष्यात ग्रामोद्योग सुरू करण्याची इच्छा आहे का?' प्रश्न उघडतो; 'होय' ⇒ 'कोणता ग्रामोद्योग सुरू करायचा?' text field.", en: "'No' — 'Do you wish to start a rural business in future?' opens; 'Yes' ⇒ 'Which business?' text field opens." },
            ],
          },
        ],
      },
    ],
  },
  {
    badge: "D",
    title: { mr: "धारण केलेले पद (राजकीय / सामाजिक / लोकप्रतिनिधी)", en: "Positions Held (Political / Social / Representative)" },
    groups: [
      {
        title: { mr: "मुख्य प्रश्न", en: "Main Question" },
        fields: [
          {
            name: { mr: "कुटुंबातील कोणी धारण केलेले पद आहे का?", en: "Anyone in family holding a position?" },
            type: { mr: "Radio (होय / नाही)", en: "Radio (Yes / No)" },
            logic: [{ mr: "'होय' — 'पद जोडा' dialog उघडते; अनेक पदे जोडता येतात.", en: "'Yes' — 'Add Position' dialog opens; multiple positions can be added." }],
          },
        ],
      },
      {
        title: { mr: "पद जोडणे — Dialog", en: "Add Position — Dialog Fields" },
        fields: [
          { name: { mr: "व्यक्तीचे नाव *", en: "Person's Name" }, type: { mr: "Dropdown — कुटुंब प्रमुख + सदस्य", en: "Dropdown — Head + Members" } },
          {
            name: { mr: "पदाचा प्रकार *", en: "Position Type" },
            type: { mr: "Dropdown", en: "Dropdown" },
            options: [{ mr: "राजकीय", en: "Political" }, { mr: "सामाजिक", en: "Social" }, { mr: "लोकप्रतिनिधी", en: "Representative" }],
          },
          { name: { mr: "वर्तमान स्थिती", en: "Current Status" }, type: { mr: "Dropdown", en: "Dropdown" }, options: [{ mr: "आजी", en: "Current" }, { mr: "माजी", en: "Former" }] },
        ],
      },
      {
        title: { mr: "राजकीय — Conditional Fields", en: "Political — Conditional Fields" },
        notes: [{ mr: "पदाचा प्रकार = 'राजकीय' असल्यास दिसतात.", en: "Shown when Position Type = 'Political'." }],
        fields: [
          {
            name: { mr: "राजकीय पद", en: "Political Level" },
            type: { mr: "Dropdown", en: "Dropdown" },
            options: [
              { mr: "प्रदेश पदाधिकारी", en: "State Office-bearer" },
              { mr: "जिल्हा पदाधिकारी", en: "District Office-bearer" },
              { mr: "तालुका पदाधिकारी", en: "Taluka Office-bearer" },
              { mr: "गाव पदाधिकारी", en: "Village Office-bearer" },
            ],
          },
          { name: { mr: "पक्षाचे नाव", en: "Party Name" }, type: { mr: "Dropdown (BJP / INC / NCP / …)", en: "Dropdown (BJP / INC / NCP / …)" }, logic: [{ mr: "'इतर' — 'पक्षाचे नाव लिहा' text field उघडते.", en: "'Other' — 'Enter party name' text field opens." }] },
        ],
      },
      {
        title: { mr: "लोकप्रतिनिधी — Conditional Fields", en: "Representative — Conditional Fields" },
        notes: [{ mr: "पदाचा प्रकार = 'लोकप्रतिनिधी' असल्यास दिसतात.", en: "Shown when Position Type = 'Representative'." }],
        fields: [
          {
            name: { mr: "लोकप्रतिनिधी पद", en: "Representative Type" },
            type: { mr: "Dropdown", en: "Dropdown" },
            options: [
              { mr: "खासदार", en: "MP" }, { mr: "आमदार", en: "MLA" },
              { mr: "जिल्हा परिषद सदस्य", en: "Zilla Parishad Member" },
              { mr: "पंचायत समिती सदस्य", en: "Panchayat Samiti Member" },
              { mr: "नगरपरिषद सदस्य", en: "Municipal Council Member" },
              { mr: "नगरपंचायत", en: "Nagar Panchayat" },
              { mr: "ग्रामपंचायत", en: "Gram Panchayat" },
              { mr: "Co-operative Bank", en: "Co-operative Bank" },
              { mr: "Co-operative Society", en: "Co-operative Society" },
              { mr: "कृषी उत्पन्न बाजार समिती", en: "APMC" },
              { mr: "तालुका खरेदी-विक्री संघ", en: "Taluka Purchase-Sale Union" },
              { mr: "पतसंस्था", en: "Credit Society" },
            ],
            logic: [
              { mr: "निवडलेल्या पदानुसार 'भूमिका' dropdown (अध्यक्ष / उपाध्यक्ष / सभापती / सदस्य / सरपंच इ.) उघडतो.", en: "A 'Role' dropdown (President / VP / Chairman / Member / Sarpanch etc.) opens per selected type." },
              { mr: "Co-operative Bank / Society / पतसंस्था — 'संस्थेचे नाव' text field उघडते.", en: "Co-operative Bank / Society / Credit Society — 'Institution Name' text field opens." },
              { mr: "भूमिका निवडल्यावर — कार्यकाळ (वर्ष-पासून / वर्ष-पर्यंत) व पक्षाचे नाव dropdowns उघडतात.", en: "After Role selection — Period (year from / year to) and Party Name dropdowns open." },
            ],
          },
        ],
      },
      {
        title: { mr: "सामाजिक — Conditional Fields", en: "Social — Conditional Fields" },
        notes: [{ mr: "पदाचा प्रकार = 'सामाजिक' असल्यास दिसतात.", en: "Shown when Position Type = 'Social'." }],
        fields: [
          { name: { mr: "संस्था", en: "Organisation" }, type: { mr: "Dropdown", en: "Dropdown" }, options: [{ mr: "सामाजिक संस्था", en: "Social Organisation" }, { mr: "शैक्षणिक संस्था", en: "Educational Institution" }] },
          { name: { mr: "पद", en: "Role" }, type: { mr: "Dropdown", en: "Dropdown" }, options: [{ mr: "पदाधिकारी", en: "Office-bearer" }, { mr: "अध्यक्ष", en: "President" }, { mr: "उपाध्यक्ष", en: "Vice President" }, { mr: "सचिव", en: "Secretary" }, { mr: "सदस्य", en: "Member" }] },
        ],
      },
    ],
  },
  {
    badge: "E",
    title: { mr: "कौटुंबिक आवश्यक गरजा", en: "Household Items & Basic Needs" },
    groups: [
      {
        title: { mr: "घरातील वस्तू", en: "Household Items" },
        fields: [
          {
            name: { mr: "घरातील वस्तू (multi-select)", en: "Household Items (multi-select)" },
            type: { mr: "Checkboxes", en: "Checkboxes" },
            options: [
              { mr: "मोबाईल", en: "Mobile" }, { mr: "टीव्ही", en: "TV" }, { mr: "फ्रिज", en: "Fridge" },
              { mr: "गॅस शेगडी", en: "Gas Stove" }, { mr: "कॉम्प्युटर", en: "Computer" },
              { mr: "सायकल", en: "Bicycle" }, { mr: "दोन चाकी वाहन", en: "Two-wheeler" },
              { mr: "ऑटो", en: "Auto" }, { mr: "चार चाकी वाहन", en: "Four-wheeler" },
            ],
            logic: [{ mr: "वस्तू निवडल्यास त्याची 'संख्या' (1–10) dropdown उघडते.", en: "Selecting an item opens a 'Quantity' dropdown (1–10)." }],
          },
        ],
      },
      {
        title: { mr: "सौर ऊर्जा", en: "Solar Energy" },
        fields: [
          {
            name: { mr: "घरी सौर ऊर्जा (Solar Panel) बसविलेली आहे का?", en: "Is a Solar Panel installed at home?" },
            type: { mr: "Radio (होय / नाही)", en: "Radio (Yes / No)" },
            logic: [{ mr: "'नाही' — 'सौर ऊर्जा योजनेचा लाभ घ्यायचा आहे का?' Radio उघडतो.", en: "'No' — 'Do you want to avail the Solar Panel scheme?' Radio opens." }],
          },
        ],
      },
    ],
  },
  {
    badge: "F",
    title: { mr: "घर विषयक माहिती", en: "House Information" },
    groups: [{
      title: { mr: "घराचा तपशील", en: "House Details" },
      fields: [
        {
          name: { mr: "स्वतःचे घर आहे काय?", en: "Do you own a house?" },
          type: { mr: "Radio (होय / नाही)", en: "Radio (Yes / No)" },
          logic: [
            { mr: "'होय' — 'घराचा प्रकार' dropdown: कच्चा / पक्का.", en: "'Yes' — 'House Type' dropdown: Kachcha / Pakka." },
            { mr: "'नाही' — 'राहण्याची स्थिती' dropdown: भाड्याचे / आश्रित; 'तुम्हाला घरकुल योजनेचा लाभ मिळाला आहे का?' Radio उघडते.", en: "'No' — 'Living Status' dropdown: Rented / Dependent; 'Have you received Gharkul scheme benefit?' Radio opens." },
            { mr: "घरकुल = 'नाही' — 'तुम्हाला घरकुल योजनेचा लाभ घ्यायचा आहे का?' Radio उघडते.", en: "Gharkul = 'No' — 'Do you want to avail the Gharkul scheme?' Radio opens." },
          ],
        },
      ],
    }],
  },
  {
    badge: "G",
    title: { mr: "शेती विषयक माहिती", en: "Agriculture Information" },
    groups: [
      {
        title: { mr: "प्रारंभिक प्रश्न", en: "Initial Question" },
        fields: [
          {
            name: { mr: "शेतजमीन आहे काय?", en: "Do you have farmland?" },
            type: { mr: "Radio (होय / नाही)", en: "Radio (Yes / No)" },
            logic: [{ mr: "'होय' — खालील सर्व शेती-संबंधित sections उघडतात.", en: "'Yes' — all farming-related sections below open." }],
          },
        ],
      },
      {
        title: { mr: "शेती तपशील", en: "Farm Details" },
        fields: [
          {
            name: { mr: "एकूण शेती", en: "Total Farmland" },
            type: { mr: "Dropdown", en: "Dropdown" },
            options: [
              { mr: "< 1 एकर", en: "< 1 acre" }, { mr: "1–5 एकर", en: "1–5 acres" },
              { mr: "5–10 एकर", en: "5–10 acres" }, { mr: "10–20 एकर", en: "10–20 acres" },
              { mr: "> 20 एकर", en: "> 20 acres" },
            ],
          },
        ],
      },
      {
        title: { mr: "पीक प्रकार (Repeatable)", en: "Crops (Repeatable)" },
        notes: [{ mr: "'पीक जोडा' बटणाने अनेक पिके जोडता येतात.", en: "Use 'Add Crop' to add multiple crops." }],
        fields: [
          { name: { mr: "पिक हंगाम", en: "Crop Season" }, type: { mr: "Dropdown", en: "Dropdown" }, options: [{ mr: "खरीप", en: "Kharif" }, { mr: "रब्बी (धान सोडून)", en: "Rabi (excl. paddy)" }, { mr: "उन्हाळी (धानासह)", en: "Summer (incl. paddy)" }, { mr: "घेतलेली पिके", en: "Crops Grown" }] },
        ],
      },
      {
        title: { mr: "क्षेत्र (एकरमध्ये)", en: "Area (in acres)" },
        fields: [
          { name: { mr: "ओलिताखालील क्षेत्र", en: "Irrigated Area" }, type: { mr: "Number", en: "Number" } },
          { name: { mr: "कोरडवाहू क्षेत्र", en: "Dryland Area" }, type: { mr: "Number", en: "Number" } },
          { name: { mr: "खरीप हंगाम क्षेत्र", en: "Kharif Area" }, type: { mr: "Number", en: "Number" } },
          { name: { mr: "रब्बी हंगाम क्षेत्र (धान सोडून)", en: "Rabi Area (excl. paddy)" }, type: { mr: "Number", en: "Number" } },
          { name: { mr: "उन्हाळी हंगाम क्षेत्र (धानासह)", en: "Summer Area (incl. paddy)" }, type: { mr: "Number", en: "Number" } },
        ],
      },
      {
        title: { mr: "प्रमुख पीक प्रकार", en: "Major Crop Types" },
        fields: [
          {
            name: { mr: "प्रमुख पीक प्रकार (multi-select)", en: "Major Crop Types (multi-select)" },
            type: { mr: "Checkboxes", en: "Checkboxes" },
            options: [
              { mr: "धान्य पिके", en: "Cereal Crops" }, { mr: "कडधान्य पिके", en: "Pulses" },
              { mr: "तेलबिया पिके", en: "Oilseeds" }, { mr: "भाजीपाला पिके", en: "Vegetables" },
              { mr: "फळबाग", en: "Orchards" }, { mr: "नगदी पिके", en: "Cash Crops" },
              { mr: "मसाला पिके", en: "Spice Crops" }, { mr: "इतर", en: "Other" },
            ],
            logic: [{ mr: "'इतर' — 'इतर पीक प्रकार' text field उघडते.", en: "'Other' — 'Other Crop Type' text field opens." }],
          },
        ],
      },
      {
        title: { mr: "सिंचनाचे साधन", en: "Irrigation Sources" },
        notes: [{ mr: "प्रत्येक source साठी checkbox + 'संख्या' (1–20) dropdown.", en: "Each source has a checkbox + 'Quantity' (1–20) dropdown." }],
        fields: [
          { name: { mr: "ट्युबवेल / बोअरवेल", en: "Tubewell / Borewell" }, type: { mr: "Checkbox + संख्या", en: "Checkbox + Quantity" }, logic: [{ mr: "निवडल्यास 'विद्युत पंप' / 'सौर पंप' checkboxes उघडतात.", en: "If selected, 'Electric Pump' / 'Solar Pump' checkboxes open." }] },
          { name: { mr: "विहीर", en: "Well" }, type: { mr: "Checkbox + संख्या", en: "Checkbox + Quantity" }, logic: [{ mr: "निवडल्यास 'विद्युत पंप' / 'सौर पंप' checkboxes उघडतात.", en: "If selected, 'Electric Pump' / 'Solar Pump' checkboxes open." }] },
          { name: { mr: "शेततलाव", en: "Farm Pond" }, type: { mr: "Checkbox + संख्या", en: "Checkbox + Quantity" } },
          { name: { mr: "तलाव", en: "Lake / Pond" }, type: { mr: "Checkbox + संख्या", en: "Checkbox + Quantity" }, logic: [
            { mr: "निवडल्यास 'हा तलाव कोहळी समाजाच्या मालगुजारीचा आहे का?' (होय / नाही) उघडतो.", en: "If selected, 'Is this a Kohli Samaj Malguzari pond?' (Yes / No) opens." },
            { mr: "मालगुजारीचे = 'होय' — 'सिंचनासाठी पाणी मोफत उपलब्ध होते का?' उघडतो.", en: "Malguzari = 'Yes' — 'Is water free for irrigation?' opens." },
          ] },
          { name: { mr: "नदी", en: "River" }, type: { mr: "Checkbox + संख्या", en: "Checkbox + Quantity" } },
          { name: { mr: "नहर", en: "Canal" }, type: { mr: "Checkbox + संख्या", en: "Checkbox + Quantity" } },
        ],
      },
      {
        title: { mr: "शेती विषयक साधने", en: "Farming Tools / Equipment" },
        notes: [{
          mr: "प्रत्येक साधनासाठी: 'आहे / नाही'. 'होय' → संख्या. 'नाही' → 'घ्यायची इच्छा आहे का?' → 'होय' → 'कर्जाची आवश्यकता आहे का?'",
          en: "For each tool: 'Yes / No'. 'Yes' → Quantity. 'No' → 'Wish to purchase?' → 'Yes' → 'Loan required?'",
        }],
        fields: [
          { name: { mr: "ट्रॅक्टर", en: "Tractor" }, type: { mr: "Radio + Conditional", en: "Radio + Conditional" } },
          { name: { mr: "हार्वेस्टर", en: "Harvester" }, type: { mr: "Radio + Conditional", en: "Radio + Conditional" } },
          { name: { mr: "रोटावेटर", en: "Rotavator" }, type: { mr: "Radio + Conditional", en: "Radio + Conditional" } },
          { name: { mr: "कल्टिवेटर", en: "Cultivator" }, type: { mr: "Radio + Conditional", en: "Radio + Conditional" } },
          { name: { mr: "ट्रॅक्टर ट्रॉली", en: "Tractor Trolley" }, type: { mr: "Radio + Conditional", en: "Radio + Conditional" } },
          { name: { mr: "इतर आधुनिक कृषी अवजारे", en: "Other Modern Farming Equipment" }, type: { mr: "Radio (होय / नाही)", en: "Radio (Yes / No)" }, logic: [{ mr: "'होय' — 'कृपया नमूद करा' text field उघडते.", en: "'Yes' — 'Please specify' text field opens." }] },
        ],
      },
      {
        title: { mr: "शेती व्यवस्थापन प्रकार", en: "Farm Management Type" },
        fields: [
          {
            name: { mr: "ठेक्याने / बटाईने शेती करता का?", en: "Contract / Share Cropping?" },
            type: { mr: "Radio (होय / नाही)", en: "Radio (Yes / No)" },
            logic: [{ mr: "'होय' — 'ठेक्याने / बटाईने केलेल्या शेतीचे क्षेत्र (एकरमध्ये)' number field उघडते.", en: "'Yes' — 'Contract / Share cropping area (in acres)' number field opens." }],
          },
        ],
      },
    ],
  },
  {
    badge: "H",
    title: { mr: "सामाजिक व आर्थिक लाभार्थी माहिती", en: "Social & Economic Beneficiary Information" },
    groups: [
      {
        title: { mr: "मुख्यमंत्री लाडकी बहीण योजना", en: "Ladki Bahin Yojana" },
        notes: [{
          mr: "लाभार्थी / बिगर-लाभार्थी fields फक्त 'लिंग = स्त्री' असलेल्या सदस्यांमधून निवडता येतात.",
          en: "Beneficiary / non-beneficiary dropdowns only show members with Gender = Female.",
        }],
        fields: [
          {
            name: { mr: "आपल्या घरामध्ये 'लाडकी बहीण योजना' चे लाभार्थी आहेत का?", en: "Any 'Ladki Bahin Yojana' beneficiary in the family?" },
            type: { mr: "Radio (होय / नाही)", en: "Radio (Yes / No)" },
            logic: [
              { mr: "'होय' — 'लाभार्थी सदस्य निवडा' dropdown (केवळ स्त्री नावे) उघडतो; 'Add' ने एकाहून अधिक निवडता येतात.", en: "'Yes' — 'Select beneficiary member(s)' dropdown (female names only) opens; 'Add' allows multiple selections." },
              { mr: "प्रत्येक निवडलेल्या स्त्रीसाठी — 'या योजनेचा लाभ नियमितपणे मिळतो का?' (होय / नाही).", en: "For each selected woman — 'Do you regularly receive the benefit?' (Yes / No)." },
              { mr: "नियमित लाभ = 'नाही' — 'लाभ मिळत नसल्यास मुख्य कारण' dropdown उघडतो.", en: "Regular benefit = 'No' — 'Main reason for not receiving benefit' dropdown opens." },
              { mr: "'नाही' (कोणी लाभार्थी नाही) — 'बिगर-लाभार्थी सदस्य निवडा' dropdown व कारण dropdown उघडतो.", en: "'No' (no beneficiary) — 'Select non-beneficiary member(s)' and reason dropdown open." },
            ],
          },
          {
            name: { mr: "लाभ न मिळण्याची कारणे", en: "Reasons for not receiving benefit" },
            type: { mr: "Dropdown", en: "Dropdown" },
            options: [
              { mr: "KYC पूर्ण नाही / प्रलंबित", en: "KYC not complete / pending" },
              { mr: "आधार कार्ड व बँक खाते लिंक नाही", en: "Aadhaar not linked with bank account" },
              { mr: "बँक खात्यात DBT सक्रिय नाही", en: "DBT not active in bank account" },
              { mr: "अर्जाची पडताळणी प्रलंबित", en: "Application verification pending" },
              { mr: "अर्जातील माहिती / कागदपत्रांमध्ये त्रुटी", en: "Errors in application / documents" },
              { mr: "बँक खाते निष्क्रिय / बंद / चुकीचे", en: "Bank account inactive / closed / wrong" },
              { mr: "इतर", en: "Other" },
            ],
            logic: [{ mr: "'इतर' — free-text 'कारण नमूद करा' input उघडतो.", en: "'Other' — free-text 'Please specify reason' input opens." }],
          },
        ],
      },
      {
        title: { mr: "दुर्धर आजार", en: "Critical Illness" },
        fields: [
          {
            name: { mr: "कुटुंबात दुर्धर आजाराने बाधित रुग्ण आहे का? (Cancer / Heart / Kidney इ.)", en: "Any critical illness patient (Cancer / Heart / Kidney etc.)?" },
            type: { mr: "Radio (होय / नाही)", en: "Radio (Yes / No)" },
            logic: [{ mr: "'होय' — 'वैद्यकीय सहाय्याची आवश्यकता आहे का?' Radio उघडतो.", en: "'Yes' — 'Do you need medical assistance?' Radio opens." }],
          },
        ],
      },
      {
        title: { mr: "खेळाडू", en: "Sportsperson" },
        fields: [
          {
            name: { mr: "राज्य / राष्ट्रीय / आंतरराष्ट्रीय स्तरावरील खेळाडू आहेत का?", en: "Any State / National / International sportsperson?" },
            type: { mr: "Radio (होय / नाही)", en: "Radio (Yes / No)" },
            logic: [{ mr: "'होय' — 'खेळाचा प्रकार' (text) व 'स्तर' (Dropdown: State / National / International).", en: "'Yes' — 'Sport type' (text) and 'Level' (Dropdown: State / National / International) open." }],
          },
        ],
      },
    ],
  },
  {
    badge: "I",
    title: { mr: "उद्योजक / स्वयंरोजगार व रोजगार माहिती", en: "Entrepreneur / Self-employment & Employment" },
    groups: [
      {
        title: { mr: "उद्योजक / स्वयंरोजगार", en: "Entrepreneur / Self-employment" },
        fields: [
          {
            name: { mr: "कुटुंबातील सदस्य उद्योजक / स्वयंरोजगारात आहेत का?", en: "Any entrepreneur / self-employed member?" },
            type: { mr: "Radio (होय / नाही)", en: "Radio (Yes / No)" },
            logic: [{ mr: "'होय' — 'तपशील व व्यवसायाचा पत्ता' Textarea उघडतो.", en: "'Yes' — 'Details & business address' Textarea opens." }],
          },
        ],
      },
      {
        title: { mr: "जोडधंदा / अतिरिक्त व्यवसाय", en: "Side Business" },
        fields: [
          {
            name: { mr: "कुटुंबात जोडधंदा / अतिरिक्त व्यवसाय आहे का?", en: "Does the family run a side business?" },
            type: { mr: "Radio (होय / नाही)", en: "Radio (Yes / No)" },
            logic: [{ mr: "'होय' — 'व्यवसायाचे स्वरूप व तपशील' Textarea उघडतो.", en: "'Yes' — 'Nature & details of business' Textarea opens." }],
          },
        ],
      },
    ],
  },
  {
    badge: "★",
    title: { mr: "अतिरिक्त वैशिष्ट्ये", en: "Additional Features" },
    groups: [
      {
        title: { mr: "Google Translate Toggle", en: "Google Translate Toggle" },
        notes: [
          { mr: "Form च्या वर उजव्या कोपऱ्यात 'English / मराठी' toggle button.", en: "'English / मराठी' toggle button appears at the top-right of the form." },
          { mr: "Click केल्यावर संपूर्ण form Google Translate द्वारे भाषांतरित होते.", en: "On click, the entire form is translated via Google Translate." },
          { mr: "जतन (Save) होणारा data नेहमी मूळ मराठी keys मध्येच saved होतो — translation फक्त प्रदर्शनासाठी.", en: "Saved data always uses the original Marathi keys — translation is display-only." },
        ],
        fields: [],
      },
    ],
  },
];

// ---------------- RENDERING HELPERS ----------------

const COLORS = {
  primary: "1E3A8A",
  accent: "0F766E",
  amber: "B45309",
  muted: "6B7280",
  soft: "F1F5F9",
  band: "E0E7FF",
  border: "CBD5E1",
};

const pick = (obj, lang) => (typeof obj === "string" ? obj : obj[lang]);

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

function headerRow(labels, widths, lang) {
  return new TableRow({
    tableHeader: true,
    children: labels.map((l, i) => cell(
      [new Paragraph({ children: [new TextRun({ text: pick(l, lang), bold: true, color: "FFFFFF" })] })],
      { width: widths[i], fill: COLORS.primary }
    )),
  });
}

function bulletsInCell(items, lang, opts = {}) {
  if (!items || items.length === 0) return [new Paragraph({ children: [new TextRun({ text: "—", color: COLORS.muted })] })];
  return items.map((it) => new Paragraph({
    spacing: { after: 40 },
    indent: { left: 100, hanging: 100 },
    children: [
      new TextRun({ text: "• ", color: opts.color || COLORS.muted, bold: true }),
      new TextRun({ text: pick(it, lang), color: opts.color || "1F2937" }),
    ],
  }));
}

function fieldTable(group, lang) {
  const widths = [3200, 1800, 2400, 2400]; // sum 9800 ~ landscape content
  const rows = [headerRow([
    { mr: "फील्ड", en: "Field" },
    { mr: "प्रकार", en: "Type" },
    { mr: "पर्याय", en: "Options" },
    { mr: "जर-तर तर्क", en: "Conditional Logic" },
  ], widths, lang)];

  group.fields.forEach((f, idx) => {
    rows.push(new TableRow({
      children: [
        cell([new Paragraph({ children: [new TextRun({ text: pick(f.name, lang), bold: true })] })], { width: widths[0], fill: idx % 2 === 0 ? "FFFFFF" : COLORS.soft }),
        cell([new Paragraph({ children: [new TextRun({ text: pick(f.type, lang), color: COLORS.accent })] })], { width: widths[1], fill: idx % 2 === 0 ? "FFFFFF" : COLORS.soft }),
        cell(bulletsInCell(f.options, lang), { width: widths[2], fill: idx % 2 === 0 ? "FFFFFF" : COLORS.soft }),
        cell(bulletsInCell(f.logic, lang, { color: COLORS.amber }), { width: widths[3], fill: idx % 2 === 0 ? "FFFFFF" : COLORS.soft }),
      ],
    }));
  });

  return new Table({
    width: { size: 9800, type: WidthType.DXA },
    columnWidths: widths,
    rows,
  });
}

function renderGroup(group, lang) {
  const nodes = [];
  nodes.push(new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 80 },
    children: [new TextRun({ text: pick(group.title, lang), bold: true, color: COLORS.accent })],
  }));
  if (group.notes && group.notes.length) {
    group.notes.forEach((n) => nodes.push(new Paragraph({
      spacing: { before: 40, after: 100 },
      border: { left: { style: BorderStyle.SINGLE, size: 18, color: COLORS.accent, space: 8 } },
      children: [
        new TextRun({ text: lang === "mr" ? "टीप: " : "Note: ", bold: true, color: COLORS.accent }),
        new TextRun({ text: pick(n, lang) }),
      ],
    })));
  }
  if (group.fields && group.fields.length) {
    nodes.push(fieldTable(group, lang));
  }
  return nodes;
}

function renderSection(section, lang, isFirst) {
  const nodes = [];
  if (!isFirst) nodes.push(new Paragraph({ children: [new PageBreak()] }));
  nodes.push(new Paragraph({
    spacing: { before: 120, after: 60 },
    shading: { fill: COLORS.band, type: ShadingType.CLEAR },
    children: [new TextRun({
      text: `  ${section.badge}   ${pick(section.title, lang)}  `,
      bold: true, size: 32, color: COLORS.primary,
    })],
  }));
  section.groups.forEach((g) => nodes.push(...renderGroup(g, lang)));
  return nodes;
}

function buildDoc(lang) {
  const isEn = lang === "en";
  const title = isEn ? "Kohli Samaj Vikas Mandal, Nagpur" : "कोहळी समाज विकास मंडळ, नागपूर";
  const subtitle = isEn ? "Family Survey — Form Structure Guide" : "कुटुंब सर्वेक्षण — फॉर्म संरचना मार्गदर्शक";
  const tagline = isEn
    ? "A professional, section-by-section reference covering every field, dropdown option, and conditional (if-then) logic branch."
    : "प्रत्येक section, field, dropdown option आणि जर-तर तर्कासह professional structured reference.";

  const cover = [
    new Paragraph({ spacing: { before: 800, after: 120 }, alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: title, bold: true, size: 44, color: COLORS.primary })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 },
      children: [new TextRun({ text: subtitle, bold: true, size: 32, color: COLORS.accent })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 },
      children: [new TextRun({ text: tagline, italics: true, color: COLORS.muted, size: 22 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: isEn ? "Language: English" : "भाषा: मराठी", bold: true, color: COLORS.primary })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 },
      children: [new TextRun({ text: isEn ? "Version 2.0" : "आवृत्ती 2.0", color: COLORS.muted })] }),
    new Paragraph({ children: [new PageBreak()] }),
    new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { after: 120 },
      children: [new TextRun({ text: isEn ? "Table of Contents" : "अनुक्रमणिका", bold: true, color: COLORS.primary })] }),
    ...sections.map((s) => new Paragraph({
      spacing: { after: 40 }, indent: { left: 200 },
      children: [
        new TextRun({ text: `${s.badge}.  `, bold: true, color: COLORS.accent }),
        new TextRun({ text: pick(s.title, lang) }),
      ],
    })),
    new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 80 },
      children: [new TextRun({ text: isEn ? "How to read this document" : "हे document कसे वाचावे", bold: true, color: COLORS.accent })] }),
    ...(isEn ? [
      "Each section lists its groups and the exact fields shown in the form.",
      "The Type column shows the input type: Text, Number, Dropdown, Radio, Checkbox, Date, Multi-select, Image upload.",
      "The Options column lists dropdown / radio / checkbox values.",
      "The Conditional Logic column shows which additional fields open based on the selected value.",
    ] : [
      "प्रत्येक section मध्ये त्याचे groups व फॉर्ममध्ये दिसणारे नेमके fields दिलेले आहेत.",
      "'प्रकार' column मध्ये input type दिलेला आहे: मजकूर, संख्या, Dropdown, Radio, Checkbox, Date, Multi-select, Image upload.",
      "'पर्याय' column मध्ये dropdown / radio / checkbox चे values दिलेले आहेत.",
      "'जर-तर तर्क' column मध्ये निवडलेल्या value नुसार कोणते अतिरिक्त fields उघडतात ते दर्शवले आहे.",
    ]).map((t) => new Paragraph({
      spacing: { after: 40 }, indent: { left: 360, hanging: 220 },
      children: [new TextRun({ text: "•  ", bold: true, color: COLORS.accent }), new TextRun({ text: t })],
    })),
  ];

  const body = sections.flatMap((s, i) => renderSection(s, lang, i === 0 ? false : false));

  return new Document({
    styles: {
      default: { document: { run: { font: "Nirmala UI", size: 22 } } },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 32, bold: true, font: "Nirmala UI", color: COLORS.primary },
          paragraph: { spacing: { before: 280, after: 140 }, outlineLevel: 0 } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 26, bold: true, font: "Nirmala UI", color: COLORS.accent },
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
      children: [...cover, new Paragraph({ children: [new PageBreak()] }), ...body],
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

await write("en", "Survey-Form-Structure-English.docx");
await write("mr", "Survey-Form-Structure-Marathi.docx");
