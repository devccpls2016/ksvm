import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportExcel(rows: any[], filename = "surveys.xlsx") {
  const flat = rows.map(r => ({
    गाव: r.village, तालुका: r.taluka, जिल्हा: r.district, पिनकोड: r.pincode,
    "कुटुंब प्रमुख": r.head_name, मोबाईल: r.mobile, समुदाय: r.community,
    "वैवाहिक स्थिती": r.marital_status, लिंग: r.gender, वय: r.age,
    शिक्षण: r.education, व्यवसाय: r.occupation,
    "स्वतःचे घर": r.owns_house ? "होय" : "नाही", "घर प्रकार": r.house_type,
    "शेतजमीन": r.has_farmland ? "होय" : "नाही", "शेती क्षेत्र": r.total_farmland,
    "सदस्य संख्या": Array.isArray(r.members) ? r.members.length : 0,
    "तयार केले": new Date(r.created_at).toLocaleString("mr-IN"),
  }));
  const ws = XLSX.utils.json_to_sheet(flat);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Surveys");
  XLSX.writeFile(wb, filename);
}

export function exportPDF(rows: any[], filename = "surveys.pdf") {
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text("Family Survey Report", 14, 14);
  doc.setFontSize(10);
  doc.text(`Total: ${rows.length} | Generated: ${new Date().toLocaleString()}`, 14, 20);
  autoTable(doc, {
    startY: 26,
    head: [["Village", "Head Name", "Mobile", "Members", "Own House", "Farmland"]],
    body: rows.map(r => [
      r.village, r.head_name, r.mobile || "-",
      Array.isArray(r.members) ? r.members.length : 0,
      r.owns_house ? "Yes" : "No",
      r.has_farmland ? "Yes" : "No",
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [180, 90, 40] },
  });
  doc.save(filename);
}
