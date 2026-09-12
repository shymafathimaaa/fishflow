import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { Order } from '../types';

/**
 * Generates a high-quality printable PDF document for a FishFlow Market Token.
 */
export async function generateTokenPDF(order: Order): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5', // Compact printable A5 ticket format (148mm x 210mm)
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Color Palette
  const deepNavy = [15, 23, 42];     // #0f172a
  const oceanBlue = [2, 132, 199];   // #0284c7
  const lightBg = [248, 250, 252];    // #f8fafc
  const cardBg = [240, 249, 255];     // #f0f9ff
  const textDark = [30, 41, 59];     // #1e293b
  const textMuted = [100, 116, 139];  // #64748b

  // 1. Header Banner
  doc.setFillColor(deepNavy[0], deepNavy[1], deepNavy[2]);
  doc.rect(0, 0, pageWidth, 30, 'F');

  // Brand Header Logo & Name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('FishFlow', 12, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(56, 189, 248); // #38bdf8
  doc.text('Fresh fish. Less waiting.', 12, 23);

  // Badge Text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('OFFICIAL DIGITAL MARKET TOKEN', pageWidth - 12, 18, { align: 'right' });

  // 2. Main Token Number Box
  doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
  doc.roundedRect(12, 35, pageWidth - 24, 40, 3, 3, 'F');
  doc.setDrawColor(186, 230, 253);
  doc.setLineWidth(0.4);
  doc.roundedRect(12, 35, pageWidth - 24, 40, 3, 3, 'S');

  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('TOKEN NUMBER', pageWidth / 2, 42, { align: 'center' });

  doc.setTextColor(oceanBlue[0], oceanBlue[1], oceanBlue[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(30);
  doc.text(order.token, pageWidth / 2, 55, { align: 'center' });

  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text(
    `Estimated Wait: ~${order.estimatedWaitMinutes} mins   |   Orders Ahead: ${order.ordersAhead}   |   Status: ${order.status}`,
    pageWidth / 2,
    68,
    { align: 'center' }
  );

  // 3. QR Code Generation & Positioning
  let qrDataUrl = '';
  try {
    const qrPayload = JSON.stringify({
      token: order.token,
      orderId: order.id,
      customer: order.customerName,
      weight: `${order.totalWeightKg}kg`,
      status: order.status,
      timestamp: order.createdAt,
    });
    qrDataUrl = await QRCode.toDataURL(qrPayload, {
      width: 200,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });
  } catch (e) {
    console.error('Failed to generate QR Code for PDF:', e);
  }

  // Draw QR Code on right side of details section
  if (qrDataUrl) {
    doc.addImage(qrDataUrl, 'PNG', pageWidth - 42, 82, 30, 30);
  }

  // 4. Order Information Section
  let yPos = 83;
  doc.setTextColor(deepNavy[0], deepNavy[1], deepNavy[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('CUSTOMER & ORDER METADATA', 12, yPos);

  yPos += 4;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(12, yPos, pageWidth - 46, yPos);

  yPos += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Customer Name:', 12, yPos);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(order.customerName, 40, yPos);

  yPos += 5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Order Reference:', 12, yPos);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(order.id, 40, yPos);

  yPos += 5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Order Timestamp:', 12, yPos);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFont('helvetica', 'normal');
  const dateStr = new Date(order.createdAt).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  doc.text(dateStr, 40, yPos);

  // 5. Items Breakdown Table
  yPos += 10;
  doc.setFillColor(241, 245, 249);
  doc.rect(12, yPos, pageWidth - 24, 7, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('FISH ITEM DESCRIPTION', 16, yPos + 4.8);
  doc.text('QTY', 75, yPos + 4.8);
  doc.text('PREPARATION', 95, yPos + 4.8);
  doc.text('SUBTOTAL', pageWidth - 16, yPos + 4.8, { align: 'right' });

  yPos += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);

  order.items.forEach((item) => {
    yPos += 6;
    doc.text(item.fishName.substring(0, 28), 16, yPos);
    doc.text(`${item.quantityKg} kg`, 75, yPos);
    doc.text(item.preparation, 95, yPos);
    doc.text(`₹${item.subtotal}`, pageWidth - 16, yPos, { align: 'right' });
  });

  yPos += 6;
  doc.setDrawColor(226, 232, 240);
  doc.line(12, yPos, pageWidth - 12, yPos);

  yPos += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(`Total Weight: ${order.totalWeightKg} kg`, 12, yPos);
  
  doc.setTextColor(oceanBlue[0], oceanBlue[1], oceanBlue[2]);
  doc.setFontSize(10.5);
  doc.text(`Total Demo Amount: ₹${order.totalAmount}`, pageWidth - 12, yPos, { align: 'right' });

  // 6. Printable Footer Guidance
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.line(0, pageHeight - 20, pageWidth, pageHeight - 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Please present this token at the FishFlow counter when your token ID is called.', pageWidth / 2, pageHeight - 12, { align: 'center' });
  doc.text(`Track Live Status: http://localhost:3000/track/${order.token}`, pageWidth / 2, pageHeight - 6, { align: 'center' });

  // Trigger browser download
  doc.save(`FishFlow_Token_${order.token}.pdf`);
}
