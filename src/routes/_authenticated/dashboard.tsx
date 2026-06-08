import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, Home, Sprout, ClipboardList } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

function Dashboard() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("surveys").select("*").then(({ data }) => {
      setRows(data || []);
      setLoading(false);
    });
  }, []);

  const total = rows.length;
  const totalMembers = rows.reduce((s, r) => s + ((r.members as any[])?.length || 0), 0);
  const withFarmland = rows.filter(r => r.has_farmland).length;
  const ownHouse = rows.filter(r => r.owns_house).length;

  const villageData = Object.entries(
    rows.reduce<Record<string, number>>((a, r) => {
      const v = r.village || "अज्ञात"; a[v] = (a[v] || 0) + 1; return a;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const houseData = Object.entries(
    rows.reduce<Record<string, number>>((a, r) => {
      const v = r.house_type || "—"; a[v] = (a[v] || 0) + 1; return a;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  if (loading) return <div className="text-muted-foreground">लोड होत आहे...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">डॅशबोर्ड</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={ClipboardList} label="एकूण सर्वेक्षणे" value={total} />
        <StatCard icon={Users} label="एकूण सदस्य" value={totalMembers} />
        <StatCard icon={Home} label="स्वतःचे घर" value={ownHouse} />
        <StatCard icon={Sprout} label="शेतजमीन" value={withFarmland} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>गावनिहाय वितरण</CardTitle></CardHeader>
          <CardContent style={{ height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={villageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" /><YAxis /><Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>घराचा प्रकार</CardTitle></CardHeader>
          <CardContent style={{ height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={houseData} dataKey="value" nameKey="name" outerRadius={90} label>
                  {houseData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
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
          <div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
