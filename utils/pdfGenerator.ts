// PDF generation utility for finance data
export const generatePaymentsPDF = async (payments: any[], filters?: any) => {
  try {
    // Check if we're in the browser
    if (globalThis.window === undefined) {
      throw new TypeError('PDF generation is only available in the browser');
    }
    
    // Dynamically import jsPDF to avoid SSR issues
    const { default: jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF('portrait', 'mm', 'a4');
    
    // Add title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Finance Management Report', 105, 20, { align: 'center' });
    
    // Add date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 28, { align: 'center' });
    
    // Add filters info if available
    let startY = 35;
    if (filters) {
      let yPos = 35;
      doc.setFontSize(10);
      doc.text('Applied Filters:', 14, yPos);
      yPos += 7;
      
      if (filters.searchTerm) {
        doc.text(`Search: ${filters.searchTerm}`, 14, yPos);
        yPos += 7;
      }
      if (filters.month) {
        doc.text(`Month: ${filters.month}`, 14, yPos);
        yPos += 7;
      }
      if (filters.startDate || filters.endDate) {
        doc.text(`Date Range: ${filters.startDate || 'All'} to ${filters.endDate || 'All'}`, 14, yPos);
      }
      startY = 60;
    }
    
    // Prepare table data
    const tableData = payments.map(payment => [
      payment.paymentId || '',
      new Date(payment.createdAt).toLocaleDateString(),
      payment.paidFor || '',
      payment.paidBy || '',
      payment.month || '',
      payment.amount.toLocaleString() || '0',
      payment.reference || '',
      payment.isExtra ? 'Yes' : 'No',
      payment.accessgiven ? 'Yes' : 'No',
      payment.status || ''
    ]);
    
    // Add table
    autoTable(doc, {
      head: [['Payment ID', 'Date', 'Paid For', 'Paid By', 'Month', 'Amount', 'Reference', 'Extra', 'Access', 'Status']],
      body: tableData,
      startY,
      styles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
        font: 'helvetica',
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [0, 0, 0],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240],
      },
      margin: { left: 14, right: 14 },
    });
    
    // Add total
    const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    
    // Get the final Y position from the table, or use a default
    const finalY = startY + (payments.length * 5) + 20;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Payments: ${payments.length}`, 14, finalY);
    doc.text(`Total Amount: Rs. ${totalAmount.toLocaleString()}`, 14, finalY + 7);
    
    // Save the PDF
    const fileName = `finance_report_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

