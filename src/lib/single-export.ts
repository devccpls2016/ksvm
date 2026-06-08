import { supabase } from "@/integrations/supabase/client";

async function photoUrl(path?: string | null) {
  if (!path) return "";
  try {
    const { data } = await supabase.storage.from("survey-photos").createSignedUrl(path, 3600);
    return data?.signedUrl || "";
  } catch { return ""; }
}

function esc(s: any) {
  if (s === null || s === undefined || s === "") return "—";
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function field(label: string, val: any) {
  return `<div class="field"><div class="field-label">${esc(label)}</div><div class="field-value">${esc(val)}</div></div>`;
}

export async function buildSurveyHTML(r: any) {
  const photo = await photoUrl(r.head_photo_url);
  const members = Array.isArray(r.members) ? r.members : [];
  const crops = Array.isArray(r.crops) ? r.crops : [];
  const now = new Date().toLocaleString("mr-IN");

  return `<!doctype html><html lang="mr"><head><meta charset="utf-8"/>
<title>कुटुंब सर्वेक्षण अहवाल — ${esc(r.head_name)}</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Noto+Serif+Devanagari:wght@600;700&display=swap" rel="stylesheet">
<style>
  @page { size: A4; margin: 14mm 12mm 16mm; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: 'Noto Sans Devanagari', 'Mangal', system-ui, sans-serif;
    color: #1a1a1a; font-size: 11px; line-height: 1.5;
    background: #fff;
  }
  .page { max-width: 800px; margin: 0 auto; padding: 16px; }

  /* Header / cover band */
  .cover {
    display: flex; justify-content: space-between; align-items: center;
    padding: 18px 22px; border-radius: 8px;
    background: linear-gradient(135deg, #b45a28 0%, #8a3f17 100%);
    color: #fff; margin-bottom: 18px;
  }
  .cover-left { display: flex; flex-direction: column; gap: 4px; }
  .cover h1 {
    font-family: 'Noto Serif Devanagari', serif;
    font-size: 22px; margin: 0; font-weight: 700; letter-spacing: 0.2px;
  }
  .cover .sub { font-size: 12px; opacity: 0.95; }
  .cover .meta { font-size: 10px; opacity: 0.85; margin-top: 6px; }
  .cover .photo-wrap {
    width: 96px; height: 96px; border-radius: 50%;
    border: 3px solid #fff; overflow: hidden; background: #fff;
    flex-shrink: 0;
  }
  .cover .photo-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .cover .photo-placeholder {
    width: 100%; height: 100%; display: flex; align-items: center;
    justify-content: center; color: #b45a28; font-size: 32px; font-weight: 700;
  }

  /* Summary strip */
  .summary {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 8px; margin-bottom: 18px;
  }
  .summary .item {
    border: 1px solid #e8d9cc; border-radius: 6px; padding: 8px 10px;
    background: #fdf7f2;
  }
  .summary .item .k { font-size: 9px; color: #8a5a3f; text-transform: uppercase; letter-spacing: 0.4px; }
  .summary .item .v { font-size: 12px; font-weight: 600; color: #1a1a1a; margin-top: 2px; }

  /* Section */
  section { margin-bottom: 16px; page-break-inside: avoid; }
  .section-title {
    display: flex; align-items: center; gap: 8px;
    font-family: 'Noto Serif Devanagari', serif;
    font-size: 13px; font-weight: 700; color: #fff;
    background: #b45a28; padding: 7px 12px; border-radius: 4px 4px 0 0;
    margin: 0;
  }
  .section-body {
    border: 1px solid #e8d9cc; border-top: none;
    padding: 12px; border-radius: 0 0 4px 4px;
    background: #fff;
  }

  /* Field grid */
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; }
  .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px 16px; }
  .field { display: flex; flex-direction: column; padding: 4px 0; border-bottom: 1px dotted #e5d6c8; }
  .field-label { font-size: 9.5px; color: #7a5a45; font-weight: 500; text-transform: uppercase; letter-spacing: 0.3px; }
  .field-value { font-size: 12px; color: #1a1a1a; font-weight: 500; margin-top: 1px; }

  /* Tables */
  table { width: 100%; border-collapse: collapse; font-size: 10.5px; }
  thead th {
    background: #fdf0e6; color: #6a3416; font-weight: 600;
    text-align: left; padding: 7px 8px; border-bottom: 2px solid #b45a28;
    font-size: 10px; text-transform: uppercase; letter-spacing: 0.3px;
  }
  tbody td { padding: 6px 8px; border-bottom: 1px solid #f0e4d8; vertical-align: top; }
  tbody tr:nth-child(even) td { background: #fdfaf7; }
  tbody tr:last-child td { border-bottom: none; }

  /* Tags */
  .tags { display: flex; flex-wrap: wrap; gap: 6px; }
  .tag {
    display: inline-block; background: #fdf0e6; color: #6a3416;
    border: 1px solid #f0c8a8; padding: 3px 10px; border-radius: 12px;
    font-size: 10.5px; font-weight: 500;
  }
  .empty { color: #999; font-style: italic; font-size: 11px; }

  /* Footer */
  .footer {
    margin-top: 24px; padding-top: 10px; border-top: 1px solid #ddd;
    display: flex; justify-content: space-between;
    font-size: 9.5px; color: #888;
  }

  /* Print controls */
  .btnbar {
    position: sticky; top: 0; z-index: 10;
    background: #fff; padding: 10px 0; margin-bottom: 10px;
    border-bottom: 1px solid #eee;
  }
  .btnbar button {
    padding: 8px 16px; margin-right: 8px; cursor: pointer;
    background: #b45a28; color: #fff; border: none; border-radius: 4px;
    font-family: inherit; font-size: 12px; font-weight: 500;
  }
  .btnbar button.secondary { background: #fff; color: #b45a28; border: 1px solid #b45a28; }

  @media print {
    .btnbar { display: none; }
    body { font-size: 10.5px; }
    .page { padding: 0; max-width: none; }
    section { page-break-inside: avoid; }
  }
</style></head><body>
<div class="btnbar no-print">
  <button onclick="window.print()">🖨️ प्रिंट / PDF जतन करा</button>
  <button class="secondary" onclick="window.close()">बंद करा</button>
</div>

<div class="page">
  <div class="cover">
    <div class="cover-left">
      <div class="sub">कोहळी परिवार</div>
      <h1>कुटुंब सर्वेक्षण अहवाल</h1>
      <div class="sub">${esc(r.head_name)} — ${esc(r.village)}${r.taluka ? ", " + esc(r.taluka) : ""}</div>
      <div class="meta">अहवाल क्र: ${esc(String(r.id).slice(0, 8).toUpperCase())} • तयार: ${esc(now)}</div>
    </div>
    <div class="photo-wrap">
      ${photo
        ? `<img src="${photo}" alt="photo" crossorigin="anonymous"/>`
        : `<div class="photo-placeholder">${esc((r.head_name || "?").trim().charAt(0))}</div>`}
    </div>
  </div>

  <div class="summary">
    <div class="item"><div class="k">गाव</div><div class="v">${esc(r.village)}</div></div>
    <div class="item"><div class="k">जिल्हा</div><div class="v">${esc(r.district)}</div></div>
    <div class="item"><div class="k">सदस्य</div><div class="v">${members.length + 1}</div></div>
    <div class="item"><div class="k">मोबाईल</div><div class="v">${esc(r.mobile)}</div></div>
  </div>

  <section>
    <h2 class="section-title">A · भौगोलिक माहिती</h2>
    <div class="section-body">
      <div class="grid-2">
        ${field("गाव", r.village)}${field("तालुका", r.taluka)}
        ${field("जिल्हा", r.district)}${field("पिनकोड", r.pincode)}
      </div>
    </div>
  </section>

  <section>
    <h2 class="section-title">B · कुटुंब प्रमुख माहिती</h2>
    <div class="section-body">
      <div class="grid-3">
        ${field("नाव", r.head_name)}${field("मोबाईल", r.mobile)}${field("समुदाय", r.community)}
        ${field("वैवाहिक स्थिती", r.marital_status)}${field("लिंग", r.gender)}${field("वय", r.age)}
        ${field("जन्मतारीख", r.dob)}${field("शिक्षण", r.education)}${field("व्यवसाय", r.occupation)}
      </div>
    </div>
  </section>

  <section>
    <h2 class="section-title">C · कुटुंबातील सदस्य (${members.length})</h2>
    <div class="section-body">
    ${members.length === 0 ? '<div class="empty">कोणतेही अतिरिक्त सदस्य नाहीत</div>' : `
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
    </div>
  </section>

  <section>
    <h2 class="section-title">D · धारण केलेले पद</h2>
    <div class="section-body">
      <div class="grid-2">
        ${field("पद आहे?", r.has_position ? "होय" : "नाही")}
        ${r.has_position && r.position_data ? `
          ${field("पदाचा प्रकार", r.position_data.type)}
          ${field("स्थिती", r.position_data.status)}
          ${field("राजकीय पद", r.position_data.political_level)}
          ${field("पक्ष", r.position_data.party_name)}
          ${field("लोकप्रतिनिधी", r.position_data.representative_type)}
          ${field("संस्था", r.position_data.social_org)}
          ${field("पद", r.position_data.social_role)}
        ` : ""}
      </div>
    </div>
  </section>

  <section>
    <h2 class="section-title">E · घरातील वापराच्या वस्तू</h2>
    <div class="section-body">
      ${(r.household_items || []).length
        ? `<div class="tags">${(r.household_items || []).map((x: string) => `<span class="tag">${esc(x)}</span>`).join("")}</div>`
        : '<div class="empty">माहिती नाही</div>'}
    </div>
  </section>

  <section>
    <h2 class="section-title">F · घर विषयक माहिती</h2>
    <div class="section-body">
      <div class="grid-3">
        ${field("स्वतःचे घर", r.owns_house === true ? "होय" : r.owns_house === false ? "नाही" : "—")}
        ${field("घराचा प्रकार", r.house_type)}
        ${field("राहण्याची स्थिती", r.living_status)}
      </div>
    </div>
  </section>

  <section>
    <h2 class="section-title">G · शेती विषयक माहिती</h2>
    <div class="section-body">
      <div class="grid-2">
        ${field("शेतजमीन आहे?", r.has_farmland === true ? "होय" : r.has_farmland === false ? "नाही" : "—")}
        ${field("एकूण शेती", r.total_farmland)}
      </div>
      ${crops.length > 0 ? `
      <table style="margin-top:10px;">
        <thead><tr><th>#</th><th>हंगाम</th><th>कोरडवाहू</th><th>कोरडवाहू पिक</th><th>ओलितावली</th><th>ओलितावली पिक</th><th>खरीप</th><th>रब्बी</th><th>एकूण</th></tr></thead>
        <tbody>
        ${crops.map((c: any, i: number) => `<tr>
          <td>${i + 1}</td><td>${esc(c.season)}</td><td>${esc(c.dry_land)}</td><td>${esc(c.dry_crop)}</td>
          <td>${esc(c.wet_land)}</td><td>${esc(c.wet_crop)}</td><td>${esc(c.kharif)}</td><td>${esc(c.rabi)}</td><td>${esc(c.total)}</td>
        </tr>`).join("")}
        </tbody>
      </table>` : ""}
    </div>
  </section>

  <section>
    <h2 class="section-title">H · सिंचनाचे साधन</h2>
    <div class="section-body">
      ${(r.irrigation_sources || []).length
        ? `<div class="tags">${(r.irrigation_sources || []).map((x: string) => `<span class="tag">${esc(x)}</span>`).join("")}</div>`
        : '<div class="empty">माहिती नाही</div>'}
    </div>
  </section>

  <section>
    <h2 class="section-title">I · शेती विषयक साधने</h2>
    <div class="section-body">
      ${(r.farming_tools || []).length
        ? `<div class="tags">${(r.farming_tools || []).map((x: string) => `<span class="tag">${esc(x)}</span>`).join("")}</div>`
        : '<div class="empty">माहिती नाही</div>'}
    </div>
  </section>

  <div class="footer">
    <div>© कोहळी परिवार — कुटुंब सर्वेक्षण प्रणाली</div>
    <div>अहवाल क्र: ${esc(String(r.id).slice(0, 8).toUpperCase())}</div>
  </div>
</div>

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
    setTimeout(() => { try { w.focus(); w.print(); } catch {} }, 800);
  }
}

export async function downloadSurveyPDF(r: any) {
  const { default: html2canvas } = await import("html2canvas");
  const { default: jsPDF } = await import("jspdf");
  const html = await buildSurveyHTML(r);

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.left = "-10000px";
  iframe.style.top = "0";
  iframe.style.width = "800px";
  iframe.style.height = "1000px";
  document.body.appendChild(iframe);

  try {
    const doc = iframe.contentDocument!;
    doc.open();
    doc.write(html);
    doc.close();

    await new Promise((res) => setTimeout(res, 1200));
    try { await (doc as any).fonts?.ready; } catch {}

    const body = doc.body;
    body.style.width = "800px";
    const canvas = await html2canvas(body, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      windowWidth: 800,
      windowHeight: body.scrollHeight,
    });

    const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    let heightLeft = imgHeight;
    let position = 0;
    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const safeName = (r.head_name || "survey").replace(/[^\w\u0900-\u097F]+/g, "_");
    pdf.save(`survey_${safeName}_${String(r.id).slice(0, 8)}.pdf`);
  } finally {
    document.body.removeChild(iframe);
  }
}
