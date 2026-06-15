import { Input } from "@/components/ui/input";

type Props = {
  value: string; // YYYY-MM-DD
  onChange: (dob: string, age: number | "") => void;
};

function calcAge(dob: string): number | "" {
  if (!dob) return "";
  const [y, m, d] = dob.split("-").map(Number);
  if (!y || !m || !d) return "";
  const birth = new Date(y, m - 1, d);
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  const mo = now.getMonth() - birth.getMonth();
  if (mo < 0 || (mo === 0 && now.getDate() < birth.getDate())) years--;
  return years >= 0 ? years : "";
}

export function DobInput({ value, onChange }: Props) {
  const [yy = "", mm = "", dd = ""] = value ? value.split("-") : [];

  const update = (d: string, m: string, y: string) => {
    const dn = parseInt(d, 10);
    const mn = parseInt(m, 10);
    const yn = parseInt(y, 10);
    if (
      d && m && y &&
      y.length === 4 &&
      dn >= 1 && dn <= 31 &&
      mn >= 1 && mn <= 12 &&
      yn >= 1900 && yn <= new Date().getFullYear()
    ) {
      const dob = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
      // validate real date
      const dt = new Date(yn, mn - 1, dn);
      if (dt.getFullYear() === yn && dt.getMonth() === mn - 1 && dt.getDate() === dn) {
        onChange(dob, calcAge(dob));
        return;
      }
    }
    onChange("", "");
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      <Input
        type="number"
        inputMode="numeric"
        placeholder="दिवस"
        min={1}
        max={31}
        value={dd ? String(parseInt(dd, 10)) : ""}
        onChange={(e) => update(e.target.value, mm, yy)}
        aria-label="दिवस (DD)"
      />
      <Input
        type="number"
        inputMode="numeric"
        placeholder="महिना"
        min={1}
        max={12}
        value={mm ? String(parseInt(mm, 10)) : ""}
        onChange={(e) => update(dd, e.target.value, yy)}
        aria-label="महिना (MM)"
      />
      <Input
        type="number"
        inputMode="numeric"
        placeholder="वर्ष"
        min={1900}
        max={new Date().getFullYear()}
        value={yy}
        onChange={(e) => update(dd, mm, e.target.value)}
        aria-label="वर्ष (YYYY)"
      />
    </div>
  );
}
