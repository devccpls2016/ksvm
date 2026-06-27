// ============================================================
// नौकरी / व्यवसाय (Job / Occupation) – Hierarchical data tree
// Used by <OccupationSelect /> to render cascading dropdowns.
// Encoded as JSON in a single string field so existing
// `occupation: string` storage stays unchanged.
// ============================================================

export type OccupationValue = {
  category: string;                  // Level 1 – मुख्य श्रेणी
  // Generic sub-classification fields (only those relevant fill in)
  serviceType?: string;              // राज्य / केंद्र शासन
  classLevel?: string;               // Class 1 / 2 / 3 / 4
  designation?: string;              // पदनाम
  branch?: string;                   // शाखा (engineer / education stream)
  rank?: string;                     // सैन्य / पोलीस rank
  force?: string;                    // Army / Navy / BSF / Police force
  institutionType?: string;          // सरकारी / खाजगी / अनुदानित / PSU
  institutionLevel?: string;         // प्राथमिक शाळा / महाविद्यालय …
  sector?: string;                   // IT / Banking / Healthcare …
  bankType?: string;                 // RBI / Nationalized / Cooperative …
  hospitalType?: string;             // सरकारी / खाजगी
  farmingTypes?: string[];           // multi-select
  landSize?: string;
  businessType?: string;
  businessName?: string;
  retiredFrom?: string;              // पूर्वीचा विभाग
  contributions?: string[];          // NRI – community contributions
  // NRI specific
  country?: string;
  province?: string;
  city?: string;
  // Common extra fields
  organisation?: string;             // कंपनी / संस्था / रुग्णालय नाव
  postingPlace?: string;             // कार्यरत ठिकाण
  annualIncome?: string;             // वार्षिक उत्पन्न
  experienceYears?: string;          // अनुभव (वर्षे)
  notes?: string;                    // इतर तपशील
};

export const EMPTY_OCCUPATION: OccupationValue = { category: "" };

export function encodeOccupation(v: OccupationValue): string {
  if (!v || !v.category) return "";
  // Strip empty entries so the stored string stays compact.
  const clean: Record<string, unknown> = {};
  Object.entries(v).forEach(([k, val]) => {
    if (val === undefined || val === null || val === "") return;
    if (Array.isArray(val) && val.length === 0) return;
    clean[k] = val;
  });
  return JSON.stringify(clean);
}

export function decodeOccupation(s: string | undefined | null): OccupationValue {
  if (!s) return { ...EMPTY_OCCUPATION };
  // Backward-compat: old plain string values
  if (!s.startsWith("{")) return { category: s };
  try {
    const obj = JSON.parse(s);
    return { ...EMPTY_OCCUPATION, ...obj };
  } catch {
    return { category: s };
  }
}

/** Human-readable summary for tables / previews. */
export function summariseOccupation(v: OccupationValue): string {
  const parts: string[] = [];
  if (v.category) parts.push(v.category);
  if (v.serviceType) parts.push(v.serviceType);
  if (v.force) parts.push(v.force);
  if (v.classLevel) parts.push(v.classLevel);
  if (v.branch) parts.push(v.branch);
  if (v.sector) parts.push(v.sector);
  if (v.bankType) parts.push(v.bankType);
  if (v.institutionType) parts.push(v.institutionType);
  if (v.institutionLevel) parts.push(v.institutionLevel);
  if (v.hospitalType) parts.push(v.hospitalType);
  if (v.businessType) parts.push(v.businessType);
  if (v.retiredFrom) parts.push(`निवृत्त: ${v.retiredFrom}`);
  if (v.designation) parts.push(v.designation);
  if (v.rank) parts.push(v.rank);
  if (v.farmingTypes?.length) parts.push(v.farmingTypes.join(", "));
  if (v.landSize) parts.push(v.landSize);
  if (v.country) parts.push(v.country);
  if (v.city) parts.push(v.city);
  if (v.organisation) parts.push(v.organisation);
  if (v.postingPlace) parts.push(v.postingPlace);
  return parts.join(" • ");
}

// ============================================================
// Option lists (Marathi + English bilingual)
// ============================================================

export const PRIMARY_CATEGORIES: string[] = [
  "शेतकरी (Farmer)",
  "शेती + व्यवसाय (Agriculture + Business)",
  "कृषी मजूर / शेतमजूर (Farm Labour)",
  "स्वरोजगार (Self Employed)",
  "व्यवसाय (Business Owner)",
  "मानधनधारक पदाधिकारी (Honorarium Based Position)",
  "सरकारी कर्मचारी (Government Employee)",
  "निमसरकारी / PSU कर्मचारी (Semi Government / PSU)",
  "खाजगी कर्मचारी (Private Employee)",
  "शिक्षण क्षेत्र (Education Sector)",
  "वैद्यकीय क्षेत्र (Medical Sector)",
  "महिला व बाल विकास (Women & Child Development)",
  "अभियंता (Engineering Sector)",
  "बँकिंग व वित्तीय क्षेत्र (Banking & Finance)",
  "न्यायव्यवस्था (Judiciary)",
  "संरक्षण व सुरक्षा सेवा (Defence & Security)",
  "निवृत्त / पेन्शनधारक (Retired / Pensioner)",
  "बेरोजगार (Unemployed)",
  "परदेशस्थ (NRI)",
  "इतर (Other)",
];

export const FARMING_TYPES = [
  "कोरडवाहू शेती (Dry Land Farming)",
  "बागायती शेती (Irrigated Farming)",
  "धान शेती (Paddy Farming)",
  "भाजीपाला शेती (Vegetable Farming)",
  "फळबाग (Horticulture / Orchard)",
  "मत्स्य व्यवसाय (Fisheries)",
  "पशुपालन (Animal Husbandry)",
  "दुग्ध व्यवसाय (Dairy)",
  "कुक्कुटपालन (Poultry)",
  "शेळीपालन (Goat Rearing)",
  "रेशीम उद्योग (Sericulture)",
  "मधमाशी पालन (Apiculture)",
  "इतर (Other)",
];

export const LAND_SIZES = [
  "1 एकरपेक्षा कमी (< 1 acre)",
  "1 ते 5 एकर (1–5 acres)",
  "5 ते 10 एकर (5–10 acres)",
  "10 ते 20 एकर (10–20 acres)",
  "20 एकरपेक्षा जास्त (> 20 acres)",
];

export const BUSINESS_TYPES = [
  "किराणा दुकान (Grocery Shop)",
  "हार्डवेअर (Hardware)",
  "मेडिकल स्टोअर (Medical Store)",
  "कृषी सेवा केंद्र (Agri Service Centre)",
  "ट्रान्सपोर्ट (Transport)",
  "बांधकाम व्यवसाय (Construction)",
  "हॉटेल / रेस्टॉरंट (Hotel / Restaurant)",
  "उद्योग / कारखाना (Industry / Factory)",
  "सेवा व्यवसाय (Service Business)",
  "ऑनलाइन व्यवसाय (Online Business)",
  "दुग्ध / डेअरी (Dairy)",
  "वाहन विक्री / गॅरेज (Auto / Garage)",
  "कपडे / टेलरिंग (Garments / Tailoring)",
  "सौंदर्य / सलून (Salon / Beauty)",
  "इतर (Other)",
];

export const SELF_EMPLOYED_TYPES = [
  "सुतार (Carpenter)",
  "लोहार (Blacksmith)",
  "गवंडी (Mason)",
  "प्लंबर (Plumber)",
  "इलेक्ट्रिशियन (Electrician)",
  "वेल्डर (Welder)",
  "मेकॅनिक (Mechanic)",
  "ड्रायव्हर (Driver)",
  "शिंपी (Tailor)",
  "नाभिक (Barber)",
  "चित्रकार / पेंटर (Painter)",
  "फेरीवाला (Hawker / Vendor)",
  "इतर (Other)",
];

export const HONORARIUM_POSITIONS = [
  "रोजगार सेवक (Employment Sevak)",
  "पोलीस पाटील (Police Patil)",
  "कोतवाल (Kotwal)",
  "सरपंच (Sarpanch)",
  "उपसरपंच (Up-Sarpanch)",
  "ग्रामपंचायत सदस्य (Gram Panchayat Member)",
  "पंचायत समिती सदस्य (Panchayat Samiti Member)",
  "जिल्हा परिषद सदस्य (Zilla Parishad Member)",
  "नगरसेवक (Municipal Councillor)",
  "इतर (Other)",
];

// ---------- Government Employee ----------
export const GOVT_SERVICE_TYPES = [
  "राज्य शासन (State Government)",
  "केंद्र शासन (Central Government)",
];

export const GOVT_CLASSES = [
  "Class 1 Officer (वर्ग 1 अधिकारी)",
  "Class 2 Officer (वर्ग 2 अधिकारी)",
  "Class 3 Employee (वर्ग 3 कर्मचारी)",
  "Class 4 Employee (वर्ग 4 कर्मचारी)",
];

export const GOVT_CLASS_DESIGNATIONS: Record<string, string[]> = {
  "Class 1 Officer (वर्ग 1 अधिकारी)": [
    "IAS (भारतीय प्रशासन सेवा)",
    "IPS (भारतीय पोलीस सेवा)",
    "IFS (भारतीय वन सेवा)",
    "IRS (भारतीय महसूल सेवा)",
    "State Civil Service Officer (राज्य नागरी सेवा अधिकारी)",
    "District Collector (जिल्हाधिकारी)",
    "CEO Zilla Parishad (मुख्य कार्यकारी अधिकारी, जि.प.)",
    "Superintendent of Police (पोलीस अधीक्षक)",
    "Commissioner (आयुक्त)",
    "Chief Engineer (मुख्य अभियंता)",
    "Executive Director (कार्यकारी संचालक)",
    "Deputy Secretary (उपसचिव)",
    "Joint Secretary (सहसचिव)",
    "University Registrar (विद्यापीठ कुलसचिव)",
    "Dean (अधिष्ठाता)",
    "Principal – Government College (शासकीय महाविद्यालय प्राचार्य)",
    "Civil Surgeon (जिल्हा शल्य चिकित्सक)",
    "District Health Officer (जिल्हा आरोग्य अधिकारी)",
    "Chief Executive Officer (मुख्य कार्यकारी अधिकारी)",
    "Other Class 1 Officer (इतर वर्ग 1)",
  ],
  "Class 2 Officer (वर्ग 2 अधिकारी)": [
    "Deputy Collector (उपजिल्हाधिकारी)",
    "Tahsildar (तहसीलदार)",
    "Naib Tahsildar (नायब तहसीलदार)",
    "Block Development Officer / BDO (गटविकास अधिकारी)",
    "Extension Officer (विस्तार अधिकारी)",
    "Assistant Commissioner (सहाय्यक आयुक्त)",
    "Assistant Director (सहाय्यक संचालक)",
    "Assistant Engineer (सहाय्यक अभियंता)",
    "Medical Officer (वैद्यकीय अधिकारी)",
    "Police Inspector / PI (पोलीस निरीक्षक)",
    "Labour Officer (कामगार अधिकारी)",
    "Accounts Officer (लेखा अधिकारी)",
    "Education Officer (शिक्षण अधिकारी)",
    "Assistant Registrar (सहाय्यक निबंधक)",
    "Mukhyadhikari (मुख्याधिकारी)",
    "Other Class 2 Officer (इतर वर्ग 2)",
  ],
  "Class 3 Employee (वर्ग 3 कर्मचारी)": [
    "Gram Sevak (ग्रामसेवक)",
    "Agriculture Assistant (कृषी सहाय्यक)",
    "Talathi (तलाठी)",
    "Clerk / लिपिक (Clerk)",
    "Senior Clerk (वरिष्ठ लिपिक)",
    "Junior Clerk (कनिष्ठ लिपिक)",
    "Teacher (शिक्षक)",
    "Police Constable (पोलीस शिपाई)",
    "Head Constable (हवालदार)",
    "Forest Guard (वनरक्षक)",
    "Laboratory Technician (प्रयोगशाळा तंत्रज्ञ)",
    "Data Entry Operator (डेटा एंट्री ऑपरेटर)",
    "Assistant (सहाय्यक)",
    "Revenue Assistant (महसूल सहाय्यक)",
    "Other Class 3 Employee (इतर वर्ग 3)",
  ],
  "Class 4 Employee (वर्ग 4 कर्मचारी)": [
    "Peon / शिपाई (Peon)",
    "Attendant (परिचर)",
    "Driver (वाहन चालक)",
    "Watchman (चौकीदार)",
    "Sweeper (सफाई कर्मचारी)",
    "Helper (मदतनीस)",
    "Office Assistant (कार्यालय सहाय्यक)",
    "Multi Task Staff / MTS (बहुउद्देशीय कर्मचारी)",
    "Other Class 4 Employee (इतर वर्ग 4)",
  ],
};

// ---------- Education Sector ----------
export const EDU_INSTITUTION_TYPES = [
  "Government (सरकारी)",
  "Aided (अनुदानित)",
  "Private (खाजगी)",
  "University (विद्यापीठ)",
];

export const EDU_INSTITUTION_LEVELS = [
  "Primary School (प्राथमिक शाळा)",
  "Secondary School (माध्यमिक शाळा)",
  "Higher Secondary School (उच्च माध्यमिक विद्यालय)",
  "Junior College (कनिष्ठ महाविद्यालय)",
  "Degree College (पदवी महाविद्यालय)",
  "University (विद्यापीठ)",
];

export const EDU_DESIGNATIONS = [
  "Primary Teacher (प्राथमिक शिक्षक)",
  "Secondary Teacher (माध्यमिक शिक्षक)",
  "Higher Secondary Teacher (उच्च माध्यमिक शिक्षक)",
  "Lecturer (व्याख्याता)",
  "Assistant Professor (सहाय्यक प्राध्यापक)",
  "Associate Professor (सहयोगी प्राध्यापक)",
  "Professor (प्राध्यापक)",
  "Head of Department / HOD (विभागप्रमुख)",
  "Principal (प्राचार्य)",
  "Vice Principal (उपप्राचार्य)",
  "Mukhyadhyapak / मुख्याध्यापक (Headmaster)",
  "Dean (अधिष्ठाता)",
  "Registrar (कुलसचिव)",
  "Other (इतर)",
];

// ---------- Medical Sector ----------
export const MED_INSTITUTION_TYPES = [
  "Government Hospital (सरकारी रुग्णालय)",
  "Private Hospital (खाजगी रुग्णालय)",
  "Medical College (वैद्यकीय महाविद्यालय)",
  "Clinic (दवाखाना)",
  "Primary Health Centre / PHC (प्राथमिक आरोग्य केंद्र)",
];

export const MED_DESIGNATIONS = [
  "Medical Officer (वैद्यकीय अधिकारी)",
  "Resident Doctor (निवासी डॉक्टर)",
  "Specialist Doctor (विशेषज्ञ डॉक्टर)",
  "Surgeon (शल्यचिकित्सक)",
  "Physician (फिजिशियन)",
  "Dentist (दंतचिकित्सक)",
  "Orthopedic Doctor (अस्थिरोग तज्ज्ञ)",
  "Pediatrician (बालरोग तज्ज्ञ)",
  "Gynecologist (स्त्रीरोग तज्ज्ञ)",
  "Cardiologist (हृदयरोग तज्ज्ञ)",
  "Neurologist (न्यूरोलॉजिस्ट)",
  "Psychiatrist (मानसोपचार तज्ज्ञ)",
  "BAMS Doctor (आयुर्वेद)",
  "BHMS Doctor (होमिओपॅथी)",
  "BUMS Doctor (युनानी)",
  "Physiotherapist (फिजिओथेरपिस्ट)",
  "Pharmacist (फार्मासिस्ट)",
  "Staff Nurse / परिचारिका (Nurse)",
  "Nursing Superintendent (परिचारिका अधीक्षक)",
  "Lab Technician (प्रयोगशाळा तंत्रज्ञ)",
  "Radiologist (रेडिओलॉजिस्ट)",
  "Other (इतर)",
];

// ---------- Women & Child Development ----------
export const WCD_DESIGNATIONS = [
  "अंगणवाडी सेविका (Anganwadi Sevika)",
  "अंगणवाडी मदतनीस (Anganwadi Madatnis)",
  "आशा सेविका (ASHA Worker)",
  "ASHA Facilitator (आशा फॅसिलिटेटर)",
  "Supervisor – ICDS (पर्यवेक्षक)",
  "Child Development Project Officer / CDPO (बालविकास प्रकल्प अधिकारी)",
  "Community Health Worker (सामुदायिक आरोग्य कर्मचारी)",
  "Nutrition Officer (पोषण अधिकारी)",
  "Other (इतर)",
];

// ---------- Engineering ----------
export const ENG_INSTITUTION_TYPES = [
  "Government (सरकारी)",
  "PSU (सार्वजनिक उपक्रम)",
  "Private (खाजगी)",
  "Self Employed / Consultant (स्वतंत्र सल्लागार)",
];

export const ENG_BRANCHES = [
  "Civil Engineer (स्थापत्य अभियंता)",
  "Mechanical Engineer (यांत्रिक अभियंता)",
  "Electrical Engineer (विद्युत अभियंता)",
  "Electronics Engineer (इलेक्ट्रॉनिक्स)",
  "Computer Engineer (संगणक अभियंता)",
  "IT Engineer (माहिती तंत्रज्ञान)",
  "Software Engineer (सॉफ्टवेअर)",
  "Network Engineer (नेटवर्क)",
  "Agriculture Engineer (कृषी अभियंता)",
  "Chemical Engineer (रसायन अभियंता)",
  "Other (इतर)",
];

export const ENG_DESIGNATIONS = [
  "Junior Engineer / JE (कनिष्ठ अभियंता)",
  "Assistant Engineer / AE (सहाय्यक अभियंता)",
  "Deputy Engineer (उप अभियंता)",
  "Executive Engineer / EE (कार्यकारी अभियंता)",
  "Superintending Engineer / SE (अधीक्षक अभियंता)",
  "Chief Engineer / CE (मुख्य अभियंता)",
  "Project Manager (प्रकल्प व्यवस्थापक)",
  "Technical Director (तांत्रिक संचालक)",
  "Software Developer (सॉफ्टवेअर डेव्हलपर)",
  "Other (इतर)",
];

// ---------- Banking & Finance ----------
export const BANK_TYPES = [
  "RBI (रिझर्व्ह बँक)",
  "Nationalized Bank (राष्ट्रीयीकृत बँक)",
  "Cooperative Bank (सहकारी बँक)",
  "Private Bank (खाजगी बँक)",
  "Insurance Sector (विमा क्षेत्र)",
  "NBFC / Finance Company (वित्त कंपनी)",
];

export const BANK_DESIGNATIONS = [
  "Clerk (लिपिक)",
  "Cashier (खजिनदार)",
  "Officer (अधिकारी)",
  "Probationary Officer / PO (परिविक्षाधीन अधिकारी)",
  "Assistant Manager (सहाय्यक व्यवस्थापक)",
  "Branch Manager (शाखा व्यवस्थापक)",
  "Regional Manager (विभागीय व्यवस्थापक)",
  "AGM (सहाय्यक महाव्यवस्थापक)",
  "DGM (उप महाव्यवस्थापक)",
  "GM (महाव्यवस्थापक)",
  "Insurance Agent (विमा एजंट)",
  "Other (इतर)",
];

// ---------- Judiciary ----------
export const JUDICIARY_DESIGNATIONS = [
  "Judge – Supreme Court (सर्वोच्च न्यायालय न्यायाधीश)",
  "Judge – High Court (उच्च न्यायालय न्यायाधीश)",
  "District Judge (जिल्हा न्यायाधीश)",
  "Civil Judge Senior Division (दिवाणी न्यायाधीश वरिष्ठ)",
  "Civil Judge Junior Division (दिवाणी न्यायाधीश कनिष्ठ)",
  "Judicial Magistrate (न्यायदंडाधिकारी)",
  "Public Prosecutor (सरकारी वकील)",
  "Advocate / वकील (Advocate)",
  "Notary (नोटरी)",
  "Court Clerk (न्यायालय लिपिक)",
  "Other (इतर)",
];

// ---------- Defence & Security ----------
export const DEFENCE_FORCES = [
  "Indian Army (भारतीय सैन्य)",
  "Indian Navy (भारतीय नौदल)",
  "Indian Air Force (भारतीय वायुदल)",
  "BSF (सीमा सुरक्षा दल)",
  "CRPF (केंद्रीय राखीव पोलीस दल)",
  "CISF (केंद्रीय औद्योगिक सुरक्षा दल)",
  "ITBP (भारत-तिबेट सीमा पोलीस)",
  "SSB (सशस्त्र सीमा बल)",
  "Assam Rifles (आसाम रायफल्स)",
  "Maharashtra Police (महाराष्ट्र पोलीस)",
  "SRPF (राज्य राखीव पोलीस दल)",
  "GRP (रेल्वे पोलीस)",
  "RPF (रेल्वे संरक्षण दल)",
  "Coast Guard (तटरक्षक दल)",
  "Other (इतर)",
];

export const MILITARY_RANKS = [
  "Soldier / Sepoy (सैनिक)",
  "Lance Naik (लान्स नायक)",
  "Naik (नायक)",
  "Havildar (हवालदार)",
  "Subedar (सुभेदार)",
  "Subedar Major (सुभेदार मेजर)",
  "Lieutenant (लेफ्टनंट)",
  "Captain (कॅप्टन)",
  "Major (मेजर)",
  "Lieutenant Colonel (लेफ्टनंट कर्नल)",
  "Colonel (कर्नल)",
  "Brigadier (ब्रिगेडियर)",
  "Major General (मेजर जनरल)",
  "Lieutenant General (लेफ्टनंट जनरल)",
  "General (जनरल)",
  "Other (इतर)",
];

export const POLICE_RANKS = [
  "Constable (शिपाई)",
  "Head Constable (हवालदार)",
  "ASI – Assistant Sub Inspector (सहाय्यक उपनिरीक्षक)",
  "PSI – Police Sub Inspector (पोलीस उपनिरीक्षक)",
  "API – Assistant Police Inspector (सहाय्यक पोलीस निरीक्षक)",
  "PI – Police Inspector (पोलीस निरीक्षक)",
  "ACP / DYSP (सहाय्यक पोलीस आयुक्त / उपअधीक्षक)",
  "SP – Superintendent of Police (पोलीस अधीक्षक)",
  "DIG (उप महानिरीक्षक)",
  "IG (महानिरीक्षक)",
  "DGP (पोलीस महासंचालक)",
  "Other (इतर)",
];

// ---------- Private Sector ----------
export const PRIVATE_SECTORS = [
  "IT / Software (माहिती तंत्रज्ञान)",
  "Banking / Finance (बँकिंग व वित्त)",
  "Education (शिक्षण)",
  "Healthcare (आरोग्य)",
  "Manufacturing (उत्पादन)",
  "Construction (बांधकाम)",
  "Retail / Sales (किरकोळ विक्री)",
  "Hospitality (आदरातिथ्य)",
  "Logistics / Transport (वाहतूक)",
  "Telecom (दूरसंचार)",
  "Media / Journalism (माध्यम)",
  "Agriculture / Agri-Business (कृषी)",
  "Other (इतर)",
];

// ---------- Retired ----------
export const RETIRED_FROM = [
  "शिक्षक (Teacher)",
  "सरकारी कर्मचारी (Government Employee)",
  "संरक्षण सेवा (Defence Service)",
  "बँक कर्मचारी (Bank Employee)",
  "खाजगी कर्मचारी (Private Employee)",
  "वैद्यकीय (Medical)",
  "अभियंता (Engineer)",
  "इतर (Other)",
];

// ---------- NRI ----------
export const NRI_CONTRIBUTIONS = [
  "देणगी (Donation)",
  "शिष्यवृत्ती सहाय्य (Scholarship Support)",
  "शिक्षण मार्गदर्शन (Educational Guidance)",
  "करिअर मार्गदर्शन (Career Counselling)",
  "रोजगार मार्गदर्शन (Employment Guidance)",
  "गुंतवणूक मार्गदर्शन (Investment Guidance)",
  "मेंटॉरशिप (Mentorship)",
  "सामाजिक प्रकल्प सहाय्य (Social Project Support)",
];

export const INCOME_RANGES = [
  "1 लाखाखाली (< 1 Lakh)",
  "1 – 3 लाख (1–3 Lakh)",
  "3 – 5 लाख (3–5 Lakh)",
  "5 – 10 लाख (5–10 Lakh)",
  "10 – 25 लाख (10–25 Lakh)",
  "25 लाखापेक्षा जास्त (> 25 Lakh)",
  "सांगू इच्छित नाही (Prefer not to say)",
];
