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
  const pos = r.position_data || {};
  const b = r.benefits_info || {};
  const emp = r.employment_info || {};

  return `<!doctype html><html><head><meta charset="utf-8"/>
<title>सर्वेक्षण - ${esc(r.head_name)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; }
  body { font-family: 'Noto Sans Devanagari', 'Mangal', system-ui, sans-serif; color:#1a1a1a; font-size:11.5px; line-height:1.5; margin:0; padding:20px; background:#fff; }
  .doc { max-width: 760px; margin: 0 auto; }
  .header { display:flex; justify-content:space-between; align-items:center; gap:16px; border-bottom:3px solid #b45a28; padding-bottom:12px; margin-bottom:16px; }
  .header h1 { font-size:20px; margin:0 0 4px; color:#b45a28; font-weight:700; }
  .header .sub { font-size:11px; color:#666; }
  .photo { width:96px; height:96px; object-fit:cover; border:2px solid #b45a28; border-radius:6px; flex-shrink:0; }
  .section { margin-top:14px; page-break-inside: avoid; break-inside: avoid; }
  .section h2 { font-size:13px; margin:0 0 6px; padding:6px 10px; background:#b45a28; color:#fff; border-radius:4px 4px 0 0; font-weight:600; }
  table { width:100%; border-collapse: collapse; }
  td, th { border:1px solid #d4d4d4; padding:6px 9px; vertical-align:top; text-align:left; font-size:11px; }
  td.lbl { background:#faf3ee; width:35%; font-weight:600; color:#5a3a20; }
  th { background:#fff3eb; color:#5a3a20; font-weight:600; font-size:10.5px; }
  .tags { padding:8px; border:1px solid #d4d4d4; border-radius:0 0 4px 4px; background:#fff; }
  .tag { display:inline-block; background:#fff3eb; border:1px solid #f0c8a8; padding:3px 10px; border-radius:12px; margin:3px; font-size:10.5px; color:#5a3a20; }
  .empty { padding:8px; color:#888; font-style:italic; border:1px solid #d4d4d4; border-radius:0 0 4px 4px; }
  .footer { margin-top:20px; padding-top:10px; border-top:1px solid #ddd; font-size:10px; color:#888; text-align:center; }
</style></head><body>
<div class="doc">

<div class="header">
  <div>
    <h1>कुटुंब सर्वेक्षण अहवाल</h1>
    <div class="sub">ID: ${esc(String(r.id).slice(0, 8))}</div>
    <div class="sub">तयार दिनांक: ${esc(new Date(r.created_at).toLocaleString("mr-IN"))}</div>
  </div>
  ${photo ? `<img class="photo" src="${photo}" alt="photo" crossorigin="anonymous"/>` : ""}
</div>

<div class="section">
  <h2>A. भौगोलिक माहिती</h2>
  <table>
    ${row("गाव", r.village)}${row("तालुका", r.taluka)}${row("जिल्हा", r.district)}${row("पिनकोड", r.pincode)}
  </table>
</div>

<div class="section">
  <h2>B. कुटुंब प्रमुख माहिती</h2>
  <table>
    ${row("नाव", r.head_name)}${row("मोबाईल", r.mobile)}${row("समुदाय", r.community)}
    ${row("वैवाहिक स्थिती", r.marital_status)}${row("लिंग", r.gender)}${row("वय", r.age)}
    ${row("जन्मतारीख", r.dob)}${row("शिक्षण", r.education)}${row("व्यवसाय", r.occupation)}
  </table>
</div>

<div class="section">
  <h2>C. कुटुंबातील सदस्य (${members.length})</h2>
  ${members.length === 0 ? '<div class="empty">कोणताही सदस्य नोंदवलेला नाही</div>' : `
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

<div class="section">
  <h2>D. धारण केलेले पद</h2>
  <table>
    ${row("पद आहे?", r.has_position ? "होय" : "नाही")}
    ${r.has_position ? `
      ${row("पदाचा प्रकार", pos.type)}
      ${row("स्थिती", pos.status)}
      ${row("राजकीय पद", pos.political_level)}
      ${row("पक्ष", pos.party_name)}
      ${row("लोकप्रतिनिधी", pos.representative_type)}
      ${row("संस्था", pos.social_org)}
      ${row("पद", pos.social_role)}
    ` : ""}
  </table>
</div>

<div class="section">
  <h2>E. घरातील वापराच्या वस्तू</h2>
  ${(r.household_items || []).length > 0
    ? `<div class="tags">${(r.household_items || []).map((x: string) => {
        const count = r.household_item_counts?.[x];
        return `<span class="tag">${esc(x)}${count ? ` (${count})` : ""}</span>`;
      }).join("")}</div>`
    : `<div class="empty">कोणतीही वस्तू नोंदवलेली नाही</div>`}
  <table style="margin-top:10px;">
    ${row("सौर ऊर्जा प्रणाली बसविण्यात आलेली आहे?", r.solar_panel_installed === true ? "होय" : r.solar_panel_installed === false ? "नाही" : "-")}
    ${r.solar_panel_installed === false ? row("सौर ऊर्जा योजनेचा लाभ घ्यायचा आहे?", r.solar_panel_wanted === true ? "होय" : r.solar_panel_wanted === false ? "नाही" : "-") : ""}
  </table>
</div>

<div class="section">
  <h2>F. घर विषयक माहिती</h2>
  <table>
    ${row("स्वतःचे घर", r.owns_house === true ? "होय" : r.owns_house === false ? "नाही" : "-")}
    ${row("घराचा प्रकार", r.house_type)}
    ${row("राहण्याची स्थिती", r.living_status)}
  </table>
</div>

<div class="section">
  <h2>G. शेती विषयक माहिती</h2>
  <table>
    ${row("शेतजमीन आहे?", r.has_farmland === true ? "होय" : r.has_farmland === false ? "नाही" : "-")}
    ${row("एकूण शेती", r.total_farmland)}
    ${row("ओलिताखालील क्षेत्र (एकर)", r.irrigated_area)}
    ${row("कोरडवाहू क्षेत्र (एकर)", r.dryland_area)}
    ${row("खरीप हंगामाखालील क्षेत्र (एकर)", r.kharif_area)}
    ${row("रब्बी हंगामाखालील क्षेत्र (एकर)", r.rabi_area)}
    ${row("उन्हाळी हंगामाखालील क्षेत्र (एकर)", r.summer_area)}
    ${row("प्रमुख पीक प्रकार", [...(r.major_crop_types || []), r.major_crop_types_other].filter(Boolean).join(", "))}
  </table>
  ${crops.length > 0 ? `
  <table style="margin-top:8px;">
    <thead><tr><th>#</th><th>पिक हंगाम</th></tr></thead>
    <tbody>
    ${crops.map((c: any, i: number) => `<tr><td>${i + 1}</td><td>${esc(c.season)}</td></tr>`).join("")}
    </tbody>
  </table>` : ""}
</div>


<div class="section">
  <h2>H. सिंचनाचे साधन</h2>
  ${(r.irrigation_sources || []).length > 0
    ? `<div class="tags">${(r.irrigation_sources || []).map((x: string) => `<span class="tag">${esc(x)}</span>`).join("")}</div>`
    : `<div class="empty">नोंदवलेले नाही</div>`}
</div>

<div class="section">
  <h2>I. शेती विषयक साधने</h2>
  ${(r.farming_tools || []).length > 0
    ? `<div class="tags">${(r.farming_tools || []).map((x: string) => `<span class="tag">${esc(x)}</span>`).join("")}</div>`
    : `<div class="empty">नोंदवलेले नाही</div>`}
</div>

<div class="section">
  <h2>J. सामाजिक व आर्थिक लाभार्थी माहिती</h2>
  <table>
    ${row("मुख्यमंत्री लाडकी बहीण योजना लाभार्थी", b.ladki_bahin === true ? "होय" : b.ladki_bahin === false ? "नाही" : "-")}
    ${b.ladki_bahin === true ? row("लाभार्थी संख्या", b.ladki_bahin_count || "-") : ""}
    ${b.ladki_bahin === true ? row("लाभ नियमितपणे मिळतो का?", b.ladki_bahin_regular === true ? "होय" : b.ladki_bahin_regular === false ? "नाही" : "-") : ""}
    ${row("दुर्धर आजाराने बाधित रुग्ण", b.critical_illness === true ? "होय" : b.critical_illness === false ? "नाही" : "-")}
    ${b.critical_illness === true ? row("वैद्यकीय सहाय्याची आवश्यकता", b.medical_aid_needed === true ? "होय" : b.medical_aid_needed === false ? "नाही" : "-") : ""}
    ${row("राज्य / राष्ट्रीय / आंतरराष्ट्रीय खेळाडू", b.has_sportsperson === true ? "होय" : b.has_sportsperson === false ? "नाही" : "-")}
    ${b.has_sportsperson === true ? row("खेळाचा प्रकार", b.sport_type || "-") : ""}
    ${b.has_sportsperson === true ? row("स्तर", b.sport_level || "-") : ""}
  </table>
</div>

<div class="section">
  <h2>K. उद्योजक / स्वयंरोजगार व रोजगार संबंधित माहिती</h2>
  <table>
    ${row("उद्योजक / स्वयंरोजगारात कार्यरत", emp.has_entrepreneur === true ? "होय" : emp.has_entrepreneur === false ? "नाही" : "-")}
    ${emp.has_entrepreneur === true ? row("तपशील व व्यवसायाचा पत्ता", emp.entrepreneur_details || "-") : ""}
    ${row("जोडधंदा / अतिरिक्त व्यवसाय", emp.has_side_business === true ? "होय" : emp.has_side_business === false ? "नाही" : "-")}
    ${emp.has_side_business === true ? row("व्यवसायाचे स्वरूप व तपशील", emp.side_business_details || "-") : ""}
  </table>
</div>

<div class="footer">कुटुंब सर्वेक्षण अहवाल — ${esc(r.head_name)} — ${esc(r.village)}</div>

</div>
</body></html>`;
}

export async function downloadSurveyPDF(r: any) {
  const { default: html2canvas } = await import("html2canvas");
  const { default: jsPDF } = await import("jspdf");
  const html = await buildSurveyHTML(r);

  const RENDER_WIDTH = 760;

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.left = "-10000px";
  iframe.style.top = "0";
  iframe.style.width = RENDER_WIDTH + 40 + "px";
  iframe.style.height = "1200px";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  try {
    const doc = iframe.contentDocument!;
    doc.open();
    doc.write(html);
    doc.close();

    await new Promise((res) => setTimeout(res, 500));
    try { await (doc as any).fonts?.ready; } catch {}
    const imgs = Array.from(doc.images);
    await Promise.all(imgs.map((img: any) => img.complete ? Promise.resolve() : new Promise(res => {
      img.onload = img.onerror = res;
    })));
    await new Promise((res) => setTimeout(res, 200));

    const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const marginMm = 10;
    const contentW = pageW - marginMm * 2;
    const contentH = pageH - marginMm * 2;

    // Render each block (header + section) separately to avoid mid-content cuts
    const blocks = Array.from(doc.querySelectorAll(".doc > .header, .doc > .section, .doc > .footer")) as HTMLElement[];

    let cursorY = marginMm;
    let pageNum = 0;

    for (const block of blocks) {
      const canvas = await html2canvas(block, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        windowWidth: RENDER_WIDTH + 40,
      });
      const imgWmm = contentW;
      const imgHmm = (canvas.height / canvas.width) * imgWmm;
      const imgData = canvas.toDataURL("image/jpeg", 0.92);

      // If block taller than page, slice it across pages
      if (imgHmm > contentH) {
        const pxPerMm = canvas.width / contentW;
        const sliceHpx = Math.floor(contentH * pxPerMm);
        let rendered = 0;
        // start on a fresh page if current page already has content
        if (cursorY > marginMm) { pdf.addPage(); pageNum++; cursorY = marginMm; }
        while (rendered < canvas.height) {
          const sh = Math.min(sliceHpx, canvas.height - rendered);
          const pageCanvas = document.createElement("canvas");
          pageCanvas.width = canvas.width;
          pageCanvas.height = sh;
          const ctx = pageCanvas.getContext("2d")!;
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          ctx.drawImage(canvas, 0, rendered, canvas.width, sh, 0, 0, canvas.width, sh);
          const sliceData = pageCanvas.toDataURL("image/jpeg", 0.92);
          const sliceHmm = (sh / canvas.width) * contentW;
          if (rendered > 0) { pdf.addPage(); pageNum++; }
          pdf.addImage(sliceData, "JPEG", marginMm, marginMm, contentW, sliceHmm);
          rendered += sh;
          cursorY = marginMm + sliceHmm + 2;
        }
      } else {
        // Place block; new page if it doesn't fit
        if (cursorY + imgHmm > pageH - marginMm) {
          pdf.addPage();
          pageNum++;
          cursorY = marginMm;
        }
        pdf.addImage(imgData, "JPEG", marginMm, cursorY, imgWmm, imgHmm);
        cursorY += imgHmm + 3;
      }
    }

    const safeName = (r.head_name || "survey").replace(/[^\w\u0900-\u097F]+/g, "_");
    pdf.save(`survey_${safeName}_${String(r.id).slice(0, 8)}.pdf`);
  } finally {
    document.body.removeChild(iframe);
  }
}
