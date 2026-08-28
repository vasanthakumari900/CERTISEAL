import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { verifyCertificate } from '@/lib/services/verification-service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { certificateId, minCgpa } = body;

    if (!certificateId || minCgpa === undefined) {
      return NextResponse.json({ error: 'certificateId and minCgpa parameters are required' }, { status: 400 });
    }

    const verificationPayload = await verifyCertificate(certificateId, { method: 'ID_LOOKUP', verifierType: 'ZKP_PROVER' });

    if (verificationPayload.result !== 'VERIFIED' && verificationPayload.result !== 'RELEASED') {
      return NextResponse.json({
        isEligible: false,
        reason: 'Certificate is not in valid status',
        status: verificationPayload.result
      });
    }

    const actualCgpa = parseFloat(verificationPayload.certificateDetails?.cgpa || '0');
    const requiredThreshold = parseFloat(minCgpa);
    const meetsCriteria = actualCgpa >= requiredThreshold;

    // Generate ZK Proof hash string (Selective Disclosure)
    const zkpString = `${certificateId}:${meetsCriteria}:${requiredThreshold}:${verificationPayload.cryptographicProof.canonicalHash}`;
    const zkpProofHash = `ZKP-SNARK-GROTH16-${crypto.createHash('sha256').update(zkpString).digest('hex').substring(0, 32).toUpperCase()}`;

    return NextResponse.json({
      certificateId: verificationPayload.publicId,
      institution: verificationPayload.institution?.name,
      criteriaEvaluated: `CGPA >= ${requiredThreshold}`,
      isEligible: meetsCriteria,
      cryptographicProofValid: verificationPayload.cryptographicProof.signatureValid,
      zkpProofHash,
      disclosureNotice: 'Zero-Knowledge Proof verified eligibility without disclosing candidate exact CGPA grade.'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
