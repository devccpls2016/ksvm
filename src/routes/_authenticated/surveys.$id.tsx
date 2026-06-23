import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SurveyForm } from "@/components/SurveyForm";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { SurveyFormValues } from "@/lib/survey-types";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/surveys/$id")({
  component: EditSurvey,
});

function EditSurvey() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("surveys").select("*").eq("id", id).maybeSingle().then(({ data, error }) => {
      if (error) toast.error(error.message);
      setData(data);
      setLoading(false);
    });
  }, [id]);

  async function submit(v: SurveyFormValues) {
    setBusy(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("surveys").update({
        ...v,
        age: v.age === "" ? null : v.age,
        dob: v.dob || null,
        updated_by: user?.id,
      } as any).eq("id", id);
      if (error) throw error;
      toast.success("अपडेट झाले");
      navigate({ to: "/surveys" });
    } catch (e: any) {
      toast.error(e.message);
    } finally { setBusy(false); }
  }

  if (loading) return <p>लोड होत आहे...</p>;
  if (!data) return <p>रेकॉर्ड सापडले नाही</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/surveys"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1"/>परत</Button></Link>
          <h1 className="text-2xl font-bold mt-2">सर्वेक्षण संपादन</h1>
          <p className="text-xs text-muted-foreground">शेवटचे अपडेट: {new Date(data.updated_at).toLocaleString("mr-IN")}</p>
        </div>
      </div>
      <SurveyForm
        initial={{
          ...data,
          age: data.age ?? "",
          dob: data.dob ?? "",
          household_items: data.household_items || [],
          irrigation_sources: data.irrigation_sources || [],
          irrigation_details: (data as any).irrigation_details || {},

          farming_tools: data.farming_tools || [],
          farming_tools_details: (data as any).farming_tools_details || {},
          crops: data.crops || [],
          members: data.members || [],
          position_data: data.position_data || {},
          solar_panel_installed: data.solar_panel_installed ?? null,
          solar_panel_wanted: data.solar_panel_wanted ?? null,
          major_crop_types: data.major_crop_types || [],
          major_crop_types_other: data.major_crop_types_other ?? "",
          irrigated_area: data.irrigated_area ?? "",
          dryland_area: data.dryland_area ?? "",
          kharif_area: data.kharif_area ?? "",
          rabi_area: data.rabi_area ?? "",
          summer_area: data.summer_area ?? "",
          benefits_info: (data as any).benefits_info || {},
          employment_info: (data as any).employment_info || {},



        }}
        onSubmit={submit}
        submitting={busy}
        submitLabel="अपडेट करा"
      />
    </div>
  );
}
