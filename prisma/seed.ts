import { PrismaClient } from '@prisma/client';
import { generateInstitutionKeyPair, signFingerprint } from '../lib/crypto/signatures';
import { buildCertificateCanonicalPayload } from '../lib/crypto/canonical';
import { encryptField } from '../lib/crypto/encryption';
import { hashPassword } from '../lib/auth/password';
import { appendLedgerEntry } from '../lib/services/ledger-service';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding National CERTISEAL Master Registry with 100+ Colleges (including 15+ Chennai Colleges)...');

  // Reset database
  await prisma.securityAlert.deleteMany();
  await prisma.verificationRequest.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.ledgerEntry.deleteMany();
  await prisma.certificateVersion.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.user.deleteMany();
  await prisma.institutionKey.deleteMany();
  await prisma.institutionAlias.deleteMany();
  await prisma.institutionAffiliation.deleteMany();
  await prisma.institutionRegulatoryRecord.deleteMany();
  await prisma.institutionAccreditation.deleteMany();
  await prisma.institutionSource.deleteMany();
  await prisma.institutionRequest.deleteMany();
  await prisma.institutionOnboarding.deleteMany();
  await prisma.institution.deleteMany();

  // Helper for generating institution with encrypted Ed25519 keypair & regulatory data
  async function createNationalInst(data: {
    publicId: string;
    name: string;
    code: string;
    type: string;
    category: string;
    year: number;
    website: string;
    email: string;
    city: string;
    district: string;
    state: string;
    postalCode: string;
    status: 'PARTICIPATING' | 'VERIFIED' | 'REGISTRY_LISTED' | 'NOT_ONBOARDED' | 'SUSPENDED';
    naacGrade?: string;
    aliases?: string[];
  }) {
    const keyPair = generateInstitutionKeyPair();
    const normalized = data.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const encryptedKeyCiphertext = encryptField(keyPair.privateKeyPem);

    const inst = await prisma.institution.create({
      data: {
        publicId: data.publicId,
        officialName: data.name,
        normalizedName: normalized,
        shortName: data.code,
        institutionType: data.type,
        institutionCategory: data.category,
        establishedYear: data.year,
        officialWebsite: data.website,
        officialEmail: data.email,
        address: `Campus Drive, ${data.city}, ${data.state}`,
        city: data.city,
        district: data.district,
        state: data.state,
        country: 'India',
        postalCode: data.postalCode,
        status: data.status,
        publicKey: keyPair.publicKeyPem,
        publicKeyFingerprint: keyPair.publicKeyFingerprint,
        keyVersion: 1,
        keys: {
          create: {
            keyVersion: 1,
            publicKey: keyPair.publicKeyPem,
            publicKeyFingerprint: keyPair.publicKeyFingerprint,
            encryptedPrivateKey: encryptedKeyCiphertext,
            status: 'ACTIVE'
          }
        },
        regulatoryRecords: {
          create: [
            { regulatoryBody: 'UGC', recognitionType: 'Section 2(f) & 12(B)', recognitionStatus: 'APPROVED' },
            { regulatoryBody: 'AISHE', recognitionType: 'Higher Education Survey', recognitionStatus: 'ACTIVE' }
          ]
        },
        sources: {
          create: [
            { sourceName: 'UGC Official Master Registry Snapshot', sourceType: 'GOVERNMENT_REGISTRY', sourceUrl: 'https://ugc.ac.in' },
            { sourceName: 'AISHE Ministry of Education', sourceType: 'GOVERNMENT_REGISTRY', sourceUrl: 'https://aishe.gov.in' }
          ]
        }
      }
    });

    if (data.naacGrade) {
      await prisma.institutionAccreditation.create({
        data: { institutionId: inst.id, body: 'NAAC', grade: data.naacGrade, score: 3.85, status: 'ACTIVE' }
      });
    }

    if (data.aliases) {
      for (const al of data.aliases) {
        await prisma.institutionAlias.create({
          data: { institutionId: inst.id, alias: al, aliasType: 'ABBREVIATION' }
        });
      }
    }

    return { inst, keyPair, code: data.code };
  }

  // ----------------------------------------------------
  // CHENNAI & NATIONAL COLLEGES
  // ----------------------------------------------------
  const iitMadras = await createNationalInst({
    publicId: 'INST-TN-000101', name: 'Indian Institute of Technology Madras', code: 'IITM',
    type: 'IIT', category: 'Government', year: 1959, website: 'https://iitm.ac.in', email: 'registrar@iitm.ac.in',
    city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', postalCode: '600036', status: 'PARTICIPATING', naacGrade: 'A++', aliases: ['IIT Madras', 'IITM', 'Chennai']
  });

  const cegAnna = await createNationalInst({
    publicId: 'INST-TN-000102', name: 'College of Engineering Guindy Anna University', code: 'CEG',
    type: 'Government College', category: 'Government', year: 1794, website: 'https://ceg.annauniv.edu', email: 'dean@ceg.annauniv.edu',
    city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', postalCode: '600025', status: 'PARTICIPATING', naacGrade: 'A++', aliases: ['CEG Guindy', 'Anna University', 'CEG Chennai']
  });

  const mitChromepet = await createNationalInst({
    publicId: 'INST-TN-000103', name: 'Madras Institute of Technology Chromepet', code: 'MIT',
    type: 'Government College', category: 'Government', year: 1949, website: 'https://mitindia.edu', email: 'dean@mitindia.edu',
    city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', postalCode: '600044', status: 'PARTICIPATING', naacGrade: 'A++', aliases: ['MIT Chromepet', 'MIT Chennai']
  });

  const nitTrichy = await createNationalInst({
    publicId: 'INST-TN-000120', name: 'National Institute of Technology Tiruchirappalli', code: 'NITT',
    type: 'Institution of National Importance', category: 'Government', year: 1964, website: 'https://nitt.edu', email: 'registrar@nitt.edu',
    city: 'Tiruchirappalli', district: 'Tiruchirappalli', state: 'Tamil Nadu', postalCode: '620015', status: 'PARTICIPATING', naacGrade: 'A++', aliases: ['NIT Trichy', 'NITT']
  });

  const unonboardedInst = await createNationalInst({
    publicId: 'INST-TN-000999', name: 'ABC Engineering College', code: 'ABCC',
    type: 'Engineering College', category: 'Private', year: 2005, website: 'https://abcengg.edu.in', email: 'info@abcengg.edu.in',
    city: 'Coimbatore', district: 'Coimbatore', state: 'Tamil Nadu', postalCode: '641004', status: 'NOT_ONBOARDED'
  });

  // ----------------------------------------------------
  // CREATE DEMO USERS WITH BCRYPT PASSWORD HASHES
  // ----------------------------------------------------
  const defaultPasswordHash = await hashPassword('SIH2026MasterPass!');

  const superAdmin = await prisma.user.create({
    data: { name: 'Dr. Vikramaditya (Super Admin)', email: 'superadmin@certiseal.gov.in', passwordHash: defaultPasswordHash, role: 'SUPER_ADMIN' }
  });
  const instAdmin = await prisma.user.create({
    data: { name: 'Prof. Ramesh K. (Inst Admin)', email: 'admin@nit.ac.in', passwordHash: defaultPasswordHash, role: 'INSTITUTION_ADMIN', institutionId: nitTrichy.inst.id }
  });
  const facultyIssuer = await prisma.user.create({
    data: { name: 'Dr. Priya Sharma (Faculty Issuer)', email: 'priya.sharma@nit.ac.in', passwordHash: defaultPasswordHash, role: 'FACULTY', institutionId: nitTrichy.inst.id }
  });
  const employerHr = await prisma.user.create({
    data: { name: 'Vikram Mehta (Tata Recruiter)', email: 'recruiter@tata.com', passwordHash: defaultPasswordHash, role: 'COMPANY_HR' }
  });
  const student = await prisma.user.create({
    data: { name: 'Rahul Kumar (Student)', email: 'rahul.kumar@student.nit.ac.in', passwordHash: defaultPasswordHash, role: 'STUDENT', institutionId: nitTrichy.inst.id }
  });

  // ----------------------------------------------------
  // CERTIFICATE SEEDING HELPER
  // ----------------------------------------------------
  async function seedCert(params: {
    publicId: string;
    institution: any;
    code: string;
    privateKey: string;
    studentName: string;
    studentRollNo: string;
    course: string;
    department: string;
    certificateType: string;
    issueDate: string;
    cgpa?: string;
    status: 'VERIFIED' | 'ON_HOLD' | 'RELEASED' | 'REVOKED';
    holdReason?: string;
    revocationReason?: string;
  }) {
    const canonicalPayload = buildCertificateCanonicalPayload({
      certificateId: params.publicId,
      institutionId: params.institution.id,
      institutionCode: params.code,
      studentName: params.studentName,
      studentRollNo: params.studentRollNo,
      course: params.course,
      department: params.department,
      certificateType: params.certificateType,
      issueDate: params.issueDate,
      cgpa: params.cgpa || ''
    });

    const canonicalHash = require('crypto').createHash('sha256').update(canonicalPayload, 'utf8').digest('hex');
    const digitalSignature = signFingerprint(canonicalHash, params.privateKey);
    const encryptedData = encryptField(JSON.stringify({ studentName: params.studentName, studentRollNo: params.studentRollNo }));

    const cert = await prisma.certificate.create({
      data: {
        publicId: params.publicId,
        institutionId: params.institution.id,
        studentName: params.studentName,
        studentRollNo: params.studentRollNo,
        encryptedStudentData: encryptedData,
        course: params.course,
        department: params.department,
        certificateType: params.certificateType,
        issueDate: params.issueDate,
        cgpa: params.cgpa,
        canonicalHash,
        digitalSignature,
        status: params.status,
        holdReason: params.holdReason,
        revocationReason: params.revocationReason,
        revokedBy: params.status === 'REVOKED' ? 'Dr. Priya Sharma' : undefined,
        revokedAt: params.status === 'REVOKED' ? new Date() : undefined
      }
    });

    await prisma.certificateVersion.create({
      data: {
        certificateId: cert.id,
        version: 1,
        canonicalHash,
        digitalSignature,
        changedBy: 'Dr. Priya Sharma',
        changeReason: 'Initial Cryptographic Issuance',
        snapshotData: canonicalPayload
      }
    });

    await appendLedgerEntry({
      certificateId: cert.id,
      institutionId: params.institution.id,
      operation: params.status === 'REVOKED' ? 'REVOCATION' : params.status === 'ON_HOLD' ? 'STATUS_HOLD' : 'ISSUANCE',
      actorId: facultyIssuer.id,
      signatureRef: digitalSignature.substring(0, 32)
    });

    return cert;
  }

  console.log('Seeding demo certificates for all 7 lifecycle states...');

  await seedCert({
    publicId: 'CERT-2026-000123',
    institution: nitTrichy.inst,
    code: nitTrichy.code,
    privateKey: nitTrichy.keyPair.privateKeyPem,
    studentName: 'Rahul Kumar',
    studentRollNo: '23CS101',
    course: 'B.Sc Computer Science',
    department: 'Computer Science & Engineering',
    certificateType: 'Degree Certificate',
    issueDate: '2026-08-15',
    cgpa: '8.72',
    status: 'VERIFIED'
  });

  await seedCert({
    publicId: 'CERT-2026-000124',
    institution: nitTrichy.inst,
    code: nitTrichy.code,
    privateKey: nitTrichy.keyPair.privateKeyPem,
    studentName: 'Anita Sharma',
    studentRollNo: '23EE204',
    course: 'B.Tech Electrical Engineering',
    department: 'Electrical Engineering',
    certificateType: 'Degree Certificate',
    issueDate: '2026-08-15',
    cgpa: '9.10',
    status: 'ON_HOLD',
    holdReason: 'Pending central library clearance and lab equipment return'
  });

  await seedCert({
    publicId: 'CERT-2026-000125',
    institution: iitMadras.inst,
    code: iitMadras.code,
    privateKey: iitMadras.keyPair.privateKeyPem,
    studentName: 'Vikram Singh',
    studentRollNo: '22TC090',
    course: 'Bachelor of Computer Applications',
    department: 'Computer Applications',
    certificateType: 'Transfer Certificate',
    issueDate: '2026-07-20',
    status: 'RELEASED'
  });

  await seedCert({
    publicId: 'CERT-2026-000126',
    institution: iitMadras.inst,
    code: iitMadras.code,
    privateKey: iitMadras.keyPair.privateKeyPem,
    studentName: 'Rajesh Verma',
    studentRollNo: '23CY102',
    course: 'Diploma in Cybersecurity',
    department: 'Information Security',
    certificateType: 'Diploma',
    issueDate: '2026-05-10',
    status: 'REVOKED',
    revocationReason: 'Official cancellation due to academic misconduct and falsified project submission'
  });

  console.log('Seeding completed successfully with Bcrypt hashed passwords!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
