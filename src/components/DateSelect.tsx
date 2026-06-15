import { useMemo } from "react";
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
  const y = parseInt(year, 10);
  const m = parseInt(month, 10);
  return new Date(y, m, 0).getDate();
}

export function calcAge(dobStr: string): number | "" {
  if (!dobStr) return "";
  const parts = dobStr.split("-");
  if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) return "";
  const birth = new Date(`${parts[0]}-${parts[1]}-${parts[2]}T00:00:00`);
  if (isNaN(birth.getTime())) return "";
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    years--;
  }
  return years >= 0 ? years : "";
}

type DateSelectProps = {
  value?: string; // yyyy-MM-dd
  onChange: (dob: string, age: number | "") => void;
  disabled?: boolean;
};

export function DateSelect({ value, onChange, disabled }: DateSelectProps) {
  const [year = "", month = "", day = ""] = value ? value.split("-") : ["", "", ""];

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    const list: string[] = [];
    for (let y = current; y >= 1920; y--) list.push(String(y));
    return list;
  }, []);

  const daysInMonth = getDaysInMonth(year, month);
  const days = Array.from({ length: daysInMonth }, (_, i) => String(i + 1).padStart(2, "0"));

  function update(newYear: string, newMonth: string, newDay: string) {
    if (newYear && newMonth && newDay) {
      const dob = `${newYear}-${newMonth}-${newDay}`;
      onChange(dob, calcAge(dob));
    } else {
      // Keep partial date stored so selects retain user's picks, but age empty
      const partial = `${newYear}-${newMonth}-${newDay}`;
      onChange(partial === "--" ? "" : partial, "");
    }
  }

  const age = calcAge(value || "");

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-center">
        <div className="flex items-center justify-center h-10 w-10 rounded-md border bg-muted/40 text-muted-foreground shrink-0">
          <CalendarIcon className="h-4 w-4" />
        </div>
        <Select disabled={disabled} value={day || undefined} onValueChange={(d) => update(year, month, d)}>
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
            update(year, m, safeDay);
          }}
        >
          <SelectTrigger className="flex-[2]"><SelectValue placeholder="महिना" /></SelectTrigger>
          <SelectContent className="max-h-60">
            {MONTHS.map((m) => (<SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>))}
          </SelectContent>
        </Select>

        <Select disabled={disabled} value={year || undefined} onValueChange={(y) => {
          const maxDays = getDaysInMonth(y, month);
          const safeDay = day && parseInt(day, 10) > maxDays ? String(maxDays).padStart(2, "0") : day;
          update(y, month, safeDay);
        }}>
          <SelectTrigger className="flex-[1.5]"><SelectValue placeholder="वर्ष" /></SelectTrigger>
          <SelectContent className="max-h-60">
            {years.map((y) => (<SelectItem key={y} value={y}>{y}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>
      {age !== "" && (
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2.5 py-1 font-medium">
            वय: {age} वर्षे
          </span>
        </div>
      )}
    </div>
  );
}
