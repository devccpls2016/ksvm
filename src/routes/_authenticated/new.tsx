import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SurveyForm } from "@/components/SurveyForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { SurveyFormValues } from "@/lib/survey-types";

export const Route = createFileRoute("/_authenticated/new")({
  component: NewSurvey,
});

function NewSurvey() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  async function submit(v: SurveyFormValues) {
    setBusy(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("surveys").insert({
        ...v,
        age: v.age === "" ? null : v.age,
        dob: v.dob || null,
        created_by: user.id,
        updated_by: user.id,
      } as any);
      if (error) throw error;
      toast.success("सर्वेक्षण यशस्वीरीत्या जतन झाले");
      navigate({ to: "/surveys" });
    } catch (e: any) {
      toast.error(e.message || "जतन करताना त्रुटी");
    } finally { setBusy(false); }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">नवीन कुटुंब सर्वेक्षण</h1>
        <p className="text-muted-foreground text-sm">सर्व आवश्यक माहिती भरा आणि जतन करा.</p>
      </div>
      <SurveyForm onSubmit={submit} submitting={busy} />
    </div>
  );
}
