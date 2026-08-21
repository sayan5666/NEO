import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function exportElementToPdf(elementId: string, filename: string = 'interview_report.pdf') {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`Element #${elementId} not found for PDF export. Triggering window.print()`);
    window.print();
    return;
  }

  try {
    // Generate high-resolution canvas capture of the element
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#FFFDF5',
      windowWidth: element.scrollWidth,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth - 40; // 20pt margin on each side
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 20;

    pdf.addImage(imgData, 'PNG', 20, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 20, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(filename);
  } catch (error) {
    console.error('Failed to export PDF via html2canvas/jspdf:', error);
    // Fallback to browser print dialog
    window.print();
  }
}
