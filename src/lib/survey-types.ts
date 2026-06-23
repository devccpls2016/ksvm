export type FamilyMember = {
  name: string;
  relationship: string;
  age?: number | "";
  dob?: string;
  gender?: string;
  education?: string;
  occupation?: string;
  job_place?: string;
  mobile?: string;
  job_type?: string; // Government/Private/Department - when occupation is job
};

export type Crop = {
  season: string;
};


export type PositionData = {
  type?: string; // राजकीय / सामाजिक / लोकप्रतिनिधी
  status?: string; // आजी / माजी
  political_level?: string;
  party_name?: string;
  representative_type?: string;
  coop_role?: string;
  coop_org_name?: string;
  social_org?: string;
  social_role?: string;
};

export interface SurveyFormValues {
  village: string;
  taluka: string;
  district: string;
  pincode: string;
  head_name: string;
  head_photo_url: string;
  mobile: string;
  community: string;
  marital_status: string;
  gender: string;
  age: number | "";
  dob: string;
  education: string;
  occupation: string;
  household_items: string[];
  household_item_counts: Record<string, number>;
  owns_house: boolean | null;
  house_type: string;
  living_status: string;
  gharkul_received: boolean | null;
  gharkul_wanted: boolean | null;
  solar_panel_installed: boolean | null;
  solar_panel_wanted: boolean | null;
  has_farmland: boolean | null;
  total_farmland: string;
  crops: Crop[];
  irrigation_sources: string[];
  farming_tools: string[];
  has_position: boolean;
  position_data: PositionData;
  members: FamilyMember[];
}

export const emptySurvey: SurveyFormValues = {
  village: "", taluka: "", district: "", pincode: "",
  head_name: "", head_photo_url: "", mobile: "", community: "कोहळी",
  marital_status: "", gender: "", age: "", dob: "", education: "", occupation: "",
  household_items: [],
  household_item_counts: {},
  owns_house: null, house_type: "", living_status: "", gharkul_received: null, gharkul_wanted: null, solar_panel_installed: null, solar_panel_wanted: null,
  has_farmland: null, total_farmland: "", crops: [], irrigation_sources: [], farming_tools: [],
  has_position: false, position_data: {},
  members: [],
};
