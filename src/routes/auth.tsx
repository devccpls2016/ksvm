import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { T } from "@/lib/marathi";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: `${T.login} | ${T.appName}` }] }),
  component: AuthPage,
});

function AuthPage() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session) navigate({ to: "/dashboard" });
  }, [session, navigate]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("स्वागत आहे!");
    navigate({ to: "/dashboard" });
  }

  async function signup(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName }, emailRedirectTo: window.location.origin },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("नोंदणी यशस्वी! कृपया लॉग इन करा.");
    setTab("login");
  }

  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) return toast.error("Google सह लॉग इन करताना त्रुटी आली");
    if (r.redirected) return;
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary via-background to-accent/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl mb-2">कु</div>
          <CardTitle className="text-2xl">{T.appName}</CardTitle>
          <CardDescription>{T.appTagline}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">{T.login}</TabsTrigger>
              <TabsTrigger value="signup">{T.signup}</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={login} className="space-y-3 mt-4">
                <div><Label>{T.email}</Label><Input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></div>
                <div><Label>{T.password}</Label><Input type="password" required value={password} onChange={e=>setPassword(e.target.value)}/></div>
                <Button type="submit" className="w-full" disabled={busy}>{busy ? "..." : T.login}</Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={signup} className="space-y-3 mt-4">
                <div><Label>{T.fullName}</Label><Input required value={fullName} onChange={e=>setFullName(e.target.value)}/></div>
                <div><Label>{T.email}</Label><Input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></div>
                <div><Label>{T.password}</Label><Input type="password" minLength={6} required value={password} onChange={e=>setPassword(e.target.value)}/></div>
                <Button type="submit" className="w-full" disabled={busy}>{busy ? "..." : T.signup}</Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">किंवा</span></div>
          </div>

          <Button variant="outline" className="w-full" onClick={google}>
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            {T.loginWithGoogle}
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-4">
            <Link to="/" className="underline">मुख्यपृष्ठावर परत</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
