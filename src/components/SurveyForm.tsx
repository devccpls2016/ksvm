import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { DateSelect } from "@/components/DateSelect";
import { EducationSelect } from "@/components/EducationSelect";
import { OccupationSelect } from "@/components/OccupationSelect";
import { Trash2, Plus, Upload, X, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  T, MARITAL, GENDER, OCCUPATION, EDUCATION, RELATIONSHIP, JOB_TYPE,
  HOUSEHOLD_ITEMS, HOUSE_TYPES, LIVING_STATUS, FARMLAND_SIZES,
  CROP_TYPES, CROP_SEASONS, MAJOR_CROP_TYPES, IRRIGATION, FARM_TOOLS,
  POSITION_TYPES, POSITION_STATUS, POLITICAL_LEVELS, REPRESENTATIVES, SOCIAL_ORGS, REPRESENTATIVE_ROLES,
} from "@/lib/marathi";

const POLITICAL_PARTIES = [
  "भारतीय जनता पक्ष (BJP)",
  "भारतीय राष्ट्रीय काँग्रेस (INC)",
  "राष्ट्रवादी काँग्रेस पक्ष (NCP)",
  "राष्ट्रवादी काँग्रेस पक्ष (शरदचंद्र पवार)",
  "शिवसेना",
  "शिवसेना (उद्धव बाळासाहेब ठाकरे)",
  "महाराष्ट्र नवनिर्माण सेना (MNS)",
  "अपक्ष (Independent)",
  "इतर (Other)",
];
const YEAR_OPTIONS = Array.from({ length: 2050 - 1949 }, (_, i) => String(2050 - i));
import type { SurveyFormValues, FamilyMember, Crop } from "@/lib/survey-types";
import { emptySurvey } from "@/lib/survey-types";

type Props = {
  initial?: Partial<SurveyFormValues>;
  onSubmit: (v: SurveyFormValues) => Promise<void>;
  submitting?: boolean;
  submitLabel?: string;
  readOnly?: boolean;
};

export function SurveyForm({ initial, onSubmit, submitting, submitLabel, readOnly }: Props) {
  const [v, setV] = useState<SurveyFormValues>({ ...emptySurvey, ...initial });
  const [uploading, setUploading] = useState(false);
  const [sameAsCorrespondence, setSameAsCorrespondence] = useState(false);

  useEffect(() => {
    if (sameAsCorrespondence) {
      setV((p) => ({
        ...p,
        permanent_address: {
          native_district: p.district,
          native_taluka: p.taluka,
          native_village: p.village,
          native_pincode: p.pincode,
        },
      }));
    }
  }, [sameAsCorrespondence, v.district, v.taluka, v.village, v.pincode]);

  const upd = <K extends keyof SurveyFormValues>(k: K, val: SurveyFormValues[K]) =>
    setV((p) => ({ ...p, [k]: val }));

  function toggleArr(key: "household_items" | "irrigation_sources" | "farming_tools" | "major_crop_types", item: string) {
    setV((p) => {
      const arr = (p[key] as string[]) || [];
      return { ...p, [key]: arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item] };
    });
  }


  async function uploadPhoto(file: File) {
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const path = `${user?.id}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("survey-photos").upload(path, file, { upsert: false });
      if (error) throw error;
      upd("head_photo_url", path);
      toast.success("फोटो अपलोड झाला");
    } catch (e: any) {
      toast.error(e.message || "फोटो अपलोड अयशस्वी");
    } finally {
      setUploading(false);
    }
  }

  const [memberDraft, setMemberDraft] = useState<FamilyMember | null>(null);
  const [editIdx, setEditIdx] = useState<number | null>(null);

  function openAddMember() {
    setMemberDraft({ name: "", relationship: "" });
    setEditIdx(null);
  }
  function openEditMember(i: number) {
    setMemberDraft({ ...v.members[i] });
    setEditIdx(i);
  }
  function closeMemberDialog() {
    setMemberDraft(null);
    setEditIdx(null);
  }
  function updDraft(patch: Partial<FamilyMember>) {
    setMemberDraft(d => d ? { ...d, ...patch } : d);
  }
  function saveMember() {
    if (!memberDraft) return;
    if (!memberDraft.name?.trim()) { toast.error("कृपया सदस्याचे नाव भरा"); return; }
    if (!memberDraft.relationship) { toast.error("कृपया नाते निवडा"); return; }
    setV(p => {
      if (editIdx === null) return { ...p, members: [...p.members, memberDraft] };
      return { ...p, members: p.members.map((m, idx) => idx === editIdx ? memberDraft : m) };
    });
    toast.success(editIdx === null ? "सदस्य जोडला गेला" : "सदस्य माहिती अद्यतनित झाली");
    closeMemberDialog();
  }
  function delMember(i: number) {
    setV(p => ({ ...p, members: p.members.filter((_, idx) => idx !== i) }));
  }

  function addCrop() {
    setV(p => ({ ...p, crops: [...p.crops, { season: "" }] }));
  }

  function updCrop(i: number, patch: Partial<Crop>) {
    setV(p => ({ ...p, crops: p.crops.map((c, idx) => idx === i ? { ...c, ...patch } : c) }));
  }
  function delCrop(i: number) {
    setV(p => ({ ...p, crops: p.crops.filter((_, idx) => idx !== i) }));
  }

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    if (!v.village || !v.head_name) { toast.error("गाव व कुटुंब प्रमुखाचे नाव आवश्यक"); return; }
    await onSubmit(v);
  }

  return (
    <form onSubmit={handle} className="space-y-7">
      <fieldset disabled={readOnly} className={readOnly ? "space-y-7 [&_*]:!cursor-default" : "space-y-7 contents"}>

      {/* A. भौगोलिक माहिती */}
      <Card className="section-card sec-amber border-0 p-0 gap-0">
        <CardHeader className="section-header [&>*]:p-0">
          <div className="section-badge">A</div>
          <CardTitle className="section-title">{T.geoInfo}</CardTitle>
          <div className="section-sub">गाव, तालुका, जिल्हा व मूळ वस्ती</div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="border rounded-lg p-4 space-y-4 bg-muted/20">
            <Label className="text-base font-semibold block">पत्रव्यवहाराचा पत्ता (Correspondence Address)</Label>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="जिल्हा"><Input value={v.district} onChange={e=>upd("district", e.target.value)} /></Field>
              <Field label="तालुका"><Input value={v.taluka} onChange={e=>upd("taluka", e.target.value)} /></Field>
              <Field label="गाव *"><Input required value={v.village} onChange={e=>upd("village", e.target.value)} /></Field>
              <Field label="पिनकोड"><Input value={v.pincode} onChange={e=>upd("pincode", e.target.value)} /></Field>
            </div>
          </div>

          <div className="border rounded-lg p-4 space-y-4 bg-muted/20">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <Label className="text-base font-semibold block">मूळ वस्ती (Permanent Address)</Label>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="same-as-correspondence"
                  checked={sameAsCorrespondence}
                  onCheckedChange={(checked) => setSameAsCorrespondence(!!checked)}
                />
                <Label htmlFor="same-as-correspondence" className="text-sm font-medium leading-none cursor-pointer select-none">
                  पत्रव्यवहाराचा पत्ता हा मूळ वस्तीसाठी समान आहे <span className="text-muted-foreground">(Same as Correspondence Address)</span>
                </Label>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="जिल्हा">
                <Input
                  value={v.permanent_address?.native_district || ""}
                  onChange={(e) =>
                    setV((p) => ({
                      ...p,
                      permanent_address: { ...(p.permanent_address || {}), native_district: e.target.value },
                    }))
                  }
                  placeholder="जिल्हा"
                  disabled={sameAsCorrespondence}
                />
              </Field>
              <Field label="तालुका">
                <Input
                  value={v.permanent_address?.native_taluka || ""}
                  onChange={(e) =>
                    setV((p) => ({
                      ...p,
                      permanent_address: { ...(p.permanent_address || {}), native_taluka: e.target.value },
                    }))
                  }
                  placeholder="तालुका"
                  disabled={sameAsCorrespondence}
                />
              </Field>
              <Field label="मूळ वस्ती (गाव / शहर)">
                <Input
                  value={v.permanent_address?.native_village || ""}
                  onChange={(e) =>
                    setV((p) => ({
                      ...p,
                      permanent_address: { ...(p.permanent_address || {}), native_village: e.target.value },
                    }))
                  }
                  placeholder="गाव / शहर"
                  disabled={sameAsCorrespondence}
                />
              </Field>
              <Field label="पिनकोड">
                <Input
                  value={v.permanent_address?.native_pincode || ""}
                  onChange={(e) =>
                    setV((p) => ({
                      ...p,
                      permanent_address: { ...(p.permanent_address || {}), native_pincode: e.target.value },
                    }))
                  }
                  placeholder="पिनकोड"
                  disabled={sameAsCorrespondence}
                />
              </Field>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* B. वैयक्तिक माहिती */}
      <Card className="section-card sec-rose border-0 p-0 gap-0">
        <CardHeader className="section-header [&>*]:p-0">
          <div className="section-badge">B</div>
          <CardTitle className="section-title">{T.personalInfo}</CardTitle>
          <div className="section-sub">कुटुंब प्रमुखाची माहिती</div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">

          <div className="flex items-center gap-4">
            <div className="h-24 w-24 rounded-lg bg-muted flex items-center justify-center overflow-hidden border">
              {v.head_photo_url ? <PhotoPreview path={v.head_photo_url} /> : <Upload className="h-8 w-8 text-muted-foreground" />}
            </div>
            <div>
              <Label>कुटुंब प्रमुखाचा फोटो</Label>
              <input
                id="photo-camera"
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                disabled={uploading}
                onChange={e => e.target.files?.[0] && uploadPhoto(e.target.files[0])}
              />
              <div className="flex gap-2 mt-1">
                <Button type="button" size="sm" disabled={uploading}
                  onClick={() => document.getElementById("photo-camera")?.click()}>
                  <Upload className="h-4 w-4 mr-1"/>{uploading ? "अपलोड होत आहे..." : "कॅमेरा उघडा"}
                </Button>
                {v.head_photo_url && (
                <Button variant="ghost" size="sm" type="button" onClick={()=>upd("head_photo_url","")}>
                  <X className="h-4 w-4 mr-1"/>काढा
                </Button>
                )}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Field label="कुटुंब प्रमुखाचे नाव *"><Input required value={v.head_name} onChange={e=>upd("head_name", e.target.value)} /></Field>
            <Field label="मोबाईल क्रमांक"><Input value={v.mobile} onChange={e=>upd("mobile", e.target.value)} /></Field>
            <Field label="समुदाय / जनजाती"><Input value={v.community} onChange={e=>upd("community", e.target.value)} /></Field>
            <SelectField label="वैवाहिक स्थिती" value={v.marital_status} onChange={x=>upd("marital_status", x)} options={MARITAL} />
            {v.marital_status === "विवाहित" && (
              <div className="md:col-span-2 border rounded-lg p-4 space-y-3 bg-primary/5">
                <Label className="text-base font-semibold block">विवाहाचा प्रकार (Type of Marriage)</Label>
                <RadioGroup
                  value={v.marriage_type || ""}
                  onValueChange={(x) => setV(p => ({ ...p, marriage_type: x, spouse_caste: x === "आंतरजातीय विवाह" ? p.spouse_caste : "" }))}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <label className="flex items-center gap-2 cursor-pointer">
                    <RadioGroupItem value="जातीय विवाह" /> जातीय विवाह (Within Community / Same Caste)
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <RadioGroupItem value="आंतरजातीय विवाह" /> आंतरजातीय विवाह (Inter-Caste Marriage)
                  </label>
                </RadioGroup>
                {v.marriage_type === "आंतरजातीय विवाह" && (
                  <Field label="जोडीदाराची जात (Spouse's Caste)">
                    <Input value={v.spouse_caste || ""} onChange={e => upd("spouse_caste", e.target.value)} placeholder="जोडीदाराची जात नमूद करा" />
                  </Field>
                )}
              </div>
            )}
            <SelectField label="लिंग" value={v.gender} onChange={x=>upd("gender", x)} options={GENDER} />
            <Field label="जन्मतारीख">
              <DateSelect
                value={v.dob}
                onChange={(dob, age) => setV(p => ({ ...p, dob, age }))}
              />
            </Field>
            <Field label="वय"><Input type="number" value={v.age} readOnly className="bg-muted" /></Field>
          </div>
          <div className="border rounded-lg p-4 space-y-3 bg-muted/20">
            <Label className="text-base font-semibold block">मामेकुळ तपशील</Label>
            <div className="grid md:grid-cols-3 gap-3">
              <Field label="नाव">
                <Input
                  value={v.maternal_family?.name || ""}
                  onChange={e => upd("maternal_family", { ...(v.maternal_family || {}), name: e.target.value })}
                />
              </Field>
              <Field label="संपूर्ण पत्ता">
                <Input
                  value={v.maternal_family?.address || ""}
                  onChange={e => upd("maternal_family", { ...(v.maternal_family || {}), address: e.target.value })}
                />
              </Field>
              <Field label="मोबाईल क्रमांक">
                <Input
                  value={v.maternal_family?.mobile || ""}
                  onChange={e => upd("maternal_family", { ...(v.maternal_family || {}), mobile: e.target.value })}
                />
              </Field>
            </div>
          </div>
          <div className="border rounded-lg p-3 bg-muted/20">
            <Label className="mb-2 block font-medium">शिक्षण (Education)</Label>
            <EducationSelect value={v.education} onChange={x=>upd("education", x)} />
          </div>
          <div className="border rounded-lg p-3 bg-muted/20">
            <Label className="mb-2 block font-medium">नौकरी / व्यवसाय (Job / Occupation)</Label>
            <OccupationSelect value={v.occupation} onChange={x=>upd("occupation", x)} />
          </div>
        </CardContent>
      </Card>

      {/* C. कुटुंबातील सदस्य */}
      <Card className="section-card sec-emerald border-0 p-0 gap-0">
        <CardHeader className="section-header">
          <div className="section-badge">C</div>
          <CardTitle className="section-title">{T.members}</CardTitle>
          <div className="section-sub">कुटुंबातील प्रत्येक सदस्याची माहिती जोडा</div>
          <div className="w-full flex justify-center pt-2">
            <Button
              type="button"
              size="lg"
              onClick={openAddMember}
              className="h-16 px-10 text-xl font-bold gap-3 min-w-[240px] rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-2xl shadow-emerald-600/35 hover:shadow-emerald-600/55 border-2 border-white/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] [&_svg]:size-7"
            >
              <Plus className="stroke-[2.5]"/>
              <span>{T.add} सदस्य</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-6">

          {v.members.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">अद्याप कोणीही सदस्य जोडलेला नाही. वरील बटणावर क्लिक करून सदस्य जोडा.</p>
          )}
          {v.members.map((m, i) => (
            <div key={i} className="border rounded-lg p-4 bg-muted/30 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="size-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold shrink-0">
                  {i + 1}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold truncate">{m.name || "—"}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {[m.relationship, m.gender, m.age ? `वय ${m.age}` : null, m.mobile].filter(Boolean).join(" • ")}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button type="button" variant="outline" size="sm" onClick={() => openEditMember(i)} className="gap-1">
                  <Pencil className="h-4 w-4"/> संपादन
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => delMember(i)} className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4"/>
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Family member dialog */}
      <Dialog open={memberDraft !== null} onOpenChange={(o) => { if (!o) closeMemberDialog(); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editIdx === null ? "नवीन सदस्य जोडा" : `सदस्य संपादन — #${editIdx + 1}`}
            </DialogTitle>
          </DialogHeader>
          {memberDraft && (() => {
            const m = memberDraft;
            return (
              <div className="space-y-4">
                <div className="grid md:grid-cols-3 gap-3">
                  <Field label="नाव"><Input value={m.name} onChange={e=>updDraft({ name: e.target.value })}/></Field>
                  <SelectField label="नाते" value={m.relationship} onChange={x=>updDraft({ relationship: x })} options={RELATIONSHIP} />
                  <SelectField label="वैवाहिक स्थिती" value={m.marital_status || ""} onChange={x=>updDraft({ marital_status: x })} options={MARITAL} />
                  {m.marital_status === "विवाहित" && (
                    <div className="md:col-span-3 border rounded-md p-3 bg-primary/5 space-y-2">
                      <Label className="block text-sm font-semibold">विवाहाचा प्रकार (Type of Marriage)</Label>
                      <RadioGroup
                        value={m.marriage_type || ""}
                        onValueChange={(x) => updDraft({ marriage_type: x, spouse_caste: x === "आंतरजातीय विवाह" ? m.spouse_caste : "" })}
                        className="flex flex-col sm:flex-row gap-3"
                      >
                        <label className="flex items-center gap-2 cursor-pointer">
                          <RadioGroupItem value="जातीय विवाह" /> जातीय विवाह (Same Caste)
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <RadioGroupItem value="आंतरजातीय विवाह" /> आंतरजातीय विवाह (Inter-Caste)
                        </label>
                      </RadioGroup>
                      {m.marriage_type === "आंतरजातीय विवाह" && (
                        <Field label="जोडीदाराची जात (Spouse's Caste)">
                          <Input value={m.spouse_caste || ""} onChange={e => updDraft({ spouse_caste: e.target.value })} placeholder="जोडीदाराची जात नमूद करा" />
                        </Field>
                      )}
                    </div>
                  )}
                  <SelectField label="लिंग" value={m.gender || ""} onChange={x=>updDraft({ gender: x })} options={GENDER} />
                  <Field label="जन्मतारीख">
                    <DateSelect
                      value={m.dob}
                      onChange={(dob, age) => updDraft({ dob, age })}
                    />
                  </Field>
                  <Field label="वय"><Input type="number" value={m.age ?? ""} readOnly className="bg-muted" /></Field>
                  <Field label="मोबाईल"><Input value={m.mobile || ""} onChange={e=>updDraft({ mobile: e.target.value })}/></Field>
                </div>
                <div className="border rounded-md p-3 bg-background space-y-2">
                  <Label className="block text-sm font-medium">मामेकुळ तपशील</Label>
                  <div className="grid md:grid-cols-3 gap-3">
                    <Field label="नाव">
                      <Input
                        value={m.maternal_family?.name || ""}
                        onChange={e => updDraft({ maternal_family: { ...(m.maternal_family || {}), name: e.target.value } })}
                      />
                    </Field>
                    <Field label="संपूर्ण पत्ता">
                      <Input
                        value={m.maternal_family?.address || ""}
                        onChange={e => updDraft({ maternal_family: { ...(m.maternal_family || {}), address: e.target.value } })}
                      />
                    </Field>
                    <Field label="मोबाईल क्रमांक">
                      <Input
                        value={m.maternal_family?.mobile || ""}
                        onChange={e => updDraft({ maternal_family: { ...(m.maternal_family || {}), mobile: e.target.value } })}
                      />
                    </Field>
                  </div>
                </div>
                {["मुलगा","मुलगी","भाऊ","बहीण"].includes(m.relationship) && m.marital_status === "विवाहित" && (
                  <div className="border rounded-md p-3 bg-background space-y-2">
                    <Label className="block text-sm font-medium">सासुरवाडी</Label>
                    <div className="grid md:grid-cols-3 gap-3">
                      <Field label={m.relationship === "मुलगी" || m.relationship === "बहीण" ? "पतीचे नाव" : "नाव"}>
                        <Input
                          value={m.in_laws_family?.name || ""}
                          onChange={e => updDraft({ in_laws_family: { ...(m.in_laws_family || {}), name: e.target.value } })}
                        />
                      </Field>
                      <Field label="संपूर्ण पत्ता">
                        <Input
                          value={m.in_laws_family?.address || ""}
                          onChange={e => updDraft({ in_laws_family: { ...(m.in_laws_family || {}), address: e.target.value } })}
                        />
                      </Field>
                      <Field label="मोबाईल क्रमांक">
                        <Input
                          value={m.in_laws_family?.mobile || ""}
                          onChange={e => updDraft({ in_laws_family: { ...(m.in_laws_family || {}), mobile: e.target.value } })}
                        />
                      </Field>
                    </div>
                  </div>
                )}
                <div className="border rounded-md p-3 bg-background">
                  <Label className="mb-2 block text-sm font-medium">शिक्षण (Education)</Label>
                  <EducationSelect value={m.education || ""} onChange={x=>updDraft({ education: x })} />
                </div>
                <div className="border rounded-md p-3 bg-background">
                  <Label className="mb-2 block text-sm font-medium">नौकरी / व्यवसाय (Job / Occupation)</Label>
                  <OccupationSelect value={m.occupation || ""} onChange={x=>updDraft({ occupation: x })} />
                </div>
                {m.gender === "स्त्री" && (
                  <div className="border rounded-md p-3 bg-background space-y-3">
                    <Label className="block text-sm font-semibold text-primary">जर महिला असेल तर:</Label>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">आपण महिला बचत गटाची सदस्य आहात का?</Label>
                      <RadioGroup
                        value={m.mahila_bachat_gat?.is_member === true ? "yes" : m.mahila_bachat_gat?.is_member === false ? "no" : ""}
                        onValueChange={(x) =>
                          updDraft({
                            mahila_bachat_gat: {
                              ...(m.mahila_bachat_gat || {}),
                              is_member: x === "yes",
                              wants_to_join: x === "yes" ? null : m.mahila_bachat_gat?.wants_to_join ?? null,
                            },
                          })
                        }
                        className="flex gap-6"
                      >
                        <Label className="flex items-center gap-2"><RadioGroupItem value="yes"/>{T.yes}</Label>
                        <Label className="flex items-center gap-2"><RadioGroupItem value="no"/>{T.no}</Label>
                      </RadioGroup>
                    </div>
                    {m.mahila_bachat_gat?.is_member === false && (
                      <div className="space-y-2 pl-4 border-l-2 border-primary/30">
                        <Label className="text-sm font-medium">आपल्याला कोहळी समाजाच्या महिला बचत गटामध्ये सहभागी व्हायला आवडेल का?</Label>
                        <RadioGroup
                          value={m.mahila_bachat_gat?.wants_to_join === true ? "yes" : m.mahila_bachat_gat?.wants_to_join === false ? "no" : ""}
                          onValueChange={(x) =>
                            updDraft({
                              mahila_bachat_gat: {
                                ...(m.mahila_bachat_gat || {}),
                                wants_to_join: x === "yes",
                              },
                            })
                          }
                          className="flex gap-6"
                        >
                          <Label className="flex items-center gap-2"><RadioGroupItem value="yes"/>{T.yes}</Label>
                          <Label className="flex items-center gap-2"><RadioGroupItem value="no"/>{T.no}</Label>
                        </RadioGroup>
                      </div>
                    )}
                    <div className="space-y-2 pt-2 border-t border-primary/20">
                      <Label className="text-sm font-medium">आपण सध्या कोणत्याही प्रकारचा ग्रामोद्योग किंवा घरगुती व्यवसाय करत आहात काय?</Label>
                      <RadioGroup
                        value={m.mahila_bachat_gat?.has_rural_home_business === true ? "yes" : m.mahila_bachat_gat?.has_rural_home_business === false ? "no" : ""}
                        onValueChange={(x) =>
                          updDraft({
                            mahila_bachat_gat: {
                              ...(m.mahila_bachat_gat || {}),
                              has_rural_home_business: x === "yes",
                              business_name: x === "yes" ? (m.mahila_bachat_gat?.business_name || "") : "",
                              wants_to_start_business: x === "yes" ? null : (m.mahila_bachat_gat?.wants_to_start_business ?? null),
                              desired_business: x === "yes" ? "" : (m.mahila_bachat_gat?.desired_business || ""),
                            },
                          })
                        }
                        className="flex gap-6"
                      >
                        <Label className="flex items-center gap-2"><RadioGroupItem value="yes"/>{T.yes}</Label>
                        <Label className="flex items-center gap-2"><RadioGroupItem value="no"/>{T.no}</Label>
                      </RadioGroup>
                    </div>
                    {m.mahila_bachat_gat?.has_rural_home_business === true && (
                      <div className="space-y-2 pl-4 border-l-2 border-primary/30">
                        <Label className="text-sm font-medium">आपण कोणता ग्रामोद्योग किंवा घरगुती व्यवसाय करत आहात?</Label>
                        <Input
                          value={m.mahila_bachat_gat?.business_name || ""}
                          onChange={(e) =>
                            updDraft({
                              mahila_bachat_gat: {
                                ...(m.mahila_bachat_gat || {}),
                                business_name: e.target.value,
                              },
                            })
                          }
                          placeholder="व्यवसायाचे नाव लिहा"
                        />
                      </div>
                    )}
                    {m.mahila_bachat_gat?.has_rural_home_business === false && (
                      <div className="space-y-2 pl-4 border-l-2 border-primary/30">
                        <Label className="text-sm font-medium">आपल्याला भविष्यात ग्रामोद्योग किंवा घरगुती व्यवसाय सुरू करण्याची इच्छा आहे का?</Label>
                        <RadioGroup
                          value={m.mahila_bachat_gat?.wants_to_start_business === true ? "yes" : m.mahila_bachat_gat?.wants_to_start_business === false ? "no" : ""}
                          onValueChange={(x) =>
                            updDraft({
                              mahila_bachat_gat: {
                                ...(m.mahila_bachat_gat || {}),
                                wants_to_start_business: x === "yes",
                                desired_business: x === "yes" ? (m.mahila_bachat_gat?.desired_business || "") : "",
                              },
                            })
                          }
                          className="flex gap-6"
                        >
                          <Label className="flex items-center gap-2"><RadioGroupItem value="yes"/>{T.yes}</Label>
                          <Label className="flex items-center gap-2"><RadioGroupItem value="no"/>{T.no}</Label>
                        </RadioGroup>
                      </div>
                    )}
                    {m.mahila_bachat_gat?.wants_to_start_business === true && (
                      <div className="space-y-2 pl-4 border-l-2 border-primary/30">
                        <Label className="text-sm font-medium">आपल्याला कोणता ग्रामोद्योग सुरू करायचा आहे?</Label>
                        <Input
                          value={m.mahila_bachat_gat?.desired_business || ""}
                          onChange={(e) =>
                            updDraft({
                              mahila_bachat_gat: {
                                ...(m.mahila_bachat_gat || {}),
                                desired_business: e.target.value,
                              },
                            })
                          }
                          placeholder="ग्रामोद्योगाचे नाव लिहा"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}
          <DialogFooter className="gap-2 sm:gap-2 pt-2">
            <Button type="button" variant="outline" onClick={closeMemberDialog}>रद्द करा</Button>
            <Button
              type="button"
              onClick={saveMember}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold shadow-lg gap-2"
            >
              <Plus className="h-4 w-4"/> सदस्य जतन करा
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* D. धारण केलेले पद */}
      <PositionsSection v={v} setV={setV} />


      {/* 4. कौटुंबिक आवश्यक गरजा */}
      <Card className="section-card sec-indigo border-0 p-0 gap-0">
        <CardHeader className="section-header [&>*]:p-0">
          <div className="section-badge">E</div>
          <CardTitle className="section-title">{T.needs} (घरातील वापराच्या वस्तू)</CardTitle>
          <div className="section-sub">कुटुंबात असलेल्या प्रमुख वस्तू निवडा</div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {HOUSEHOLD_ITEMS.map(item => {
              const checked = v.household_items.includes(item);
              const count = v.household_item_counts?.[item] ?? 1;
              return (
                <div key={item} className="flex items-center justify-between gap-2 p-2 rounded border hover:bg-accent/10">
                  <Label className="flex items-center gap-2 cursor-pointer flex-1">
                    <Checkbox checked={checked} onCheckedChange={() => {
                      toggleArr("household_items", item);
                      const next = { ...(v.household_item_counts || {}) };
                      if (checked) { delete next[item]; } else { next[item] = 1; }
                      upd("household_item_counts", next);
                    }} />
                    <span className="text-sm">{item}</span>
                  </Label>
                  {checked && (
                    <div className="w-20 shrink-0">
                      <Select value={String(count)} onValueChange={x => upd("household_item_counts", { ...(v.household_item_counts || {}), [item]: Number(x) })}>
                        <SelectTrigger className="h-8"><SelectValue placeholder="#" /></SelectTrigger>
                        <SelectContent>{Array.from({ length: 10 }, (_, i) => String(i + 1)).map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <Separator className="my-2" />

          <Field label={T.solarPanelInstalled}>
            <RadioGroup value={v.solar_panel_installed === null ? "" : v.solar_panel_installed ? "yes" : "no"} onValueChange={x => { upd("solar_panel_installed", x === "yes"); if (x === "yes") upd("solar_panel_wanted", null); }} className="flex gap-6">
              <Label className="flex items-center gap-2"><RadioGroupItem value="yes"/>{T.yes}</Label>
              <Label className="flex items-center gap-2"><RadioGroupItem value="no"/>{T.no}</Label>
            </RadioGroup>
          </Field>
          {v.solar_panel_installed === false && (
            <Field label={T.solarPanelWanted}>
              <RadioGroup value={v.solar_panel_wanted === null ? "" : v.solar_panel_wanted ? "yes" : "no"} onValueChange={x => upd("solar_panel_wanted", x === "yes")} className="flex gap-6">
                <Label className="flex items-center gap-2"><RadioGroupItem value="yes"/>{T.yes}</Label>
                <Label className="flex items-center gap-2"><RadioGroupItem value="no"/>{T.no}</Label>
              </RadioGroup>
            </Field>
          )}
        </CardContent>
      </Card>


      {/* 5. घर विषयक माहिती */}
      <Card className="section-card sec-orange border-0 p-0 gap-0">
        <CardHeader className="section-header [&>*]:p-0">
          <div className="section-badge">F</div>
          <CardTitle className="section-title">{T.houseInfo}</CardTitle>
          <div className="section-sub">घराची स्थिती व सुविधा</div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">

          <Field label="स्वतःचे घर आहे काय?">
            <RadioGroup value={v.owns_house === null ? "" : v.owns_house ? "yes" : "no"} onValueChange={x => upd("owns_house", x === "yes")} className="flex gap-6">
              <Label className="flex items-center gap-2"><RadioGroupItem value="yes"/>{T.yes}</Label>
              <Label className="flex items-center gap-2"><RadioGroupItem value="no"/>{T.no}</Label>
            </RadioGroup>
          </Field>
          {v.owns_house === true && (
            <SelectField label="घराचा प्रकार" value={v.house_type} onChange={x=>upd("house_type", x)} options={HOUSE_TYPES} />
          )}
          {v.owns_house === false && (
            <>
              <SelectField label="राहण्याची स्थिती" value={v.living_status} onChange={x=>upd("living_status", x)} options={LIVING_STATUS} />
              <Field label="तुम्हाला घरकुल योजनेचा लाभ मिळाला आहे का?">
                <RadioGroup value={v.gharkul_received === null ? "" : v.gharkul_received ? "yes" : "no"} onValueChange={x => { upd("gharkul_received", x === "yes"); if (x === "yes") upd("gharkul_wanted", null); }} className="flex gap-6">
                  <Label className="flex items-center gap-2"><RadioGroupItem value="yes"/>{T.yes}</Label>
                  <Label className="flex items-center gap-2"><RadioGroupItem value="no"/>{T.no}</Label>
                </RadioGroup>
              </Field>
              {v.gharkul_received === false && (
                <Field label="तुम्हाला घरकुल योजनेचा लाभ घ्यायचा आहे का?">
                  <RadioGroup value={v.gharkul_wanted === null ? "" : v.gharkul_wanted ? "yes" : "no"} onValueChange={x => upd("gharkul_wanted", x === "yes")} className="flex gap-6">
                    <Label className="flex items-center gap-2"><RadioGroupItem value="yes"/>{T.yes}</Label>
                    <Label className="flex items-center gap-2"><RadioGroupItem value="no"/>{T.no}</Label>
                  </RadioGroup>
                </Field>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* 6. शेती विषयक माहिती */}
      <Card className="section-card sec-lime border-0 p-0 gap-0">
        <CardHeader className="section-header [&>*]:p-0">
          <div className="section-badge">G</div>
          <CardTitle className="section-title">{T.agriInfo}</CardTitle>
          <div className="section-sub">शेतजमीन, सिंचन व पीक तपशील</div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">

          <Field label="शेतजमीन आहे काय?">
            <RadioGroup value={v.has_farmland === null ? "" : v.has_farmland ? "yes" : "no"} onValueChange={x => upd("has_farmland", x === "yes")} className="flex gap-6">
              <Label className="flex items-center gap-2"><RadioGroupItem value="yes"/>{T.yes}</Label>
              <Label className="flex items-center gap-2"><RadioGroupItem value="no"/>{T.no}</Label>
            </RadioGroup>
          </Field>

          {v.has_farmland === true && (
            <div className="space-y-4 border-t pt-4">
              <SelectField label="एकूण शेती" value={v.total_farmland} onChange={x=>upd("total_farmland", x)} options={FARMLAND_SIZES} />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-base font-semibold">पीक प्रकाराविषयी माहिती</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addCrop}><Plus className="h-4 w-4 mr-1"/>पीक जोडा</Button>
                </div>
                {v.crops.map((c, i) => (
                  <div key={i} className="border rounded-lg p-3 mb-2 bg-muted/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">पीक #{i+1}</span>
                      <Button type="button" variant="ghost" size="sm" onClick={()=>delCrop(i)}><Trash2 className="h-4 w-4"/></Button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-2">
                      <SelectField label="पिक हंगाम" value={c.season} onChange={x=>updCrop(i,{season:x})} options={CROP_SEASONS} />
                    </div>
                  </div>
                ))}
              </div>

              <Separator />
              <div className="space-y-3">
                <Label className="text-base font-semibold">क्षेत्र (एकरमध्ये)</Label>
                <div className="grid md:grid-cols-2 gap-3">
                  <Field label="ओलिताखालील क्षेत्र (एकरमध्ये)"><Input type="number" min="0" step="0.01" value={v.irrigated_area} onChange={e=>upd("irrigated_area", e.target.value)} /></Field>
                  <Field label="कोरडवाहू क्षेत्र (एकरमध्ये)"><Input type="number" min="0" step="0.01" value={v.dryland_area} onChange={e=>upd("dryland_area", e.target.value)} /></Field>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold">हंगामनिहाय लागवड क्षेत्र</Label>
                <div className="grid md:grid-cols-3 gap-3">
                  <Field label="खरीप हंगामाखालील क्षेत्र (एकरमध्ये)"><Input type="number" min="0" step="0.01" value={v.kharif_area} onChange={e=>upd("kharif_area", e.target.value)} /></Field>
                  <Field label="रब्बी हंगामाखालील क्षेत्र (धान सोडून) (एकरमध्ये)"><Input type="number" min="0" step="0.01" value={v.rabi_area} onChange={e=>upd("rabi_area", e.target.value)} /></Field>
                  <Field label="उन्हाळी हंगामाखालील क्षेत्र (धानासह) (एकरमध्ये)"><Input type="number" min="0" step="0.01" value={v.summer_area} onChange={e=>upd("summer_area", e.target.value)} /></Field>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold">प्रमुख पीक प्रकार (एकापेक्षा अधिक निवडू शकता)</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {MAJOR_CROP_TYPES.map(mc => (
                    <Label key={mc} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-accent/10">
                      <Checkbox checked={v.major_crop_types.includes(mc)} onCheckedChange={()=>toggleArr("major_crop_types", mc)} />
                      <span className="text-sm">{mc}</span>
                    </Label>
                  ))}
                </div>
                {v.major_crop_types.includes("इतर") && (
                  <Field label="इतर पीक प्रकार"><Input value={v.major_crop_types_other} onChange={e=>upd("major_crop_types_other", e.target.value)} placeholder="इतर पीक प्रकार लिहा" /></Field>
                )}
              </div>


              <Separator />
              <IrrigationSection v={v} setV={setV} />


              <FarmingToolsSection v={v} setV={setV} />

              <FarmManagementSection v={v} setV={setV} />

            </div>
          )}
        </CardContent>
      </Card>

      <BenefitsSection v={v} setV={setV} />

      <EmploymentSection v={v} setV={setV} />


      {!readOnly && (
        <div className="flex justify-end gap-2 sticky bottom-0 bg-background/85 backdrop-blur-md p-4 -mx-4 border-t shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.15)]">
          <Button
            type="submit"
            size="lg"
            disabled={submitting}
            className="bg-gradient-to-r from-primary via-primary to-accent text-primary-foreground font-semibold px-8 shadow-lg hover:shadow-xl hover:brightness-110 transition-all"
          >
            {submitting ? T.saving : (submitLabel || T.save)}
          </Button>
        </div>
      )}
      </fieldset>
    </form>
  );
}

function PositionsSection({ v, setV }: { v: SurveyFormValues; setV: React.Dispatch<React.SetStateAction<SurveyFormValues>> }) {
  const positions = v.position_data?.positions || [];
  const [draft, setDraft] = useState<import("@/lib/survey-types").PositionEntry | null>(null);
  const [editIdx, setEditIdx] = useState<number | null>(null);

  // one-time migration from legacy single position_data → positions[]
  useEffect(() => {
    if (v.has_position && !v.position_data?.positions && (v.position_data?.type || v.position_data?.representative_type || v.position_data?.social_org)) {
      const { positions: _p, ...legacy } = v.position_data || {};
      setV(p => ({ ...p, position_data: { positions: [legacy as any] } }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const personOptions = [
    ...(v.head_name ? [`${v.head_name} (कुटुंब प्रमुख)`] : []),
    ...v.members.filter(m => m.name?.trim()).map(m => `${m.name}${m.relationship ? ` (${m.relationship})` : ""}`),
  ];

  function openAdd() { setDraft({}); setEditIdx(null); }
  function openEdit(i: number) { setDraft({ ...positions[i] }); setEditIdx(i); }
  function close() { setDraft(null); setEditIdx(null); }
  function updD(patch: Partial<import("@/lib/survey-types").PositionEntry>) {
    setDraft(d => d ? { ...d, ...patch } : d);
  }
  function save() {
    if (!draft) return;
    if (!draft.person_name) { toast.error("कृपया व्यक्ती निवडा"); return; }
    if (!draft.type) { toast.error("कृपया पदाचा प्रकार निवडा"); return; }
    setV(p => {
      const list = p.position_data?.positions ? [...p.position_data.positions] : [];
      if (editIdx === null) list.push(draft);
      else list[editIdx] = draft;
      return { ...p, has_position: true, position_data: { positions: list } };
    });
    toast.success(editIdx === null ? "पद जोडले" : "पद अद्यतनित");
    close();
  }
  function del(i: number) {
    setV(p => {
      const list = (p.position_data?.positions || []).filter((_, idx) => idx !== i);
      return { ...p, position_data: { positions: list }, has_position: list.length > 0 ? p.has_position : false };
    });
  }

  return (
    <Card className="section-card sec-violet border-0 p-0 gap-0">
      <CardHeader className="section-header [&>*]:p-0">
        <div className="section-badge">D</div>
        <CardTitle className="section-title">( राजकीय, सामाजिक, लोकप्रतिनिधी ) {T.position}</CardTitle>
        <div className="section-sub">धारण केलेली पदे व सामाजिक भूमिका</div>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <Field label="कुटुंबातील कोणी धारण केलेले पद आहे का?">
          <RadioGroup
            value={v.has_position ? "yes" : "no"}
            onValueChange={x => setV(p => ({ ...p, has_position: x === "yes", position_data: x === "yes" ? (p.position_data || { positions: [] }) : { positions: [] } }))}
            className="flex gap-6"
          >
            <Label className="flex items-center gap-2"><RadioGroupItem value="yes" />{T.yes}</Label>
            <Label className="flex items-center gap-2"><RadioGroupItem value="no" />{T.no}</Label>
          </RadioGroup>
        </Field>

        {v.has_position && (
          <div className="space-y-3 border-t pt-4">
            {positions.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-lg">
                अजून कोणतेही पद जोडलेले नाही. खालील बटणावर क्लिक करून जोडा.
              </div>
            )}
            {positions.map((p, i) => (
              <div key={i} className="border rounded-lg p-4 bg-muted/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-1">
                  <div className="font-semibold">{p.person_name || "—"}</div>
                  <div className="text-sm text-muted-foreground">
                    {[p.type, p.status, p.political_level, p.representative_type, p.coop_role, p.social_org, p.social_role].filter(Boolean).join(" · ")}
                  </div>
                  {(p.term_from || p.term_to) && (
                    <div className="text-xs text-muted-foreground">कार्यकाळ: {p.term_from || "…"} — {p.term_to || "…"}</div>
                  )}
                  {(p.party_name || p.party_name_other) && (
                    <div className="text-xs text-muted-foreground">पक्ष: {p.party_name === "इतर (Other)" ? p.party_name_other : p.party_name}</div>
                  )}
                  {p.coop_org_name && <div className="text-xs text-muted-foreground">संस्था: {p.coop_org_name}</div>}
                </div>
                <div className="flex gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => openEdit(i)}><Pencil className="h-4 w-4 mr-1" />संपादित करा</Button>
                  <Button type="button" size="sm" variant="destructive" onClick={() => del(i)}><Trash2 className="h-4 w-4 mr-1" />हटवा</Button>
                </div>
              </div>
            ))}

            <div className="flex justify-center pt-2">
              <Button type="button" size="lg" onClick={openAdd} className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white">
                <Plus className="h-5 w-5 mr-1" />पद जोडा
              </Button>
            </div>
          </div>
        )}

        <Dialog open={!!draft} onOpenChange={(o) => !o && close()}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editIdx === null ? "नवीन पद जोडा" : "पद संपादित करा"}</DialogTitle>
            </DialogHeader>
            {draft && (
              <div className="grid md:grid-cols-2 gap-4 py-2">
                <div className="md:col-span-2">
                  <SelectField label="व्यक्तीचे नाव *" value={draft.person_name || ""} onChange={x => updD({ person_name: x })} options={personOptions} />
                  {personOptions.length === 0 && (
                    <p className="text-xs text-destructive mt-1">कृपया आधी कुटुंब प्रमुख किंवा सदस्य जोडा.</p>
                  )}
                </div>
                <SelectField label="पदाचा प्रकार *" value={draft.type || ""} onChange={x => updD({ type: x, political_level: "", representative_type: "", coop_role: "", coop_org_name: "", social_org: "", social_role: "" })} options={POSITION_TYPES} />
                <SelectField label="वर्तमान स्थिती" value={draft.status || ""} onChange={x => updD({ status: x })} options={POSITION_STATUS} />

                {draft.type === "राजकीय" && (
                  <>
                    <SelectField label="राजकीय पद" value={draft.political_level || ""} onChange={x => updD({ political_level: x })} options={POLITICAL_LEVELS} />
                    <Field label="पक्षाचे नाव"><Input value={draft.party_name || ""} onChange={e => updD({ party_name: e.target.value })} /></Field>
                  </>
                )}

                {draft.type === "लोकप्रतिनिधी" && (
                  <>
                    <SelectField label="लोकप्रतिनिधी पद" value={draft.representative_type || ""} onChange={x => updD({ representative_type: x, coop_role: "" })} options={REPRESENTATIVES} />
                    {draft.representative_type && REPRESENTATIVE_ROLES[draft.representative_type] && (
                      <>
                        <SelectField label="पद" value={draft.coop_role || ""} onChange={x => updD({ coop_role: x })} options={REPRESENTATIVE_ROLES[draft.representative_type] || []} />
                        {(draft.representative_type === "Co-operative Bank (सहकारी बँक)" || draft.representative_type === "Co-operative Society (सहकारी संस्था)" || draft.representative_type === "पतसंस्था") && (
                          <Field label={draft.representative_type === "पतसंस्था" ? "पतसंस्थेचे नाव" : "संस्थेचे नाव"}>
                            <Input value={draft.coop_org_name || ""} onChange={e => updD({ coop_org_name: e.target.value })} />
                          </Field>
                        )}
                      </>
                    )}
                    {draft.coop_role && (
                      <>
                        <div className="md:col-span-2 mt-2">
                          <h4 className="font-semibold text-sm mb-2">१. कार्यकाळ (Period)</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <SelectField label="वर्ष (पासून)" value={draft.term_from || ""} onChange={x => updD({ term_from: x })} options={YEAR_OPTIONS} />
                            <SelectField label="वर्ष (पर्यंत)" value={draft.term_to || ""} onChange={x => updD({ term_to: x })} options={YEAR_OPTIONS} />
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <h4 className="font-semibold text-sm mb-2">२. पक्ष (Political Party)</h4>
                          <SelectField label="पक्षाचे नाव" value={draft.party_name || ""} onChange={x => updD({ party_name: x, party_name_other: x === "इतर (Other)" ? draft.party_name_other : "" })} options={POLITICAL_PARTIES} />
                          {draft.party_name === "इतर (Other)" && (
                            <div className="mt-2">
                              <Field label="पक्षाचे नाव लिहा"><Input value={draft.party_name_other || ""} onChange={e => updD({ party_name_other: e.target.value })} /></Field>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </>
                )}

                {draft.type === "सामाजिक" && (
                  <>
                    <SelectField label="संस्था" value={draft.social_org || ""} onChange={x => updD({ social_org: x, social_role: "" })} options={SOCIAL_ORGS.map((s: { name: string }) => s.name)} />
                    {draft.social_org && (
                      <SelectField label="पद" value={draft.social_role || ""} onChange={x => updD({ social_role: x })}
                        options={SOCIAL_ORGS.find((s: { name: string; roles: string[] }) => s.name === draft.social_org)?.roles || []} />
                    )}
                  </>
                )}
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={close}>रद्द करा</Button>
              <Button type="button" onClick={save}>पद जतन करा</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-sm">{label}</Label>{children}</div>;
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue placeholder="निवडा" /></SelectTrigger>
        <SelectContent>{options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}

function PhotoPreview({ path }: { path: string }) {
  const [url, setUrl] = useState<string>("");
  useEffect(() => {
    supabase.storage.from("survey-photos").createSignedUrl(path, 3600).then(({ data }) => {
      if (data?.signedUrl) setUrl(data.signedUrl);
    });
  }, [path]);
  return url ? <img src={url} alt="" className="h-full w-full object-cover" /> : <span className="text-xs">...</span>;
}

const IRRIGATION_SOURCES: { key: "tubewell" | "well" | "farm_pond" | "pond" | "river" | "canal"; label: string; pumps?: boolean }[] = [
  { key: "tubewell",  label: "ट्युबवेल / बोअरवेल", pumps: true },
  { key: "well",      label: "विहीर",             pumps: true },
  { key: "farm_pond", label: "शेततलाव" },
  { key: "pond",      label: "तलाव" },
  { key: "river",     label: "नदी" },
  { key: "canal",     label: "नहर" },
];

function IrrigationSection({
  v,
  setV,
}: {
  v: SurveyFormValues;
  setV: React.Dispatch<React.SetStateAction<SurveyFormValues>>;
}) {
  function patch(key: string, p: Record<string, any>) {
    setV((prev) => {
      const det = { ...(prev.irrigation_details || {}) } as any;
      det[key] = { ...(det[key] || {}), ...p };
      const labelMap: Record<string, string> = Object.fromEntries(
        IRRIGATION_SOURCES.map((s) => [s.key, s.label])
      );
      const active = Object.entries(det)
        .filter(([, val]: any) => (val?.count ?? 0) > 0)
        .map(([k]) => labelMap[k])
        .filter(Boolean);
      return { ...prev, irrigation_details: det, irrigation_sources: active };
    });
  }

  return (
    <div>
      <Label className="mb-2 block text-base font-semibold">सिंचनाचे साधन</Label>
      <div className="grid gap-3">
        {IRRIGATION_SOURCES.map((src) => {
          const d = (v.irrigation_details as any)?.[src.key] || {};
          const count = d.count ?? "";
          const enabled = (typeof count === "number" && count > 0);
          return (
            <div key={src.key} className="border rounded-lg p-3 bg-card">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={enabled}
                    onCheckedChange={(c) => patch(src.key, { count: c ? (count || 1) : "" })}
                  />
                  <span className="font-medium text-sm">{src.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground">संख्या</Label>
                  <Select
                    value={count === "" ? "" : String(count)}
                    onValueChange={(val) => patch(src.key, { count: val ? Number(val) : "" })}
                  >
                    <SelectTrigger className="h-8 w-20"><SelectValue placeholder="0" /></SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                        <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {src.pumps && enabled && (
                <div className="mt-3 pl-6 flex flex-wrap gap-2">
                  <Label className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-accent/10 text-sm">
                    <Checkbox
                      checked={!!d.electric}
                      onCheckedChange={(c) => patch(src.key, { electric: !!c })}
                    />
                    विद्युत पंप
                  </Label>
                  <Label className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-accent/10 text-sm">
                    <Checkbox
                      checked={!!d.solar}
                      onCheckedChange={(c) => patch(src.key, { solar: !!c })}
                    />
                    सौर पंप
                  </Label>
                </div>
              )}
              {src.key === "pond" && enabled && (
                <div className="mt-3 pl-6 space-y-3 border-l-2 border-primary/30">
                  <div>
                    <Label className="text-sm font-medium block mb-2">
                      हा तलाव कोहळी समाजाच्या मालगुजारीचे तलाव आहे का?
                    </Label>
                    <div className="flex gap-2 flex-wrap">
                      {[
                        { label: "होय", val: true },
                        { label: "नाही", val: false },
                      ].map((o) => (
                        <Label
                          key={o.label}
                          className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-accent/10 text-sm"
                        >
                          <Checkbox
                            checked={d.is_kohli_malguzari === o.val}
                            onCheckedChange={(c) =>
                              patch(src.key, {
                                is_kohli_malguzari: c ? o.val : null,
                                ...(o.val === false ? { water_free_for_irrigation: null } : {}),
                              } as any)
                            }
                          />
                          {o.label}
                        </Label>
                      ))}
                    </div>
                  </div>
                  {d.is_kohli_malguzari === true && (
                    <div>
                      <Label className="text-sm font-medium block mb-2">
                        सिंचनासाठी या तलावाचे पाणी मोफत उपलब्ध होते का?
                      </Label>
                      <div className="flex gap-2 flex-wrap">
                        {[
                          { label: "होय", val: true },
                          { label: "नाही", val: false },
                        ].map((o) => (
                          <Label
                            key={o.label}
                            className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-accent/10 text-sm"
                          >
                            <Checkbox
                              checked={d.water_free_for_irrigation === o.val}
                              onCheckedChange={(c) =>
                                patch(src.key, {
                                  water_free_for_irrigation: c ? o.val : null,
                                } as any)
                              }
                            />
                            {o.label}
                          </Label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const FARM_TOOL_LIST: { key: "tractor" | "harvester" | "rotavator" | "cultivator" | "tractor_trolley"; label: string; shortLabel: string }[] = [
  { key: "tractor", label: "ट्रॅक्टर", shortLabel: "ट्रॅक्टर" },
  { key: "harvester", label: "हार्वेस्टर (Harvestor)", shortLabel: "हार्वेस्टर" },
  { key: "rotavator", label: "रोटावेटर (Rotavator)", shortLabel: "रोटावेटर" },
  { key: "cultivator", label: "कल्टिवेटर (Cultivator)", shortLabel: "कल्टिवेटर" },
  { key: "tractor_trolley", label: "ट्रॅक्टर ट्रॉली (Tractor Trolley)", shortLabel: "ट्रॅक्टर ट्रॉली" },
];

function YesNo({ value, onChange }: { value: boolean | null | undefined; onChange: (v: boolean | null) => void }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {[{ label: "होय", val: true }, { label: "नाही", val: false }].map((o) => (
        <Label key={o.label} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-accent/10 text-sm">
          <Checkbox checked={value === o.val} onCheckedChange={(c) => onChange(c ? o.val : null)} />
          {o.label}
        </Label>
      ))}
    </div>
  );
}

function FarmingToolsSection({ v, setV }: { v: SurveyFormValues; setV: React.Dispatch<React.SetStateAction<SurveyFormValues>> }) {
  const details = v.farming_tools_details || {};
  function patchTool(key: string, p: Record<string, any>) {
    setV((prev) => ({
      ...prev,
      farming_tools_details: {
        ...(prev.farming_tools_details || {}),
        [key]: { ...((prev.farming_tools_details as any)?.[key] || {}), ...p },
      },
    }));
  }
  function patchRoot(p: Record<string, any>) {
    setV((prev) => ({ ...prev, farming_tools_details: { ...(prev.farming_tools_details || {}), ...p } }));
  }

  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold block">शेती विषयक साधने</Label>
      <div className="grid gap-3 md:grid-cols-2">
        {FARM_TOOL_LIST.map((tool, idx) => {
          const d = (details as any)[tool.key] || {};
          return (
            <div key={tool.key} className="border rounded-lg p-4 space-y-3 bg-card/50">
              <div className="font-medium text-sm">{idx + 1}. {tool.label}</div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">आहे / नाही</Label>
                  <YesNo value={d.has} onChange={(val) => patchTool(tool.key, { has: val })} />
                </div>
                {d.has === true && (
                  <Field label="संख्या">
                    <Input
                      type="number" min={0}
                      value={d.count ?? ""}
                      onChange={(e) => patchTool(tool.key, { count: e.target.value === "" ? "" : Number(e.target.value) })}
                    />
                  </Field>
                )}
              </div>
              {d.has === false && (
                <div className="space-y-3 pt-2 border-t">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">{tool.shortLabel} घ्यायची इच्छा आहे का?</Label>
                    <YesNo value={d.want_to_buy} onChange={(val) => patchTool(tool.key, { want_to_buy: val, ...(val !== true ? { needs_loan: null } : {}) })} />
                  </div>
                  {d.want_to_buy === true && (
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1.5 block">कर्जाची आवश्यकता आहे का?</Label>
                      <YesNo value={d.needs_loan} onChange={(val) => patchTool(tool.key, { needs_loan: val })} />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="border rounded-lg p-4 space-y-3 bg-card/50">
        <div className="font-medium text-sm">6. इतर आधुनिक कृषी अवजारे वापरता का?</div>
        <YesNo value={details.other_uses} onChange={(val) => patchRoot({ other_uses: val })} />
        {details.other_uses === true && (
          <Field label="कृपया नमूद करा">
            <Input
              value={details.other_details || ""}
              onChange={(e) => patchRoot({ other_details: e.target.value })}
              placeholder="अवजारांची नावे लिहा"
            />
          </Field>
        )}
      </div>
    </div>
  );
}

const LADKI_BAHIN_REASONS = [
  "KYC पूर्ण केलेली नाही / KYC प्रलंबित आहे",
  "आधार कार्ड व बँक खाते लिंक नाही",
  "बँक खात्यात DBT सुविधा सक्रिय नाही",
  "अर्जाची पडताळणी (Verification) प्रलंबित आहे",
  "अर्जातील माहिती किंवा कागदपत्रांमध्ये त्रुटी आहे",
  "बँक खाते निष्क्रिय / बंद / चुकीचे आहे",
  "इतर",
];

function getFemaleNames(v: SurveyFormValues): string[] {
  const list: string[] = [];
  if (v.gender === "स्त्री" && v.head_name?.trim()) list.push(v.head_name.trim());
  (v.members || []).forEach((m) => {
    if (m.gender === "स्त्री" && m.name?.trim()) list.push(m.name.trim());
  });
  return Array.from(new Set(list));
}

function LadkiBahinBlock({
  v, b, patch,
}: {
  v: SurveyFormValues;
  b: NonNullable<SurveyFormValues["benefits_info"]>;
  patch: (p: Partial<NonNullable<SurveyFormValues["benefits_info"]>>) => void;
}) {
  const femaleNames = getFemaleNames(v);
  const beneficiaries = b.ladki_bahin_beneficiaries || [];
  const nonBeneficiaries = b.ladki_bahin_non_beneficiaries || [];

  const usedBenef = new Set(beneficiaries.map((x) => x.name));
  const usedNon = new Set(nonBeneficiaries.map((x) => x.name));

  function addBenef(name: string) {
    if (!name || usedBenef.has(name)) return;
    patch({ ladki_bahin_beneficiaries: [...beneficiaries, { name, regular: null }] });
  }
  function updBenef(i: number, p: Partial<typeof beneficiaries[number]>) {
    const arr = beneficiaries.map((x, idx) => (idx === i ? { ...x, ...p } : x));
    patch({ ladki_bahin_beneficiaries: arr });
  }
  function delBenef(i: number) {
    patch({ ladki_bahin_beneficiaries: beneficiaries.filter((_, idx) => idx !== i) });
  }
  function addNon(name: string) {
    if (!name || usedNon.has(name)) return;
    patch({ ladki_bahin_non_beneficiaries: [...nonBeneficiaries, { name }] });
  }
  function updNon(i: number, p: Partial<typeof nonBeneficiaries[number]>) {
    const arr = nonBeneficiaries.map((x, idx) => (idx === i ? { ...x, ...p } : x));
    patch({ ladki_bahin_non_beneficiaries: arr });
  }
  function delNon(i: number) {
    patch({ ladki_bahin_non_beneficiaries: nonBeneficiaries.filter((_, idx) => idx !== i) });
  }

  return (
    <div className="border rounded-lg p-4 space-y-3 bg-card/50">
      <div className="font-medium text-sm">
        1. आपल्या घरामध्ये "मुख्यमंत्री लाडकी बहीण योजना" चे लाभार्थी आहेत का?
      </div>
      <YesNo
        value={b.ladki_bahin}
        onChange={(val) =>
          patch({
            ladki_bahin: val,
            ...(val !== true ? { ladki_bahin_beneficiaries: [] } : {}),
            ...(val !== false ? { ladki_bahin_non_beneficiaries: [] } : {}),
          })
        }
      />

      {femaleNames.length === 0 && b.ladki_bahin !== null && b.ladki_bahin !== undefined && (
        <div className="text-xs text-muted-foreground italic pt-2 border-t">
          टीप: कृपया आधी कुटुंब प्रमुख / सदस्य विभागात स्त्री सदस्यांची नोंद करा.
        </div>
      )}

      {b.ladki_bahin === true && femaleNames.length > 0 && (
        <div className="pt-3 border-t space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-end gap-2">
            <div className="flex-1">
              <Label className="text-sm mb-1.5 block">लाभार्थी सदस्य निवडा (स्त्री)</Label>
              <Select value="" onValueChange={addBenef}>
                <SelectTrigger><SelectValue placeholder="नाव निवडा व जोडा" /></SelectTrigger>
                <SelectContent>
                  {femaleNames.filter((n) => !usedBenef.has(n)).map((n) => (
                    <SelectItem key={n} value={n}>{n}</SelectItem>
                  ))}
                  {femaleNames.filter((n) => !usedBenef.has(n)).length === 0 && (
                    <div className="px-2 py-1.5 text-xs text-muted-foreground">सर्व नावे जोडली गेली आहेत</div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {beneficiaries.map((row, i) => (
            <div key={i} className="border rounded-md p-3 bg-background space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-medium text-sm">{row.name}</div>
                <Button type="button" size="sm" variant="ghost" onClick={() => delBenef(i)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div>
                <Label className="text-sm mb-1.5 block">या योजनेचा लाभ नियमितपणे मिळतो का?</Label>
                <YesNo
                  value={row.regular ?? null}
                  onChange={(val) =>
                    updBenef(i, { regular: val, ...(val !== false ? { reason: "", reason_other: "" } : {}) })
                  }
                />
              </div>
              {row.regular === false && (
                <div className="space-y-2">
                  <Label className="text-sm mb-1.5 block">
                    लाभ मिळत नसल्यास मुख्य कारण
                  </Label>
                  <Select value={row.reason || ""} onValueChange={(x) => updBenef(i, { reason: x })}>
                    <SelectTrigger><SelectValue placeholder="कारण निवडा" /></SelectTrigger>
                    <SelectContent>
                      {LADKI_BAHIN_REASONS.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {row.reason === "इतर" && (
                    <Input
                      value={row.reason_other || ""}
                      onChange={(e) => updBenef(i, { reason_other: e.target.value })}
                      placeholder="कारण नमूद करा"
                    />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {b.ladki_bahin === false && femaleNames.length > 0 && (
        <div className="pt-3 border-t space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-end gap-2">
            <div className="flex-1">
              <Label className="text-sm mb-1.5 block">
                लाभ न मिळणारे सदस्य निवडा (स्त्री)
              </Label>
              <Select value="" onValueChange={addNon}>
                <SelectTrigger><SelectValue placeholder="नाव निवडा व जोडा" /></SelectTrigger>
                <SelectContent>
                  {femaleNames.filter((n) => !usedNon.has(n)).map((n) => (
                    <SelectItem key={n} value={n}>{n}</SelectItem>
                  ))}
                  {femaleNames.filter((n) => !usedNon.has(n)).length === 0 && (
                    <div className="px-2 py-1.5 text-xs text-muted-foreground">सर्व नावे जोडली गेली आहेत</div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {nonBeneficiaries.map((row, i) => (
            <div key={i} className="border rounded-md p-3 bg-background space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-medium text-sm">{row.name}</div>
                <Button type="button" size="sm" variant="ghost" onClick={() => delNon(i)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div>
                <Label className="text-sm mb-1.5 block">
                  लाभ न मिळण्याचे मुख्य कारण
                </Label>
                <Select value={row.reason || ""} onValueChange={(x) => updNon(i, { reason: x })}>
                  <SelectTrigger><SelectValue placeholder="कारण निवडा" /></SelectTrigger>
                  <SelectContent>
                    {LADKI_BAHIN_REASONS.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {row.reason === "इतर" && (
                  <Input
                    value={row.reason_other || ""}
                    onChange={(e) => updNon(i, { reason_other: e.target.value })}
                    placeholder="कारण नमूद करा"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BenefitsSection({ v, setV }: { v: SurveyFormValues; setV: React.Dispatch<React.SetStateAction<SurveyFormValues>> }) {
  const b = v.benefits_info || {};
  function patch(p: Partial<typeof b>) {
    setV((prev) => ({ ...prev, benefits_info: { ...(prev.benefits_info || {}), ...p } }));
  }
  return (
    <Card className="section-card sec-cyan border-0 p-0 gap-0">
      <CardHeader className="section-header [&>*]:p-0">
        <div className="section-badge">H</div>
        <CardTitle className="section-title">सामाजिक व आर्थिक लाभार्थी माहिती</CardTitle>
        <div className="section-sub">शासकीय योजना व लाभार्थी तपशील</div>
      </CardHeader>
      <CardContent className="space-y-5 pt-6">

        {/* 1. Ladki Bahin */}
        <LadkiBahinBlock v={v} b={b} patch={patch} />


        {/* 2. Critical illness */}
        <div className="border rounded-lg p-4 space-y-3 bg-card/50">
          <div className="font-medium text-sm">2. आपल्या कुटुंबात दुर्धर आजाराने बाधित रुग्ण आहे का? (Cancer / Heart Attack / Kidney / इ.)</div>
          <YesNo value={b.critical_illness} onChange={(val) => patch({ critical_illness: val, ...(val !== true ? { medical_aid_needed: null } : {}) })} />
          {b.critical_illness === true && (
            <div className="pt-2 border-t">
              <Label className="text-sm mb-1.5 block">वैद्यकीय सहाय्याची आवश्यकता आहे का?</Label>
              <YesNo value={b.medical_aid_needed} onChange={(val) => patch({ medical_aid_needed: val })} />
            </div>
          )}
        </div>

        {/* 3. Sportsperson */}
        <div className="border rounded-lg p-4 space-y-3 bg-card/50">
          <div className="font-medium text-sm">3. आपल्या कुटुंबात राज्य / राष्ट्रीय / आंतरराष्ट्रीय स्तरावरील खेळाडू आहेत का?</div>
          <YesNo value={b.has_sportsperson} onChange={(val) => patch({ has_sportsperson: val, ...(val !== true ? { sport_type: "", sport_level: "" } : {}) })} />
          {b.has_sportsperson === true && (
            <div className="grid md:grid-cols-2 gap-3 pt-2 border-t">
              <Field label="खेळाचा प्रकार">
                <Input value={b.sport_type || ""} onChange={(e) => patch({ sport_type: e.target.value })} placeholder="उदा. क्रिकेट, कबड्डी" />
              </Field>
              <Field label="स्तर">
                <Select value={b.sport_level || ""} onValueChange={(x) => patch({ sport_level: x })}>
                  <SelectTrigger><SelectValue placeholder="निवडा" /></SelectTrigger>
                  <SelectContent>
                    {["State", "National", "International"].map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function EmploymentSection({ v, setV }: { v: SurveyFormValues; setV: React.Dispatch<React.SetStateAction<SurveyFormValues>> }) {
  const e = v.employment_info || {};
  function patch(p: Partial<typeof e>) {
    setV((prev) => ({ ...prev, employment_info: { ...(prev.employment_info || {}), ...p } }));
  }
  return (
    <Card className="section-card sec-fuchsia border-0 p-0 gap-0">
      <CardHeader className="section-header [&>*]:p-0">
        <div className="section-badge">I</div>
        <CardTitle className="section-title">उद्योजक / स्वयंरोजगार व रोजगार संबंधित माहिती</CardTitle>
        <div className="section-sub">व्यवसाय व रोजगार तपशील</div>
      </CardHeader>
      <CardContent className="space-y-5 pt-6">

        {/* 1. Entrepreneur / Self-employment */}
        <div className="border rounded-lg p-4 space-y-3 bg-card/50">
          <div className="font-medium text-sm">1. आपल्या कुटुंबातील सदस्य उद्योजक / स्वयंरोजगारात कार्यरत आहेत का?</div>
          <YesNo
            value={e.has_entrepreneur}
            onChange={(val) =>
              patch({
                has_entrepreneur: val,
                ...(val !== true ? { entrepreneur_details: "", entrepreneur_address: "" } : {}),
              })
            }
          />
          {e.has_entrepreneur === true && (
            <div className="grid gap-3 pt-2 border-t">
              <Field label="तपशील व व्यवसायाचा पत्ता नमूद करा">
                <Textarea
                  value={e.entrepreneur_details || ""}
                  onChange={(ev) => patch({ entrepreneur_details: ev.target.value })}
                  placeholder="व्यवसायाचे नाव, स्वरूप आणि पत्ता"
                />
              </Field>
            </div>
          )}
        </div>

        {/* 2. Side Business */}
        <div className="border rounded-lg p-4 space-y-3 bg-card/50">
          <div className="font-medium text-sm">2. आपल्या कुटुंबात “जोडधंदा / अतिरिक्त व्यवसाय” (Side Business) आहे का?</div>
          <YesNo
            value={e.has_side_business}
            onChange={(val) =>
              patch({
                has_side_business: val,
                ...(val !== true ? { side_business_details: "" } : {}),
              })
            }
          />
          {e.has_side_business === true && (
            <div className="grid gap-3 pt-2 border-t">
              <Field label="व्यवसायाचे स्वरूप व तपशील नमूद करा">
                <Textarea
                  value={e.side_business_details || ""}
                  onChange={(ev) => patch({ side_business_details: ev.target.value })}
                  placeholder="जोडधंद्याचे स्वरूप, उत्पादने/सेवा इ."
                />
              </Field>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function FarmManagementSection({ v, setV }: { v: SurveyFormValues; setV: React.Dispatch<React.SetStateAction<SurveyFormValues>> }) {
  const fm = v.farm_management || {};
  function patch(p: Partial<typeof fm>) {
    setV((prev) => ({ ...prev, farm_management: { ...(prev.farm_management || {}), ...p } }));
  }
  return (
    <div className="space-y-4 border-t pt-4">
      <Label className="text-base font-semibold block">शेती व्यवस्थापन प्रकार</Label>
      <div className="border rounded-lg p-4 space-y-3 bg-card/50">
        <div className="font-medium text-sm">1. आपण ठेक्याने (Contract Farming) किंवा बटाईने (Share Cropping) शेती करता का?</div>
        <YesNo
          value={fm.has_contract_or_share}
          onChange={(val) =>
            patch({
              has_contract_or_share: val,
              ...(val !== true ? { contract_farming_area: "" } : {}),
            })
          }
        />
        {fm.has_contract_or_share === true && (
          <div className="grid md:grid-cols-2 gap-3 pt-2 border-t">
            <Field label="ठेक्याने / बटाईने केलेल्या शेतीचे क्षेत्र (एकरमध्ये)">
              <Input
                type="number"
                min={0}
                step="0.01"
                value={fm.contract_farming_area || ""}
                onChange={(e) => patch({ contract_farming_area: e.target.value })}
                placeholder="उदा. 2.5"
              />
            </Field>
          </div>
        )}
      </div>
    </div>
  );
}




