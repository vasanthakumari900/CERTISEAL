/**
 * Deterministic JSON Canonicalization Algorithm
 * Sorts object keys recursively to ensure consistent serialization for SHA-256 hashing.
 */
export function canonicalize(obj: any): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    return '[' + obj.map(item => canonicalize(item)).join(',') + ']';
  }

  const sortedKeys = Object.keys(obj).sort();
  const parts: string[] = [];

  for (const key of sortedKeys) {
    if (obj[key] !== undefined) {
      parts.push(JSON.stringify(key) + ':' + canonicalize(obj[key]));
    }
  }

  return '{' + parts.join(',') + '}';
}

/**
 * Builds the single authoritative canonical payload protecting all 14 core certificate attributes.
 */
export function buildCertificateCanonicalPayload(cert: {
  certificateId: string;
  institutionId?: string;
  institutionCode?: string;
  studentName: string;
  studentRollNo: string;
  course: string;
  department: string;
  certificateType: string;
  issueDate: string;
  completionDate?: string | null;
  marks?: string | null;
  cgpa?: string | null;
  graduationYear?: string | null;
  additionalMetadata?: string | null;
}): string {
  const structuredData = {
    certificateId: cert.certificateId || '',
    institutionId: cert.institutionId || '',
    institutionCode: cert.institutionCode || '',
    studentName: cert.studentName ? cert.studentName.trim() : '',
    studentRollNo: cert.studentRollNo ? cert.studentRollNo.trim() : '',
    course: cert.course ? cert.course.trim() : '',
    department: cert.department ? cert.department.trim() : '',
    certificateType: cert.certificateType ? cert.certificateType.trim() : '',
    issueDate: cert.issueDate ? cert.issueDate.trim() : '',
    completionDate: cert.completionDate ? cert.completionDate.trim() : '',
    marks: cert.marks ? String(cert.marks).trim() : '',
    cgpa: cert.cgpa ? String(cert.cgpa).trim() : '',
    graduationYear: cert.graduationYear ? String(cert.graduationYear).trim() : '',
    additionalMetadata: cert.additionalMetadata ? String(cert.additionalMetadata).trim() : ''
  };

  return canonicalize(structuredData);
}
