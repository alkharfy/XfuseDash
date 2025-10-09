import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Excel Export
export function exportToExcel(data: any[], filename: string = 'report') {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  
  XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
}

// PDF Export (with basic Arabic support)
export function exportToPDF(data: any[], filename: string = 'report', title: string = 'Report') {
  const doc = new jsPDF();

  // You need to add a font that supports Arabic characters
  // This is a complex topic. For a simple solution, we can try to use a base64 encoded font,
  // but for a robust solution, a library like `jspdf-arabic` might be needed.
  // For this example, we'll assume basic rendering might work for some viewers, but it's not guaranteed.
  
  doc.setFontSize(18);
  // To display Arabic correctly, text should be reversed and handled properly.
  // This is a placeholder for the title.
  doc.text(title, 105, 20, { align: 'center' });
  
  const tableData = data.map(item => Object.values(item));
  const headers = Object.keys(data[0] || {});
  
  (doc as any).autoTable({
    head: [headers],
    body: tableData,
    startY: 30,
    // Add styles for RTL, though this is limited in jspdf-autotable
    styles: {
      halign: 'right', // Align text to the right for Arabic
    },
    headStyles: {
      fillColor: [63, 81, 181] // Primary color
    }
  });
  
  doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
}
