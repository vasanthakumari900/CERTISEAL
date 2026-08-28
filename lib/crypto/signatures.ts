import crypto from 'crypto';

export interface InstitutionKeyPair {
  publicKeyPem: string;
  privateKeyPem: string;
  publicKeyFingerprint: string;
}

/**
 * Generates an Ed25519 signing keypair for an institution.
 */
export function generateInstitutionKeyPair(): InstitutionKeyPair {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });

  const publicKeyFingerprint = crypto
    .createHash('sha256')
    .update(publicKey, 'utf8')
    .digest('hex')
    .slice(0, 16);

  return {
    publicKeyPem: publicKey,
    privateKeyPem: privateKey,
    publicKeyFingerprint: `ED25519-FP-${publicKeyFingerprint.toUpperCase()}`
  };
}

/**
 * Signs a certificate SHA-256 fingerprint using the institution's Ed25519 private key.
 */
export function signFingerprint(fingerprint: string, privateKeyPem: string): string {
  const signatureBuffer = crypto.sign(null, Buffer.from(fingerprint, 'utf8'), privateKeyPem);
  return signatureBuffer.toString('base64');
}

/**
 * Verifies an Ed25519 digital signature against a certificate SHA-256 fingerprint and institution public key.
 */
export function verifySignature(fingerprint: string, signatureBase64: string, publicKeyPem: string): boolean {
  try {
    const signatureBuffer = Buffer.from(signatureBase64, 'base64');
    return crypto.verify(null, Buffer.from(fingerprint, 'utf8'), publicKeyPem, signatureBuffer);
  } catch (error) {
    return false;
  }
}
