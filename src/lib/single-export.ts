import { supabase } from "@/integrations/supabase/client";

async function photoUrl(path?: string | null) {
  if (!path) return "";
  try {
    const { data } = await supabase.storage.from("survey-photos").createSignedUrl(path, 3600);
    return data?.signedUrl || "";
  } catch { return ""; }
}

function esc(s: any) {
  if (s === null || s === undefined || s === "") return "-";
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function row(label: string, val: any) {
  return `<tr><td class="lbl">${esc(label)}</td><td>${esc(val)}</td></tr>`;
}

export async function buildSurveyHTML(r: any) {
  const photo = await photoUrl(r.head_photo_url);
  const members = Array.isArray(r.members) ? r.members : [];
  const crops = Array.isArray(r.crops) ? r.crops : [];

  return `<!doctype html><html><head><meta charset="utf-8"/>
<title>सर्वेक्षण - ${esc(r.head_name)}</title>
<style>
  @page { size: A4; margin: 14mm; }
  body { font-family: 'Noto Sans Devanagari', 'Mangal', system-ui, sans-serif; color:#111; font-size:12px; line-height:1.4; }
  h1 { font-size:18px; margin:0 0 4px; }
  h2 { font-size:14px; margin:18px 0 6px; padding-bottom:4px; border-bottom:2px solid #b45a28; color:#b45a28; }
  .hdr { display:flex; justify-content:space-between; align-items:start; border-bottom:2px solid #333; padding-bottom:8px; }
  .meta { font-size:11px; color:#555; }
  table { width:100%; border-collapse: collapse; margin-top:4px; }
  td, th { border:1px solid #ccc; padding:5px 8px; vertical-align:top; text-align:left; }
  td.lbl { background:#f5f5f5; width:35%; font-weight:600; }
  th { background:#fff3eb; }
  .photo { width:90px; height:90px; object-fit:cover; border:1px solid #ccc; border-radius:4px; }
  .tag { display:inline-block; background:#fff3eb; border:1px solid #f0c8a8; padding:2px 8px; border-radius:12px; margin:2px; font-size:11px; }
  @media print { .no-print { display:none; } }
  .btnbar { margin:10px 0; }
  .btnbar button { padding:8px 16px; margin-right:8px; cursor:pointer; }
</style></head><body>
<div class="btnbar no-print">
  <button onclick="window.print()">🖨️ प्रिंट / PDF जतन करा</button>
  <button onclick="window.close()">बंद करा</button>
</div>

<div class="hdr">
  <div>
    <h1>कुटुंब सर्वेक्षण अहवाल</h1>
    <div class="meta">ID: ${esc(r.id)}</div>
    <div class="meta">तयार: ${esc(new Date(r.created_at).toLocaleString("mr-IN"))}</div>
    <div class="meta">अपडेट: ${esc(new Date(r.updated_at).toLocaleString("mr-IN"))}</div>
  </div>
  ${photo ? `<img class="photo" src="${photo}" alt="photo"/>` : ""}
</div>

<h2>A. भौगोलिक माहिती</h2>
<table>
  ${row("गाव", r.village)}${row("तालुका", r.taluka)}${row("जिल्हा", r.district)}${row("पिनकोड", r.pincode)}
</table>

<h2>B. कुटुंब प्रमुख माहिती</h2>
<table>
  ${row("नाव", r.head_name)}${row("मोबाईल", r.mobile)}${row("समुदाय", r.community)}
  ${row("वैवाहिक स्थिती", r.marital_status)}${row("लिंग", r.gender)}${row("वय", r.age)}
  ${row("जन्मतारीख", r.dob)}${row("शिक्षण", r.education)}${row("व्यवसाय", r.occupation)}
</table>

<h2>C. कुटुंबातील सदस्य (${members.length})</h2>
${members.length === 0 ? '<p>—</p>' : `
<table>
  <thead><tr><th>#</th><th>नाव</th><th>नाते</th><th>लिंग</th><th>वय</th><th>शिक्षण</th><th>व्यवसाय</th><th>मोबाईल</th></tr></thead>
  <tbody>
  ${members.map((m: any, i: number) => `<tr>
    <td>${i + 1}</td><td>${esc(m.name)}</td><td>${esc(m.relationship)}</td>
    <td>${esc(m.gender)}</td><td>${esc(m.age)}</td><td>${esc(m.education)}</td>
    <td>${esc(m.occupation)}${m.job_type ? " (" + esc(m.job_type) + ")" : ""}</td>
    <td>${esc(m.mobile)}</td>
  </tr>`).join("")}
  </tbody>
</table>`}

<h2>D. धारण केलेले पद</h2>
<table>
  ${row("पद आहे?", r.has_position ? "होय" : "नाही")}
  ${r.has_position && r.position_data ? `
    ${row("पदाचा प्रकार", r.position_data.type)}
    ${row("स्थिती", r.position_data.status)}
    ${row("राजकीय पद", r.position_data.political_level)}
    ${row("पक्ष", r.position_data.party_name)}
    ${row("लोकप्रतिनिधी", r.position_data.representative_type)}
    ${row("संस्था", r.position_data.social_org)}
    ${row("पद", r.position_data.social_role)}
  ` : ""}
</table>

<h2>घरातील वापराच्या वस्तू</h2>
<div>${(r.household_items || []).map((x: string) => `<span class="tag">${esc(x)}</span>`).join("") || "-"}</div>

<h2>घर विषयक माहिती</h2>
<table>
  ${row("स्वतःचे घर", r.owns_house === true ? "होय" : r.owns_house === false ? "नाही" : "-")}
  ${row("घराचा प्रकार", r.house_type)}
  ${row("राहण्याची स्थिती", r.living_status)}
</table>

<h2>शेती विषयक माहिती</h2>
<table>
  ${row("शेतजमीन आहे?", r.has_farmland === true ? "होय" : r.has_farmland === false ? "नाही" : "-")}
  ${row("एकूण शेती", r.total_farmland)}
</table>
${crops.length > 0 ? `
<table style="margin-top:8px;">
  <thead><tr><th>#</th><th>हंगाम</th><th>कोरडवाहू</th><th>कोरडवाहू पिक</th><th>ओलितावली</th><th>ओलितावली पिक</th><th>खरीप</th><th>रब्बी</th><th>एकूण</th></tr></thead>
  <tbody>
  ${crops.map((c: any, i: number) => `<tr>
    <td>${i + 1}</td><td>${esc(c.season)}</td><td>${esc(c.dry_land)}</td><td>${esc(c.dry_crop)}</td>
    <td>${esc(c.wet_land)}</td><td>${esc(c.wet_crop)}</td><td>${esc(c.kharif)}</td><td>${esc(c.rabi)}</td><td>${esc(c.total)}</td>
  </tr>`).join("")}
  </tbody>
</table>` : ""}

<h2>सिंचनाचे साधन</h2>
<div>${(r.irrigation_sources || []).map((x: string) => `<span class="tag">${esc(x)}</span>`).join("") || "-"}</div>

<h2>शेती विषयक साधने</h2>
<div>${(r.farming_tools || []).map((x: string) => `<span class="tag">${esc(x)}</span>`).join("") || "-"}</div>

</body></html>`;
}

export async function openSurveyPrint(r: any, autoPrint = true) {
  const html = await buildSurveyHTML(r);
  const w = window.open("", "_blank", "width=900,height=1000");
  if (!w) {
    alert("कृपया pop-up अनुमती द्या");
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
  if (autoPrint) {
    setTimeout(() => { try { w.focus(); w.print(); } catch {} }, 600);
  }
}
