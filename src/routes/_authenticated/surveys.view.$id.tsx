import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SurveyForm } from "@/components/SurveyForm";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Pencil, FileText } from "lucide-react";
import { downloadSurveyPDF } from "@/lib/single-export";

export const Route = createFileRoute("/_authenticated/surveys/view/$id")({
  component: ViewSurvey,
});

function ViewSurvey() {
  const { id } = Route.useParams();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("surveys").select("*").eq("id", id).maybeSingle().then(({ data, error }) => {
      if (error) toast.error(error.message);
      setData(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <p>लोड होत आहे...</p>;
  if (!data) return <p>रेकॉर्ड सापडले नाही</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <Link to="/surveys"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1"/>परत</Button></Link>
          <h1 className="text-2xl font-bold mt-2">सर्वेक्षण तपशील (फक्त वाचनासाठी)</h1>
          <p className="text-xs text-muted-foreground">शेवटचे अपडेट: {new Date(data.updated_at).toLocaleString("mr-IN")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.promise(downloadSurveyPDF(data), { loading: "PDF तयार होत आहे...", success: "PDF डाउनलोड झाले", error: "PDF अपयशी" })}>
            <FileText className="h-4 w-4 mr-1"/>PDF
          </Button>
          <Link to="/surveys/$id" params={{ id }}>
            <Button><Pencil className="h-4 w-4 mr-1"/>संपादन करा</Button>
          </Link>
        </div>
      </div>
      <SurveyForm
        readOnly
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
          farm_management: (data as any).farm_management || {},
          permanent_address: (data as any).permanent_address || {},
          maternal_family: (data as any).maternal_family || {},
        }}
        onSubmit={async () => {}}
      />
    </div>
  );
}
