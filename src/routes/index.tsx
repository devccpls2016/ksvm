import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { ClipboardList, BarChart3, Users, FileText } from "lucide-react";
import { T } from "@/lib/marathi";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "कुटुंब सर्वेक्षण | Family Survey System" },
      { name: "description", content: "गाव, तालुका, जिल्हा स्तरीय कुटुंब सर्वेक्षणासाठी आधुनिक डिजिटल प्लॅटफॉर्म." },
    ],
  }),
  component: Index,
});

function Index() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && session) navigate({ to: "/dashboard" });
  }, [loading, session, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-accent/10">
      <header className="border-b bg-background/70 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">कु</div>
            <span className="font-semibold text-lg">{T.appName}</span>
          </div>
          <Link to="/auth"><Button>{T.login}</Button></Link>
        </div>
      </header>

      <section className="container mx-auto px-4 py-16 md:py-24 text-center">
        <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight">
          ग्रामीण कुटुंबांचा<br/>
          <span className="text-primary">डिजिटल सर्वेक्षण मंच</span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          {T.appTagline}. कुटुंब प्रमुख, सदस्य, घर, शेती व आवश्यक गरजांची संपूर्ण माहिती एका ठिकाणी.
        </p>
        <div className="mt-8 flex gap-3 justify-center">
          <Link to="/auth"><Button size="lg" className="text-base">{T.login} / {T.signup}</Button></Link>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-20 grid md:grid-cols-4 gap-4">
        {[
          { icon: ClipboardList, title: "संपूर्ण फॉर्म", desc: "भौगोलिक, वैयक्तिक, घर व शेती माहिती" },
          { icon: Users, title: "कुटुंब सदस्य", desc: "प्रत्येक सदस्याची सविस्तर नोंद" },
          { icon: BarChart3, title: "Analytics Dashboard", desc: "Charts, graphs व real-time आकडेवारी" },
          { icon: FileText, title: "Excel / PDF अहवाल", desc: "एका क्लिकवर download करा" },
        ].map((f, i) => (
          <div key={i} className="rounded-xl border bg-card p-6 shadow-sm">
            <f.icon className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold mb-1">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </section>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} {T.appName}
      </footer>
    </div>
  );
}
