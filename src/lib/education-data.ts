// Hierarchical education data: Level -> Stream -> Courses
// Institution type (Government/Private) captured separately for applicable levels.

export type EducationStream = {
  stream: string;
  courses: string[];
};

export type EducationLevel = {
  level: string;
  // If streams is empty, the level itself is the final value (e.g. निरक्षर)
  streams: EducationStream[];
  // Whether to ask for Government / Private / etc.
  askInstitution: boolean;
};

export const INSTITUTION_TYPES = [
  "सरकारी (Government)",
  "खाजगी (Private)",
  "अनुदानित (Aided)",
  "विना-अनुदानित (Unaided)",
  "स्वायत्त (Autonomous)",
];

export const EDUCATION_TREE: EducationLevel[] = [
  {
    level: "निरक्षर (Illiterate)",
    askInstitution: false,
    streams: [{ stream: "—", courses: ["निरक्षर"] }],
  },
  {
    level: "प्राथमिक (Primary)",
    askInstitution: true,
    streams: [
      {
        stream: "इयत्ता 1 ते 5",
        courses: ["इयत्ता 1 वी", "इयत्ता 2 री", "इयत्ता 3 री", "इयत्ता 4 थी", "इयत्ता 5 वी"],
      },
    ],
  },
  {
    level: "माध्यमिक (Secondary)",
    askInstitution: true,
    streams: [
      {
        stream: "इयत्ता 6 ते 10",
        courses: ["इयत्ता 6 वी", "इयत्ता 7 वी", "इयत्ता 8 वी", "इयत्ता 9 वी", "इयत्ता 10 वी (SSC)"],
      },
    ],
  },
  {
    level: "उच्च माध्यमिक (Higher Secondary)",
    askInstitution: true,
    streams: [
      { stream: "Arts (कला)", courses: ["इयत्ता 11 वी Arts", "इयत्ता 12 वी Arts"] },
      { stream: "Commerce (वाणिज्य)", courses: ["इयत्ता 11 वी Commerce", "इयत्ता 12 वी Commerce"] },
      { stream: "Science (विज्ञान)", courses: ["इयत्ता 11 वी Science", "इयत्ता 12 वी Science"] },
      {
        stream: "Vocational (व्यावसायिक)",
        courses: ["MCVC", "Vocational Course", "Agriculture Vocational", "Technical Vocational"],
      },
    ],
  },
  {
    level: "पदविका / डिप्लोमा (Diploma)",
    askInstitution: true,
    streams: [
      {
        stream: "Engineering Diploma",
        courses: [
          "Civil Engineering", "Mechanical Engineering", "Electrical Engineering",
          "Electronics Engineering", "Computer Engineering", "Information Technology",
          "Automobile Engineering", "Chemical Engineering",
        ],
      },
      {
        stream: "Technical Diploma",
        courses: [
          "Polytechnic", "ITI Electrician", "ITI Fitter", "ITI Welder",
          "ITI Turner", "ITI COPA", "ITI Mechanic", "ITI Plumber",
        ],
      },
      {
        stream: "Medical Diploma",
        courses: [
          "D.Pharm", "B.Pharm", "GNM", "ANM",
          "Medical Laboratory Technology", "Radiology Technician",
        ],
      },
      {
        stream: "Education Diploma",
        courses: ["D.Ed.", "D.El.Ed.", "Early Childhood Education"],
      },
      {
        stream: "Agriculture Diploma",
        courses: ["Diploma in Agriculture", "Agriculture Technology"],
      },
      {
        stream: "Management Diploma",
        courses: [
          "Diploma in Business Management",
          "Diploma in Marketing",
          "Diploma in Finance",
        ],
      },
      {
        stream: "Computer Diploma",
        courses: ["DCA", "PGDCA", "Hardware & Networking", "Software Development"],
      },
      {
        stream: "Other Diploma",
        courses: [
          "Hotel Management", "Fashion Designing", "Interior Designing",
          "Fine Arts", "Other Diploma",
        ],
      },
    ],
  },
  {
    level: "पदवी (Graduate)",
    askInstitution: true,
    streams: [
      {
        stream: "Arts (BA)",
        courses: [
          "BA General", "BA Marathi", "BA English", "BA Hindi", "BA History",
          "BA Political Science", "BA Sociology", "BA Economics", "BA Psychology",
          "BA Geography", "BA Public Administration",
        ],
      },
      {
        stream: "Commerce",
        courses: ["B.Com", "B.Com (Computer Application)", "BAF", "BFM", "BBI"],
      },
      {
        stream: "Science",
        courses: [
          "B.Sc", "B.Sc Physics", "B.Sc Chemistry", "B.Sc Mathematics",
          "B.Sc Computer Science", "B.Sc Information Technology",
          "B.Sc Biotechnology", "B.Sc Microbiology", "B.Sc Agriculture", "B.Sc Nursing",
        ],
      },
      {
        stream: "Computer & IT",
        courses: ["BCA", "BCS", "B.Sc IT", "B.Sc Computer Science"],
      },
      {
        stream: "Engineering (BE)",
        courses: [
          "BE Civil", "BE Mechanical", "BE Electrical", "BE Electronics",
          "BE Computer", "BE IT", "BE Electronics & Telecommunication",
        ],
      },
      {
        stream: "Engineering (B.Tech)",
        courses: [
          "B.Tech Civil", "B.Tech Mechanical", "B.Tech Electrical",
          "B.Tech Computer Science", "B.Tech IT", "B.Tech AI & Data Science",
          "B.Tech Artificial Intelligence", "B.Tech Cyber Security",
        ],
      },
      {
        stream: "Medical",
        courses: ["MBBS", "BAMS", "BHMS", "BDS", "BUMS", "BPT", "BOT", "BASLP", "B.Pharm"],
      },
      { stream: "Law", courses: ["LLB", "BA LLB", "BBA LLB", "B.Com LLB"] },
      { stream: "Education", courses: ["B.Ed", "B.P.Ed"] },
      { stream: "Management", courses: ["BBA", "BMS"] },
      { stream: "Agriculture", courses: ["B.Sc Agriculture", "B.Tech Agriculture"] },
      { stream: "Architecture & Design", courses: ["B.Arch", "Bachelor of Design"] },
      { stream: "Hospitality", courses: ["Hotel Management", "Travel & Tourism"] },
      {
        stream: "Other Graduate",
        courses: [
          "Fine Arts", "Performing Arts",
          "Journalism & Mass Communication", "Social Work (BSW)",
        ],
      },
    ],
  },
  {
    level: "पदव्युत्तर (Postgraduate)",
    askInstitution: true,
    streams: [
      {
        stream: "Arts",
        courses: [
          "MA Marathi", "MA English", "MA Hindi", "MA History", "MA Sociology",
          "MA Economics", "MA Political Science", "MA Psychology", "MA Geography",
        ],
      },
      { stream: "Commerce", courses: ["M.Com"] },
      {
        stream: "Management",
        courses: [
          "MBA Finance", "MBA Marketing", "MBA HR",
          "MBA Operations", "MBA IT", "MBA Hospital Management",
        ],
      },
      {
        stream: "Science",
        courses: [
          "M.Sc Physics", "M.Sc Chemistry", "M.Sc Mathematics",
          "M.Sc Computer Science", "M.Sc Biotechnology",
          "M.Sc Microbiology", "M.Sc Agriculture",
        ],
      },
      { stream: "Computer & IT", courses: ["MCA", "MCS", "M.Sc IT"] },
      {
        stream: "Engineering",
        courses: [
          "ME Civil", "ME Mechanical", "ME Electrical", "ME Computer",
          "M.Tech Civil", "M.Tech Mechanical",
          "M.Tech Computer Science", "M.Tech AI & Data Science",
        ],
      },
      { stream: "Medical", courses: ["MD", "MS", "MDS", "M.Pharm", "MPT"] },
      { stream: "Education", courses: ["M.Ed"] },
      { stream: "Law", courses: ["LLM"] },
      { stream: "Social Work", courses: ["MSW"] },
      { stream: "Research", courses: ["M.Phil", "Ph.D."] },
      {
        stream: "Other Postgraduate",
        courses: ["Journalism", "Fine Arts", "Library Science", "Public Administration"],
      },
    ],
  },
  {
    level: "इतर (Other)",
    askInstitution: true,
    streams: [
      {
        stream: "Certificate Courses",
        courses: ["MSCIT", "Tally", "Typing", "CCC", "GST Course"],
      },
      {
        stream: "Skill Development",
        courses: ["PMKVY Course", "NSDC Course", "Entrepreneurship Course"],
      },
      {
        stream: "Computer Certifications",
        courses: [
          "Data Analytics", "Web Development", "Graphic Designing",
          "Digital Marketing", "Cyber Security", "Cloud Computing",
          "Artificial Intelligence",
        ],
      },
      {
        stream: "Professional Certifications",
        courses: ["CA", "CS", "CMA", "CFA"],
      },
      {
        stream: "Competitive Exam Qualification",
        courses: ["UPSC Qualified", "MPSC Qualified", "Banking Qualified", "SSC Qualified"],
      },
      { stream: "Other", courses: ["Other Course"] },
    ],
  },
];

// Encode/decode pipe-delimited education string
// Format: "Level | Stream | Course | Institution"
export function encodeEducation(parts: {
  level?: string; stream?: string; course?: string; institution?: string;
}): string {
  const arr = [parts.level, parts.stream, parts.course, parts.institution]
    .map((x) => (x || "").trim());
  // strip trailing empties
  while (arr.length && !arr[arr.length - 1]) arr.pop();
  return arr.join(" | ");
}

export function decodeEducation(value: string): {
  level: string; stream: string; course: string; institution: string;
} {
  const parts = (value || "").split("|").map((s) => s.trim());
  return {
    level: parts[0] || "",
    stream: parts[1] || "",
    course: parts[2] || "",
    institution: parts[3] || "",
  };
}
