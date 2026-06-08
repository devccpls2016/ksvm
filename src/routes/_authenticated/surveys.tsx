import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Eye, Pencil, Trash2, Download, FileDown } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { exportExcel, exportPDF } from "@/lib/export";

export const Route = createFileRoute("/_authenticated/surveys")({
  component: SurveysList,
});

function SurveysList() {
  const { role } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [villageF, setVillageF] = useState("all");
  const [houseF, setHouseF] = useState("all");
  const [farmF, setFarmF] = useState("all");

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("surveys").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const villages = useMemo(() => Array.from(new Set(rows.map(r => r.village).filter(Boolean))), [rows]);
  const filtered = useMemo(() => {
    return rows.filter(r => {
      if (search) {
        const s = search.toLowerCase();
        if (!(r.head_name?.toLowerCase().includes(s) || r.mobile?.includes(s) || r.village?.toLowerCase().includes(s) || r.taluka?.toLowerCase().includes(s) || r.district?.toLowerCase().includes(s) || r.pincode?.includes(s))) return false;
      }
      if (villageF !== "all" && r.village !== villageF) return false;
      if (houseF === "yes" && !r.owns_house) return false;
      if (houseF === "no" && r.owns_house) return false;
      if (farmF === "yes" && !r.has_farmland) return false;
      if (farmF === "no" && r.has_farmland) return false;
      return true;
    });
  }, [rows, search, villageF, houseF, farmF]);

  async function del(id: string) {
    const { error } = await supabase.from("surveys").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("हटवले");
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold">सर्व सर्वेक्षणे</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} पैकी {rows.length} रेकॉर्ड्स</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportExcel(filtered)}><Download className="h-4 w-4 mr-1"/>Excel</Button>
          <Button variant="outline" onClick={() => exportPDF(filtered)}><FileDown className="h-4 w-4 mr-1"/>PDF</Button>
          <Link to="/new"><Button>+ नवीन</Button></Link>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">शोध व फिल्टर</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-4 gap-3">
          <Input placeholder="नाव / मोबाईल / गाव शोधा..." value={search} onChange={e=>setSearch(e.target.value)} />
          <Select value={villageF} onValueChange={setVillageF}>
            <SelectTrigger><SelectValue placeholder="गाव"/></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">सर्व गावे</SelectItem>
              {villages.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={houseF} onValueChange={setHouseF}>
            <SelectTrigger><SelectValue placeholder="घर"/></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">सर्व</SelectItem>
              <SelectItem value="yes">स्वतःचे घर</SelectItem>
              <SelectItem value="no">घर नाही</SelectItem>
            </SelectContent>
          </Select>
          <Select value={farmF} onValueChange={setFarmF}>
            <SelectTrigger><SelectValue placeholder="शेती"/></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">सर्व</SelectItem>
              <SelectItem value="yes">शेती आहे</SelectItem>
              <SelectItem value="no">शेती नाही</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>कुटुंब प्रमुख</TableHead>
                <TableHead>मोबाईल</TableHead>
                <TableHead>गाव</TableHead>
                <TableHead>तालुका</TableHead>
                <TableHead>सदस्य</TableHead>
                <TableHead>घर</TableHead>
                <TableHead>शेती</TableHead>
                <TableHead>दिनांक</TableHead>
                <TableHead className="text-right">क्रिया</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && <TableRow><TableCell colSpan={9} className="text-center py-8">लोड होत आहे...</TableCell></TableRow>}
              {!loading && filtered.length === 0 && <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">कोणताही रेकॉर्ड नाही</TableCell></TableRow>}
              {filtered.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.head_name}</TableCell>
                  <TableCell>{r.mobile || "-"}</TableCell>
                  <TableCell>{r.village}</TableCell>
                  <TableCell>{r.taluka || "-"}</TableCell>
                  <TableCell>{Array.isArray(r.members) ? r.members.length : 0}</TableCell>
                  <TableCell>{r.owns_house ? "होय" : r.owns_house === false ? "नाही" : "-"}</TableCell>
                  <TableCell>{r.has_farmland ? "होय" : r.has_farmland === false ? "नाही" : "-"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("mr-IN")}</TableCell>
                  <TableCell className="text-right">
                    <Link to="/surveys/$id" params={{ id: r.id }}>
                      <Button variant="ghost" size="sm"><Pencil className="h-4 w-4"/></Button>
                    </Link>
                    {role === "admin" && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm"><Trash2 className="h-4 w-4 text-destructive"/></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>रेकॉर्ड हटवायचे का?</AlertDialogTitle>
                            <AlertDialogDescription>हे रेकॉर्ड कायमचे हटवले जाईल.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>रद्द</AlertDialogCancel>
                            <AlertDialogAction onClick={() => del(r.id)}>हटवा</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
