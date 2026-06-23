import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import {
  Users, Home, Sprout, ClipboardList, UserCheck, Briefcase, Building2,
  Banknote, MapPin, Calendar, TrendingUp,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { listAppUsers } from "@/lib/users.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

const COLORS = ["hsl(var(--primary))", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16"];

function Dashboard() {
  const { role, user } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userCount, setUserCount] = useState(0);
  const fetchUsers = useServerFn(listAppUsers);

  useEffect(() => {
    supabase.from("surveys").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setRows(data || []);
      setLoading(false);
    });
    if (role === "admin") {
      fetchUsers({} as any).then((u) => setUserCount(u.length)).catch(() => {});
    }
  }, [role, fetchUsers]);

  const isAdmin = role === "admin";
  const myRows = isAdmin ? rows : rows.filter((r) => r.created_by === user?.id);

  // ===== Stats =====
  const stats = useMemo(() => {
    const allMembers = myRows.flatMap((r) => (Array.isArray(r.members) ? r.members : []));
    const headMembers = myRows.map((r) => ({ gender: r.gender, occupation: r.occupation }));
    const everyone = [...allMembers, ...headMembers];
    const male = everyone.filter((m: any) => m.gender === "पुरुष").length;
    const female = everyone.filter((m: any) => m.gender === "स्त्री").length;
    const jobMembers = allMembers.filter((m: any) => m.job_type);
    const govt = jobMembers.filter((m: any) => m.job_type === "Government").length
      + myRows.filter((r) => r.occupation === "सरकारी नौकरी").length;
    const priv = jobMembers.filter((m: any) => m.job_type === "Private").length
      + myRows.filter((r) => r.occupation === "खाजगी नौकरी").length;
    const totalJob = govt + priv + jobMembers.filter((m: any) => m.job_type === "Department").length;

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const todayCount = myRows.filter((r) => new Date(r.created_at) >= today).length;
    const monthCount = myRows.filter((r) => new Date(r.created_at) >= monthStart).length;

    return {
      totalSurveys: myRows.length,
      totalFamilies: myRows.length,
      totalMembers: allMembers.length + myRows.length,
      male, female,
      ownHouse: myRows.filter((r) => r.owns_house).length,
      rented: myRows.filter((r) => r.owns_house === false).length,
      withFarmland: myRows.filter((r) => r.has_farmland).length,
      noFarmland: myRows.filter((r) => r.has_farmland === false).length,
      totalJob,
      govt, priv,
      todayCount, monthCount,
    };
  }, [myRows]);

  // ===== Charts data =====
  const groupBy = (arr: any[], key: string) =>
    Object.entries(
      arr.reduce<Record<string, number>>((a, r) => {
        const v = (r[key] || "—").toString();
        a[v] = (a[v] || 0) + 1;
        return a;
      }, {}),
    ).map(([name, value]) => ({ name, value }));

  const villageData = groupBy(myRows, "village");
  const talukaData = groupBy(myRows, "taluka");
  const districtData = groupBy(myRows, "district");
  const houseData = groupBy(myRows.filter((r) => r.house_type), "house_type");
  const educationData = groupBy(myRows.filter((r) => r.education), "education");
  const occupationData = groupBy(myRows.filter((r) => r.occupation), "occupation");
  const genderData = [
    { name: "पुरुष", value: stats.male },
    { name: "स्त्री", value: stats.female },
  ];
  const farmlandData = [
    { name: "शेती आहे", value: stats.withFarmland },
    { name: "शेती नाही", value: stats.noFarmland },
  ];

  const ageData = useMemo(() => {
    const buckets = { "0-18": 0, "19-35": 0, "36-60": 0, "60+": 0 };
    const ages: number[] = [
      ...myRows.map((r) => r.age).filter((a) => typeof a === "number"),
      ...myRows.flatMap((r) => (Array.isArray(r.members) ? r.members : []).map((m: any) => m.age)).filter((a: any) => typeof a === "number"),
    ];
    ages.forEach((a) => {
      if (a <= 18) buckets["0-18"]++;
      else if (a <= 35) buckets["19-35"]++;
      else if (a <= 60) buckets["36-60"]++;
      else buckets["60+"]++;
    });
    return Object.entries(buckets).map(([name, value]) => ({ name, value }));
  }, [myRows]);

  const cropsData = useMemo(() => {
    const map: Record<string, number> = {};
    myRows.forEach((r) => (Array.isArray(r.major_crop_types) ? r.major_crop_types : []).forEach((k: string) => {
      if (!k) return;
      map[k] = (map[k] || 0) + 1;
    }));
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [myRows]);


  const irrigationData = useMemo(() => {
    const map: Record<string, number> = {};
    myRows.forEach((r) => (Array.isArray(r.irrigation_sources) ? r.irrigation_sources : []).forEach((s: string) => {
      map[s] = (map[s] || 0) + 1;
    }));
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [myRows]);

  const itemsData = useMemo(() => {
    const map: Record<string, number> = {};
    myRows.forEach((r) => (Array.isArray(r.household_items) ? r.household_items : []).forEach((s: string) => {
      map[s] = (map[s] || 0) + 1;
    }));
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [myRows]);

  const positionTypeData = useMemo(() => {
    const map: Record<string, number> = {};
    myRows.filter((r) => r.has_position).forEach((r) => {
      const t = (r.position_data as any)?.type || "—";
      map[t] = (map[t] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [myRows]);

  const positionStatusData = useMemo(() => {
    const map: Record<string, number> = {};
    myRows.filter((r) => r.has_position).forEach((r) => {
      const t = (r.position_data as any)?.status || "—";
      map[t] = (map[t] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [myRows]);

  const surveyByUserData = useMemo(() => {
    if (!isAdmin) return [];
    const map: Record<string, number> = {};
    rows.forEach((r) => {
      const k = r.created_by || "—";
      map[k] = (map[k] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name: name.slice(0, 6), value }));
  }, [rows, isAdmin]);

  if (loading) return <div className="text-muted-foreground">लोड होत आहे...</div>;

  // ===== Surveyor minimal view =====
  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard icon={ClipboardList} label="Total Family Survey Submitted" value={stats.totalSurveys} />
          <StatCard icon={Calendar} label="Today Submitted Survey" value={stats.todayCount} />
          <StatCard icon={TrendingUp} label="This Month Submitted Survey" value={stats.monthCount} />
        </div>
      </div>
    );
  }

  // ===== Admin full view =====
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Visual Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={ClipboardList} label="Total Survey Submitted" value={stats.totalSurveys} />
        <StatCard icon={Home} label="Total Families" value={stats.totalFamilies} />
        <StatCard icon={Users} label="Total Family Members" value={stats.totalMembers} />
        <StatCard icon={UserCheck} label="Total Male" value={stats.male} />
        <StatCard icon={UserCheck} label="Total Female" value={stats.female} />
        <StatCard icon={Building2} label="Own House Families" value={stats.ownHouse} />
        <StatCard icon={MapPin} label="Rented / Dependent" value={stats.rented} />
        <StatCard icon={Sprout} label="Agriculture Families" value={stats.withFarmland} />
        <StatCard icon={Sprout} label="Non-Agriculture" value={stats.noFarmland} />
        <StatCard icon={Briefcase} label="Total Job Holders" value={stats.totalJob} />
        <StatCard icon={Banknote} label="Government Job" value={stats.govt} />
        <StatCard icon={Briefcase} label="Private Job" value={stats.priv} />
        <StatCard icon={Users} label="Total Survey Users" value={userCount} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <ChartCard title="गावानुसार Survey Count"><BarCh data={villageData} /></ChartCard>
        <ChartCard title="तालुकानुसार Survey Count"><BarCh data={talukaData} /></ChartCard>
        <ChartCard title="जिल्हानुसार Survey Count"><BarCh data={districtData} /></ChartCard>
        <ChartCard title="लिंगानुसार"><PieCh data={genderData} /></ChartCard>
        <ChartCard title="वयोगटानुसार"><BarCh data={ageData} /></ChartCard>
        <ChartCard title="शिक्षणानुसार"><BarCh data={educationData} /></ChartCard>
        <ChartCard title="व्यवसायानुसार"><BarCh data={occupationData} /></ChartCard>
        <ChartCard title="घर प्रकारानुसार"><PieCh data={houseData} /></ChartCard>
        <ChartCard title="शेतजमीन"><PieCh data={farmlandData} /></ChartCard>
        <ChartCard title="पिक प्रकारानुसार"><BarCh data={cropsData} /></ChartCard>
        <ChartCard title="सिंचन साधनानुसार"><BarCh data={irrigationData} /></ChartCard>
        <ChartCard title="घरातील वस्तू"><BarCh data={itemsData} /></ChartCard>
        <ChartCard title="पदानुसार (राजकीय / सामाजिक / लोकप्रतिनिधी)"><PieCh data={positionTypeData} /></ChartCard>
        <ChartCard title="आजी / माजी"><PieCh data={positionStatusData} /></ChartCard>
        <ChartCard title="Survey User wise Count"><BarCh data={surveyByUserData} /></ChartCard>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-xs text-muted-foreground truncate">{label}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent style={{ height: 280 }}>{children}</CardContent>
    </Card>
  );
}

function BarCh({ data }: { data: { name: string; value: number }[] }) {
  if (!data.length) return <div className="text-sm text-muted-foreground">डेटा नाही</div>;
  return (
    <ResponsiveContainer>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" fontSize={11} />
        <YAxis fontSize={11} allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function PieCh({ data }: { data: { name: string; value: number }[] }) {
  if (!data.length) return <div className="text-sm text-muted-foreground">डेटा नाही</div>;
  return (
    <ResponsiveContainer>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" outerRadius={80} label>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip /><Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
