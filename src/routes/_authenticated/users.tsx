import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { listAppUsers, createSurveyUser, updateSurveyUser, deleteSurveyUser } from "@/lib/users.functions";

export const Route = createFileRoute("/_authenticated/users")({
  component: UsersPage,
});

function UsersPage() {
  const { role, loading } = useAuth();
  const navigate = useNavigate();
  const list = useServerFn(listAppUsers);
  const create = useServerFn(createSurveyUser);
  const update = useServerFn(updateSurveyUser);
  const del = useServerFn(deleteSurveyUser);

  const [rows, setRows] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [editRow, setEditRow] = useState<any | null>(null);

  const [form, setForm] = useState({
    full_name: "", email: "", mobile: "", password: "", confirm: "", is_active: true,
  });

  useEffect(() => {
    if (!loading && role && role !== "admin") navigate({ to: "/dashboard" });
  }, [loading, role, navigate]);

  async function load() {
    try {
      const r = await list({} as any);
      setRows(r);
    } catch (e: any) { toast.error(e.message); }
  }
  useEffect(() => { if (role === "admin") load(); }, [role]);

  function resetForm() {
    setForm({ full_name: "", email: "", mobile: "", password: "", confirm: "", is_active: true });
    setEditRow(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password && form.password !== form.confirm) return toast.error("Password जुळत नाही");
    setBusy(true);
    try {
      if (editRow) {
        await update({ data: {
          id: editRow.id,
          full_name: form.full_name,
          mobile: form.mobile,
          is_active: form.is_active,
          email: form.email,
          ...(form.password ? { password: form.password } : {}),
        }} as any);
        toast.success("अपडेट झाले");
      } else {
        if (!form.password) return toast.error("Password आवश्यक");
        await create({ data: {
          full_name: form.full_name, email: form.email, mobile: form.mobile,
          password: form.password, is_active: form.is_active,
        }} as any);
        toast.success("Survey User तयार झाला");
      }
      setOpen(false); resetForm(); load();
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }

  function startEdit(r: any) {
    setEditRow(r);
    setForm({ full_name: r.full_name || "", email: r.email || "", mobile: r.mobile || "", password: "", confirm: "", is_active: r.is_active });
    setOpen(true);
  }

  async function remove(id: string) {
    try { await del({ data: { id } } as any); toast.success("हटवले"); load(); }
    catch (e: any) { toast.error(e.message); }
  }

  if (role && role !== "admin") return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold">Create Survey User</h1>
          <p className="text-sm text-muted-foreground">{rows.length} वापरकर्ते</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1"/>नवीन Survey User</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editRow ? "Edit User" : "Create Survey User"}</DialogTitle></DialogHeader>
            <form onSubmit={submit} className="space-y-3">
              <div><Label>Survey User Name</Label><Input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
              <div><Label>Mobile Number</Label><Input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} /></div>
              <div><Label>Email / Username</Label><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>{editRow ? "New Password (वैकल्पिक)" : "Password"}</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
                <div><Label>Confirm Password</Label><Input type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} /></div>
              </div>
              <div className="flex items-center justify-between rounded border p-2">
                <Label>Status: {form.is_active ? "Active" : "Inactive"}</Label>
                <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={busy}>{busy ? "..." : (editRow ? "Update" : "Create")}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">All Users</CardTitle></CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>नाव</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">क्रिया</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">रेकॉर्ड नाही</TableCell></TableRow>}
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.full_name}</TableCell>
                  <TableCell>{r.email}</TableCell>
                  <TableCell>{r.mobile || "-"}</TableCell>
                  <TableCell><Badge variant={r.role === "admin" ? "default" : "secondary"}>{r.role}</Badge></TableCell>
                  <TableCell>{r.is_active ? <Badge>Active</Badge> : <Badge variant="outline">Inactive</Badge>}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(r)}><Pencil className="h-4 w-4"/></Button>
                    {r.role !== "admin" && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm"><Trash2 className="h-4 w-4 text-destructive"/></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>हटवायचे का?</AlertDialogTitle>
                            <AlertDialogDescription>{r.email} हे खाते कायमचे हटवले जाईल.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>रद्द</AlertDialogCancel>
                            <AlertDialogAction onClick={() => remove(r.id)}>हटवा</AlertDialogAction>
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
