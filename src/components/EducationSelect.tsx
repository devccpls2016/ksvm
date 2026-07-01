import { useEffect, useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  EDUCATION_TREE,
  INSTITUTION_TYPES,
  decodeEducation,
  encodeEducation,
} from "@/lib/education-data";

type Props = {
  value: string;
  onChange: (encoded: string) => void;
};

export function EducationSelect({ value, onChange }: Props) {
  const initial = decodeEducation(value);
  const [level, setLevel] = useState(initial.level);
  const [stream, setStream] = useState(initial.stream);
  const [course, setCourse] = useState(initial.course);
  const [institution, setInstitution] = useState(initial.institution);

  // Re-sync when external value changes (e.g. form reset)
  useEffect(() => {
    const d = decodeEducation(value);
    setLevel(d.level);
    setStream(d.stream);
    setCourse(d.course);
    setInstitution(d.institution);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const levelObj = useMemo(
    () => EDUCATION_TREE.find((l) => l.level === level),
    [level]
  );
  const streamObj = useMemo(
    () => levelObj?.streams.find((s) => s.stream === stream),
    [levelObj, stream]
  );

  function emit(next: { level?: string; stream?: string; course?: string; institution?: string }) {
    onChange(
      encodeEducation({
        level: next.level ?? level,
        stream: next.stream ?? stream,
        course: next.course ?? course,
        institution: next.institution ?? institution,
      })
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {/* Level */}
      <div>
        <Label className="text-xs text-muted-foreground mb-1 block">शिक्षण स्तर</Label>
        <Select
          value={level}
          onValueChange={(v) => {
            setLevel(v);
            setStream("");
            setCourse("");
            setInstitution("");
            emit({ level: v, stream: "", course: "", institution: "" });
          }}
        >
          <SelectTrigger><SelectValue placeholder="निवडा" /></SelectTrigger>
          <SelectContent className="max-h-72 bg-popover">
            {EDUCATION_TREE.map((l) => (
              <SelectItem key={l.level} value={l.level}>{l.level}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stream */}
      {levelObj && levelObj.streams.length > 0 && levelObj.streams[0].stream !== "—" && (
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">शाखा / गट (Stream)</Label>
          <Select
            value={stream}
            onValueChange={(v) => {
              setStream(v);
              setCourse("");
              emit({ stream: v, course: "" });
            }}
          >
            <SelectTrigger><SelectValue placeholder="शाखा निवडा" /></SelectTrigger>
            <SelectContent className="max-h-72 bg-popover">
              {levelObj.streams.map((s) => (
                <SelectItem key={s.stream} value={s.stream}>{s.stream}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Course */}
      {streamObj && (
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">अभ्यासक्रम (Course)</Label>
          <Select
            value={course.startsWith("इतर (नमूद करा)") ? "इतर (नमूद करा)" : course}
            onValueChange={(v) => {
              setCourse(v);
              emit({ course: v });
            }}
          >
            <SelectTrigger><SelectValue placeholder="अभ्यासक्रम निवडा" /></SelectTrigger>
            <SelectContent className="max-h-72 bg-popover">
              {streamObj.courses.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {course.startsWith("इतर (नमूद करा)") && (
            <div className="mt-2">
              <Label className="text-xs text-muted-foreground mb-1 block">इतर – नमूद करा</Label>
              <Input
                value={course.replace(/^इतर \(नमूद करा\):?\s*/, "")}
                onChange={(e) => {
                  const txt = e.target.value;
                  const next = txt ? `इतर (नमूद करा): ${txt}` : "इतर (नमूद करा)";
                  setCourse(next);
                  emit({ course: next });
                }}
                placeholder="उदा. D.Arch. (Doctor of Architecture)"
              />
            </div>
          )}
        </div>
      )}

      {/* Institution Type */}
      {levelObj?.askInstitution && course && (
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">संस्था प्रकार</Label>
          <Select
            value={institution}
            onValueChange={(v) => {
              setInstitution(v);
              emit({ institution: v });
            }}
          >
            <SelectTrigger><SelectValue placeholder="सरकारी / खाजगी" /></SelectTrigger>
            <SelectContent className="max-h-72 bg-popover">
              {INSTITUTION_TYPES.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Preview */}
      {value && (
        <div className="md:col-span-2">
          <span className="inline-block text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-md font-medium">
            {value}
          </span>
        </div>
      )}
    </div>
  );
}
