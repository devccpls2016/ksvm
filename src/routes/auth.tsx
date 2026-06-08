import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { T } from "@/lib/marathi";
import { initAdmin } from "@/lib/users.functions";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: `${T.login} | ${T.appName}` }] }),
  component: AuthPage,
});

function AuthPage() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const bootstrap = useServerFn(initAdmin);

  useEffect(() => {
    bootstrap({} as any).catch(() => {});
  }, [bootstrap]);

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary via-background to-accent/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl mb-2">कु</div>
          <CardTitle className="text-2xl">{T.appName}</CardTitle>
          <CardDescription>{T.appTagline}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={login} className="space-y-3 mt-2">
            <div><Label>{T.email}</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div><Label>{T.password}</Label><Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
            <Button type="submit" className="w-full" disabled={busy}>{busy ? "..." : T.login}</Button>
          </form>

          <div className="mt-4 rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
            <div><strong>डीफॉल्ट Admin:</strong> admin@gmail.com / 123456</div>
            <div className="mt-1">Survey User चे credentials Admin तयार करेल. Self-registration उपलब्ध नाही.</div>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-4">
            <Link to="/" className="underline">मुख्यपृष्ठावर परत</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
