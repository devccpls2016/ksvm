import { useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

function calcAge(dobStr: string): number | "" {
  if (!dobStr) return "";
  const birth = new Date(dobStr);
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
    for (let y = current; y >= 1920; y--) {
      list.push(String(y));
    }
    return list;
  }, []);

  const daysInMonth = getDaysInMonth(year, month);
  const days = Array.from({ length: daysInMonth }, (_, i) => String(i + 1).padStart(2, "0"));

  function update(newYear: string, newMonth: string, newDay: string) {
    if (newYear && newMonth && newDay) {
      const dob = `${newYear}-${newMonth}-${newDay}`;
      onChange(dob, calcAge(dob));
    } else {
      onChange("", "");
    }
  }

  return (
    <div className="flex gap-2 items-center">
      <Select
        disabled={disabled}
        value={day || undefined}
        onValueChange={(d) => update(year, month, d)}
      >
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="दिवस" />
        </SelectTrigger>
        <SelectContent>
          {days.map((d) => (
            <SelectItem key={d} value={d}>{d}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        disabled={disabled}
        value={month || undefined}
        onValueChange={(m) => {
          const maxDays = getDaysInMonth(year, m);
          const safeDay = parseInt(day, 10) > maxDays ? String(maxDays).padStart(2, "0") : day;
          update(year, m, safeDay);
        }}
      >
        <SelectTrigger className="flex-[2]">
          <SelectValue placeholder="महिना" />
        </SelectTrigger>
        <SelectContent>
          {MONTHS.map((m) => (
            <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        disabled={disabled}
        value={year || undefined}
        onValueChange={(y) => update(y, month, day)}
      >
        <SelectTrigger className="flex-[1.5]">
          <SelectValue placeholder="वर्ष" />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {years.map((y) => (
            <SelectItem key={y} value={y}>{y}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
