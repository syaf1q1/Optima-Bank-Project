// voucherPDF.js
export function downloadVoucher(voucherData, userName, markDownloaded, addNotification) {
  if (!voucherData) return;

  // Prevent duplicate downloads
  if (markDownloaded.has(voucherData.code)) {
    addNotification('⚠️ This voucher has already been downloaded', 'warning');
    return;
  }

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; background: white; }
    .voucher-container { max-width: 600px; margin: 0 auto; border: 2px solid #8C1A6A; padding: 30px; }
    .header { text-align: center; border-bottom: 2px solid #8C1A6A; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { color: #8C1A6A; font-size: 28px; margin-bottom: 5px; letter-spacing: 2px; }
    .header h2 { color: #333; font-size: 18px; font-weight: normal; }
    .info-label { font-weight: bold; color: #555; font-size: 12px; text-transform: uppercase; margin-top: 10px; }
    .voucher-code { background: #f5f5f5; padding: 10px; border-radius: 5px; font-family: 'Courier New', monospace; font-size: 18px; font-weight: bold; letter-spacing: 2px; color: #8C1A6A; }
    .terms { margin-top: 20px; font-size: 13px; color: #666; }
  </style>
</head>
<body>
  <div class="voucher-container">
    <div class="header">
      <h1>OPTIMA BANK</h1>
      <h2>Voucher Redemption</h2>
    </div>
    <p><span class="info-label">Voucher:</span> ${voucherData.name}</p>
    <p><span class="info-label">Code:</span> <span class="voucher-code">${voucherData.code}</span></p>
    <p><span class="info-label">Value:</span> ${voucherData.price} Points</p>
    <p><span class="info-label">Redeemed Date:</span> ${voucherData.date}</p>
    <p><span class="info-label">Expires On:</span> ${voucherData.expires}</p>
    <p><span class="info-label">User:</span> ${userName}</p>

    <div class="terms">
      <b>Terms & Conditions:</b>
      <ul>
        <li>Valid until expiry date</li>
        <li>Cannot be exchanged for cash</li>
        <li>One-time use only</li>
      </ul>
    </div>
  </div>
</body>
</html>`;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(htmlContent);
  printWindow.document.close();

  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
      markDownloaded.add(voucherData.code);
      addNotification('✅ Voucher ready to save as PDF!', 'success');
    }, 500);
  };
}
