import { useMemo, useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon } from "lucide-react";

const MONTHS = [
  { value: "01", label: "जानेवारी" },
  { value: "02", label: "फेब्रुवारी" },
  { value: "03", label: "मार्च" },
  { value: "04", label: "एप्रिल" },
  { value: "05", label: "मे" },
  { value: "06", label: "जून" },
  { value: "07", label: "जुलै" },
  { value: "08", label: "ऑगस्ट" },
  { value: "09", label: "सप्टेंबर" },
  { value: "10", label: "ऑक्टोबर" },
  { value: "11", label: "नोव्हेंबर" },
  { value: "12", label: "डिसेंबर" },
];

function getDaysInMonth(year: string, month: string) {
  if (!year || !month) return 31;
  return new Date(parseInt(year, 10), parseInt(month, 10), 0).getDate();
}

export function calcAge(dobStr: string): number | "" {
  if (!dobStr) return "";
  const [y, m, d] = dobStr.split("-");
  if (!y || !m || !d) return "";
  const birth = new Date(`${y}-${m}-${d}T00:00:00`);
  if (isNaN(birth.getTime())) return "";
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  const mo = now.getMonth() - birth.getMonth();
  if (mo < 0 || (mo === 0 && now.getDate() < birth.getDate())) years--;
  return years >= 0 ? years : "";
}

type DateSelectProps = {
  value?: string; // yyyy-MM-dd (complete only)
  onChange: (dob: string, age: number | "") => void;
  disabled?: boolean;
};

export function DateSelect({ value, onChange, disabled }: DateSelectProps) {
  // Local state holds partial selections; only propagate when complete
  const init = value && value.split("-").length === 3 ? value.split("-") : ["", "", ""];
  const [year, setYear] = useState(init[0] || "");
  const [month, setMonth] = useState(init[1] || "");
  const [day, setDay] = useState(init[2] || "");

  useEffect(() => {
    if (!value) {
      setYear(""); setMonth(""); setDay("");
    } else {
      const [y, m, d] = value.split("-");
      setYear(y || ""); setMonth(m || ""); setDay(d || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    const list: string[] = [];
    for (let y = current; y >= 1920; y--) list.push(String(y));
    return list;
  }, []);

  const daysInMonth = getDaysInMonth(year, month);
  const days = Array.from({ length: daysInMonth }, (_, i) => String(i + 1).padStart(2, "0"));

  function propagate(y: string, m: string, d: string) {
    if (y && m && d) {
      const dob = `${y}-${m}-${d}`;
      onChange(dob, calcAge(dob));
    } else if (value) {
      onChange("", "");
    }
  }

  const age = year && month && day ? calcAge(`${year}-${month}-${day}`) : "";

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-center">
        <div className="flex items-center justify-center h-10 w-10 rounded-md border bg-muted/40 text-muted-foreground shrink-0">
          <CalendarIcon className="h-4 w-4" />
        </div>
        <Select disabled={disabled} value={day || undefined} onValueChange={(d) => { setDay(d); propagate(year, month, d); }}>
          <SelectTrigger className="flex-1"><SelectValue placeholder="दिवस" /></SelectTrigger>
          <SelectContent className="max-h-60">
            {days.map((d) => (<SelectItem key={d} value={d}>{d}</SelectItem>))}
          </SelectContent>
        </Select>

        <Select
          disabled={disabled}
          value={month || undefined}
          onValueChange={(m) => {
            const maxDays = getDaysInMonth(year, m);
            const safeDay = day && parseInt(day, 10) > maxDays ? String(maxDays).padStart(2, "0") : day;
            setMonth(m); setDay(safeDay);
            propagate(year, m, safeDay);
          }}
        >
          <SelectTrigger className="flex-[2]"><SelectValue placeholder="महिना" /></SelectTrigger>
          <SelectContent className="max-h-60">
            {MONTHS.map((m) => (<SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>))}
          </SelectContent>
        </Select>

        <Select
          disabled={disabled}
          value={year || undefined}
          onValueChange={(y) => {
            const maxDays = getDaysInMonth(y, month);
            const safeDay = day && parseInt(day, 10) > maxDays ? String(maxDays).padStart(2, "0") : day;
            setYear(y); setDay(safeDay);
            propagate(y, month, safeDay);
          }}
        >
          <SelectTrigger className="flex-[1.5]"><SelectValue placeholder="वर्ष" /></SelectTrigger>
          <SelectContent className="max-h-60">
            {years.map((y) => (<SelectItem key={y} value={y}>{y}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>
      {age !== "" && (
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2.5 py-1 text-xs font-medium">
          वय: {age} वर्षे
        </span>
      )}
    </div>
  );
}
