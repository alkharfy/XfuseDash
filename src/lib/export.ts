import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { amiriFont } from './amiri-font'; // Import the font

// Extend jsPDF with the autoTable plugin
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// Excel Export (No changes needed here)
export function exportToExcel(data: any[], filename: string = 'report') {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  
  XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
}

// PDF Export (Updated to support Arabic)
export function exportToPDF(data: any[], filename: string = 'report', title: string = 'Report') {
  const doc = new jsPDF();

  // 1. Add the font to the virtual file system
  doc.addFileToVFS('Amiri-Regular.ttf', amiriFont);
  // 2. Add the font to jsPDF
  doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
  // 3. Set the font for the entire document
  doc.setFont('Amiri');

  // Reverse the title for RTL display
  const rtlTitle = title.split('').reverse().join('');
  doc.setFontSize(18);
  doc.text(rtlTitle, 105, 20, { align: 'center' });
  
  if (!data || data.length === 0) {
    doc.setFontSize(12);
    const noDataText = 'لا توجد بيانات للتصدير.';
    doc.text(noDataText.split('').reverse().join(''), 105, 40, { align: 'center' });
    doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
    return;
  }

  const tableData = data.map(item => Object.values(item).map(val => String(val).split('').reverse().join('')));
  const headers = Object.keys(data[0]).map(h => h.split('').reverse().join(''));
  
  doc.autoTable({
    head: [headers],
    body: tableData,
    startY: 30,
    theme: 'grid',
    styles: {
      font: 'Amiri', // Apply the font to the table
      halign: 'right', // Align text to the right
      cellPadding: 2,
      fontSize: 10,
    },
    headStyles: {
      fillColor: [41, 128, 185], // A nice blue color
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });
  
  doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
}
