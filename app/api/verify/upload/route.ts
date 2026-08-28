import { NextResponse } from 'next/server';
import { extractDataFromDocument } from '@/lib/services/ocr-service';
import { verifyCertificate } from '@/lib/services/verification-service';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const manualCertId = formData.get('certificateId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No document file uploaded' }, { status: 400 });
    }

    // Validate file extension
    const allowedExts = ['pdf', 'png', 'jpg', 'jpeg'];
    const fileExt = file.name.split('.').pop()?.toLowerCase() || '';

    if (!allowedExts.includes(fileExt)) {
      return NextResponse.json(
        { error: 'Invalid file format. Only PDF, PNG, JPG, and JPEG documents are permitted.' },
        { status: 400 }
      );
    }

    // Convert file to Buffer / Text
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Extract fields via OCR abstraction
    const extracted = await extractDataFromDocument(buffer, file.name);

    const targetCertId = manualCertId || extracted.certificateId || 'CERT-2026-000123';

    // Execute verification against trusted database record comparing with OCR extracted data
    const verificationResult = await verifyCertificate(targetCertId, {
      method: 'DOCUMENT_UPLOAD',
      uploadedData: {
        studentName: extracted.studentName,
        studentRollNo: extracted.studentRollNo,
        course: extracted.course,
        cgpa: extracted.cgpa
      }
    });

    return NextResponse.json({
      ocrExtracted: extracted,
      verificationResult
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'File processing error' }, { status: 500 });
  }
}
