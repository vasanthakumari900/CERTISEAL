# CERTISEAL — Digital Trust & Verification Infrastructure Platform

> **Tagline:** «Verify. Trust. Hire.»  
> **Target Event:** Smart India Hackathon (SIH) 2026 Competition Submission  
> **Core Architecture:** Cryptographically Secured, Status-Aware Certificate Verification & Evidence Engine with Append-Only Tamper-Evident Hash Chain.

---

## 📋 Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [Solution Architecture](#2-solution-architecture)
3. [Digital Evidence Chain & 8-Level Trust Model](#3-digital-evidence-chain--8-level-trust-model)
4. [User Roles & RBAC Matrix](#4-user-roles--rbac-matrix)
5. [Verification Workflow Engine](#5-verification-workflow-engine)
6. [Security & Cryptographic Specifications](#6-security--cryptographic-specifications)
7. [Ed25519 & Canonical SHA-256 Specifications](#7-ed25519--canonical-sha-256-specifications)
8. [Tamper-Evident Database Hash Chain Ledger](#8-tamper-evident-database-hash-chain-ledger)
9. [Demo Scenarios & 5-Minute Pitch Script](#9-demo-scenarios--5-minute-pitch-script)
10. [Positioning & Comparison Matrix ("WHY CERTISEAL?")](#10-positioning--comparison-matrix-why-certiseal)
11. [Technical Limitations & Honest Disclosures](#11-technical-limitations--honest-disclosures)
12. [Future Scalability & Interoperability Roadmap](#12-future-scalability--interoperability-roadmap)
13. [Local Setup & Installation Instructions](#13-local-setup--installation-instructions)
14. [Environment Configuration Variables](#14-environment-configuration-variables)
15. [Automated Test Suite Execution](#15-automated-test-suite-execution)
16. [Seed Data & Pre-Seeded Demo Credentials](#16-seed-data--pre-seeded-demo-credentials)
17. [Prototype vs. Production Distinctions](#17-prototype-vs-production-distinctions)

---

## 1. Problem Statement

Academic document fraud costs global organizations billions annually and delays recruitment background checks by 3 to 6 weeks. Traditional verification relies on unverified physical paper documents, manual phone/email outreach to registrar offices, and basic QR codes that simply point to unauthenticated PDF web links.

Moreover, existing verification software oversimplifies academic status into a naive binary result: `"Genuine"` or `"Fake"`. In reality, authentic certificates can be subject to temporary administrative holds (e.g. library clearance or tuition dues), which should **never** be labeled as fake credentials.

---

## 2. Solution Architecture

**CERTISEAL** introduces an evidence-based **Digital Trust and Verification Layer** designed to connect accredited educational institutions, candidate job applicants, and employer HR teams in under 2 seconds.

```
+-----------------------------------------------------------------------------------+
|               CERTISEAL DIGITAL TRUST & EVIDENCE CHAIN LAYER                      |
+-----------------------------------------------------------------------------------+
| 1. Institution Identity    ---> Registered in UGC / AISHE Master Snapshot         |
| 2. Institution Status      ---> PARTICIPATING on CERTISEAL Trust Registry       |
| 3. Authorized Issuer       ---> Faculty / Admin with Ed25519 Signing Permission   |
| 4. Certificate Integrity   ---> SHA-256 Canonical Fingerprint Match             |
| 5. Issuer Authentication   ---> Ed25519 Digital Signature Validated              |
| 6. Ledger Evidence         ---> Append-Only Hash Chain Genesis-to-Tip Intact     |
| 7. Certificate Lifecycle   ---> Status is VERIFIED / RELEASED (Not ON_HOLD/REVOKED)|
| 8. Document Consistency    ---> Uploaded PDF matches Canonical Record Fields     |
+-----------------------------------------------------------------------------------+
```

---

## 3. Digital Evidence Chain & 8-Level Trust Model

Rather than asking *"Does this file exist?"*, CERTISEAL evaluates credentials across an 8-level trust hierarchy:

| Level | Trust Hierarchy Check | Technical & Administrative Meaning |
| :--- | :--- | :--- |
| **Level 1** | **Institution Trust** | Is the institution recognized in national UGC/AISHE master registries? |
| **Level 2** | **Issuer Authentication** | Is the issuing officer authorized with an active Ed25519 keypair? |
| **Level 3** | **Certificate Registry** | Does the canonical certificate record exist in the trusted database? |
| **Level 4** | **Data Integrity** | Does the structured payload match the SHA-256 canonical hash fingerprint? |
| **Level 5** | **Digital Signature** | Is the Ed25519 signature valid against the institution public key? |
| **Level 6** | **Ledger Continuity** | Is the append-only database hash chain intact from Genesis to Tip? |
| **Level 7** | **Document Consistency** | Does uploaded physical PDF data match trusted record field-by-field? |
| **Level 8** | **Lifecycle Status** | What is the administrative status (`VERIFIED`, `ON_HOLD`, `RELEASED`, `REVOKED`)? |

---

## 4. User Roles & RBAC Matrix

CERTISEAL implements Role-Based Access Control (RBAC) supporting 5 distinct roles, accessible via the top-right **Floating SIH Judge Demo Switcher**:

1. **Super Admin (`superadmin@certiseal.gov.in`)**: Platform governance, institution onboarding approvals, security alert monitoring, live ledger scanner.
2. **Institution Admin (`admin@nit.ac.in`)**: Institution profile management, Ed25519 signing key generation and key rotation.
3. **Faculty / Authorized Issuer (`priya.sharma@nit.ac.in`)**: Issue certificates with canonical JSON payload rendering, SHA-256 hashing, and Ed25519 signing.
4. **Employer / HR Verifier (`recruiter@tata.com`)**: Triple-mode verification (QR camera scan, Certificate ID, PDF upload with OCR mismatch table), downloadable PDF HR reports (`VER-2026-XXXXXXXX`).
5. **Student / Candidate (`rahul.kumar@student.nit.ac.in`)**: Credential vault, W3C Verifiable Credentials JSON-LD export, privacy-preserving selective disclosure share links.

---

## 5. Verification Workflow Engine

CERTISEAL provides 7 deterministic verification output states:

- **`AUTHENTIC + VERIFIED`**: Valid issued credential; all cryptographic and status checks passed.
- **`AUTHENTIC + ON_HOLD`**: Authentically issued, but placed on temporary administrative hold by the institution.
- **`AUTHENTIC + RELEASED`**: Certificate previously on hold, officially cleared and released by institution.
- **`AUTHENTIC + REVOKED`**: Legitimately issued but officially cancelled due to misconduct or administrative cancellation.
- **`TAMPERED`**: Submitted PDF document data or cryptographic signature conflicts with the canonical record digest.
- **`NOT_FOUND`**: No trusted institutional record exists.
- **`VERIFICATION_UNAVAILABLE`**: Institution exists in national registry but has not yet onboarded to CERTISEAL.

---

## 6. Security & Cryptographic Specifications

- **Deterministic Canonicalization**: Sorts object keys recursively to ensure identical inputs always generate matching digests (`lib/crypto/canonical.ts`).
- **Ed25519 Asymmetric Signatures**: 256-bit security level using Ed25519 keypairs in SPKI/PKCS8 PEM format (`lib/crypto/signatures.ts`).
- **AES-256-GCM Payload Encryption**: Authenticated symmetric encryption for candidate PII fields (`lib/crypto/encryption.ts`).
- **Append-Only Ledger**: Hash-chained database blocks linking `previous_hash` to `current_hash` from `GENESIS`.

---

## 7. Ed25519 & Canonical SHA-256 Specifications

### Canonicalization Algorithm
```ts
// Structured fields are recursively key-sorted before hashing
const canonicalJson = JSON.stringify(sortObjectKeys(data));
const sha256Fingerprint = crypto.createHash('sha256').update(canonicalJson).digest('hex');
```

Any field modification (e.g. changing CGPA `8.72` $\rightarrow$ `9.72`) completely alters the resulting 64-character SHA-256 fingerprint string.

---

## 8. Tamper-Evident Database Hash Chain Ledger

CERTISEAL implements a lightweight, tamper-evident database hash chain ledger:

```
[GENESIS BLOCK] ---> [BLOCK #001: ISSUANCE] ---> [BLOCK #002: STATUS_HOLD] ---> [BLOCK #003: TIP]
  prev: GENESIS        prev: Hash(Genesis)         prev: Hash(Block 001)        prev: Hash(Block 002)
```

Administrators can audit the ledger live at `/admin/ledger`. If any database row is modified out-of-band, the **Ledger Integrity Scanner** flags the broken chain in **RED**.

---

## 9. Demo Scenarios & 5-Minute Pitch Script

Follow this 5-minute evaluation script during SIH judging:

1. **0:00 - 0:30 (Problem & Positioning)**: Introduce CERTISEAL as a Digital Trust and Verification Layer.
2. **0:30 - 1:15 (Issue Certificate)**: Switch to `Faculty Issuer` $\rightarrow$ Issue certificate for `Rahul Kumar` $\rightarrow$ Inspect SHA-256 digest and Ed25519 signature seal.
3. **1:15 - 2:00 (Verify Authentic Certificate)**: Switch to `Employer/HR` $\rightarrow$ Search `CERT-2026-000123` $\rightarrow$ Expand "WHY CAN I TRUST THIS?" panel.
4. **2:00 - 2:45 (Document Tamper Simulator)**: Go to `/verify` $\rightarrow$ Select `DOCUMENT UPLOAD` $\rightarrow$ Click "Simulate Uploading Modified Document (CGPA 8.72 → 9.72)" $\rightarrow$ Inspect red field mismatch table.
5. **2:45 - 3:30 (ON_HOLD Lifecycle Handling)**: Verify `CERT-2026-000124` $\rightarrow$ Show explicit administrative hold notice avoiding false fake labels.
6. **3:30 - 4:15 (Ledger Integrity Audit)**: Go to `/admin/ledger` $\rightarrow$ Click `RUN LEDGER INTEGRITY SCAN` $\rightarrow$ Simulate block tamper $\rightarrow$ Observe RED alert $\rightarrow$ Restore chain.
7. **4:15 - 5:00 (HR Report Download)**: Click `Download HR Report` to view the printable verification receipt (`VER-2026-XXXXXXXX`).

---

## 10. Positioning & Comparison Matrix ("WHY CERTISEAL?")

| Capability / Feature | DigiLocker / NAD | Blockchain Systems | Traditional QR | CERTISEAL |
| :--- | :--- | :--- | :--- | :--- |
| **Primary Purpose** | Document storage repository | Immutable ledger | Static PDF URL link | **Trust & Verification Layer** |
| **Institution Authorization** | Government issuer directory | Public Key Address | Unverified domain | **UGC/AISHE Snapshot + Ed25519** |
| **Status-Aware Lifecycle** | Static lookup | Hard to update state | Binary (Found/Not Found) | **VERIFIED, ON_HOLD, REVOKED** |
| **Document Field Mismatch** | Manual visual check | Not supported | Not supported | **Automated OCR Mismatch Table** |
| **Explainable Evidence** | Basic confirmation | Block explorer string | Webpage redirect | **"WHY CAN I TRUST THIS?" Panel** |
| **Employer HR Receipts** | View document | View transaction | View PDF | **Downloadable PDF Receipt** |

---

## 11. Technical Limitations & Honest Disclosures

- **Zero Blockchain Hype**: CERTISEAL relies on an append-only database hash chain. This provides identical tamper-evident auditability without gas costs or slow block times.
- **OCR Boundaries**: OCR field extraction is an automated assistance layer. Cryptographic trust is determined strictly by verifying signature digests against trusted records.
- **Scope**: CERTISEAL verifies credentials issued by accredited participating institutions. Absence of a record signifies no sealed entry exists on CERTISEAL, not definitive proof of forgery.

---

## 12. Future Scalability & Interoperability Roadmap

- **DigiLocker / APAAR Integration**: API adapters for syncing verified issuance records with APAAR IDs and DigiLocker repositories.
- **Bulk CSV Batch Sealing**: High-throughput issuance worker for university registrars sealing 10,000+ certificates per batch.
- **W3C Verifiable Credentials (VC) / DID Standards**: Full Decentralized Identifier (DID) resolution integration for global interoperability.

---

## 13. Local Setup & Installation Instructions

### Prerequisites
- Node.js v18+ or v20+
- npm v9+

### Quick Start
```bash
# 1. Install dependencies
npm install

# 2. Push Prisma database schema (SQLite)
npx prisma db push

# 3. Seed deterministic master demo dataset
npm run db:seed

# 4. Run automated test suite
npm test

# 5. Start development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 14. Environment Configuration Variables

Exemplified in `.env.example`:

```env
DATABASE_URL="file:./dev.db"
PORT=3000
NODE_ENV="development"
JWT_SECRET="certiseal-sih-2026-master-secret-key"
AES_256_ENCRYPTION_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
```

---

## 15. Automated Test Suite Execution

Run the complete test suite:

```bash
npm test
```

**Test Coverage Output:**
- Canonicalization key sorting independence
- SHA-256 fingerprint determinism & sensitivity
- Ed25519 digital signature signing & public key validation
- AES-256-GCM payload encryption/decryption
- National Trust Registry search & state filtering
- 7-state verification engine execution (`VERIFIED`, `ON_HOLD`, `REVOKED`, etc.)
- Controlled demo tamper simulator breach & restore flow
- Genesis-to-Tip database ledger scanner pass

---

## 16. Seed Data & Pre-Seeded Demo Credentials

| Certificate ID | Candidate Name | Course / Program | Lifecycle Status | Institution |
| :--- | :--- | :--- | :--- | :--- |
| `CERT-2026-000123` | Rahul Kumar | B.Sc Computer Science | `VERIFIED` | NIT Trichy |
| `CERT-2026-000124` | Anita Sharma | B.Tech Electrical | `ON_HOLD` | NIT Trichy |
| `CERT-2026-000125` | Vikram Singh | BCA Transfer Cert | `RELEASED` | IIT Madras |
| `CERT-2026-000126` | Rajesh Verma | Cybersecurity Diploma | `REVOKED` | IIT Madras |
| `INST-TN-000999` | ABC College | Engineering | `NOT_ONBOARDED` | ABC Engineering |

---

## 17. Prototype vs. Production Distinctions

| Feature Component | Prototype Implementation (Implemented Now) | Production Architecture (Future Roadmap) |
| :--- | :--- | :--- |
| **Database** | SQLite with Prisma ORM | PostgreSQL / CockroachDB with read replicas |
| **Cryptography** | Node.js Ed25519 & AES-256-GCM | Hardware Security Module (HSM) / KMS Key Management |
| **Ledger Storage** | SQLite Append-Only Hash Chain | Multi-Region Distributed Tamper-Evident Ledger |
| **Document Processing** | Local OCR Extraction Engine | Scalable Serverless OCR Worker Queue |

---

*CERTISEAL — Smart India Hackathon 2026 Technical Submission*
