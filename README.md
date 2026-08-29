# CERTX — National Digital Certificate Verification & Trust Infrastructure

> **Tagline**: «Verify. Trust. Hire.»
> **Smart India Hackathon (SIH) Grand Finale Evaluation Edition**

CERTX is a cryptographically secured, status-aware digital certificate verification and trust network designed for academic credential integrity, envelope encryption, and instant multi-level HR background checks.

---

## 🏛️ Ecosystem Architecture: Three Isolated Surfaces

CERTX is architected into three distinct web surfaces with strict responsibility separation:

```
                                  CERTX
                             MAIN ECOSYSTEM
                                   |
                +------------------+------------------+
                |                                     |
                v                                     v
          CERTX ONBOARDING                      CERTX PLATFORM
                |                                     |
          +-----+-----+                               |
          |           |                               v
          v           v                          ACTUAL CERTX
       LANDING      ADMIN                          PRODUCT
       WEBSITE      PORTAL                    (AUTH + RBAC)
```

1. **CERTX LANDING WEBSITE** (`Public Surface`):
   - **Routes**: `/`, `/problem`, `/how-it-works`, `/security-architecture`, `/verification-chain`, `/for-institutions`, `/for-students`, `/for-employers`, `/institutions`, `/faq`, `/apply`, `/login`.
   - **Public Onboarding**: Exposes educational explainers, security specs, and `[Apply for CERTX Access]` onboarding forms. Does NOT expose administrative or operational dashboards.

2. **CERTX ADMIN PORTAL** (`Super Admin Surface`):
   - **Routes**: `/admin/dashboard`, `/admin/applications`, `/admin/organizations`, `/admin/ledger`, `/admin/tamper-simulator`.
   - **Governance**: Application review (`Approve`/`Reject`), organization status governance (`PARTICIPATING`, `SUSPENDED`), audit logging, system monitoring, and the SIH Tamper Simulator. Protected strictly by server-side RBAC (`SUPER_ADMIN`).

3. **CERTX PRODUCT PLATFORM** (`Protected Operational Surface`):
   - **Routes**: Mapped role workspaces (`/verify`, `/institution/dashboard`, `/institution/certificates/issue`, `/company/dashboard`, `/student/dashboard`).
   - **Workspaces**: Role-based access for Institution Admins, Faculty Issuers, Employer/HR Verifiers, and Students.

---

## 🔒 Mandatory Envelope Encryption & Key Architecture

CERTX implements an authoritative AES-256-GCM + Per-Certificate DEK + KMS Envelope Encryption pipeline:

```
ISSUER → PLAINTEXT CERTIFICATE
  ↓
GENERATE UNIQUE 256-BIT DEK (crypto.randomBytes(32))
  ↓
AES-256-GCM ENCRYPTION (Fresh IV + Ciphertext + AuthTag)
  ↓
KMS WRAPS DEK (LocalKMSProvider / AWSKMSProvider via KEK)
  ↓
POSTGRESQL DATABASE (Stores Ciphertext, Encrypted DEK, IV, AuthTag, KMS Key ID)
  ↓
VERIFICATION REQUEST → KMS UNWRAP DEK → AES-256-GCM DECRYPT → AUTH TAG CHECK
  ↓
TRUSTED DECRYPTED PAYLOAD → SHA-256 → ED25519 → HASH-CHAIN LEDGER → OCR → LIFECYCLE
```

- **Data Encryption Key (DEK)**: Every single certificate receives a fresh, cryptographically random 256-bit DEK (`crypto.randomBytes(32)`).
- **AES-256-GCM Cipher**: Payload encrypted using AES-256-GCM with fresh 12-byte IV and 16-byte authentication tag.
- **KMS Provider Abstraction**:
  - `LocalKMSProvider`: Development / offline SIH prototype mode (AES-256-GCM Envelope KEK derived from `ENCRYPTION_MASTER_KEY`).
  - `AWSKMSProvider`: Production cloud mode using official `@aws-sdk/client-kms` (`EncryptCommand` & `DecryptCommand`).
- **Fail Closed Security**: Missing KMS secrets or corrupted authentication tags result in immediate server denial (`VERIFICATION_UNAVAILABLE`).

---

## ⚡ 8-Level Cryptographic Verification Chain

1. **LEVEL 1 — Institution Identity**: UGC/AISHE directory registration and active non-suspended status.
2. **LEVEL 2 — Issuer Authentication**: Active Ed25519 key version bound to issuing institution.
3. **LEVEL 3 — Certificate Registry**: Canonical record presence in database trust registry.
4. **LEVEL 4 — SHA-256 Envelope Integrity**: Canonical JSON recalculation from decrypted envelope payload.
5. **LEVEL 5 — Ed25519 Digital Signature**: Signature verification against institution public key fingerprint.
6. **LEVEL 6 — Hash-Chain Ledger**: Genesis-to-tip immutable hash chain validation.
7. **LEVEL 7 — Document & OCR Consistency**: AWS Textract / RegEx document field matching.
8. **LEVEL 8 — Lifecycle Status**: Evaluation of `VERIFIED`, `ON_HOLD`, `RELEASED`, and `REVOKED` states.

---

## 🛠️ Technology Stack & Infrastructure

- **Framework**: Next.js 14 (App Router, TypeScript, React 18, Tailwind CSS)
- **Database**: PostgreSQL (Prisma ORM)
- **Authentication & RBAC**: Bcryptjs password hashing, HMAC SHA-256 session cookies (`certiseal_session`), server-side role permission guards (`requireRole`)
- **Cloud KMS**: AWS KMS (`@aws-sdk/client-kms`) & Local KMS Abstraction
- **Document OCR**: AWS Textract (`@aws-sdk/client-textract`) & Prototype RegEx Extractor
- **Signatures & Fingerprinting**: Ed25519 keypairs, SHA-256 canonical hashing

---

## 🚀 Environment Setup & Deployment

Copy `.env.example` to `.env` and fill in placeholders:

```bash
# PostgreSQL Database Connection
DATABASE_URL="postgresql://user:password@localhost:5432/certx_db?schema=public"

# Session HMAC Signing Secret
AUTH_SECRET="your-long-random-session-secret"

# KMS Provider ('local' for dev/demo, 'aws' for cloud production)
KMS_PROVIDER="local"
ENCRYPTION_MASTER_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

# AWS Cloud Infrastructure (Used when KMS_PROVIDER=aws or OCR_PROVIDER=aws-textract)
AWS_REGION="us-east-1"
AWS_KMS_KEY_ID="arn:aws:kms:us-east-1:123456789012:key/xxxx-xxxx-xxxx"
OCR_PROVIDER="prototype"
```

### Installation & Execution Commands

```bash
# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Seed Database
npm run db:seed

# Run Unit & Integration Test Suite
npm test

# Run TypeScript Typecheck
npx tsc --noEmit

# Production Build
npm run build
```

---

## 📜 Security Policy & Disclaimer

CERTX enforces strict fail-closed security controls. Cryptographic keys, DEKs, KEKs, AWS credentials, and private keys are NEVER exposed to client-side JavaScript, API responses, cookies, or browser local storage.
