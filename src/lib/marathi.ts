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

export const HOUSE_TYPES = [
  "पाल / गवताचे", "माती / कावलारू", "टिनाचे / कुळाचे", "विटा / सिमेंटचे",
];
export const LIVING_STATUS = ["भाड्याचे", "आश्रित"];

export const FARMLAND_SIZES = [
  "0 – 2.5 आर", "2.5 – 5.0 आर", "5.0 – 10.0 आर", "More Than 10 आर",
];
export const CROP_TYPES = ["गहू", "धान", "मका"];
export const CROP_SEASONS = ["खरीप", "रब्बी", "उन्हाळी"];
export const IRRIGATION = ["ट्युबवेल / बोअरवेल", "विहीर", "तलाव / नदी", "नहर"];
export const FARM_TOOLS = ["बैलबंडी", "नांगर", "ट्रॅक्टर", "विहीर", "बोअरवेल"];

// Position
export const POSITION_TYPES = ["राजकीय", "सामाजिक", "लोकप्रतिनिधी"];
export const POSITION_STATUS = ["आजी", "माजी"];
export const POLITICAL_LEVELS = [
  "प्रदेश पदाधिकारी", "जिल्हा पदाधिकारी", "तालुका पदाधिकारी", "गाव पदाधिकारी",
];
export const REPRESENTATIVES = [
  "आमदार", "जिल्हा परिषद सदस्य", "पंचायत समिती सदस्य", "नगरपरिषद सदस्य",
];
export const SOCIAL_ORGS = [
  { name: "सामाजिक संस्था (Social Organisation)", roles: ["पदाधिकारी", "अध्यक्ष", "उपाध्यक्ष", "सचिव", "सदस्य"] },
  { name: "शैक्षणिक संस्था (Educational Institution)", roles: ["पदाधिकारी", "अध्यक्ष", "उपाध्यक्ष", "सचिव", "सदस्य"] },
];

// लोकप्रतिनिधी अंतर्गत सहकारी संस्था
export const REPRESENTATIVE_ORGS = [
  { name: "Co-operative Bank (सहकारी बँक)", roles: ["अध्यक्ष", "उपाध्यक्ष", "संचालक", "सदस्य"] },
  { name: "Co-operative Society (सहकारी संस्था)", roles: ["अध्यक्ष", "उपाध्यक्ष", "सचिव", "मेंबर"] },
];
