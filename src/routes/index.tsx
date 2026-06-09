import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { ClipboardList, BarChart3, Users, FileText, Target, Shield, HeartHandshake, TrendingUp } from "lucide-react";
import { T } from "@/lib/marathi";
import logoAsset from "@/assets/kohli-logo.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "कोहळी समाज विकास मंडळ, नागपूर | कुटुंब सर्वेक्षण" },
      { name: "description", content: "कोहळी समाजातील प्रत्येक कुटुंबाची अचूक, अद्ययावत व डिजिटल माहिती संकलित करण्यासाठी आधुनिक कुटुंब सर्वेक्षण व माहिती व्यवस्थापन प्रणाली." },
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
    <div className="min-h-screen bg-background">
      {/* Navbar — official letterhead style */}
      <header className="border-b-2 border-primary/30 bg-background sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <img
              src={logoAsset.url}
              alt="कोहळी समाज विकास मंडळ, नागपूर"
              className="h-16 w-16 md:h-20 md:w-20 rounded-full object-cover border-2 border-primary/40 shadow-sm shrink-0"
            />

            {/* Org block */}
            <div className="flex-1 min-w-0 text-center">
              <h1 className="font-bold text-xl md:text-3xl tracking-tight text-primary leading-tight truncate">
                कोहळी समाज विकास मंडळ, नागपूर
              </h1>
              <div className="hidden md:flex items-center justify-between mt-1 text-[11px] md:text-xs text-muted-foreground font-medium">
                <span>Society Reg. No. MAH.680/1989 (N)</span>
                <span>Public Trust Reg. No. (F) 8666 (N)</span>
              </div>
              <p className="hidden md:block text-[11px] md:text-xs text-muted-foreground mt-1 leading-snug">
                केंद्रिय कार्यालय :– प्लॉट नं. ०७, गावंडे ले-आऊट, तुकाराम सभागृहाचे मागे, रिंग रोड, नरेंद्रनगर, नागपूर, पिन कोड – ४४००२७
              </p>
            </div>

            <Link to="/auth" className="shrink-0">
              <Button size="sm" className="md:size-default">{T.login}</Button>
            </Link>
          </div>

          {/* Mobile reg + address */}
          <div className="md:hidden mt-2 text-center text-[10px] text-muted-foreground space-y-0.5">
            <div className="flex justify-between"><span>Reg. MAH.680/1989 (N)</span><span>Trust (F) 8666 (N)</span></div>
            <p>केंद्रिय कार्यालय :– प्लॉट नं. ०७, गावंडे ले-आऊट, रिंग रोड, नरेंद्रनगर, नागपूर – ४४००२७</p>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="container mx-auto px-4 py-20 md:py-28 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-4 py-1.5 text-sm font-medium mb-6">
              <Shield className="h-4 w-4" />
              <span>कोहळी समाज विकास मंडळ, नागपूर</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight tracking-tight text-foreground">
              कोहळी समाजाच्या विकासासाठी<br />
              <span className="text-primary">डिजिटल कुटुंब सर्वेक्षण</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              समाजातील प्रत्येक कुटुंबाची सामाजिक, शैक्षणिक, आर्थिक, व्यावसायिक, राजकीय, कृषी व निवासविषयक माहिती एकाच डिजिटल प्लॅटफॉर्मवर.
            </p>
            <div className="mt-8 flex gap-3 justify-center">
              <Link to="/auth"><Button size="lg" className="text-base px-8">{T.login}</Button></Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mission / About */}
      <section className="py-16 md:py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">प्रणालीचा उद्देश</h2>
              <div className="mt-3 h-1 w-16 bg-primary rounded-full mx-auto" />
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div className="rounded-2xl border bg-background p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">माहिती संकलन</h3>
                <p className="text-muted-foreground leading-relaxed text-base">
                  कोहळी समाजातील प्रत्येक कुटुंबाची अचूक, अद्ययावत व डिजिटल माहिती संकलित करण्यासाठी ही कुटुंब सर्वेक्षण व माहिती व्यवस्थापन प्रणाली विकसित करण्यात येत आहे. या प्रणालीद्वारे समाजातील कुटुंबांची सामाजिक, शैक्षणिक, आर्थिक, व्यावसायिक, राजकीय, कृषी व निवासविषयक माहिती एकाच डिजिटल प्लॅटफॉर्मवर उपलब्ध होईल.
                </p>
              </div>

              <div className="rounded-2xl border bg-background p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">समाज विकास</h3>
                <p className="text-muted-foreground leading-relaxed text-base">
                  या सर्वेक्षणाचा मुख्य उद्देश समाजातील प्रत्येक कुटुंबाची माहिती एकत्रित करून समाजाच्या विकासासाठी आवश्यक असलेले विश्लेषण, नियोजन व निर्णय प्रक्रिया अधिक प्रभावी करणे हा आहे.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">वैशिष्ट्ये</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">सर्वेक्षण प्रक्रिया अधिक सोपी, अचूक व प्रभावी बनवण्यासाठी आधुनिक सुविधा</p>
          </div>
          <div className="grid md:grid-cols-4 gap-5">
            {[
              { icon: ClipboardList, title: "संपूर्ण फॉर्म", desc: "भौगोलिक, वैयक्तिक, घर व शेती माहिती एका फॉर्ममध्ये" },
              { icon: Users, title: "कुटुंब सदस्य", desc: "प्रत्येक सदस्याची सविस्तर नोंद व व्यवस्थापन" },
              { icon: BarChart3, title: "विश्लेषण व अहवाल", desc: "Charts, graphs व real-time आकडेवारी डॅशबोर्डवर" },
              { icon: FileText, title: "Excel / PDF अहवाल", desc: "एका क्लिकवर सर्वेक्षणाचे अहवाल download करा" },
            ].map((f, i) => (
              <div key={i} className="rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
                <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-base mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <HeartHandshake className="h-10 w-10 text-primary mx-auto mb-5" />
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">समाजसेवेसाठी सहभागी व्हा</h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              कोहळी समाज विकास मंडळ, नागपूर — या मोहिमेत सहभागी होऊन आपल्या कुटुंबाची माहिती डिजिटल स्वरूपात नोंदवा व समाजाच्या विकासासाठी योगदान द्या.
            </p>
            <Link to="/auth"><Button size="lg" className="text-base px-8">सर्वेक्षण सुरू करा</Button></Link>
          </div>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground bg-background">
        <p className="font-semibold text-foreground mb-1">© {new Date().getFullYear()} {T.appName}</p>
        <p>कुटुंब सर्वेक्षण व माहिती व्यवस्थापन प्रणाली</p>
      </footer>
    </div>
  );
}
