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
  const initials = (r.head_name || "?").trim().charAt(0);

  return `<!doctype html><html lang="mr"><head><meta charset="utf-8"/>
<title>सर्वेक्षण - ${esc(r.head_name)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background: #f4f5f7; }
  body {
    font-family: 'Noto Sans Devanagari', 'Inter', system-ui, -apple-system, sans-serif;
    color: #1a1d23; font-size: 11px; line-height: 1.55; -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }

  .page {
    width: 210mm; min-height: 297mm; margin: 0 auto; background: #fff;
    padding: 0 0 18mm 0; position: relative; overflow: hidden;
  }

  /* HERO HEADER */
  .hero {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #b45a28 130%);
    color: #fff; padding: 22mm 16mm 14mm; position: relative; overflow: hidden;
  }
  .hero::before {
    content: ""; position: absolute; top: -40mm; right: -30mm; width: 90mm; height: 90mm;
    background: radial-gradient(circle, rgba(255,165,90,.35), transparent 70%); border-radius: 50%;
  }
  .hero::after {
    content: ""; position: absolute; bottom: -30mm; left: -20mm; width: 70mm; height: 70mm;
    background: radial-gradient(circle, rgba(99,102,241,.25), transparent 70%); border-radius: 50%;
  }
  .hero-top { display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 2; font-size: 10px; opacity: .85; letter-spacing: 1.2px; text-transform: uppercase; }
  .hero-brand { font-weight: 700; }
  .hero-id { font-family: 'Inter', monospace; }
  .hero-main { display: flex; gap: 18px; align-items: center; margin-top: 18px; position: relative; z-index: 2; }
  .avatar {
    width: 78px; height: 78px; border-radius: 50%; overflow: hidden; flex-shrink: 0;
    background: linear-gradient(135deg, #f59e0b, #b45a28); display: flex; align-items: center; justify-content: center;
    font-size: 34px; font-weight: 700; color: #fff; border: 3px solid rgba(255,255,255,.25);
    box-shadow: 0 8px 24px rgba(0,0,0,.3);
  }
  .avatar img { width: 100%; height: 100%; object-fit: cover; }
  .hero-info h1 { font-size: 24px; font-weight: 700; line-height: 1.15; margin-bottom: 4px; }
  .hero-info .subtitle { font-size: 12px; opacity: .85; font-weight: 500; }
  .hero-meta { display: flex; gap: 18px; margin-top: 10px; font-size: 10px; opacity: .9; flex-wrap: wrap; }
  .hero-meta span b { font-weight: 600; opacity: 1; }

  /* QUICK STATS STRIP */
  .stats {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: #e5e7eb;
    margin: 0 16mm; transform: translateY(-12px); border-radius: 10px; overflow: hidden;
    box-shadow: 0 6px 20px rgba(15,23,42,.12); position: relative; z-index: 3;
  }
  .stat { background: #fff; padding: 10px 12px; }
  .stat-label { font-size: 8.5px; text-transform: uppercase; letter-spacing: .8px; color: #64748b; font-weight: 600; }
  .stat-value { font-size: 14px; font-weight: 700; color: #0f172a; margin-top: 3px; }
  .stat-value.accent { color: #b45a28; }

  /* CONTENT */
  .content { padding: 6mm 16mm 0; }
  .section { margin-top: 14px; page-break-inside: avoid; }
  .section-head { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
  .section-bullet {
    width: 22px; height: 22px; border-radius: 6px; display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #b45a28, #f59e0b); color: #fff; font-weight: 700; font-size: 11px;
    box-shadow: 0 2px 6px rgba(180,90,40,.35);
  }
  .section-title { font-size: 13px; font-weight: 700; color: #0f172a; letter-spacing: .2px; }
  .section-line { flex: 1; height: 1px; background: linear-gradient(to right, #e5e7eb, transparent); }

  .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px 14px; }
  .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px 14px; }
  .field {
    background: #f8fafc; border: 1px solid #eef0f3; border-left: 3px solid #b45a28;
    border-radius: 6px; padding: 7px 10px;
  }
  .field-label { font-size: 8.5px; text-transform: uppercase; letter-spacing: .6px; color: #64748b; font-weight: 600; }
  .field-value { font-size: 11.5px; color: #0f172a; font-weight: 500; margin-top: 2px; word-break: break-word; }

  /* TABLES */
  table.data {
    width: 100%; border-collapse: separate; border-spacing: 0; border-radius: 8px; overflow: hidden;
    border: 1px solid #e5e7eb; font-size: 10.5px;
  }
  table.data thead th {
    background: #0f172a; color: #fff; font-weight: 600; padding: 8px 10px; text-align: left;
    font-size: 9.5px; text-transform: uppercase; letter-spacing: .6px;
  }
  table.data tbody td { padding: 7px 10px; border-top: 1px solid #eef0f3; vertical-align: top; }
  table.data tbody tr:nth-child(even) td { background: #fafbfc; }

  .tags { display: flex; flex-wrap: wrap; gap: 6px; }
  .tag {
    background: #fff7ed; border: 1px solid #fed7aa; color: #9a3412;
    padding: 4px 10px; border-radius: 999px; font-size: 10px; font-weight: 500;
  }
  .empty { color: #94a3b8; font-style: italic; font-size: 10.5px; padding: 4px 0; }

  .pill { display: inline-block; padding: 2px 9px; border-radius: 999px; font-size: 9.5px; font-weight: 600; }
  .pill-yes { background: #dcfce7; color: #166534; }
  .pill-no { background: #fee2e2; color: #991b1b; }

  /* FOOTER */
  .footer {
    position: absolute; bottom: 0; left: 0; right: 0; padding: 6mm 16mm;
    border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;
    font-size: 9px; color: #94a3b8;
  }
  .footer .accent { color: #b45a28; font-weight: 600; }

  .toolbar { max-width: 210mm; margin: 12px auto; padding: 0 16mm; display: flex; gap: 8px; }
  .toolbar button {
    padding: 8px 16px; border: 0; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 12px;
    background: #0f172a; color: #fff;
  }
  .toolbar button.secondary { background: #e5e7eb; color: #0f172a; }
  @media print { .toolbar { display: none; } body { background: #fff; } .page { box-shadow: none; margin: 0; } }
</style></head><body>

<div class="toolbar">
  <button onclick="window.print()">🖨️ प्रिंट / PDF जतन करा</button>
  <button class="secondary" onclick="window.close()">बंद करा</button>
</div>

<div class="page">
  <div class="hero">
    <div class="hero-top">
      <div class="hero-brand">कुटुंब सर्वेक्षण अहवाल · Family Survey Report</div>
      <div class="hero-id">#${esc(String(r.id).slice(0, 8).toUpperCase())}</div>
    </div>
    <div class="hero-main">
      <div class="avatar">${photo ? `<img src="${photo}" alt="photo"/>` : esc(initials)}</div>
      <div class="hero-info">
        <h1>${esc(r.head_name)}</h1>
        <div class="subtitle">${esc(r.village)}${r.taluka ? ", " + esc(r.taluka) : ""}${r.district ? ", " + esc(r.district) : ""}</div>
        <div class="hero-meta">
          ${r.mobile ? `<span>📱 <b>${esc(r.mobile)}</b></span>` : ""}
          ${r.community ? `<span>👥 <b>${esc(r.community)}</b></span>` : ""}
          ${r.occupation ? `<span>💼 <b>${esc(r.occupation)}</b></span>` : ""}
        </div>
      </div>
    </div>
  </div>

  <div class="stats">
    <div class="stat"><div class="stat-label">सदस्य</div><div class="stat-value accent">${members.length}</div></div>
    <div class="stat"><div class="stat-label">शेती</div><div class="stat-value">${r.has_farmland ? esc(r.total_farmland || "होय") : "नाही"}</div></div>
    <div class="stat"><div class="stat-label">घर</div><div class="stat-value">${r.owns_house ? "स्वतःचे" : "नाही"}</div></div>
    <div class="stat"><div class="stat-label">पद</div><div class="stat-value">${r.has_position ? "होय" : "नाही"}</div></div>
  </div>

  <div class="content">

    <div class="section">
      <div class="section-head"><div class="section-bullet">A</div><div class="section-title">भौगोलिक माहिती</div><div class="section-line"></div></div>
      <div class="grid-2">
        ${field("गाव", r.village)}${field("तालुका", r.taluka)}
        ${field("जिल्हा", r.district)}${field("पिनकोड", r.pincode)}
      </div>
    </div>

    <div class="section">
      <div class="section-head"><div class="section-bullet">B</div><div class="section-title">कुटुंब प्रमुख माहिती</div><div class="section-line"></div></div>
      <div class="grid-3">
        ${field("नाव", r.head_name)}${field("मोबाईल", r.mobile)}${field("समुदाय", r.community)}
        ${field("लिंग", r.gender)}${field("वय", r.age)}${field("जन्मतारीख", r.dob)}
        ${field("वैवाहिक स्थिती", r.marital_status)}${field("शिक्षण", r.education)}${field("व्यवसाय", r.occupation)}
      </div>
    </div>

    <div class="section">
      <div class="section-head"><div class="section-bullet">C</div><div class="section-title">कुटुंबातील सदस्य (${members.length})</div><div class="section-line"></div></div>
      ${members.length === 0 ? '<div class="empty">कोणताही सदस्य नोंदवलेला नाही</div>' : `
      <table class="data">
        <thead><tr><th>#</th><th>नाव</th><th>नाते</th><th>लिंग</th><th>वय</th><th>शिक्षण</th><th>व्यवसाय</th><th>मोबाईल</th></tr></thead>
        <tbody>
        ${members.map((m: any, i: number) => `<tr>
          <td>${i + 1}</td><td><b>${esc(m.name)}</b></td><td>${esc(m.relationship)}</td>
          <td>${esc(m.gender)}</td><td>${esc(m.age)}</td><td>${esc(m.education)}</td>
          <td>${esc(m.occupation)}${m.job_type ? " <span style='color:#64748b'>(" + esc(m.job_type) + ")</span>" : ""}</td>
          <td>${esc(m.mobile)}</td>
        </tr>`).join("")}
        </tbody>
      </table>`}
    </div>

    <div class="section">
      <div class="section-head"><div class="section-bullet">D</div><div class="section-title">धारण केलेले पद</div><div class="section-line"></div></div>
      <div class="grid-2">
        <div class="field"><div class="field-label">पद आहे?</div><div class="field-value"><span class="pill ${r.has_position ? "pill-yes" : "pill-no"}">${r.has_position ? "होय" : "नाही"}</span></div></div>
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

    <div class="section">
      <div class="section-head"><div class="section-bullet">E</div><div class="section-title">घर व घरगुती वस्तू</div><div class="section-line"></div></div>
      <div class="grid-3" style="margin-bottom:8px;">
        <div class="field"><div class="field-label">स्वतःचे घर</div><div class="field-value"><span class="pill ${r.owns_house ? "pill-yes" : "pill-no"}">${r.owns_house === true ? "होय" : r.owns_house === false ? "नाही" : "—"}</span></div></div>
        ${field("घराचा प्रकार", r.house_type)}
        ${field("राहण्याची स्थिती", r.living_status)}
      </div>
      <div class="field" style="border-left-color:#6366f1;">
        <div class="field-label">घरातील वापराच्या वस्तू</div>
        <div class="field-value">
          ${(r.household_items || []).length ? `<div class="tags" style="margin-top:4px;">${(r.household_items || []).map((x: string) => `<span class="tag">${esc(x)}</span>`).join("")}</div>` : "—"}
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-head"><div class="section-bullet">F</div><div class="section-title">शेती विषयक माहिती</div><div class="section-line"></div></div>
      <div class="grid-2" style="margin-bottom:8px;">
        <div class="field"><div class="field-label">शेतजमीन आहे?</div><div class="field-value"><span class="pill ${r.has_farmland ? "pill-yes" : "pill-no"}">${r.has_farmland === true ? "होय" : r.has_farmland === false ? "नाही" : "—"}</span></div></div>
        ${field("एकूण शेती", r.total_farmland)}
      </div>
      ${crops.length > 0 ? `
      <table class="data">
        <thead><tr><th>#</th><th>हंगाम</th><th>कोरडवाहू</th><th>कोरडवाहू पिक</th><th>ओलितावली</th><th>ओलितावली पिक</th><th>खरीप</th><th>रब्बी</th><th>एकूण</th></tr></thead>
        <tbody>
        ${crops.map((c: any, i: number) => `<tr>
          <td>${i + 1}</td><td><b>${esc(c.season)}</b></td><td>${esc(c.dry_land)}</td><td>${esc(c.dry_crop)}</td>
          <td>${esc(c.wet_land)}</td><td>${esc(c.wet_crop)}</td><td>${esc(c.kharif)}</td><td>${esc(c.rabi)}</td><td><b>${esc(c.total)}</b></td>
        </tr>`).join("")}
        </tbody>
      </table>` : ""}
      <div class="grid-2" style="margin-top:8px;">
        <div class="field" style="border-left-color:#0ea5e9;">
          <div class="field-label">सिंचनाचे साधन</div>
          <div class="field-value">${(r.irrigation_sources || []).length ? `<div class="tags" style="margin-top:4px;">${(r.irrigation_sources || []).map((x: string) => `<span class="tag" style="background:#e0f2fe;border-color:#bae6fd;color:#075985;">${esc(x)}</span>`).join("")}</div>` : "—"}</div>
        </div>
        <div class="field" style="border-left-color:#16a34a;">
          <div class="field-label">शेती विषयक साधने</div>
          <div class="field-value">${(r.farming_tools || []).length ? `<div class="tags" style="margin-top:4px;">${(r.farming_tools || []).map((x: string) => `<span class="tag" style="background:#dcfce7;border-color:#bbf7d0;color:#166534;">${esc(x)}</span>`).join("")}</div>` : "—"}</div>
        </div>
      </div>
    </div>

  </div>

  <div class="footer">
    <div>तयार: <b>${esc(new Date(r.created_at).toLocaleString("mr-IN"))}</b> · अपडेट: <b>${esc(new Date(r.updated_at).toLocaleString("mr-IN"))}</b></div>
    <div class="accent">कोहळी परिवार सर्वेक्षण</div>
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
  iframe.style.width = "794px"; // A4 @ 96dpi
  iframe.style.height = "1123px";
  document.body.appendChild(iframe);

  try {
    const doc = iframe.contentDocument!;
    doc.open();
    doc.write(html);
    doc.close();

    // wait for fonts + images
    await new Promise((res) => setTimeout(res, 1200));
    try { await (doc as any).fonts?.ready; } catch {}
    const imgs = Array.from(doc.images || []);
    await Promise.all(imgs.map(img => img.complete ? Promise.resolve() : new Promise(r2 => { img.onload = img.onerror = () => r2(null); })));

    const target = doc.querySelector(".page") as HTMLElement || doc.body;
    const canvas = await html2canvas(target, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      windowWidth: 794,
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
    pdf.save(`Survey_${safeName}_${String(r.id).slice(0, 8)}.pdf`);
  } finally {
    document.body.removeChild(iframe);
  }
}
