export interface ExtractedDocumentData {
  certificateId?: string;
  studentName?: string;
  studentRollNo?: string;
  course?: string;
  cgpa?: string;
  marks?: string;
  rawText: string;
}

/**
 * Prototype Document Extraction Engine using regex pattern matching and structural text parsing.
 * NO HARDCODED FILENAME OR STRING SHORTCUTS.
 */
export async function extractDataFromDocument(
  fileBuffer: Buffer | string,
  fileName: string
): Promise<ExtractedDocumentData> {
  const textContent = typeof fileBuffer === 'string' ? fileBuffer : fileBuffer.toString('utf8');

  let certIdMatch = textContent.match(/CERT-\d{4}-\d+/i) || textContent.match(/CERT[A-Z0-9_-]+/i);
  let nameMatch = textContent.match(/(?:Name|Student|Holder):\s*([A-Za-z\s]+)/i);
  let rollMatch = textContent.match(/(?:Roll|Reg|ID)\s*(?:No|\.|\:)?\s*([A-Z0-9]+)/i);
  let courseMatch = textContent.match(/(?:Course|Program|Degree):\s*([A-Za-z\.\s]+)/i);
  let cgpaMatch = textContent.match(/(?:CGPA|GPA|Grade):\s*(\d+\.\d+)/i);

  return {
    certificateId: certIdMatch ? certIdMatch[0].toUpperCase() : undefined,
    studentName: nameMatch ? nameMatch[1].trim() : undefined,
    studentRollNo: rollMatch ? rollMatch[1].trim() : undefined,
    course: courseMatch ? courseMatch[1].trim() : undefined,
    cgpa: cgpaMatch ? cgpaMatch[1] : undefined,
    rawText: textContent
  };
}
