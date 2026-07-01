import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  PRIMARY_CATEGORIES,
  FARMING_TYPES,
  LAND_SIZES,
  BUSINESS_TYPES,
  SELF_EMPLOYED_TYPES,
  HONORARIUM_POSITIONS,
  GOVT_SERVICE_TYPES,
  GOVT_CLASSES,
  GOVT_CLASS_DESIGNATIONS,
  EDU_INSTITUTION_TYPES,
  eduLevelsForType,
  EDU_DESIGNATIONS_BY_LEVEL,
  MED_INSTITUTION_TYPES,
  medDesignationsForType,
  medNeedsHospitalFields,
  medIsOwnSetup,

  WCD_DESIGNATIONS,
  ENG_INSTITUTION_TYPES,
  ENG_BRANCHES,
  ENG_DESIGNATIONS,
  engDesignationsForBranch,
  BANK_TYPES,
  bankDesignationsFor,
  JUDICIARY_DESIGNATIONS,
  DEFENCE_FORCES,
  MILITARY_RANKS,
  POLICE_RANKS,
  CENTRAL_ARMED_FORCES_RANKS,
  PRIVATE_SECTORS,
  RETIRED_FROM,
  NRI_CONTRIBUTIONS,
  LOAN_AMOUNT_OPTIONS,
  LOAN_PURPOSE_OPTIONS,
  
  decodeOccupation,
  encodeOccupation,
  summariseOccupation,
  type OccupationValue,
} from "@/lib/occupation-data";

type Props = {
  value: string;
  onChange: (encoded: string) => void;
};

const MILITARY_FORCES = [
  "Indian Army (भारतीय सैन्य)",
  "Indian Navy (भारतीय नौदल)",
  "Indian Air Force (भारतीय वायुदल)",
];
const CENTRAL_ARMED_FORCES = [
  "BSF (सीमा सुरक्षा दल)",
  "CRPF (केंद्रीय राखीव पोलीस दल)",
  "CISF (केंद्रीय औद्योगिक सुरक्षा दल)",
  "ITBP (भारत-तिबेट सीमा पोलीस)",
  "SSB (सशस्त्र सीमा बल)",
  "Assam Rifles (आसाम रायफल्स)",
  "Coast Guard (तटरक्षक दल)",
];
const POLICE_FORCES = [
  "Maharashtra Police (महाराष्ट्र पोलीस)",
  "SRPF (राज्य राखीव पोलीस दल)",
  "GRP (रेल्वे पोलीस)",
  "RPF (रेल्वे संरक्षण दल)",
];
function ranksFor(force: string | undefined): string[] {
  if (!force) return MILITARY_RANKS;
  if (MILITARY_FORCES.includes(force)) return MILITARY_RANKS;
  if (CENTRAL_ARMED_FORCES.includes(force)) return CENTRAL_ARMED_FORCES_RANKS;
  if (POLICE_FORCES.includes(force)) return POLICE_RANKS;
  return MILITARY_RANKS;
}

export function OccupationSelect({ value, onChange }: Props) {
  const [state, setState] = useState<OccupationValue>(() => decodeOccupation(value));

  useEffect(() => {
    setState(decodeOccupation(value));
  }, [value]);

  function patch(p: Partial<OccupationValue>) {
    const next = { ...state, ...p };
    setState(next);
    onChange(encodeOccupation(next));
  }

  function resetTo(category: string) {
    const next: OccupationValue = { category };
    setState(next);
    onChange(encodeOccupation(next));
  }

  function toggleFarming(t: string) {
    const arr = state.farmingTypes || [];
    patch({ farmingTypes: arr.includes(t) ? arr.filter(x => x !== t) : [...arr, t] });
  }
  function toggleBusinessType(t: string) {
    const arr = state.businessTypes || [];
    patch({ businessTypes: arr.includes(t) ? arr.filter(x => x !== t) : [...arr, t] });
  }
  function toggleSelfEmployed(t: string) {
    const arr = state.selfEmployedTypes || [];
    patch({ selfEmployedTypes: arr.includes(t) ? arr.filter(x => x !== t) : [...arr, t] });
  }
  function toggleContribution(t: string) {
    const arr = state.contributions || [];
    patch({ contributions: arr.includes(t) ? arr.filter(x => x !== t) : [...arr, t] });
  }

  const c = state.category;

  return (
    <div className="space-y-3">
      {/* Level 1 – Primary Category */}
      <div>
        <Label className="text-xs text-muted-foreground mb-1 block">
          मुख्य श्रेणी (Primary Category)
        </Label>
        <Select value={c} onValueChange={resetTo}>
          <SelectTrigger><SelectValue placeholder="निवडा (Select)" /></SelectTrigger>
          <SelectContent className="max-h-72 bg-popover">
            {PRIMARY_CATEGORIES.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ============ Category-specific deep fields ============ */}

      {(c === "शेतकरी (Farmer)" || c === "शेती + व्यवसाय (Agriculture + Business)") && (
        <div className="grid gap-3 md:grid-cols-2 border-t pt-3">
          <div className="md:col-span-2">
            <Label className="text-xs text-muted-foreground mb-1 block">शेती प्रकार (Farming Type – multi)</Label>
            <div className="grid grid-cols-2 gap-2">
              {FARMING_TYPES.map(t => (
                <Label key={t} className="flex items-center gap-2 text-sm p-2 rounded border bg-background cursor-pointer">
                  <Checkbox checked={state.farmingTypes?.includes(t) || false} onCheckedChange={() => toggleFarming(t)} />
                  <span>{t}</span>
                </Label>
              ))}
            </div>
          </div>
          <SelectFieldRow label="जमीन क्षेत्र (Land Size)" value={state.landSize} options={LAND_SIZES} onChange={x => patch({ landSize: x })} />
          {c === "शेती + व्यवसाय (Agriculture + Business)" && (
            <SelectFieldRow label="व्यवसाय प्रकार (Business Type)" value={state.businessType} options={BUSINESS_TYPES} onChange={x => patch({ businessType: x })} />
          )}
          {c === "शेती + व्यवसाय (Agriculture + Business)" && state.businessType && (
            <TextRow label="व्यवसायाचे नाव (Business Name)" value={state.businessName} onChange={x => patch({ businessName: x })} />
          )}
          {c === "शेती + व्यवसाय (Agriculture + Business)" && state.businessName && (
            <div>
              <TextRow
                label="आपण आपल्या व्यवसायामार्फत किती व्यक्तींना रोजगार उपलब्ध करून दिला आहे? (संख्या नमूद करा)"
                value={state.peopleEmployed}
                type="number"
                onChange={x => patch({ peopleEmployed: x })}
              />
            </div>
          )}
        </div>
      )}

      {c === "व्यवसाय (Business Owner)" && (
        <div className="space-y-3 border-t pt-3">
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">व्यवसाय प्रकार (Business Type – multi)</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {BUSINESS_TYPES.map(t => (
                <Label key={t} className="flex items-center gap-2 text-sm p-2 rounded border bg-background cursor-pointer">
                  <Checkbox checked={state.businessTypes?.includes(t) || false} onCheckedChange={() => toggleBusinessType(t)} />
                  <span>{t}</span>
                </Label>
              ))}
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <TextRow label="व्यवसायाचे नाव (Business Name)" value={state.organisation} onChange={x => patch({ organisation: x })} />
          </div>
        </div>
      )}

      {c === "स्वरोजगार (Self Employed)" && (
        <div className="space-y-3 border-t pt-3">
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">कौशल्य / Trade (multi)</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SELF_EMPLOYED_TYPES.map(t => (
                <Label key={t} className="flex items-center gap-2 text-sm p-2 rounded border bg-background cursor-pointer">
                  <Checkbox checked={state.selfEmployedTypes?.includes(t) || false} onCheckedChange={() => toggleSelfEmployed(t)} />
                  <span>{t}</span>
                </Label>
              ))}
            </div>
          </div>
        </div>
      )}

      {c === "कृषी मजूर / शेतमजूर (Farm Labour)" && (
        <div className="grid gap-3 md:grid-cols-2 border-t pt-3">
          <TextRow label="कार्यरत गाव (Work Village)" value={state.postingPlace} onChange={x => patch({ postingPlace: x })} />
        </div>
      )}

      {c === "मानधनधारक पदाधिकारी (Honorarium Based Position)" && (
        <div className="grid gap-3 md:grid-cols-2 border-t pt-3">
          <SelectFieldRow label="पद (Position)" value={state.designation} options={HONORARIUM_POSITIONS} onChange={x => patch({ designation: x })} />
          <TextRow label="कार्यरत गाव / संस्था" value={state.organisation} onChange={x => patch({ organisation: x })} />
        </div>
      )}

      {c === "सरकारी कर्मचारी (Government Employee)" && (
        <div className="grid gap-3 md:grid-cols-2 border-t pt-3">
          <SelectFieldRow label="सेवा प्रकार (Service Type)" value={state.serviceType} options={GOVT_SERVICE_TYPES} onChange={x => patch({ serviceType: x })} />
          <SelectFieldRow label="सेवा वर्ग (Class)" value={state.classLevel} options={GOVT_CLASSES} onChange={x => patch({ classLevel: x, designation: "" })} />
          {state.classLevel && (
            <div className="md:col-span-2">
              <SelectFieldRow
                label={`पदनाम (Designation) – ${state.classLevel.split(" (")[0]}`}
                value={state.designation}
                options={GOVT_CLASS_DESIGNATIONS[state.classLevel] || []}
                onChange={x => patch({ designation: x })}
              />
            </div>
          )}
          <TextRow label="कार्यालय / विभाग (Office / Department)" value={state.organisation} onChange={x => patch({ organisation: x })} />
        </div>
      )}

      {c === "शिक्षण क्षेत्र (Education Sector)" && (
        <div className="border-t pt-4 mt-2">
          <div className="mb-3 flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-primary" />
            <h4 className="text-sm font-semibold text-foreground">
              शिक्षण क्षेत्र – तपशील (Education Sector Details)
            </h4>
          </div>

          <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
            {/* Step 1 */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">
                Step 1 — संस्था प्रकार (Institution Type)
              </div>
              <SelectFieldRow
                label="संस्था प्रकार निवडा"
                value={state.institutionType}
                options={EDU_INSTITUTION_TYPES}
                onChange={x => patch({ institutionType: x, institutionTypeOther: "", institutionLevel: "", institutionLevelOther: "", designation: "", designationOther: "" })}
              />
              {state.institutionType === "Other (इतर)" && (
                <Input
                  placeholder="संस्था प्रकार नमूद करा"
                  value={state.institutionTypeOther || ""}
                  onChange={e => patch({ institutionTypeOther: e.target.value })}
                />
              )}
            </div>

            {/* Step 2 */}
            {state.institutionType && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">
                  Step 2 — संस्था स्तर (Institution Level)
                </div>
                <SelectFieldRow
                  label="संस्था स्तर निवडा"
                  value={state.institutionLevel}
                  options={eduLevelsForType(state.institutionType).length ? eduLevelsForType(state.institutionType) : ["Other (इतर)"]}
                  onChange={x => patch({ institutionLevel: x, institutionLevelOther: "", designation: "", designationOther: "" })}
                />
                {state.institutionLevel === "Other (इतर)" && (
                  <Input
                    placeholder="संस्था स्तर नमूद करा"
                    value={state.institutionLevelOther || ""}
                    onChange={e => patch({ institutionLevelOther: e.target.value })}
                  />
                )}
              </div>
            )}

            {/* Step 3 */}
            {state.institutionLevel && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">
                  Step 3 — पदनाम (Designation)
                </div>
                <SelectFieldRow
                  label="पदनाम निवडा"
                  value={state.designation}
                  options={EDU_DESIGNATIONS_BY_LEVEL[state.institutionLevel] || ["Other (इतर)"]}
                  onChange={x => patch({ designation: x, designationOther: "" })}
                />
                {state.designation === "Other (इतर)" && (
                  <Input
                    placeholder="पदनाम नमूद करा"
                    value={state.designationOther || ""}
                    onChange={e => patch({ designationOther: e.target.value })}
                  />
                )}
              </div>
            )}

            {/* Step 4 */}
            {state.designation && (
              <div className="space-y-2 pt-2 border-t border-dashed">
                <div className="text-xs font-medium text-muted-foreground">
                  Step 4 — संस्था व कार्यरत ठिकाण
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <TextRow
                    label="संस्थेचे नाव (School / College / University Name)"
                    value={state.organisation}
                    onChange={x => patch({ organisation: x })}
                  />
                  <TextRow
                    label="कार्यरत ठिकाण (Place of Posting)"
                    value={state.postingPlace}
                    onChange={x => patch({ postingPlace: x })}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {c === "वैद्यकीय क्षेत्र (Medical Sector)" && (
        <div className="border-t pt-4 mt-2">
          <div className="mb-3 flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-primary" />
            <h4 className="text-sm font-semibold text-foreground">
              वैद्यकीय क्षेत्र – तपशील (Medical Sector Details)
            </h4>
          </div>

          <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
            {/* Step 1 — Institution Type */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">
                Step 1 — संस्था प्रकार (Institution Type)
              </div>
              <SelectFieldRow
                label="संस्था प्रकार निवडा"
                value={state.hospitalType}
                options={MED_INSTITUTION_TYPES}
                onChange={x => patch({
                  hospitalType: x,
                  hospitalTypeOther: "",
                  designation: "",
                  designationOther: "",
                  organisation: "",
                  postingPlace: "",
                  department: "",
                  setupName: "",
                  setupAddress: "",
                  setupCity: "",
                  setupDistrict: "",
                  setupPin: "",
                })}
              />
              {state.hospitalType === "Other (इतर)" && (
                <Input
                  placeholder="संस्था प्रकार नमूद करा"
                  value={state.hospitalTypeOther || ""}
                  onChange={e => patch({ hospitalTypeOther: e.target.value })}
                />
              )}
            </div>

            {/* Step 2 — Role / Designation */}
            {state.hospitalType && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">
                  Step 2 — भूमिका / पदनाम (Role / Designation)
                </div>
                <SelectFieldRow
                  label="पदनाम निवडा"
                  value={state.designation}
                  options={medDesignationsForType(state.hospitalType)}
                  onChange={x => patch({ designation: x, designationOther: "" })}
                />
                {state.designation === "Other (इतर)" && (
                  <Input
                    placeholder="पदनाम नमूद करा"
                    value={state.designationOther || ""}
                    onChange={e => patch({ designationOther: e.target.value })}
                  />
                )}
              </div>
            )}

            {/* Step 3 — Hospital / College fields */}
            {state.designation && medNeedsHospitalFields(state.hospitalType) && (
              <div className="space-y-2 pt-2 border-t border-dashed">
                <div className="text-xs font-medium text-muted-foreground">
                  Step 3 — अतिरिक्त माहिती (Hospital / College Details)
                </div>
                <TextRow
                  label="रुग्णालय / महाविद्यालयाचे नाव (Hospital / College Name)"
                  value={state.organisation}
                  onChange={x => patch({ organisation: x })}
                />
              </div>
            )}

            {/* Step 3 — Clinic / Laboratory fields */}
            {state.designation &&
              (state.hospitalType === "Clinic (दवाखाना)" ||
                state.hospitalType === "Laboratory (प्रयोगशाळा)") && (
                <div className="space-y-2 pt-2 border-t border-dashed">
                  <div className="text-xs font-medium text-muted-foreground">
                    Step 3 — {state.hospitalType === "Clinic (दवाखाना)" ? "दवाखाना" : "प्रयोगशाळा"} तपशील (
                    {state.hospitalType === "Clinic (दवाखाना)" ? "Clinic" : "Laboratory"} Details)
                  </div>
                  <TextRow
                    label={
                      state.hospitalType === "Clinic (दवाखाना)"
                        ? "दवाखान्याचे नाव (Clinic Name)"
                        : "प्रयोगशाळेचे नाव (Laboratory Name)"
                    }
                    value={state.organisation}
                    onChange={x => patch({ organisation: x })}
                  />
                </div>
              )}




            {/* Step 4 — Own Setup */}
            {state.designation && medIsOwnSetup(state.hospitalType) && (
              <div className="space-y-2 pt-2 border-t border-dashed">
                <div className="text-xs font-medium text-muted-foreground">
                  Step 4 — स्वतःच्या क्लिनिक / रुग्णालय / लॅबचे तपशील (Own Setup Details)
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <TextRow
                    label="क्लिनिक / रुग्णालय / लॅबचे नाव (Name of Setup)"
                    value={state.setupName}
                    onChange={x => patch({ setupName: x })}
                  />
                  <TextRow
                    label="शहर / गाव (City / Village)"
                    value={state.setupCity}
                    onChange={x => patch({ setupCity: x })}
                  />
                  <TextRow
                    label="जिल्हा (District)"
                    value={state.setupDistrict}
                    onChange={x => patch({ setupDistrict: x })}
                  />
                  <TextRow
                    label="पिन कोड (Pin Code)"
                    value={state.setupPin}
                    onChange={x => patch({ setupPin: x })}
                  />
                  <div className="md:col-span-2">
                    <TextRow
                      label="पूर्ण पत्ता (Full Address)"
                      value={state.setupAddress}
                      onChange={x => patch({ setupAddress: x })}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}


      {c === "महिला व बाल विकास (Women & Child Development)" && (
        <div className="grid gap-3 md:grid-cols-2 border-t pt-3">
          <SelectFieldRow label="पद (Designation)" value={state.designation} options={WCD_DESIGNATIONS} onChange={x => patch({ designation: x })} />
          <TextRow label="कार्यरत गाव / केंद्र (Work Village / Centre)" value={state.postingPlace} onChange={x => patch({ postingPlace: x })} />
        </div>
      )}

      {c === "अभियंता (Engineering Sector)" && (
        <div className="space-y-4 border-t pt-3">
          <div className="text-sm font-semibold">अभियंता क्षेत्र – तपशील (Engineering Sector Details)</div>

          {/* Step 1 */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">Step 1 — संस्था प्रकार (Institution Type)</div>
            <SelectFieldRow
              label="संस्था प्रकार निवडा"
              value={state.institutionType}
              options={ENG_INSTITUTION_TYPES}
              onChange={x => patch({ institutionType: x, branch: "", branchOther: "", designation: "", designationOther: "" })}
            />
          </div>

          {/* Step 2 */}
          {state.institutionType && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">Step 2 — शाखा (Engineering Branch)</div>
              <SelectFieldRow
                label="शाखा निवडा"
                value={state.branch}
                options={ENG_BRANCHES}
                onChange={x => patch({ branch: x, branchOther: "", designation: "", designationOther: "" })}
              />
              {state.branch === "Other (इतर)" && (
                <Input
                  placeholder="शाखा नमूद करा"
                  value={state.branchOther || ""}
                  onChange={e => patch({ branchOther: e.target.value })}
                />
              )}
            </div>
          )}

          {/* Step 3 */}
          {state.branch && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">Step 3 — पदनाम (Designation)</div>
              <SelectFieldRow
                label="पदनाम निवडा"
                value={state.designation}
                options={engDesignationsForBranch(state.branch)}
                onChange={x => patch({ designation: x, designationOther: "" })}
              />
              {state.designation === "Other (इतर)" && (
                <Input
                  placeholder="पदनाम नमूद करा"
                  value={state.designationOther || ""}
                  onChange={e => patch({ designationOther: e.target.value })}
                />
              )}
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-1">
            <TextRow label="संस्थेचे नाव (Organisation Name)" value={state.organisation} onChange={x => patch({ organisation: x })} />
          </div>
        </div>
      )}

      {c === "बँकिंग व वित्तीय क्षेत्र (Banking & Finance)" && (
        <div className="space-y-4 border-t pt-3">
          <div className="text-sm font-semibold">बँकिंग व वित्तीय क्षेत्र – तपशील (Banking & Finance Details)</div>

          {/* Step 1 */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">Step 1 — संस्था प्रकार (Institution Type)</div>
            <SelectFieldRow
              label="बँक / संस्था प्रकार"
              value={state.bankType}
              options={BANK_TYPES}
              onChange={x => patch({ bankType: x, bankTypeOther: "", designation: "", designationOther: "" })}
            />
            {state.bankType === "Other (इतर)" && (
              <Input
                placeholder="संस्था प्रकार नमूद करा"
                value={state.bankTypeOther || ""}
                onChange={e => patch({ bankTypeOther: e.target.value })}
              />
            )}
          </div>

          {/* Step 2 */}
          {state.bankType && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">Step 2 — पदनाम (Designation)</div>
              <SelectFieldRow
                label="पदनाम निवडा"
                value={state.designation}
                options={bankDesignationsFor(state.bankType)}
                onChange={x => patch({ designation: x, designationOther: "" })}
              />
              {state.designation === "Other (इतर)" && (
                <Input
                  placeholder="पदनाम नमूद करा"
                  value={state.designationOther || ""}
                  onChange={e => patch({ designationOther: e.target.value })}
                />
              )}
            </div>
          )}

          {/* Step 3 – Org details */}
          {state.designation && (
            <div className="grid gap-3 md:grid-cols-2">
              <TextRow label="बँक / संस्था नाव" value={state.organisation} onChange={x => patch({ organisation: x })} />
              <TextRow label="शाखा (Branch)" value={state.branch} onChange={x => patch({ branch: x })} />
            </div>
          )}
        </div>
      )}

      {c === "न्यायव्यवस्था (Judiciary)" && (
        <div className="grid gap-3 md:grid-cols-2 border-t pt-3">
          <SelectFieldRow label="पद (Designation)" value={state.designation} options={JUDICIARY_DESIGNATIONS} onChange={x => patch({ designation: x })} />
          <TextRow label="न्यायालय / संस्था (Court / Org)" value={state.organisation} onChange={x => patch({ organisation: x })} />
        </div>
      )}

      {c === "संरक्षण व सुरक्षा सेवा (Defence & Security)" && (
        <div className="grid gap-3 md:grid-cols-2 border-t pt-3">
          <SelectFieldRow
            label="दल (Force)"
            value={state.force}
            options={DEFENCE_FORCES}
            onChange={x => patch({ force: x, forceOther: "", rank: "", rankOther: "" })}
          />
          {state.force === "Other (इतर)" && (
            <TextRow
              label="दलाचे नाव (Specify Force)"
              value={state.forceOther}
              onChange={x => patch({ forceOther: x })}
            />
          )}
          {state.force && state.force !== "Other (इतर)" && (
            <SelectFieldRow
              label="पदनाम / रँक (Rank)"
              value={state.rank}
              options={ranksFor(state.force)}
              onChange={x => patch({ rank: x, rankOther: "" })}
            />
          )}
          {state.rank === "Other (इतर)" && (
            <TextRow
              label="पदनाम (Specify Rank)"
              value={state.rankOther}
              onChange={x => patch({ rankOther: x })}
            />
          )}
          <TextRow
            label="कार्यरत ठिकाण (Place of Posting)"
            value={state.postingPlace}
            onChange={x => patch({ postingPlace: x })}
          />
        </div>
      )}

      {c === "खाजगी कर्मचारी (Private Employee)" && (
        <div className="grid gap-3 md:grid-cols-2 border-t pt-3">
          <SelectFieldRow label="क्षेत्र (Sector)" value={state.sector} options={PRIVATE_SECTORS} onChange={x => patch({ sector: x })} />
          <TextRow label="पदनाम (Designation)" value={state.designation} onChange={x => patch({ designation: x })} />
          <TextRow label="कंपनीचे नाव (Company Name)" value={state.organisation} onChange={x => patch({ organisation: x })} />
        </div>
      )}

      {c === "निवृत्त / पेन्शनधारक (Retired / Pensioner)" && (
        <div className="grid gap-3 md:grid-cols-2 border-t pt-3">
          <SelectFieldRow label="पूर्वीचे विभाग (Retired From)" value={state.retiredFrom} options={RETIRED_FROM} onChange={x => patch({ retiredFrom: x })} />
          <TextRow label="शेवटचे पद (Last Designation)" value={state.designation} onChange={x => patch({ designation: x })} />
          <TextRow label="संस्था (Organisation)" value={state.organisation} onChange={x => patch({ organisation: x })} />
        </div>
      )}

      {c === "परदेशस्थ (NRI)" && (
        <div className="grid gap-3 md:grid-cols-2 border-t pt-3">
          <TextRow label="देश (Country)" value={state.country} onChange={x => patch({ country: x })} />
          <TextRow label="शहर (City)" value={state.city} onChange={x => patch({ city: x })} />
          <TextRow label="व्यवसाय / पद (Occupation)" value={state.designation} onChange={x => patch({ designation: x })} />
          <TextRow label="कंपनी / व्यवसाय नाव" value={state.organisation} onChange={x => patch({ organisation: x })} />
          <div className="md:col-span-2">
            <Label className="text-xs text-muted-foreground mb-1 block">समाजासाठी योगदान (Community Contribution)</Label>
            <div className="grid grid-cols-2 gap-2">
              {NRI_CONTRIBUTIONS.map(t => (
                <Label key={t} className="flex items-center gap-2 text-sm p-2 rounded border bg-background cursor-pointer">
                  <Checkbox checked={state.contributions?.includes(t) || false} onCheckedChange={() => toggleContribution(t)} />
                  <span>{t}</span>
                </Label>
              ))}
            </div>
          </div>
        </div>
      )}


      {c === "इतर (Other)" && (
        <div className="grid gap-3 md:grid-cols-2 border-t pt-3">
          <TextRow label="तपशील (Details)" value={state.notes} onChange={x => patch({ notes: x })} />
        </div>
      )}

      {/* ============ Unemployed (बेरोजगार) – detailed questionnaire ============ */}
      {c === "बेरोजगार (Unemployed)" && (
        <div className="border-t pt-4 space-y-4">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-primary" />
            <h4 className="text-sm font-semibold text-foreground">
              बेरोजगार – तपशील (Unemployment Details)
            </h4>
          </div>

          <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
            <YesNoRow
              label="सध्या रोजगाराच्या शोधात आहात का?"
              value={state.seekingJob}
              onChange={x => patch({ seekingJob: x })}
            />

            <TextRow
              label="कोणत्या क्षेत्रात रोजगार मिळवण्याची इच्छा आहे?"
              value={state.desiredSector}
              onChange={x => patch({ desiredSector: x })}
            />

            <YesNoRow
              label="रोजगारासाठी आवश्यक कौशल्य प्रशिक्षण घेण्याची इच्छा आहे का?"
              value={state.wantsSkillTraining}
              onChange={x => patch({ wantsSkillTraining: x })}
            />

            <div className="space-y-3 pt-2 border-t border-dashed">
              <YesNoRow
                label="स्वतःचा व्यवसाय किंवा दुकान सुरू करण्याची इच्छा आहे का?"
                value={state.wantOwnBusiness}
                onChange={x => patch({ wantOwnBusiness: x, ...(x !== "होय" ? { desiredBusiness: "", loanNeeded: "", loanAmount: "", loanAmountOther: "" } : {}) })}
              />
              {state.wantOwnBusiness === "होय" && (
                <>
                  <TextRow
                    label="कोणता व्यवसाय सुरू करू इच्छिता?"
                    value={state.desiredBusiness}
                    onChange={x => patch({ desiredBusiness: x })}
                  />
                  <YesNoRow
                    label="व्यवसाय सुरू करण्यासाठी आर्थिक सहाय्य (कर्ज) आवश्यक आहे का?"
                    value={state.loanNeeded}
                    onChange={x => patch({ loanNeeded: x, ...(x !== "होय" ? { loanAmount: "", loanAmountOther: "" } : {}) })}
                  />
                  {state.loanNeeded === "होय" && (
                    <LoanAmountRow state={state} patch={patch} />
                  )}
                </>
              )}
            </div>

            <YesNoRow
              label="रोजगार, स्वयंरोजगार किंवा व्यवसाय सुरू करण्यासाठी मार्गदर्शन / समुपदेशन मिळण्यास इच्छुक आहात का?"
              value={state.wantsGuidance}
              onChange={x => patch({ wantsGuidance: x })}
            />
          </div>
        </div>
      )}

      {/* ============ Common fields (most categories) ============ */}
      {c && c !== "बेरोजगार (Unemployed)" && c !== "परदेशस्थ (NRI)" && c !== "संरक्षण व सुरक्षा सेवा (Defence & Security)" && (
        <div className="grid gap-3 md:grid-cols-2 border-t pt-3">
          {!["शेतकरी (Farmer)", "कृषी मजूर / शेतमजूर (Farm Labour)", "शिक्षण क्षेत्र (Education Sector)"].includes(c) && (
            <TextRow label="कार्यरत ठिकाण (Place of Posting)" value={state.postingPlace} onChange={x => patch({ postingPlace: x })} />
          )}
        </div>
      )}

      {/* ============ Loan / Business aspiration (Self Employed) ============ */}
      {c === "स्वरोजगार (Self Employed)" && (
        <div className="border-t pt-3 space-y-3 bg-muted/30 rounded-md p-3">
          <YesNoRow
            label="आपल्याला स्वतःचे दुकान किंवा व्यवसाय सुरू करण्याची इच्छा आहे का?"
            value={state.wantOwnBusiness}
            onChange={x => patch({ wantOwnBusiness: x, ...(x !== "होय" ? { loanNeeded: "", loanAmount: "", loanAmountOther: "" } : {}) })}
          />
          {state.wantOwnBusiness === "होय" && (
            <YesNoRow
              label="व्यवसाय सुरू करण्यासाठी कर्जाची आवश्यकता आहे का?"
              value={state.loanNeeded}
              onChange={x => patch({ loanNeeded: x, ...(x !== "होय" ? { loanAmount: "", loanAmountOther: "" } : {}) })}
            />
          )}
          {state.wantOwnBusiness === "होय" && state.loanNeeded === "होय" && (
            <LoanAmountRow state={state} patch={patch} />
          )}
        </div>
      )}

      {/* ============ Loan (Business Owner) ============ */}
      {c === "व्यवसाय (Business Owner)" && (
        <div className="border-t pt-3 space-y-3 bg-muted/30 rounded-md p-3">
          <YesNoRow
            label="आपल्या व्यवसायाच्या विस्तारासाठी किंवा नवीन व्यवसाय सुरू करण्यासाठी कर्जाची आवश्यकता आहे का?"
            value={state.loanNeeded}
            onChange={x => patch({ loanNeeded: x, ...(x !== "होय" ? { loanAmount: "", loanAmountOther: "", loanPurpose: "", loanPurposeOther: "" } : {}) })}
          />
          {state.loanNeeded === "होय" && (
            <>
              <LoanAmountRow state={state} patch={patch} />
              <LoanPurposeRow state={state} patch={patch} />
            </>
          )}
        </div>
      )}



      {/* Preview chip */}
      {state.category && (
        <div>
          <span className="inline-block text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-md font-medium">
            {summariseOccupation(state)}
          </span>
        </div>
      )}
    </div>
  );
}

function SelectFieldRow({ label, value, options, onChange }: { label: string; value?: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground mb-1 block">{label}</Label>
      <Select value={value || ""} onValueChange={onChange}>
        <SelectTrigger><SelectValue placeholder="निवडा" /></SelectTrigger>
        <SelectContent className="max-h-72 bg-popover">
          {options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

function TextRow({ label, value, onChange, type = "text" }: { label: string; value?: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground mb-1 block">{label}</Label>
      <Input type={type} value={value || ""} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

function YesNoRow({ label, value, onChange }: { label: string; value?: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label className="text-sm font-medium mb-2 block">{label}</Label>
      <div className="flex gap-2">
        {["होय", "नाही"].map(opt => {
          const active = value === opt;
          return (
            <button
              type="button"
              key={opt}
              onClick={() => onChange(active ? "" : opt)}
              className={`px-4 py-1.5 rounded-md text-sm border transition ${active ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-accent"}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LoanAmountRow({ state, patch }: { state: OccupationValue; patch: (p: Partial<OccupationValue>) => void }) {
  return (
    <div>
      <Label className="text-sm font-medium mb-2 block">आवश्यक कर्ज रक्कम</Label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {LOAN_AMOUNT_OPTIONS.map(opt => (
          <Label key={opt} className="flex items-center gap-2 text-sm p-2 rounded border bg-background cursor-pointer">
            <Checkbox
              checked={state.loanAmount === opt}
              onCheckedChange={() => patch({ loanAmount: state.loanAmount === opt ? "" : opt, ...(opt !== "इतर" ? { loanAmountOther: "" } : {}) })}
            />
            <span>{opt}</span>
          </Label>
        ))}
      </div>
      {state.loanAmount === "इतर" && (
        <div className="mt-2">
          <Input
            placeholder="₹ रक्कम नमूद करा"
            value={state.loanAmountOther || ""}
            onChange={e => patch({ loanAmountOther: e.target.value })}
          />
        </div>
      )}
    </div>
  );
}

function LoanPurposeRow({ state, patch }: { state: OccupationValue; patch: (p: Partial<OccupationValue>) => void }) {
  return (
    <div>
      <Label className="text-sm font-medium mb-2 block">कर्जाचा उद्देश</Label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {LOAN_PURPOSE_OPTIONS.map(opt => (
          <Label key={opt} className="flex items-center gap-2 text-sm p-2 rounded border bg-background cursor-pointer">
            <Checkbox
              checked={state.loanPurpose === opt}
              onCheckedChange={() => patch({ loanPurpose: state.loanPurpose === opt ? "" : opt, ...(opt !== "इतर" ? { loanPurposeOther: "" } : {}) })}
            />
            <span>{opt}</span>
          </Label>
        ))}
      </div>
      {state.loanPurpose === "इतर" && (
        <div className="mt-2">
          <Input
            placeholder="उद्देश नमूद करा"
            value={state.loanPurposeOther || ""}
            onChange={e => patch({ loanPurposeOther: e.target.value })}
          />
        </div>
      )}
    </div>
  );
}
