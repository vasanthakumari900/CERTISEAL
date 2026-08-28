import { VerificationResultPayload } from './verification-service';

export function generateVerificationReportHTML(data: VerificationResultPayload): string {
  const isVerified = data.result === 'VERIFIED' || data.result === 'RELEASED';
  const isOnHold = data.result === 'ON_HOLD';
  const isRevoked = data.result === 'REVOKED';
  const isTampered = data.result === 'TAMPERED';

  let statusBg = '#10B981'; // Green
  let statusText = 'AUTHENTIC & VERIFIED';
  if (isOnHold) {
    statusBg = '#F59E0B'; // Amber
    statusText = 'AUTHENTIC — CURRENTLY ON HOLD';
  } else if (isRevoked) {
    statusBg = '#EF4444'; // Red
    statusText = 'CERTIFICATE REVOKED';
  } else if (isTampered) {
    statusBg = '#DC2626'; // Dark Red
    statusText = 'DOCUMENT TAMPERING DETECTED';
  } else if (data.result === 'NOT_FOUND') {
    statusBg = '#6B7280'; // Gray
    statusText = 'RECORD NOT FOUND';
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CERTISEAL HR Verification Report - ${data.referenceId}</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; background: #f8fafc; padding: 40px; margin: 0; }
    .container { max-width: 800px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: 1px; }
    .logo span { color: #2563eb; }
    .badge { background: ${statusBg}; color: white; padding: 8px 16px; border-radius: 6px; font-weight: 700; font-size: 14px; text-transform: uppercase; }
    .ref-box { background: #f1f5f9; padding: 16px; border-radius: 8px; font-family: monospace; font-size: 14px; margin-bottom: 24px; display: flex; justify-content: space-between; }
    .section-title { font-size: 16px; font-weight: 700; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-top: 24px; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
    th { color: #64748b; font-weight: 600; width: 35%; }
    td { color: #0f172a; font-weight: 500; }
    .diff-table th { background: #f8fafc; }
    .diff-mismatch { background: #fef2f2; color: #991b1b; }
    .diff-match { background: #f0fdf4; color: #166534; }
    .proof-box { background: #0f172a; color: #38bdf8; padding: 16px; border-radius: 8px; font-family: monospace; font-size: 12px; word-break: break-all; margin-top: 16px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">CERTI<span>SEAL</span></div>
      <div class="badge">${statusText}</div>
    </div>

    <div class="ref-box">
      <div><strong>Verification Receipt ID:</strong> ${data.referenceId}</div>
      <div><strong>Verified On:</strong> ${new Date(data.verifiedAt).toLocaleString()}</div>
    </div>

    <div class="section-title">Certificate Summary</div>
    <table>
      <tr><th>Certificate ID</th><td>${data.publicId}</td></tr>
      <tr><th>Issued By</th><td>${data.institution?.name || 'Unknown Institution'} (${data.institution?.code || ''})</td></tr>
      <tr><th>Accreditation</th><td>${data.institution?.accreditation || 'N/A'}</td></tr>
      <tr><th>Student Name</th><td>${data.certificateDetails?.studentName || 'N/A'}</td></tr>
      <tr><th>Roll / Reg No</th><td>${data.certificateDetails?.studentRollNo || 'N/A'}</td></tr>
      <tr><th>Program / Course</th><td>${data.certificateDetails?.course || 'N/A'}</td></tr>
      <tr><th>Department</th><td>${data.certificateDetails?.department || 'N/A'}</td></tr>
      <tr><th>CGPA / Marks</th><td>${data.certificateDetails?.cgpa || data.certificateDetails?.marks || 'N/A'}</td></tr>
      <tr><th>Issue Date</th><td>${data.certificateDetails?.issueDate || 'N/A'}</td></tr>
    </table>

    <div class="section-title">Status Explanation & Intelligence Summary</div>
    <p style="font-size: 14px; line-height: 1.6; color: #334155; background: #f8fafc; padding: 14px; border-left: 4px solid #2563eb; border-radius: 4px;">
      ${data.aiExplanation}
    </p>

    ${data.documentComparison ? `
      <div class="section-title">Document Comparison (Submitted vs Trusted Record)</div>
      <table class="diff-table">
        <thead>
          <tr>
            <th>Field Name</th>
            <th>Trusted Institution Record</th>
            <th>Submitted Document Value</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${data.documentComparison.fieldDiffs.map(d => `
            <tr class="${d.isMatch ? 'diff-match' : 'diff-mismatch'}">
              <td><strong>${d.field}</strong></td>
              <td>${d.trustedValue}</td>
              <td>${d.submittedValue}</td>
              <td><strong>${d.isMatch ? '✓ MATCH' : '✕ MISMATCH'}</strong></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    ` : ''}

    <div class="section-title">Cryptographic Trust Proof</div>
    <table>
      <tr><th>SHA-256 Fingerprint</th><td style="font-family: monospace; font-size: 12px;">${data.cryptographicProof.canonicalHash}</td></tr>
      <tr><th>Digital Signature (Ed25519)</th><td style="font-family: monospace; font-size: 12px;">${data.cryptographicProof.signatureValid ? '✓ VERIFIED VALID' : '✕ INVALID'}</td></tr>
      <tr><th>Institution Public Key</th><td style="font-family: monospace; font-size: 12px;">${data.cryptographicProof.publicKeyFingerprint}</td></tr>
      <tr><th>Hash-Chained Ledger</th><td style="font-family: monospace; font-size: 12px;">${data.cryptographicProof.ledgerIntegrityValid ? '✓ INTEGRITY VERIFIED (Tamper-Evident)' : '✕ LEDGER CORRUPTED'}</td></tr>
    </table>

    <div class="footer">
      This document is an official HR verification receipt generated by CERTISEAL Trust Infrastructure.<br/>
      Verification Link: ${process.env.APP_URL || 'http://localhost:3000'}/verify/${data.publicId}
    </div>
  </div>
</body>
</html>`;
}
