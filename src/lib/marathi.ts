// Marathi constants & options for the survey app
export const T = {
  appName: "कोहळी समाज विकास मंडळ, नागपूर",
  appTagline: "ग्राम / तालुका / जिल्हा स्तरीय कुटुंब सर्वेक्षण व्यवस्थापन",
  // Navigation
  dashboard: "डॅशबोर्ड",
  newSurvey: "नवीन सर्वेक्षण",
  allSurveys: "सर्व सर्वेक्षणे",
  reports: "अहवाल",
  logout: "लॉग आउट",
  // Auth
  login: "लॉग इन",
  signup: "नोंदणी करा",
  email: "ईमेल",
  password: "पासवर्ड",
  fullName: "पूर्ण नाव",
  loginWithGoogle: "Google ने लॉग इन करा",
  alreadyAccount: "खाते आहे? लॉग इन करा",
  noAccount: "खाते नाही? नोंदणी करा",
  // Common
  save: "जतन करा",
  saving: "जतन होत आहे...",
  cancel: "रद्द करा",
  edit: "संपादन",
  delete: "हटवा",
  view: "पाहा",
  search: "शोधा",
  filter: "फिल्टर",
  yes: "होय",
  no: "नाही",
  add: "जोडा",
  remove: "काढा",
  submit: "सबमिट",
  back: "मागे",
  next: "पुढे",
  // Sections
  geoInfo: "भौगोलिक माहिती",
  personalInfo: "कुटुंब प्रमुख माहिती",
  members: "कुटुंबातील सदस्य",
  position: "धारण केलेले पद",
  needs: "कौटुंबिक आवश्यक गरजा",
  houseInfo: "घर विषयक माहिती",
  agriInfo: "शेती विषयक माहिती",
  // Solar energy
  solarPanelInstalled: "तुमच्या घरी सौर ऊर्जा (Solar Panel) प्रणाली बसविण्यात आलेली आहे का?",
  solarPanelWanted: "तुम्हाला सौर ऊर्जा (Solar Panel) योजनेचा लाभ घ्यायचा आहे का?",
};

export const VILLAGES_PLACEHOLDER = "उदा. नागपूर";

// Options
export const MARITAL = ["विवाहित", "अविवाहित", "विधवा", "घटस्फोटित"];
export const GENDER = ["पुरुष", "स्त्री"];
export const OCCUPATION = [
  "शेतमजुरी / घरकाम",
  "सरकारी नौकरी",
  "खाजगी नौकरी",
  "पेन्शन धारक",
  "निराधार / भूमिहीन",
  "स्वयंरोजगार",
];
export const EDUCATION = [
  "निरक्षर", "प्राथमिक", "माध्यमिक", "उच्च माध्यमिक",
  "पदवी", "पदव्युत्तर", "इतर",
];
export const RELATIONSHIP = [
  "पत्नी", "पती", "मुलगा", "मुलगी", "वडील", "आई",
  "भाऊ", "बहीण", "सून", "जावई", "नातू", "नात", "इतर",
];
export const JOB_TYPE = ["Government", "Private", "Department"];

export const HOUSEHOLD_ITEMS = [
  "मोबाईल", "टीव्ही", "फ्रिज", "गॅस शेगडी", "कॉम्प्युटर",
  "सायकल", "दोन चाकी वाहन", "ऑटो", "चार चाकी वाहन",
];

export const HOUSE_TYPES = ["कच्चा", "पक्का"];
export const LIVING_STATUS = ["भाड्याचे", "आश्रित"];

export const FARMLAND_SIZES = [
  "1 एकरपेक्षा कमी (< 1 acre)",
  "1 ते 5 एकर (1–5 acres)",
  "5 ते 10 एकर (5–10 acres)",
  "10 ते 20 एकर (10–20 acres)",
  "20 एकरपेक्षा जास्त (> 20 acres)",
];
export const CROP_TYPES = ["गहू", "धान", "मका"];
export const CROP_SEASONS = ["खरीप", "रब्बी (धान सोडून)", "उन्हाळी (धानासह)", "घेतलेली पिके"];
export const MAJOR_CROP_TYPES = [
  "धान्य पिके",
  "कडधान्य पिके",
  "तेलबिया पिके",
  "भाजीपाला पिके",
  "फळबाग",
  "नगदी पिके",
  "मसाला पिके",
  "इतर",
];

export const IRRIGATION = ["ट्युबवेल / बोअरवेल", "विहीर", "तलाव", "नदी", "नहर"];
export const FARM_TOOLS = ["बैलबंडी", "नांगर", "ट्रॅक्टर", "विहीर", "बोअरवेल"];

// Position
export const POSITION_TYPES = ["राजकीय", "सामाजिक", "लोकप्रतिनिधी"];
export const POSITION_STATUS = ["आजी", "माजी"];
export const POLITICAL_LEVELS = [
  "प्रदेश पदाधिकारी", "जिल्हा पदाधिकारी", "तालुका पदाधिकारी", "गाव पदाधिकारी",
];
export const REPRESENTATIVES = [
  "खासदार",
  "आमदार",
  "जिल्हा परिषद सदस्य",
  "पंचायत समिती सदस्य",
  "नगरपरिषद सदस्य",
  "नगरपंचायत",
  "ग्रामपंचायत",
  "Co-operative Bank (सहकारी बँक)",
  "Co-operative Society (सहकारी संस्था)",
];


export const SOCIAL_ORGS: { name: string; roles: string[] }[] = [
  { name: "सामाजिक संस्था (Social Organisation)", roles: ["पदाधिकारी", "अध्यक्ष", "उपाध्यक्ष", "सचिव", "सदस्य"] },
  { name: "शैक्षणिक संस्था (Educational Institution)", roles: ["पदाधिकारी", "अध्यक्ष", "उपाध्यक्ष", "सचिव", "सदस्य"] },
];

export const REPRESENTATIVE_ROLES: Record<string, string[]> = {
  "खासदार": ["खासदार"],
  "आमदार": ["आमदार"],
  "जिल्हा परिषद सदस्य": ["अध्यक्ष", "उपाध्यक्ष", "सभापती", "सदस्य"],
  "पंचायत समिती सदस्य": ["अध्यक्ष", "उपाध्यक्ष", "सभापती", "सदस्य"],
  "नगरपरिषद सदस्य": ["अध्यक्ष", "उपाध्यक्ष", "सभापती", "सदस्य"],
  "ग्रामपंचायत": ["सरपंच", "उपसरपंच", "ग्रामपंचायत सदस्य", "पोलीस पाटील", "कोतवाल"],
  "Co-operative Bank (सहकारी बँक)": ["अध्यक्ष", "उपाध्यक्ष", "संचालक", "सदस्य"],
  "Co-operative Society (सहकारी संस्था)": ["अध्यक्ष", "उपाध्यक्ष", "सचिव", "मेंबर"],
};

