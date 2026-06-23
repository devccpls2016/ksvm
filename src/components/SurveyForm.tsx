import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
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
  CROP_TYPES, CROP_SEASONS, IRRIGATION, FARM_TOOLS,
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

  function toggleArr(key: "household_items" | "irrigation_sources" | "farming_tools", item: string) {
    setV((p) => {
      const arr = p[key] || [];
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
    setV(p => ({ ...p, crops: [...p.crops, { season: "", dry_land: "", dry_crop: "", wet_land: "", wet_crop: "", kharif: "", rabi: "", total: "", crops_taken: "" }] }));
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
        <CardContent className="grid md:grid-cols-2 gap-4">
          <Field label="गाव *"><Input required value={v.village} onChange={e=>upd("village", e.target.value)} /></Field>
          <Field label="तालुका"><Input value={v.taluka} onChange={e=>upd("taluka", e.target.value)} /></Field>
          <Field label="जिल्हा"><Input value={v.district} onChange={e=>upd("district", e.target.value)} /></Field>
          <Field label="पिनकोड"><Input value={v.pincode} onChange={e=>upd("pincode", e.target.value)} /></Field>
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
                <Field label="जन्मतारीख">
                  <DateSelect
                    value={m.dob}
                    onChange={(dob, age) => updMember(i, { dob, age })}
                  />
                </Field>
                <Field label="वय"><Input type="number" value={m.age ?? ""} readOnly className="bg-muted" /></Field>
                <Field label="मोबाईल"><Input value={m.mobile || ""} onChange={e=>updMember(i, { mobile: e.target.value })}/></Field>
              </div>
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
                  <Label>पीक प्रकाराविषयी माहिती</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addCrop}><Plus className="h-4 w-4 mr-1"/>पीक जोडा</Button>
                </div>
                {v.crops.map((c, i) => (
                  <div key={i} className="border rounded-lg p-3 mb-2 bg-muted/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">पीक #{i+1}</span>
                      <Button type="button" variant="ghost" size="sm" onClick={()=>delCrop(i)}><Trash2 className="h-4 w-4"/></Button>
                    </div>
                    <div className="grid md:grid-cols-4 gap-2">
                      <SelectField label="पिक हंगाम" value={c.season} onChange={x=>updCrop(i,{season:x})} options={CROP_SEASONS} />
                      <Field label="घेतलेली पिके"><Input value={c.crops_taken} onChange={e=>updCrop(i,{crops_taken:e.target.value})}/></Field>
                      <Field label="कोरडवाहू जमीन"><Input value={c.dry_land} onChange={e=>updCrop(i,{dry_land:e.target.value})}/></Field>
                      <SelectField label="कोरडवाहू पिक प्रकार" value={c.dry_crop} onChange={x=>updCrop(i,{dry_crop:x})} options={CROP_TYPES} />
                      <Field label="ओलितावली जमीन"><Input value={c.wet_land} onChange={e=>updCrop(i,{wet_land:e.target.value})}/></Field>
                      <SelectField label="ओलितावली पिक प्रकार" value={c.wet_crop} onChange={x=>updCrop(i,{wet_crop:x})} options={CROP_TYPES} />
                      <Field label="खरीप पिक"><Input value={c.kharif} onChange={e=>updCrop(i,{kharif:e.target.value})}/></Field>
                      <Field label="रब्बी पिक"><Input value={c.rabi} onChange={e=>updCrop(i,{rabi:e.target.value})}/></Field>
                      <Field label="एकूण"><Input value={c.total} onChange={e=>updCrop(i,{total:e.target.value})}/></Field>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />
              <div>
                <Label className="mb-2 block">सिंचनाचे साधन</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {IRRIGATION.map(i => (
                    <Label key={i} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-accent/10">
                      <Checkbox checked={v.irrigation_sources.includes(i)} onCheckedChange={()=>toggleArr("irrigation_sources", i)} />
                      <span className="text-sm">{i}</span>
                    </Label>
                  ))}
                </div>
              </div>

              <div>
                <Label className="mb-2 block">शेती विषयक साधने</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {FARM_TOOLS.map(i => (
                    <Label key={i} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-accent/10">
                      <Checkbox checked={v.farming_tools.includes(i)} onCheckedChange={()=>toggleArr("farming_tools", i)} />
                      <span className="text-sm">{i}</span>
                    </Label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
