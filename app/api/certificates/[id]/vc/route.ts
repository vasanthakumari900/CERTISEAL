import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const cert = await prisma.certificate.findFirst({
      where: { OR: [{ publicId: id }, { id }] },
      include: { institution: true }
    });

    if (!cert || !cert.institution) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
    }

    const instCode = (cert.institution.shortName || 'nitd').toLowerCase();

    // W3C Verifiable Credential standard format
    const verifiableCredential = {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://schema.org"
      ],
      "id": `urn:uuid:${cert.id}`,
      "type": ["VerifiableCredential", "EducationalDegreeCredential"],
      "issuer": {
        "id": `did:certiseal:${instCode}`,
        "name": cert.institution.officialName,
        "accreditation": "UGC Listed"
      },
      "issuanceDate": new Date(cert.issueDate).toISOString(),
      "credentialSubject": {
        "id": `urn:student:roll:${cert.studentRollNo}`,
        "name": cert.studentName,
        "degree": cert.course,
        "department": cert.department,
        "grade": cert.cgpa || cert.marks || 'N/A',
        "certificateType": cert.certificateType,
        "status": cert.status
      },
      "proof": {
        "type": "Ed25519Signature2020",
        "created": cert.createdAt.toISOString(),
        "verificationMethod": `did:certiseal:${instCode}#key-${cert.keyVersion}`,
        "proofPurpose": "assertionMethod",
        "proofValue": cert.digitalSignature,
        "canonicalFingerprint": cert.canonicalHash
      }
    };

    return NextResponse.json(verifiableCredential, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
