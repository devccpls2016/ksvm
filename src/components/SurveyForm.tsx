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
import { Trash2, Plus, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  T, MARITAL, GENDER, OCCUPATION, EDUCATION, RELATIONSHIP, JOB_TYPE,
  HOUSEHOLD_ITEMS, HOUSE_TYPES, LIVING_STATUS, FARMLAND_SIZES,
  CROP_TYPES, CROP_SEASONS, MAJOR_CROP_TYPES, IRRIGATION, FARM_TOOLS,
  POSITION_TYPES, POSITION_STATUS, POLITICAL_LEVELS, REPRESENTATIVES, SOCIAL_ORGS, REPRESENTATIVE_ROLES,
} from "@/lib/marathi";
import type { SurveyFormValues, FamilyMember, Crop } from "@/lib/survey-types";
import { emptySurvey } from "@/lib/survey-types";

type Props = {
  initial?: Partial<SurveyFormValues>;
  onSubmit: (v: SurveyFormValues) => Promise<void>;
  submitting?: boolean;
  submitLabel?: string;
};

export function SurveyForm({ initial, onSubmit, submitting, submitLabel }: Props) {
  const [v, setV] = useState<SurveyFormValues>({ ...emptySurvey, ...initial });
  const [uploading, setUploading] = useState(false);

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

  function addMember() {
    setV(p => ({ ...p, members: [...p.members, { name: "", relationship: "" }] }));
  }
  function updMember(i: number, patch: Partial<FamilyMember>) {
    setV(p => ({ ...p, members: p.members.map((m, idx) => idx === i ? { ...m, ...patch } : m) }));
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
    <form onSubmit={handle} className="space-y-6">
      {/* A. भौगोलिक माहिती */}
      <Card>
        <CardHeader><CardTitle>A. {T.geoInfo}</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="गाव *"><Input required value={v.village} onChange={e=>upd("village", e.target.value)} /></Field>
            <Field label="तालुका"><Input value={v.taluka} onChange={e=>upd("taluka", e.target.value)} /></Field>
            <Field label="जिल्हा"><Input value={v.district} onChange={e=>upd("district", e.target.value)} /></Field>
            <Field label="पिनकोड"><Input value={v.pincode} onChange={e=>upd("pincode", e.target.value)} /></Field>
          </div>

          <div className="border rounded-lg p-4 space-y-4 bg-muted/20">
            <Label className="text-base font-semibold block">मूळ वस्ती (Permanent Address)</Label>
            <div className="grid md:grid-cols-3 gap-4">
              <Field label="आपली मूळ वस्ती (गाव / शहर)">
                <Input
                  value={v.permanent_address?.native_village || ""}
                  onChange={(e) =>
                    setV((p) => ({
                      ...p,
                      permanent_address: { ...(p.permanent_address || {}), native_village: e.target.value },
                    }))
                  }
                  placeholder="गाव / शहर"
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
                />
              </Field>
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
                />
              </Field>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* B. वैयक्तिक माहिती */}
      <Card>
        <CardHeader><CardTitle>B. {T.personalInfo}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>C. {T.members}</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addMember}><Plus className="h-4 w-4 mr-1"/>{T.add}</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {v.members.length === 0 && <p className="text-sm text-muted-foreground">अद्याप कोणीही सदस्य जोडलेला नाही.</p>}
          {v.members.map((m, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-3 bg-muted/30">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">सदस्य #{i + 1}</span>
                <Button type="button" variant="ghost" size="sm" onClick={() => delMember(i)}><Trash2 className="h-4 w-4"/></Button>
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                <Field label="नाव"><Input value={m.name} onChange={e=>updMember(i, { name: e.target.value })}/></Field>
                <SelectField label="नाते" value={m.relationship} onChange={x=>updMember(i, { relationship: x })} options={RELATIONSHIP} />
                <SelectField label="लिंग" value={m.gender || ""} onChange={x=>updMember(i, { gender: x })} options={GENDER} />
                <SelectField label="वैवाहिक स्थिती" value={m.marital_status || ""} onChange={x=>updMember(i, { marital_status: x })} options={MARITAL} />
                <Field label="जन्मतारीख">
                  <DateSelect
                    value={m.dob}
                    onChange={(dob, age) => updMember(i, { dob, age })}
                  />
                </Field>
                <Field label="वय"><Input type="number" value={m.age ?? ""} readOnly className="bg-muted" /></Field>
                <Field label="मोबाईल"><Input value={m.mobile || ""} onChange={e=>updMember(i, { mobile: e.target.value })}/></Field>
              </div>
              <div className="border rounded-md p-3 bg-background space-y-2">
                <Label className="block text-sm font-medium">मामेकुळ तपशील</Label>
                <div className="grid md:grid-cols-3 gap-3">
                  <Field label="नाव">
                    <Input
                      value={m.maternal_family?.name || ""}
                      onChange={e => updMember(i, { maternal_family: { ...(m.maternal_family || {}), name: e.target.value } })}
                    />
                  </Field>
                  <Field label="संपूर्ण पत्ता">
                    <Input
                      value={m.maternal_family?.address || ""}
                      onChange={e => updMember(i, { maternal_family: { ...(m.maternal_family || {}), address: e.target.value } })}
                    />
                  </Field>
                  <Field label="मोबाईल क्रमांक">
                    <Input
                      value={m.maternal_family?.mobile || ""}
                      onChange={e => updMember(i, { maternal_family: { ...(m.maternal_family || {}), mobile: e.target.value } })}
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
                        onChange={e => updMember(i, { in_laws_family: { ...(m.in_laws_family || {}), name: e.target.value } })}
                      />
                    </Field>
                    <Field label="संपूर्ण पत्ता">
                      <Input
                        value={m.in_laws_family?.address || ""}
                        onChange={e => updMember(i, { in_laws_family: { ...(m.in_laws_family || {}), address: e.target.value } })}
                      />
                    </Field>
                    <Field label="मोबाईल क्रमांक">
                      <Input
                        value={m.in_laws_family?.mobile || ""}
                        onChange={e => updMember(i, { in_laws_family: { ...(m.in_laws_family || {}), mobile: e.target.value } })}
                      />
                    </Field>
                  </div>
                </div>
              )}
              <div className="border rounded-md p-3 bg-background">
                <Label className="mb-2 block text-sm font-medium">शिक्षण (Education)</Label>
                <EducationSelect value={m.education || ""} onChange={x=>updMember(i, { education: x })} />
              </div>
              <div className="border rounded-md p-3 bg-background">
                <Label className="mb-2 block text-sm font-medium">नौकरी / व्यवसाय (Job / Occupation)</Label>
                <OccupationSelect value={m.occupation || ""} onChange={x=>updMember(i, { occupation: x })} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* D. धारण केलेले पद */}
      <Card>
        <CardHeader><CardTitle>D. {T.position}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Field label="धारण केलेले पद आहे का?">
            <RadioGroup value={v.has_position ? "yes" : "no"} onValueChange={x => upd("has_position", x === "yes")} className="flex gap-6">
              <Label className="flex items-center gap-2"><RadioGroupItem value="yes"/>{T.yes}</Label>
              <Label className="flex items-center gap-2"><RadioGroupItem value="no"/>{T.no}</Label>
            </RadioGroup>
          </Field>

          {v.has_position && (
            <div className="grid md:grid-cols-2 gap-4 border-t pt-4">
              <SelectField label="पदाचा प्रकार" value={v.position_data.type || ""} onChange={x => upd("position_data", { ...v.position_data, type: x })} options={POSITION_TYPES} />
              <SelectField label="वर्तमान स्थिती" value={v.position_data.status || ""} onChange={x => upd("position_data", { ...v.position_data, status: x })} options={POSITION_STATUS} />

              {v.position_data.type === "राजकीय" && (
                <>
                  <SelectField label="राजकीय पद" value={v.position_data.political_level || ""} onChange={x => upd("position_data", { ...v.position_data, political_level: x })} options={POLITICAL_LEVELS} />
                  <Field label="पक्षाचे नाव"><Input value={v.position_data.party_name || ""} onChange={e => upd("position_data", { ...v.position_data, party_name: e.target.value })}/></Field>
                </>
              )}

              {v.position_data.type === "लोकप्रतिनिधी" && (
                <>
                  <SelectField label="लोकप्रतिनिधी पद" value={v.position_data.representative_type || ""} onChange={x => upd("position_data", { ...v.position_data, representative_type: x, coop_role: "" })} options={REPRESENTATIVES} />
                  {v.position_data.representative_type && REPRESENTATIVE_ROLES[v.position_data.representative_type] && (
                    <>
                      <SelectField label="पद" value={v.position_data.coop_role || ""} onChange={x => upd("position_data", { ...v.position_data, coop_role: x })} options={REPRESENTATIVE_ROLES[v.position_data.representative_type] || []} />
                      {(v.position_data.representative_type === "Co-operative Bank (सहकारी बँक)" || v.position_data.representative_type === "Co-operative Society (सहकारी संस्था)") && (
                        <Field label="संस्थेचे नाव"><Input value={v.position_data.coop_org_name || ""} onChange={e => upd("position_data", { ...v.position_data, coop_org_name: e.target.value })}/></Field>
                      )}
                    </>
                  )}
                </>
              )}

              {v.position_data.type === "सामाजिक" && (
                <>
                  <SelectField label="संस्था" value={v.position_data.social_org || ""} onChange={x => upd("position_data", { ...v.position_data, social_org: x, social_role: "" })} options={SOCIAL_ORGS.map((s: { name: string }) => s.name)} />
                  {v.position_data.social_org && (
                    <SelectField label="पद" value={v.position_data.social_role || ""} onChange={x => upd("position_data", { ...v.position_data, social_role: x })}
                      options={SOCIAL_ORGS.find((s: { name: string; roles: string[] }) => s.name === v.position_data.social_org)?.roles || []} />
                  )}
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 4. कौटुंबिक आवश्यक गरजा */}
      <Card>
        <CardHeader><CardTitle>{T.needs} (घरातील वापराच्या वस्तू)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
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
      <Card>
        <CardHeader><CardTitle>{T.houseInfo}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
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
      <Card>
        <CardHeader><CardTitle>{T.agriInfo}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
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
                  <Field label="रब्बी हंगामाखालील क्षेत्र (एकरमध्ये)"><Input type="number" min="0" step="0.01" value={v.rabi_area} onChange={e=>upd("rabi_area", e.target.value)} /></Field>
                  <Field label="उन्हाळी हंगामाखालील क्षेत्र (एकरमध्ये)"><Input type="number" min="0" step="0.01" value={v.summer_area} onChange={e=>upd("summer_area", e.target.value)} /></Field>
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


      <div className="flex justify-end gap-2 sticky bottom-0 bg-background/80 backdrop-blur p-3 -mx-4 border-t">
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? T.saving : (submitLabel || T.save)}
        </Button>
      </div>
    </form>
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

const FARM_TOOL_LIST: { key: "tractor" | "harvester" | "rotavator" | "cultivator" | "tractor_trolley"; label: string; extra?: boolean }[] = [
  { key: "tractor", label: "ट्रॅक्टर", extra: true },
  { key: "harvester", label: "हार्वेस्टर (Harvestor)" },
  { key: "rotavator", label: "रोटावेटर (Rotavator)" },
  { key: "cultivator", label: "कल्टिवेटर (Cultivator)" },
  { key: "tractor_trolley", label: "ट्रॅक्टर ट्रॉली (Tractor Trolley)" },
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
              {tool.extra && d.has === false && (
                <div className="space-y-3 pt-2 border-t">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">ट्रॅक्टर घ्यायची इच्छा आहे का?</Label>
                    <YesNo value={d.want_to_buy} onChange={(val) => patchTool(tool.key, { want_to_buy: val })} />
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

function BenefitsSection({ v, setV }: { v: SurveyFormValues; setV: React.Dispatch<React.SetStateAction<SurveyFormValues>> }) {
  const b = v.benefits_info || {};
  function patch(p: Partial<typeof b>) {
    setV((prev) => ({ ...prev, benefits_info: { ...(prev.benefits_info || {}), ...p } }));
  }
  return (
    <Card>
      <CardHeader><CardTitle>सामाजिक व आर्थिक लाभार्थी माहिती</CardTitle></CardHeader>
      <CardContent className="space-y-5">
        {/* 1. Ladki Bahin */}
        <div className="border rounded-lg p-4 space-y-3 bg-card/50">
          <div className="font-medium text-sm">1. आपल्या घरामध्ये "मुख्यमंत्री लाडकी बहीण योजना" चे लाभार्थी आहेत का?</div>
          <YesNo value={b.ladki_bahin} onChange={(val) => patch({ ladki_bahin: val, ...(val !== true ? { ladki_bahin_count: "", ladki_bahin_regular: null } : {}) })} />
          {b.ladki_bahin === true && (
            <div className="grid md:grid-cols-2 gap-3 pt-2 border-t">
              <Field label="लाभार्थी संख्या (घरातील किती सदस्य)">
                <Select value={b.ladki_bahin_count ? String(b.ladki_bahin_count) : ""} onValueChange={(x) => patch({ ladki_bahin_count: Number(x) })}>
                  <SelectTrigger><SelectValue placeholder="निवडा" /></SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                      <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <div>
                <Label className="text-sm mb-1.5 block">या योजनेचा लाभ नियमितपणे मिळतो का?</Label>
                <YesNo value={b.ladki_bahin_regular} onChange={(val) => patch({ ladki_bahin_regular: val })} />
              </div>
            </div>
          )}
        </div>

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
    <Card>
      <CardHeader><CardTitle>उद्योजक / स्वयंरोजगार व रोजगार संबंधित माहिती</CardTitle></CardHeader>
      <CardContent className="space-y-5">
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




