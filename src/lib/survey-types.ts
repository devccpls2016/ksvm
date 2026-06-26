export type FamilyMember = {
  name: string;
  relationship: string;
  age?: number | "";
  dob?: string;
  gender?: string;
  marital_status?: string;
  education?: string;
  occupation?: string;
  job_place?: string;
  mobile?: string;
  job_type?: string; // Government/Private/Department - when occupation is job
  maternal_family?: MaternalFamily;
};

export type MaternalFamily = {
  name?: string;
  address?: string;
  mobile?: string;
};

export type Crop = {
  season: string;
};

export type IrrigationSourceDetail = {
  count?: number | "";
  electric?: boolean;
  solar?: boolean;
  is_kohli_malguzari?: boolean | null;
  water_free_for_irrigation?: boolean | null;
};
export type IrrigationDetails = {
  tubewell?: IrrigationSourceDetail;
  well?: IrrigationSourceDetail;
  farm_pond?: IrrigationSourceDetail;
  pond?: IrrigationSourceDetail;
  river?: IrrigationSourceDetail;
  canal?: IrrigationSourceDetail;
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
  irrigated_area: string;
  dryland_area: string;
  kharif_area: string;
  rabi_area: string;
  summer_area: string;
  major_crop_types: string[];
  major_crop_types_other: string;
  crops: Crop[];
  irrigation_sources: string[];
  irrigation_details: IrrigationDetails;
  farming_tools: string[];
  farming_tools_details: FarmingToolsDetails;


  has_position: boolean;
  position_data: PositionData;
  members: FamilyMember[];
  benefits_info: BenefitsInfo;
  employment_info: EmploymentInfo;
  farm_management: FarmManagement;
  permanent_address: PermanentAddress;
  maternal_family: MaternalFamily;
}

export type PermanentAddress = {
  native_village?: string;
  native_taluka?: string;
  native_district?: string;
};

export type BenefitsInfo = {
  ladki_bahin?: boolean | null;
  ladki_bahin_count?: number | "";
  ladki_bahin_regular?: boolean | null;
  critical_illness?: boolean | null;
  medical_aid_needed?: boolean | null;
  has_sportsperson?: boolean | null;
  sport_type?: string;
  sport_level?: string;
};

export type EmploymentInfo = {
  has_entrepreneur?: boolean | null;
  entrepreneur_details?: string;
  entrepreneur_address?: string;
  has_side_business?: boolean | null;
  side_business_details?: string;
};

export type FarmManagement = {
  has_contract_or_share?: boolean | null;
  contract_farming_area?: string;
};

export type FarmingToolDetail = {
  has?: boolean | null;
  count?: number | "";
  want_to_buy?: boolean | null;
  needs_loan?: boolean | null;
};
export type FarmingToolsDetails = {
  tractor?: FarmingToolDetail;
  harvester?: FarmingToolDetail;
  rotavator?: FarmingToolDetail;
  cultivator?: FarmingToolDetail;
  tractor_trolley?: FarmingToolDetail;
  other_uses?: boolean | null;
  other_details?: string;
};

export const emptySurvey: SurveyFormValues = {
  village: "", taluka: "", district: "", pincode: "",
  head_name: "", head_photo_url: "", mobile: "", community: "कोहळी",
  marital_status: "", gender: "", age: "", dob: "", education: "", occupation: "",
  household_items: [],
  household_item_counts: {},
  owns_house: null, house_type: "", living_status: "", gharkul_received: null, gharkul_wanted: null, solar_panel_installed: null, solar_panel_wanted: null,
  has_farmland: null, total_farmland: "",
  irrigated_area: "", dryland_area: "", kharif_area: "", rabi_area: "", summer_area: "",
  major_crop_types: [], major_crop_types_other: "",
  crops: [], irrigation_sources: [], irrigation_details: {}, farming_tools: [], farming_tools_details: {},

  has_position: false, position_data: {},
  members: [],
  benefits_info: {},
  employment_info: {},
  farm_management: {},
  permanent_address: {},
};
