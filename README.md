# CERTISEAL — Certificate Verification & Trust Infrastructure Platform

> **Tagline:** «Verify. Trust. Hire.»  
> **Target Event:** Smart India Hackathon (SIH) Evaluation  
> **Architecture:** Cryptographically Secured, Status-Aware Certificate Verification Engine with Append-Only Tamper-Evident Ledger.

---

## 🚀 Executive Summary

Educational credential fraud and document tampering cost organizations billions annually and delay recruitment processes by weeks. Current verification relies on phone calls, manual document checks, unverified photocopies, and slow institutional responses.

**CERTISEAL** provides a production-grade digital verification platform where institutions cryptographically seal certificates at issuance time, allowing employers, universities, and verification agencies to verify candidate qualifications in **under 2 seconds**.

Unlike basic CRUD projects that simply output `"Genuine / Fake"`, CERTISEAL introduces a **Status-Aware Verification Engine** that understands the real academic certificate lifecycle:

| Status State | Technical & Administrative Meaning |
| :--- | :--- |
| **`VERIFIED`** | Certificate issued by authorized institution, cryptographically verified, and currently valid. |
| **`ON_HOLD`** | **Primary Differentiator**: Authentic certificate, but institution has placed a temporary administrative hold (e.g. pending library clearance). **Explicitly avoids falsely labeling authentic documents as fake.** |
| **`RELEASED`** | Certificate was previously on hold and has been officially cleared and released by institution. |
| **`REVOKED`** | Certificate was legitimately issued but subsequently cancelled due to academic misconduct or record cancellation. |
| **`TAMPERED`** | Submitted document data or cryptographic signature does not match the canonical SHA-256 fingerprint stored at issuance. |
| **`NOT_FOUND`** | No trusted institutional record exists in the trust registry. |

---

## 🔒 Cryptographic Architecture

CERTISEAL implements actual cryptographic operations using standard primitives without superficial string simulation:

```
+--------------------------+       +------------------------------+       +-----------------------------+
|  Structured Cert Data    |  ---> | Deterministic Canonicalization|  ---> | SHA-256 Fingerprint Gen     |
| (Name, Roll, CGPA, etc.) |       |  (Recursive Key-Sorting)     |       | (64-character Hex Hash)     |
+--------------------------+       +------------------------------+       +-----------------------------+
                                                                                      |
                                                                                      v
+--------------------------+       +------------------------------+       +-----------------------------+
| Append-Only Ledger Block |  <--- |  AES-256-GCM Confidential   |  <--- | Ed25519 Digital Signature   |
| (Previous Hash Chain)    |       |   Payload Encryption         |       | (Institution Keypair)       |
+--------------------------+       +------------------------------+       +-----------------------------+
```

1. **Deterministic Canonicalization (`SHA-256`)**:
   Certificate attributes are sorted recursively to guarantee that identical structured data always produces the exact same hash digest. Any field modification (e.g. changing CGPA from `8.72` to `9.72`) alters the fingerprint completely.
2. **Ed25519 Digital Signatures**:
   Each educational institution generates and maintains an independent Ed25519 signing keypair (`spki`/`pkcs8` PEM format). The institution signs the SHA-256 fingerprint at issuance time. Verification validates the signature against the institution's public key.
3. **AES-256-GCM Authenticated Encryption**:
   Sensitive student fields (such as roll number and identity records) are encrypted at rest using AES-256-GCM with authenticated tags, preventing unauthorized data exposure.
4. **Append-Only Tamper-Evident Hash Chain**:
   Every database operation records `previous_hash` chained to `current_hash` starting from the `GENESIS` block. CERTISEAL features an administrative **Ledger Integrity Scanner** that audits every block from Genesis to Tip, highlighting pristine chains in **GREEN** and corrupted blocks in **RED**.

---

## 👥 Role-Based Access Control (RBAC)

CERTISEAL includes a 1-click **Floating SIH Judge Demo Switcher** at the top right of the navigation header:

1. **Role 1 — Super Admin (`superadmin@certiseal.gov.in`)**:
   Platform governance, institution approvals, security alert monitoring, live ledger scanner.
2. **Role 2 — Institution Admin (`admin@nit.ac.in`)**:
   Institution profile, Ed25519 key management, key rotation, hold/release/revocation lifecycle controls.
3. **Role 3 — Faculty / Authorized Issuer (`priya.sharma@nit.ac.in`)**:
   Issue new certificates with dynamic forms, instant cryptographic sealing, and QR code generation.
4. **Role 4 — Company / Employer (`recruiter@tata.com`)**:
   Triple-mode verification (QR camera scan, Certificate ID lookup, document upload with OCR field diff comparison), PDF HR verification receipts (`VER-2026-XXXXXXXX`).
5. **Role 5 — Student (`rahul.kumar@student.nit.ac.in`)**:
   View personal certificates, check verification status, download/share public verification links.

---

## 🎯 13-Step SIH Judge Demonstration Flow

Follow this 3-minute sequence to evaluate the complete platform capabilities:

1. **Step 1 — Login as Institution Admin**: Click the top right Demo Switcher and select `Institution Admin`.
2. **Step 2 — Issue New Certificate**: Click `+ ISSUE NEW CERTIFICATE`. Fill in candidate details (or leave default `Rahul Kumar`, `CGPA 8.72`).
3. **Step 3 — Inspect Cryptographic Seal**: Observe the real-time canonical JSON output, SHA-256 fingerprint, Ed25519 digital signature, and ledger block creation. Click `CRYPTOGRAPHICALLY SEAL & ISSUE`.
4. **Step 4 — Switch to Employer Role**: Click Demo Switcher -> select `Employer / HR`.
5. **Step 5 — Verify Authentic Certificate**: Search Certificate ID `CERT-2026-000123`. Confirm `✓ AUTHENTIC CERTIFICATE - Status: VERIFIED`.
6. **Step 6 — Technical Details Drawer**: Expand "Technical Cryptographic Proof Details" to show judges the SHA-256 string, Ed25519 signature base64, AES-256-GCM ciphertext payload, and public key fingerprint.
7. **Step 7 — Demonstrate ON_HOLD Status**: Verify `CERT-2026-000124` (Anita Sharma). Confirm status displays **`ON_HOLD`** with explicit note: *"Authentic certificate — currently on institutional hold."*
8. **Step 8 — Demonstrate REVOKED Status**: Verify `CERT-2026-000126` (Rajesh Verma). Confirm status displays **`REVOKED`** with revocation date, actor, and reason.
9. **Step 9 — Demonstrate Document Tampering**: Go to `/verify` -> Select `METHOD C: DOCUMENT UPLOAD & OCR` -> Click "Simulate Uploading Modified Document (CGPA 8.72 → 9.72)".
10. **Step 10 — Observe Tampering Mismatch Table**: Confirm status displays **`⚠ DOCUMENT TAMPERING DETECTED`** and highlights the exact mismatched CGPA field in RED!
11. **Step 11 — Super Admin Governance & Live Ledger Scan**: Switch role to `Super Admin` -> Go to Dashboard -> Click `RUN LEDGER INTEGRITY SCAN`. Observe Genesis-to-Tip green validation pass.
12. **Step 12 — Rotate Ed25519 Key**: Switch to `Institution Admin` -> Click `Rotate Ed25519 Keys`. Notice new key version v2 generated while old certificates remain 100% verifiable!
13. **Step 13 — Download HR Verification Report**: Click `Download HR Report` to view the formal printable PDF verification receipt (`VER-2026-XXXXXXXX`).

---

## 🛠️ Local Development & Testing Instructions

### Prerequisites
- Node.js v18+ or v20+
- npm v9+

### Setup & Run
```bash
# 1. Install dependencies
npm install

# 2. Push database schema (SQLite / Prisma)
npx prisma db push

# 3. Seed realistic demo data (3 Institutions, 20+ Certificates across all 6 states)
npm run db:seed

# 4. Run automated test suite (Unit & Integration tests)
npm test

# 5. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚖️ Technical Integrity & Honesty Disclosure

- **Zero Blockchain Hype**: CERTISEAL uses an append-only database hash chain. This provides identical tamper-evident security without public blockchain gas fees, slow block times, or privacy law violations.
- **OCR Limitations**: OCR is implemented as an extraction assistance layer for uploaded documents. Cryptographic trust is determined strictly by comparing extracted fields against the institutional digital signature.
- **Scope**: CERTISEAL verifies certificates registered by participating accredited institutions. Absence of a record indicates no sealed record exists on CERTISEAL, not proof of forgery.
