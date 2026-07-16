// Generates two hierarchical Form Structure Guides (English & Marathi)
// into /mnt/documents/ as tree-style outlines showing:
//   Main field → option chosen → sub-field(s) opened → option chosen → …
//
// Run:  node scripts/generate-form-hierarchy-doc.mjs

import fs from "node:fs";
import path from "node:path";
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  PageOrientation, BorderStyle, ShadingType, PageBreak,
} from "docx";

// ---------------- TREE MODEL ----------------
// Node types:
//   section  → top-level (A. भौगोलिक माहिती)
//   field    → a form field (Dropdown / Radio / Text / …)
//   option   → a specific choice inside a field ("होय", "शेतकरी", …)
//   opens    → a group of fields/questions that appear because of that option
//   note     → an inline explanatory note
//
// Every node has bilingual { mr, en } text. `children` nest arbitrarily deep.

const T = (mr, en) => ({ mr, en });

// ---------- reusable sub-trees ----------

const educationTree = {
  kind: "field",
  label: T("शिक्षण स्तर (Education Level)", "Education Level"),
  type: T("Dropdown", "Dropdown"),
  children: [
    { kind: "option", label: T("निरक्षर", "Illiterate"),
      children: [{ kind: "note", label: T("पुढील कोणतेही field उघडत नाही; value = 'निरक्षर'.", "No further fields open; value = 'Illiterate'.") }] },

    { kind: "option", label: T("पूर्व-प्राथमिक (Pre-Primary)", "Pre-Primary"),
      children: [
        { kind: "opens", label: T("→ अभ्यासक्रम (Course) dropdown उघडते", "→ Course dropdown opens"),
          children: [
            { kind: "option", label: T("Nursery (नर्सरी)", "Nursery") },
            { kind: "option", label: T("Jr. KG / LKG (ज्युनियर केजी)", "Jr. KG / LKG") },
            { kind: "option", label: T("Sr. KG / UKG (सिनियर केजी)", "Sr. KG / UKG") },
          ] },
        { kind: "opens", label: T("→ त्यानंतर 'संस्था प्रकार' dropdown उघडते", "→ Then 'Institution Type' dropdown opens"),
          children: [
            { kind: "option", label: T("सरकारी / खाजगी / अनुदानित / विना-अनुदानित / स्वायत्त", "Government / Private / Aided / Unaided / Autonomous") },
          ] },
      ] },

    { kind: "option", label: T("प्राथमिक (Primary)", "Primary"),
      children: [
        { kind: "opens", label: T("→ अभ्यासक्रम: इयत्ता 1 वी – 5 वी", "→ Course: Std 1 – 5") },
        { kind: "opens", label: T("→ संस्था प्रकार", "→ Institution Type") },
      ] },

    { kind: "option", label: T("माध्यमिक (Secondary)", "Secondary"),
      children: [
        { kind: "opens", label: T("→ अभ्यासक्रम: इयत्ता 6 वी – 10 वी (SSC)", "→ Course: Std 6 – 10 (SSC)") },
        { kind: "opens", label: T("→ संस्था प्रकार", "→ Institution Type") },
      ] },

    { kind: "option", label: T("उच्च माध्यमिक (Higher Secondary)", "Higher Secondary"),
      children: [
        { kind: "opens", label: T("→ शाखा / गट (Stream)", "→ Stream / Group"),
          children: [
            { kind: "option", label: T("Arts (कला)", "Arts"),
              children: [{ kind: "opens", label: T("→ Course: 11 वी Arts / 12 वी Arts", "→ Course: Std 11 Arts / Std 12 Arts") }] },
            { kind: "option", label: T("Commerce (वाणिज्य)", "Commerce"),
              children: [{ kind: "opens", label: T("→ Course: 11 वी Commerce / 12 वी Commerce", "→ Course: Std 11 Commerce / Std 12 Commerce") }] },
            { kind: "option", label: T("Science (विज्ञान)", "Science"),
              children: [{ kind: "opens", label: T("→ Course: 11 वी Science / 12 वी Science", "→ Course: Std 11 Science / Std 12 Science") }] },
            { kind: "option", label: T("Vocational (व्यावसायिक)", "Vocational"),
              children: [{ kind: "opens", label: T("→ Course: MCVC / Vocational / Agri / Technical", "→ Course: MCVC / Vocational / Agri / Technical") }] },
          ] },
        { kind: "opens", label: T("→ त्यानंतर संस्था प्रकार", "→ Then Institution Type") },
      ] },

    { kind: "option", label: T("पदविका / डिप्लोमा (Diploma)", "Diploma"),
      children: [
        { kind: "opens", label: T("→ शाखा (Stream)", "→ Stream"),
          children: [
            { kind: "option", label: T("Engineering Diploma", "Engineering Diploma"),
              children: [{ kind: "opens", label: T("→ Course: Civil / Mechanical / Electrical / Electronics / Computer / IT / Automobile / Chemical", "→ Course: Civil / Mechanical / Electrical / Electronics / Computer / IT / Automobile / Chemical") }] },
            { kind: "option", label: T("Technical Diploma", "Technical Diploma"),
              children: [{ kind: "opens", label: T("→ Course: Polytechnic / ITI Electrician / Fitter / Welder / Turner / COPA / Mechanic / Plumber", "→ Course: Polytechnic / ITI Electrician / Fitter / Welder / Turner / COPA / Mechanic / Plumber") }] },
            { kind: "option", label: T("Medical Diploma", "Medical Diploma"),
              children: [{ kind: "opens", label: T("→ Course: D.Pharm / B.Pharm / GNM / ANM / MLT / Radiology", "→ Course: D.Pharm / B.Pharm / GNM / ANM / MLT / Radiology") }] },
            { kind: "option", label: T("Education / Agriculture / Management / Computer / Other", "Education / Agriculture / Management / Computer / Other"),
              children: [{ kind: "opens", label: T("→ त्या शाखेतील Course dropdown उघडते", "→ Course dropdown for that stream opens") }] },
          ] },
        { kind: "opens", label: T("→ संस्था प्रकार", "→ Institution Type") },
      ] },

    { kind: "option", label: T("पदवी (Graduate)", "Graduate"),
      children: [
        { kind: "opens", label: T("→ शाखा (Stream)", "→ Stream"),
          children: [
            { kind: "option", label: T("Arts (BA)", "Arts (BA)"),
              children: [{ kind: "opens", label: T("→ Course: BA General / Marathi / English / History / Political Sci / Sociology / Economics / Psychology / Geography …", "→ Course: BA General / Marathi / English / History / Pol Sci / Sociology / Economics / Psychology / Geography …") }] },
            { kind: "option", label: T("Commerce", "Commerce"),
              children: [{ kind: "opens", label: T("→ Course: B.Com / B.Com (CA) / BAF / BFM / BBI", "→ Course: B.Com / B.Com (CA) / BAF / BFM / BBI") }] },
            { kind: "option", label: T("Science", "Science"),
              children: [{ kind: "opens", label: T("→ Course: B.Sc / Physics / Chemistry / Maths / CS / IT / Biotech / Microbiology / Agri / Nursing", "→ Course: B.Sc / Physics / Chemistry / Maths / CS / IT / Biotech / Microbiology / Agri / Nursing") }] },
            { kind: "option", label: T("Engineering (BE / B.Tech)", "Engineering (BE / B.Tech)"),
              children: [{ kind: "opens", label: T("→ Course: Civil / Mechanical / Electrical / Computer / IT / AI & Data Science / Cyber Security …", "→ Course: Civil / Mechanical / Electrical / Computer / IT / AI & Data Science / Cyber Security …") }] },
            { kind: "option", label: T("Medical", "Medical"),
              children: [{ kind: "opens", label: T("→ Course: MBBS / BAMS / BHMS / BDS / BUMS / BPT / BOT / B.Pharm", "→ Course: MBBS / BAMS / BHMS / BDS / BUMS / BPT / BOT / B.Pharm") }] },
            { kind: "option", label: T("Law / Education / Management / Agriculture / Architecture / Hospitality / Other", "Law / Education / Management / Agriculture / Architecture / Hospitality / Other"),
              children: [{ kind: "opens", label: T("→ त्या शाखेतील Course dropdown उघडते", "→ Course dropdown for that stream opens") }] },
          ] },
        { kind: "opens", label: T("→ संस्था प्रकार", "→ Institution Type") },
      ] },

    { kind: "option", label: T("पदव्युत्तर (Postgraduate)", "Postgraduate"),
      children: [
        { kind: "opens", label: T("→ शाखा → Course (Arts / Commerce / Management / Science / CS-IT / Engineering / Medical / Education / Law / Social Work / Research / Other)", "→ Stream → Course (Arts / Commerce / Management / Science / CS-IT / Engineering / Medical / Education / Law / Social Work / Research / Other)") },
        { kind: "opens", label: T("→ संस्था प्रकार", "→ Institution Type") },
      ] },

    { kind: "option", label: T("डॉक्टरेट / पीएच.डी. (Doctorate)", "Doctorate / Ph.D."),
      children: [
        { kind: "opens", label: T("→ शाखा: Doctoral Degrees / Post-Doctoral & Research / इतर", "→ Stream: Doctoral Degrees / Post-Doctoral & Research / Other"),
          children: [
            { kind: "option", label: T("Doctoral Degrees", "Doctoral Degrees"),
              children: [{ kind: "opens", label: T("→ Course: Ph.D. / D.Sc. / D.Litt. / Ed.D. / DBA / LL.D. / Pharm.D. …", "→ Course: Ph.D. / D.Sc. / D.Litt. / Ed.D. / DBA / LL.D. / Pharm.D. …") }] },
            { kind: "option", label: T("Post-Doctoral & Research", "Post-Doctoral & Research"),
              children: [{ kind: "opens", label: T("→ Course: Post-Doc / Research Scientist / Principal Scientist / SRF / JRF", "→ Course: Post-Doc / Research Scientist / Principal Scientist / SRF / JRF") }] },
            { kind: "option", label: T("इतर (Other)", "Other"),
              children: [{ kind: "opens", label: T("→ 'इतर – नमूद करा' free-text input उघडतो", "→ 'Other – please specify' free-text input opens") }] },
          ] },
        { kind: "opens", label: T("→ संस्था प्रकार", "→ Institution Type") },
      ] },

    { kind: "option", label: T("इतर (Other)", "Other"),
      children: [
        { kind: "opens", label: T("→ शाखा: Certificate / Skill Development / Computer Certifications / Professional (CA/CS/CMA/CFA) / Competitive Exam / Other", "→ Stream: Certificate / Skill Development / Computer Certifications / Professional (CA/CS/CMA/CFA) / Competitive Exam / Other"),
          children: [{ kind: "opens", label: T("→ त्यानंतर संबंधित Course dropdown", "→ Then the corresponding Course dropdown") }] },
      ] },
  ],
};

const occupationTree = {
  kind: "field",
  label: T("मुख्य श्रेणी (Primary Category)", "Primary Category"),
  type: T("Dropdown", "Dropdown"),
  children: [
    { kind: "option", label: T("शेतकरी (Farmer)", "Farmer"),
      children: [{ kind: "opens", label: T("→ Farming Types (multi) → Land Size → Annual Income → Notes", "→ Farming Types (multi) → Land Size → Annual Income → Notes") }] },

    { kind: "option", label: T("शेती + व्यवसाय (Agriculture + Business)", "Agriculture + Business"),
      children: [{ kind: "opens", label: T("→ शेती व व्यवसाय दोन्हीचे fields उघडतात", "→ Both farming and business fields open") }] },

    { kind: "option", label: T("कृषी मजूर / शेतमजूर (Farm Labour)", "Farm Labour") },

    { kind: "option", label: T("स्वरोजगार (Self Employed)", "Self Employed"),
      children: [
        { kind: "opens", label: T("→ Self-Employed Types (multi): सुतार / लोहार / गवंडी / प्लंबर / इलेक्ट्रिशियन / वेल्डर / मेकॅनिक / ड्रायव्हर / शिंपी / नाभिक / पेंटर / फेरीवाला / इतर", "→ Self-Employed Types (multi): Carpenter / Blacksmith / Mason / Plumber / Electrician / Welder / Mechanic / Driver / Tailor / Barber / Painter / Vendor / Other"),
          children: [
            { kind: "option", label: T("'इतर' निवडल्यास", "If 'Other' chosen"),
              children: [{ kind: "opens", label: T("→ 'इतर कौशल्य नमूद करा' free-text उघडतो", "→ 'Specify other skill' free-text opens") }] },
          ] },
        { kind: "opens", label: T("→ 'स्वतःचा व्यवसाय सुरू करायचा आहे का?' (होय / नाही)", "→ 'Do you want to start own business?' (Yes / No)"),
          children: [
            { kind: "option", label: T("होय", "Yes"),
              children: [{ kind: "opens", label: T("→ 'कर्जाची आवश्यकता आहे का?' (होय / नाही)", "→ 'Is loan needed?' (Yes / No)"),
                children: [
                  { kind: "option", label: T("होय", "Yes"),
                    children: [{ kind: "opens", label: T("→ Loan Amount: 0-5 लाख / 5-10 लाख / 10 लाख+ / इतर", "→ Loan Amount: 0-5 L / 5-10 L / 10 L+ / Other") }] },
                ] }] },
          ] },
      ] },

    { kind: "option", label: T("व्यवसाय (Business Owner)", "Business Owner"),
      children: [
        { kind: "opens", label: T("→ Business Types (multi): किराणा / हार्डवेअर / मेडिकल / ट्रान्सपोर्ट / बांधकाम / हॉटेल / उद्योग / सेवा / ऑनलाइन / डेअरी / गॅरेज / टेलरिंग / सलून / इतर", "→ Business Types (multi): Grocery / Hardware / Medical / Transport / Construction / Hotel / Industry / Service / Online / Dairy / Garage / Tailoring / Salon / Other") },
        { kind: "opens", label: T("→ Business Name → People Employed → 'कर्ज आवश्यक?'", "→ Business Name → People Employed → 'Loan needed?'"),
          children: [
            { kind: "option", label: T("होय", "Yes"),
              children: [
                { kind: "opens", label: T("→ Loan Amount + Loan Purpose (नवीन व्यवसाय / विस्तार / यंत्रसामग्री / working capital / इतर)", "→ Loan Amount + Loan Purpose (New business / Expansion / Machinery / Working capital / Other)") },
              ] },
          ] },
      ] },

    { kind: "option", label: T("मानधनधारक पदाधिकारी (Honorarium Position)", "Honorarium Based Position"),
      children: [{ kind: "opens", label: T("→ Position: रोजगार सेवक / पोलीस पाटील / कोतवाल / सरपंच / उप-सरपंच / ग्रा.पं. सदस्य / पं.स. सदस्य / जि.प. सदस्य / नगरसेवक / इतर  → Organisation → Income", "→ Position: Employment Sevak / Police Patil / Kotwal / Sarpanch / Up-Sarpanch / GP Member / PS Member / ZP Member / Councillor / Other  → Organisation → Income") }] },

    { kind: "option", label: T("सरकारी कर्मचारी (Government Employee)", "Government Employee"),
      children: [
        { kind: "opens", label: T("→ Service Type", "→ Service Type"),
          children: [
            { kind: "option", label: T("राज्य शासन / केंद्र शासन", "State / Central Government") },
          ] },
        { kind: "opens", label: T("→ Class", "→ Class"),
          children: [
            { kind: "option", label: T("Class 1 Officer", "Class 1 Officer"),
              children: [{ kind: "opens", label: T("→ Designation: जिल्हाधिकारी / CEO ZP / SP / आयुक्त / Chief Engineer / Deputy Secretary / Joint Secretary / Registrar / Dean / Principal / Civil Surgeon / DHO / …", "→ Designation: District Collector / CEO ZP / SP / Commissioner / Chief Engineer / Dep. Secretary / Joint Secretary / Registrar / Dean / Principal / Civil Surgeon / DHO / …") }] },
            { kind: "option", label: T("Class 2 Officer", "Class 2 Officer"),
              children: [{ kind: "opens", label: T("→ Designation: उपजिल्हाधिकारी / तहसीलदार / नायब तहसीलदार / BDO / Extension Officer / Medical Officer / PI / …", "→ Designation: Dep. Collector / Tahsildar / Naib Tahsildar / BDO / Extension Officer / Medical Officer / PI / …") }] },
            { kind: "option", label: T("Class 3 Employee", "Class 3 Employee"),
              children: [{ kind: "opens", label: T("→ Designation: ग्रामसेवक / कृषी सहाय्यक / तलाठी / लिपिक / शिक्षक / पोलीस शिपाई / वनरक्षक / …", "→ Designation: Gram Sevak / Agri Assistant / Talathi / Clerk / Teacher / Constable / Forest Guard / …") }] },
            { kind: "option", label: T("Class 4 Employee", "Class 4 Employee"),
              children: [{ kind: "opens", label: T("→ Designation: शिपाई / परिचर / वाहन चालक / चौकीदार / सफाई कर्मचारी / …", "→ Designation: Peon / Attendant / Driver / Watchman / Sweeper / …") }] },
          ] },
        { kind: "opens", label: T("→ Department → Organisation → Posting Place → Income → Experience", "→ Department → Organisation → Posting Place → Income → Experience") },
      ] },

    { kind: "option", label: T("खाजगी कर्मचारी (Private Employee)", "Private Employee"),
      children: [{ kind: "opens", label: T("→ Sector → Designation → Organisation → Posting Place → Income → Experience", "→ Sector → Designation → Organisation → Posting Place → Income → Experience") }] },

    { kind: "option", label: T("शिक्षण क्षेत्र (Education Sector)", "Education Sector"),
      children: [{ kind: "opens", label: T("→ Institution Type → Institution Level → Designation → Branch → Organisation", "→ Institution Type → Institution Level → Designation → Branch → Organisation") }] },

    { kind: "option", label: T("वैद्यकीय क्षेत्र (Medical Sector)", "Medical Sector"),
      children: [
        { kind: "opens", label: T("→ Institution Type", "→ Institution Type"),
          children: [
            { kind: "option", label: T("सरकारी / खाजगी", "Government / Private"),
              children: [{ kind: "opens", label: T("→ Designation → Department → Hospital Name / Address", "→ Designation → Department → Hospital Name / Address") }] },
            { kind: "option", label: T("स्वतःचा setup (Own Setup)", "Own Setup"),
              children: [{ kind: "opens", label: T("→ Setup Name → Address → City → District → PIN", "→ Setup Name → Address → City → District → PIN") }] },
          ] },
      ] },

    { kind: "option", label: T("अभियंता (Engineering)", "Engineering"),
      children: [{ kind: "opens", label: T("→ Institution Type → Branch (Civil / Mechanical / …) → Designation → Organisation → Posting Place", "→ Institution Type → Branch (Civil / Mechanical / …) → Designation → Organisation → Posting Place") }] },

    { kind: "option", label: T("बँकिंग व वित्तीय क्षेत्र (Banking & Finance)", "Banking & Finance"),
      children: [{ kind: "opens", label: T("→ Bank Type (RBI / Nationalized / Cooperative / …) → Designation → Branch → Organisation", "→ Bank Type (RBI / Nationalized / Cooperative / …) → Designation → Branch → Organisation") }] },

    { kind: "option", label: T("न्यायव्यवस्था (Judiciary)", "Judiciary"),
      children: [{ kind: "opens", label: T("→ Designation (Judge / Advocate / …) → Posting Place", "→ Designation (Judge / Advocate / …) → Posting Place") }] },

    { kind: "option", label: T("संरक्षण व सुरक्षा सेवा (Defence & Security)", "Defence & Security"),
      children: [{ kind: "opens", label: T("→ Force (Army / Navy / Air Force / BSF / Police / …) → Rank → Posting Place", "→ Force (Army / Navy / Air Force / BSF / Police / …) → Rank → Posting Place") }] },

    { kind: "option", label: T("निवृत्त / पेन्शनधारक (Retired)", "Retired / Pensioner"),
      children: [{ kind: "opens", label: T("→ Retired From → Designation → Pension Amount", "→ Retired From → Designation → Pension Amount") }] },

    { kind: "option", label: T("बेरोजगार (Unemployed)", "Unemployed"),
      children: [{ kind: "opens", label: T("→ 'रोजगार शोधत आहात?' → इच्छित क्षेत्र → 'कौशल्य प्रशिक्षण हवे?' → 'इच्छित व्यवसाय?' → 'मार्गदर्शन हवे?'", "→ 'Seeking job?' → Desired Sector → 'Want skill training?' → 'Desired business?' → 'Want guidance?'") }] },

    { kind: "option", label: T("परदेशस्थ (NRI)", "NRI"),
      children: [{ kind: "opens", label: T("→ Country → City → Contributions to Community (multi)", "→ Country → City → Contributions to Community (multi)") }] },

    { kind: "option", label: T("इतर (Other)", "Other"),
      children: [{ kind: "opens", label: T("→ 'नमूद करा' free-text input", "→ 'Please specify' free-text input") }] },
  ],
};

// ---------- top-level sections ----------

const sections = [
  {
    badge: "A",
    title: T("भौगोलिक माहिती", "Geographic Information"),
    children: [
      { kind: "field", label: T("पत्रव्यवहाराचा पत्ता", "Correspondence Address"), type: T("Group", "Group"),
        children: [
          { kind: "field", label: T("जिल्हा / तालुका / गाव* / पिनकोड", "District / Taluka / Village* / Pincode"), type: T("Text", "Text") },
        ] },
      { kind: "field", label: T("मूळ वस्ती (Permanent Address)", "Permanent Address"), type: T("Group", "Group"),
        children: [
          { kind: "field", label: T("'पत्रव्यवहाराचा पत्ता समान आहे'", "'Same as Correspondence Address'"), type: T("Checkbox", "Checkbox"),
            children: [
              { kind: "option", label: T("Checked", "Checked"),
                children: [{ kind: "opens", label: T("→ मूळ जिल्हा / तालुका / गाव / पिनकोड auto-fill व disabled", "→ Native District / Taluka / Village / Pincode auto-filled and disabled") }] },
              { kind: "option", label: T("Unchecked", "Unchecked"),
                children: [{ kind: "opens", label: T("→ चारही fields स्वतः भरा", "→ Fill all four fields manually") }] },
            ] },
        ] },
    ],
  },

  {
    badge: "B",
    title: T("कुटुंब प्रमुख माहिती", "Head of Family Information"),
    children: [
      { kind: "field", label: T("कुटुंब प्रमुखाचा फोटो", "Head of Family Photo"), type: T("Camera / Image Upload", "Camera / Image Upload") },
      { kind: "field", label: T("नाव* / मोबाईल / समुदाय", "Name* / Mobile / Community"), type: T("Text", "Text") },

      { kind: "field", label: T("वैवाहिक स्थिती", "Marital Status"), type: T("Dropdown", "Dropdown"),
        children: [
          { kind: "option", label: T("विवाहित", "Married"),
            children: [
              { kind: "opens", label: T("→ 'विवाहाचा प्रकार'", "→ 'Type of Marriage'"),
                children: [
                  { kind: "option", label: T("जातीय (Same-caste)", "Same-caste") },
                  { kind: "option", label: T("आंतरजातीय (Inter-caste)", "Inter-caste"),
                    children: [{ kind: "opens", label: T("→ 'जोडीदाराची जात' text field", "→ 'Spouse's Caste' text field") }] },
                ] },
            ] },
          { kind: "option", label: T("अविवाहित / विधवा / घटस्फोटित", "Unmarried / Widow / Divorced") },
        ] },

      { kind: "field", label: T("लिंग", "Gender"), type: T("Dropdown", "Dropdown"),
        children: [{ kind: "option", label: T("पुरुष / स्त्री", "Male / Female") }] },

      { kind: "field", label: T("जन्मतारीख + वय", "Date of Birth + Age"), type: T("Date + Auto-calc", "Date + Auto-calc") },

      { kind: "field", label: T("मामेकुळ तपशील", "Maternal Family"), type: T("Group", "Group"),
        children: [{ kind: "field", label: T("नाव / संपूर्ण पत्ता / मोबाईल", "Name / Full Address / Mobile"), type: T("Text", "Text") }] },

      { kind: "field", label: T("शिक्षण (Cascading)", "Education (Cascading)"), type: T("Sub-tree", "Sub-tree"),
        children: [educationTree] },

      { kind: "field", label: T("नौकरी / व्यवसाय (Cascading)", "Occupation (Cascading)"), type: T("Sub-tree", "Sub-tree"),
        children: [occupationTree] },
    ],
  },

  {
    badge: "C",
    title: T("कुटुंबातील सदस्य (Repeatable)", "Family Members (Repeatable)"),
    children: [
      { kind: "note", label: T("'सदस्य जोडा' बटणाने अनेक सदस्य जोडता येतात.", "Use 'Add Member' to add multiple members.") },
      { kind: "field", label: T("नाव / नाते / लिंग / जन्मतारीख / मोबाईल", "Name / Relationship / Gender / DOB / Mobile"), type: T("Group", "Group") },
      { kind: "field", label: T("वैवाहिक स्थिती", "Marital Status"), type: T("Dropdown", "Dropdown"),
        children: [
          { kind: "option", label: T("विवाहित", "Married"),
            children: [
              { kind: "opens", label: T("→ विवाहाचा प्रकार → आंतरजातीय ⇒ 'जोडीदाराची जात'", "→ Type of Marriage → Inter-caste ⇒ 'Spouse's Caste'") },
              { kind: "opens", label: T("→ जर नाते ∈ (मुलगा/मुलगी/भाऊ/बहीण) → 'सासुरवाडी' section उघडतो: नाव / पत्ता / मोबाईल", "→ If Relationship ∈ (Son/Daughter/Brother/Sister) → 'In-Laws Family' opens: Name / Address / Mobile") },
            ] },
        ] },
      { kind: "field", label: T("शिक्षण व नौकरी (Cascading Section B प्रमाणे)", "Education & Occupation (cascading, same as Section B)"), type: T("Sub-tree", "Sub-tree") },
      { kind: "field", label: T("स्त्री सदस्यांसाठी अतिरिक्त प्रश्न", "Additional Questions (Female Members Only)"), type: T("Group", "Group"),
        children: [
          { kind: "field", label: T("'महिला बचत गटाच्या सदस्य आहात का?'", "'Are you a member of Mahila Bachat Gat?'"), type: T("Radio", "Radio"),
            children: [
              { kind: "option", label: T("नाही", "No"),
                children: [{ kind: "opens", label: T("→ 'कोहळी समाज महिला बचत गटात सहभागी व्हायला आवडेल का?' (होय / नाही)", "→ 'Would you like to join Kohli Samaj Mahila Bachat Gat?' (Yes / No)") }] },
            ] },
          { kind: "field", label: T("'ग्रामोद्योग / घरगुती व्यवसाय करता का?'", "'Do you run rural / home-based business?'"), type: T("Radio", "Radio"),
            children: [
              { kind: "option", label: T("होय", "Yes"),
                children: [{ kind: "opens", label: T("→ 'व्यवसायाचे नाव' text", "→ 'Business Name' text") }] },
              { kind: "option", label: T("नाही", "No"),
                children: [
                  { kind: "opens", label: T("→ 'भविष्यात ग्रामोद्योग सुरू करायची इच्छा आहे का?'", "→ 'Do you wish to start a rural business in future?'"),
                    children: [
                      { kind: "option", label: T("होय", "Yes"),
                        children: [{ kind: "opens", label: T("→ 'कोणता ग्रामोद्योग सुरू करायचा?' text", "→ 'Which business?' text") }] },
                    ] },
                ] },
            ] },
        ] },
    ],
  },

  {
    badge: "D",
    title: T("धारण केलेले पद (राजकीय / सामाजिक / लोकप्रतिनिधी)", "Positions Held (Political / Social / Representative)"),
    children: [
      { kind: "field", label: T("'कुटुंबातील कोणी पद धारण केले आहे का?'", "'Anyone in family holding a position?'"), type: T("Radio", "Radio"),
        children: [
          { kind: "option", label: T("होय", "Yes"),
            children: [
              { kind: "opens", label: T("→ 'पद जोडा' dialog: व्यक्तीचे नाव* + पदाचा प्रकार* + वर्तमान स्थिती (आजी / माजी)", "→ 'Add Position' dialog: Person Name* + Position Type* + Current Status (Current / Former)"),
                children: [
                  { kind: "field", label: T("पदाचा प्रकार", "Position Type"), type: T("Dropdown", "Dropdown"),
                    children: [
                      { kind: "option", label: T("राजकीय", "Political"),
                        children: [{ kind: "opens", label: T("→ राजकीय पद (प्रदेश / जिल्हा / तालुका / गाव) → पक्षाचे नाव (BJP / INC / NCP / … / इतर ⇒ text)", "→ Political Level (State / District / Taluka / Village) → Party (BJP / INC / NCP / … / Other ⇒ text)") }] },
                      { kind: "option", label: T("लोकप्रतिनिधी", "Representative"),
                        children: [
                          { kind: "opens", label: T("→ लोकप्रतिनिधी पद: खासदार / आमदार / जि.प. / पं.स. / नगरपरिषद / नगरपंचायत / ग्रामपंचायत / Co-op Bank / Co-op Society / APMC / पतसंस्था / …", "→ Rep. Type: MP / MLA / ZP / PS / Municipal Council / Nagar Panchayat / Gram Panchayat / Co-op Bank / Co-op Society / APMC / Credit Society / …"),
                            children: [
                              { kind: "option", label: T("Co-op Bank / Society / पतसंस्था निवडल्यास", "If Co-op Bank / Society / Credit Society"),
                                children: [{ kind: "opens", label: T("→ 'संस्थेचे नाव' text", "→ 'Institution Name' text") }] },
                              { kind: "option", label: T("कोणतेही निवडल्यावर", "After any selection"),
                                children: [{ kind: "opens", label: T("→ भूमिका (अध्यक्ष / उपाध्यक्ष / सभापती / सरपंच / सदस्य …) → कार्यकाळ (पासून-पर्यंत) → पक्षाचे नाव", "→ Role (President / VP / Chairman / Sarpanch / Member …) → Term (from-to) → Party Name") }] },
                            ] },
                        ] },
                      { kind: "option", label: T("सामाजिक", "Social"),
                        children: [{ kind: "opens", label: T("→ संस्था (सामाजिक / शैक्षणिक) → पद (पदाधिकारी / अध्यक्ष / उपाध्यक्ष / सचिव / सदस्य)", "→ Organisation (Social / Educational) → Role (Office-bearer / President / VP / Secretary / Member)") }] },
                    ] },
                ] },
            ] },
          { kind: "option", label: T("नाही", "No"),
            children: [{ kind: "opens", label: T("→ पुढील कोणतेही field उघडत नाही", "→ No further fields open") }] },
        ] },
    ],
  },

  {
    badge: "E",
    title: T("कौटुंबिक आवश्यक गरजा", "Household Items & Basic Needs"),
    children: [
      { kind: "field", label: T("घरातील वस्तू (multi-select)", "Household Items (multi-select)"), type: T("Checkboxes", "Checkboxes"),
        children: [
          { kind: "option", label: T("मोबाईल / टीव्ही / फ्रिज / गॅस शेगडी / कॉम्प्युटर / सायकल / दोन-चाकी / ऑटो / चार-चाकी", "Mobile / TV / Fridge / Gas Stove / Computer / Bicycle / Two-wheeler / Auto / Four-wheeler"),
            children: [{ kind: "opens", label: T("→ प्रत्येक वस्तूची 'संख्या' (1–10) dropdown उघडते", "→ 'Quantity' dropdown (1–10) opens for each item") }] },
        ] },
      { kind: "field", label: T("'घरी सौर ऊर्जा (Solar Panel) बसविलेली आहे का?'", "'Is a Solar Panel installed at home?'"), type: T("Radio", "Radio"),
        children: [
          { kind: "option", label: T("नाही", "No"),
            children: [{ kind: "opens", label: T("→ 'सौर ऊर्जा योजनेचा लाभ घ्यायचा आहे का?' Radio", "→ 'Do you want to avail the Solar Panel scheme?' Radio") }] },
        ] },
    ],
  },

  {
    badge: "F",
    title: T("घर विषयक माहिती", "House Information"),
    children: [
      { kind: "field", label: T("'स्वतःचे घर आहे काय?'", "'Do you own a house?'"), type: T("Radio", "Radio"),
        children: [
          { kind: "option", label: T("होय", "Yes"),
            children: [{ kind: "opens", label: T("→ 'घराचा प्रकार' dropdown: कच्चा / पक्का", "→ 'House Type' dropdown: Kachcha / Pakka") }] },
          { kind: "option", label: T("नाही", "No"),
            children: [
              { kind: "opens", label: T("→ 'राहण्याची स्थिती' dropdown: भाड्याचे / आश्रित", "→ 'Living Status' dropdown: Rented / Dependent") },
              { kind: "opens", label: T("→ 'तुम्हाला घरकुल योजनेचा लाभ मिळाला आहे का?' Radio", "→ 'Have you received Gharkul scheme benefit?' Radio"),
                children: [
                  { kind: "option", label: T("नाही", "No"),
                    children: [{ kind: "opens", label: T("→ 'तुम्हाला घरकुल योजनेचा लाभ घ्यायचा आहे का?' Radio", "→ 'Do you want to avail the Gharkul scheme?' Radio") }] },
                ] },
            ] },
        ] },
    ],
  },

  {
    badge: "G",
    title: T("शेती विषयक माहिती", "Agriculture Information"),
    children: [
      { kind: "field", label: T("'शेतजमीन आहे काय?'", "'Do you have farmland?'"), type: T("Radio", "Radio"),
        children: [
          { kind: "option", label: T("होय", "Yes"),
            children: [
              { kind: "opens", label: T("→ खालील सर्व शेती-संबंधित sections उघडतात:", "→ All farming-related sections open:"),
                children: [
                  { kind: "field", label: T("एकूण शेती", "Total Farmland"), type: T("Dropdown", "Dropdown"),
                    children: [{ kind: "option", label: T("< 1 एकर / 1–5 / 5–10 / 10–20 / > 20 एकर", "< 1 acre / 1–5 / 5–10 / 10–20 / > 20 acres") }] },
                  { kind: "field", label: T("क्षेत्र (एकरमध्ये)", "Area (in acres)"), type: T("Numbers", "Numbers"),
                    children: [{ kind: "option", label: T("ओलिताखालील / कोरडवाहू / खरीप / रब्बी / उन्हाळी", "Irrigated / Dryland / Kharif / Rabi / Summer") }] },
                  { kind: "field", label: T("पिक हंगाम (Repeatable)", "Crop Season (Repeatable)"), type: T("Dropdown + Add", "Dropdown + Add"),
                    children: [{ kind: "option", label: T("खरीप / रब्बी (धान सोडून) / उन्हाळी (धानासह) / घेतलेली पिके", "Kharif / Rabi (excl paddy) / Summer (incl paddy) / Crops Grown") }] },
                  { kind: "field", label: T("प्रमुख पीक प्रकार (multi)", "Major Crop Types (multi)"), type: T("Checkboxes", "Checkboxes"),
                    children: [
                      { kind: "option", label: T("धान्य / कडधान्य / तेलबिया / भाजीपाला / फळबाग / नगदी / मसाला / इतर", "Cereals / Pulses / Oilseeds / Vegetables / Orchards / Cash Crops / Spices / Other"),
                        children: [{ kind: "opens", label: T("'इतर' → 'इतर पीक प्रकार' text field", "'Other' → 'Other Crop Type' text field") }] },
                    ] },
                  { kind: "field", label: T("सिंचनाचे साधन", "Irrigation Sources"), type: T("Checkbox + संख्या", "Checkbox + Quantity"),
                    children: [
                      { kind: "option", label: T("ट्युबवेल / विहीर", "Tubewell / Well"),
                        children: [{ kind: "opens", label: T("→ 'विद्युत पंप' / 'सौर पंप' checkboxes उघडतात", "→ 'Electric Pump' / 'Solar Pump' checkboxes open") }] },
                      { kind: "option", label: T("तलाव", "Lake / Pond"),
                        children: [
                          { kind: "opens", label: T("→ 'हा तलाव कोहळी समाजाच्या मालगुजारीचा आहे का?' (होय / नाही)", "→ 'Is this a Kohli Samaj Malguzari pond?' (Yes / No)"),
                            children: [
                              { kind: "option", label: T("होय", "Yes"),
                                children: [{ kind: "opens", label: T("→ 'सिंचनासाठी पाणी मोफत उपलब्ध होते का?' (होय / नाही)", "→ 'Is water free for irrigation?' (Yes / No)") }] },
                            ] },
                        ] },
                      { kind: "option", label: T("शेततलाव / नदी / नहर", "Farm Pond / River / Canal") },
                    ] },
                  { kind: "field", label: T("शेती विषयक साधने", "Farming Tools / Equipment"), type: T("Radio + Conditional", "Radio + Conditional"),
                    children: [
                      { kind: "option", label: T("ट्रॅक्टर / हार्वेस्टर / रोटावेटर / कल्टिवेटर / ट्रॅक्टर ट्रॉली — प्रत्येकासाठी 'आहे?'", "Tractor / Harvester / Rotavator / Cultivator / Tractor Trolley — 'Have?' each"),
                        children: [
                          { kind: "option", label: T("होय", "Yes"),
                            children: [{ kind: "opens", label: T("→ 'संख्या' number", "→ 'Quantity' number") }] },
                          { kind: "option", label: T("नाही", "No"),
                            children: [
                              { kind: "opens", label: T("→ 'घ्यायची इच्छा आहे का?'", "→ 'Wish to purchase?'"),
                                children: [
                                  { kind: "option", label: T("होय", "Yes"),
                                    children: [{ kind: "opens", label: T("→ 'कर्जाची आवश्यकता आहे का?' (होय / नाही)", "→ 'Loan required?' (Yes / No)") }] },
                                ] },
                            ] },
                        ] },
                      { kind: "option", label: T("इतर आधुनिक कृषी अवजारे", "Other Modern Farming Equipment"),
                        children: [
                          { kind: "option", label: T("होय", "Yes"),
                            children: [{ kind: "opens", label: T("→ 'कृपया नमूद करा' text", "→ 'Please specify' text") }] },
                        ] },
                    ] },
                  { kind: "field", label: T("'ठेक्याने / बटाईने शेती करता का?'", "'Contract / Share cropping?'"), type: T("Radio", "Radio"),
                    children: [
                      { kind: "option", label: T("होय", "Yes"),
                        children: [{ kind: "opens", label: T("→ 'ठेक्याने / बटाईने केलेल्या शेतीचे क्षेत्र (एकर)' number", "→ 'Contract / share cropping area (acres)' number") }] },
                    ] },
                ] },
            ] },
          { kind: "option", label: T("नाही", "No"),
            children: [{ kind: "opens", label: T("→ शेती-संबंधित कोणतेही field उघडत नाही", "→ No farming fields open") }] },
        ] },
    ],
  },

  {
    badge: "H",
    title: T("सामाजिक व आर्थिक लाभार्थी माहिती", "Social & Economic Beneficiary Information"),
    children: [
      { kind: "field", label: T("मुख्यमंत्री लाडकी बहीण योजना", "Mukhyamantri Ladki Bahin Yojana"), type: T("Group", "Group"),
        children: [
          { kind: "note", label: T("लाभार्थी / बिगर-लाभार्थी dropdown मध्ये फक्त 'लिंग = स्त्री' असलेल्या सदस्यांची नावे दाखवली जातात.", "Beneficiary / non-beneficiary dropdowns show only members with Gender = Female.") },
          { kind: "field", label: T("'आपल्या घरामध्ये लाडकी बहीण योजनेचे लाभार्थी आहेत का?'", "'Any Ladki Bahin beneficiary in the family?'"), type: T("Radio", "Radio"),
            children: [
              { kind: "option", label: T("होय", "Yes"),
                children: [
                  { kind: "opens", label: T("→ 'लाभार्थी सदस्य निवडा' dropdown (केवळ स्त्री) + 'Add' ने अनेक", "→ 'Select beneficiary member(s)' dropdown (female only) + 'Add' for multiple"),
                    children: [
                      { kind: "field", label: T("प्रत्येक निवडलेल्या स्त्रीसाठी: 'या योजनेचा लाभ नियमितपणे मिळतो का?'", "For each selected woman: 'Do you regularly receive the benefit?'"), type: T("Radio", "Radio"),
                        children: [
                          { kind: "option", label: T("होय", "Yes"),
                            children: [{ kind: "opens", label: T("→ पुढील प्रश्न नाही", "→ No further questions") }] },
                          { kind: "option", label: T("नाही", "No"),
                            children: [
                              { kind: "opens", label: T("→ 'लाभ मिळत नसल्यास मुख्य कारण' dropdown", "→ 'Main reason for not receiving benefit' dropdown"),
                                children: [
                                  { kind: "option", label: T("KYC पूर्ण नाही / प्रलंबित", "KYC not complete / pending") },
                                  { kind: "option", label: T("आधार व बँक खाते लिंक नाही", "Aadhaar not linked to bank account") },
                                  { kind: "option", label: T("बँक खात्यात DBT सक्रिय नाही", "DBT not active in bank account") },
                                  { kind: "option", label: T("अर्जाची पडताळणी प्रलंबित", "Application verification pending") },
                                  { kind: "option", label: T("अर्ज / कागदपत्रांमध्ये त्रुटी", "Errors in application / documents") },
                                  { kind: "option", label: T("बँक खाते निष्क्रिय / बंद / चुकीचे", "Bank account inactive / closed / wrong") },
                                  { kind: "option", label: T("इतर", "Other"),
                                    children: [{ kind: "opens", label: T("→ 'कारण नमूद करा' free-text", "→ 'Please specify reason' free-text") }] },
                                ] },
                            ] },
                        ] },
                    ] },
                ] },
              { kind: "option", label: T("नाही", "No"),
                children: [{ kind: "opens", label: T("→ 'बिगर-लाभार्थी सदस्य निवडा' dropdown + प्रत्येकीसाठी वरील कारण dropdown", "→ 'Select non-beneficiary member(s)' dropdown + reason dropdown for each") }] },
            ] },
        ] },

      { kind: "field", label: T("'दुर्धर आजाराने बाधित रुग्ण आहे का?'", "'Any critical illness patient?'"), type: T("Radio", "Radio"),
        children: [
          { kind: "option", label: T("होय", "Yes"),
            children: [{ kind: "opens", label: T("→ 'वैद्यकीय सहाय्याची आवश्यकता आहे का?' Radio", "→ 'Do you need medical assistance?' Radio") }] },
        ] },

      { kind: "field", label: T("'राज्य / राष्ट्रीय / आंतरराष्ट्रीय स्तरावरील खेळाडू आहेत का?'", "'Any State / National / International sportsperson?'"), type: T("Radio", "Radio"),
        children: [
          { kind: "option", label: T("होय", "Yes"),
            children: [{ kind: "opens", label: T("→ 'खेळाचा प्रकार' (text) + 'स्तर' dropdown (State / National / International)", "→ 'Sport Type' (text) + 'Level' dropdown (State / National / International)") }] },
        ] },
    ],
  },

  {
    badge: "I",
    title: T("उद्योजक / स्वयंरोजगार व रोजगार माहिती", "Entrepreneur / Self-employment & Employment"),
    children: [
      { kind: "field", label: T("'कुटुंबातील सदस्य उद्योजक / स्वयंरोजगारात आहेत का?'", "'Any entrepreneur / self-employed member?'"), type: T("Radio", "Radio"),
        children: [
          { kind: "option", label: T("होय", "Yes"),
            children: [{ kind: "opens", label: T("→ 'तपशील व व्यवसायाचा पत्ता' Textarea", "→ 'Details & business address' Textarea") }] },
        ] },
      { kind: "field", label: T("'जोडधंदा / अतिरिक्त व्यवसाय आहे का?'", "'Any side business?'"), type: T("Radio", "Radio"),
        children: [
          { kind: "option", label: T("होय", "Yes"),
            children: [{ kind: "opens", label: T("→ 'व्यवसायाचे स्वरूप व तपशील' Textarea", "→ 'Nature & details of business' Textarea") }] },
        ] },
    ],
  },

  {
    badge: "★",
    title: T("अतिरिक्त वैशिष्ट्ये (Additional Features)", "Additional Features"),
    children: [
      { kind: "note", label: T("Form च्या वर उजव्या कोपऱ्यात 'English / मराठी' Google Translate toggle button. जतन होणारा data नेहमी मूळ मराठी keys मध्येच saved होतो — translation फक्त प्रदर्शनासाठी.", "'English / मराठी' Google Translate toggle button appears at top-right of the form. Saved data always uses original Marathi keys — translation is display-only.") },
    ],
  },
];

// ---------------- RENDERING ----------------

const COLORS = {
  primary: "1E3A8A",
  section: "0F172A",
  field:   "1E40AF",
  option:  "047857",
  opens:   "B45309",
  note:    "6B21A8",
  muted:   "64748B",
  band:    "E0E7FF",
  border:  "CBD5E1",
  soft:    "F8FAFC",
};

// Tree glyph per depth
const GLYPH = ["▣", "▸", "◆", "○", "•", "·", "‣", "»"];

const pick = (obj, lang) => (typeof obj === "string" ? obj : obj[lang]);

function nodeStyle(kind) {
  switch (kind) {
    case "field":  return { color: COLORS.field,  bold: true,  labelPrefix: "" };
    case "option": return { color: COLORS.option, bold: true,  labelPrefix: "" };
    case "opens":  return { color: COLORS.opens,  bold: false, labelPrefix: "" };
    case "note":   return { color: COLORS.note,   bold: false, labelPrefix: "" };
    default:       return { color: "1F2937",      bold: false, labelPrefix: "" };
  }
}

function kindTag(kind, lang) {
  if (kind === "field")  return lang === "en" ? "FIELD"  : "फील्ड";
  if (kind === "option") return lang === "en" ? "CHOICE" : "पर्याय";
  if (kind === "opens")  return lang === "en" ? "OPENS"  : "उघडते";
  if (kind === "note")   return lang === "en" ? "NOTE"   : "टीप";
  return "";
}

function renderNode(node, depth, lang) {
  const indent = 260 * depth;
  const glyph = GLYPH[Math.min(depth, GLYPH.length - 1)];
  const st = nodeStyle(node.kind);

  const runs = [
    new TextRun({ text: `${glyph}  `, color: st.color, bold: true }),
  ];

  const tag = kindTag(node.kind, lang);
  if (tag) {
    runs.push(new TextRun({ text: `[${tag}] `, color: COLORS.muted, size: 16, bold: true }));
  }

  runs.push(new TextRun({ text: pick(node.label, lang), color: st.color, bold: st.bold }));

  if (node.type) {
    runs.push(new TextRun({ text: `   — ${pick(node.type, lang)}`, color: COLORS.muted, italics: true, size: 18 }));
  }

  const paragraphs = [
    new Paragraph({
      spacing: { before: 20, after: 20 },
      indent: { left: indent },
      children: runs,
    }),
  ];

  if (node.children && node.children.length) {
    node.children.forEach((c) => paragraphs.push(...renderNode(c, depth + 1, lang)));
  }
  return paragraphs;
}

function renderSection(section, lang, isFirst) {
  const nodes = [];
  if (!isFirst) nodes.push(new Paragraph({ children: [new PageBreak()] }));

  // Coloured section banner
  nodes.push(new Paragraph({
    spacing: { before: 120, after: 80 },
    shading: { fill: COLORS.band, type: ShadingType.CLEAR },
    border: {
      left:   { style: BorderStyle.SINGLE, size: 24, color: COLORS.primary, space: 8 },
      top:    { style: BorderStyle.SINGLE, size:  4, color: COLORS.border,  space: 4 },
      bottom: { style: BorderStyle.SINGLE, size:  4, color: COLORS.border,  space: 4 },
      right:  { style: BorderStyle.SINGLE, size:  4, color: COLORS.border,  space: 4 },
    },
    children: [
      new TextRun({ text: `  ${section.badge}  `, bold: true, size: 32, color: "FFFFFF", shading: { fill: COLORS.primary } }),
      new TextRun({ text: `   ${pick(section.title, lang)}`, bold: true, size: 30, color: COLORS.section }),
    ],
  }));

  section.children.forEach((c) => nodes.push(...renderNode(c, 0, lang)));
  return nodes;
}

// Legend explaining the tree glyphs & colours
function renderLegend(lang) {
  const isEn = lang === "en";
  const rows = [
    { label: isEn ? "Section banner"            : "विभाग शीर्षक",  color: COLORS.section, tag: isEn ? "A / B / C …" : "A / B / C …" },
    { label: isEn ? "Field (form input)"        : "फील्ड (form input)",     color: COLORS.field,  tag: "[FIELD] / [फील्ड]" },
    { label: isEn ? "Choice / dropdown option"  : "पर्याय / dropdown निवड", color: COLORS.option, tag: "[CHOICE] / [पर्याय]" },
    { label: isEn ? "Opens (fields that appear)": "उघडते (नवीन fields येतात)", color: COLORS.opens,  tag: "[OPENS] / [उघडते]" },
    { label: isEn ? "Note"                       : "टीप",                    color: COLORS.note,   tag: "[NOTE] / [टीप]" },
  ];
  return rows.map((r) => new Paragraph({
    spacing: { after: 40 },
    indent: { left: 200 },
    children: [
      new TextRun({ text: "■ ", color: r.color, bold: true, size: 22 }),
      new TextRun({ text: `${r.tag}  `, color: COLORS.muted, size: 18, bold: true }),
      new TextRun({ text: r.label, color: "1F2937" }),
    ],
  }));
}

function buildDoc(lang) {
  const isEn = lang === "en";
  const title    = isEn ? "Kohli Samaj Vikas Mandal, Nagpur" : "कोहळी समाज विकास मंडळ, नागपूर";
  const subtitle = isEn ? "Family Survey — Hierarchical Form Tree" : "कुटुंब सर्वेक्षण — Hierarchical Form Tree";
  const tagline  = isEn
    ? "A tree-style outline of every section, field, option, and the fields that open when each option is chosen."
    : "प्रत्येक section, field, पर्याय व निवडीनंतर उघडणाऱ्या fields चा tree स्वरूपात outline.";

  const cover = [
    new Paragraph({ spacing: { before: 900, after: 120 }, alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: title, bold: true, size: 44, color: COLORS.primary })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 },
      children: [new TextRun({ text: subtitle, bold: true, size: 32, color: COLORS.field })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 },
      children: [new TextRun({ text: tagline, italics: true, color: COLORS.muted, size: 22 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: isEn ? "Language: English" : "भाषा: मराठी", bold: true, color: COLORS.primary })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 },
      children: [new TextRun({ text: isEn ? "Hierarchical Edition · v1.0" : "Hierarchical Edition · आवृत्ती 1.0", color: COLORS.muted })] }),
    new Paragraph({ children: [new PageBreak()] }),

    new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { after: 120 },
      children: [new TextRun({ text: isEn ? "How to read this tree" : "हे tree कसे वाचावे", bold: true, color: COLORS.primary })] }),
    new Paragraph({ spacing: { after: 80 },
      children: [new TextRun({
        text: isEn
          ? "Each field is followed by its options. Under each option, the fields that open when that option is selected are shown indented one level deeper. Indentation therefore mirrors exactly what the surveyor sees in the form."
          : "प्रत्येक field खाली त्याचे पर्याय दिले आहेत. प्रत्येक पर्यायाखाली, तो निवडल्यावर उघडणारे fields एका level जास्त indent करून दाखवले आहेत. म्हणून form मध्ये surveyor ला जो order दिसतो, तोच indentation मध्ये आहे.",
      })] }),

    new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 80 },
      children: [new TextRun({ text: isEn ? "Legend" : "संकेत", bold: true, color: COLORS.field })] }),
    ...renderLegend(lang),

    new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 240, after: 120 },
      children: [new TextRun({ text: isEn ? "Table of Contents" : "अनुक्रमणिका", bold: true, color: COLORS.primary })] }),
    ...sections.map((s) => new Paragraph({
      spacing: { after: 40 }, indent: { left: 200 },
      children: [
        new TextRun({ text: `${s.badge}.  `, bold: true, color: COLORS.field }),
        new TextRun({ text: pick(s.title, lang) }),
      ],
    })),
  ];

  const body = sections.flatMap((s, i) => renderSection(s, lang, false));

  return new Document({
    styles: {
      default: { document: { run: { font: "Nirmala UI", size: 20 } } },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 30, bold: true, font: "Nirmala UI", color: COLORS.primary },
          paragraph: { spacing: { before: 280, after: 140 }, outlineLevel: 0 } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 26, bold: true, font: "Nirmala UI", color: COLORS.field },
          paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 1 } },
      ],
    },
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 }, // US Letter portrait
          margin: { top: 900, right: 900, bottom: 900, left: 900 },
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

await write("en", "Survey-Form-Hierarchy-English.docx");
await write("mr", "Survey-Form-Hierarchy-Marathi.docx");
