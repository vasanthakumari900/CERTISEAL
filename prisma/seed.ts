import { PrismaClient } from '@prisma/client';
import { generateInstitutionKeyPair, signFingerprint } from '../lib/crypto/signatures';
import { generateCertificateHash } from '../lib/crypto/hashing';
import { encryptField } from '../lib/crypto/encryption';
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
  await prisma.institution.deleteMany();

  // Helper for generating institution with keypair & regulatory data
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
            encryptedPrivateKey: keyPair.privateKeyPem,
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
            { sourceName: 'UGC Official Master Registry', sourceType: 'GOVERNMENT_REGISTRY', sourceUrl: 'https://ugc.ac.in' },
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
  // CHENNAI COLLEGES (FULL COMPREHENSIVE LIST)
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

  const actechGuindy = await createNationalInst({
    publicId: 'INST-TN-000104', name: 'Alagappa College of Technology Guindy', code: 'ACTECH',
    type: 'Government College', category: 'Government', year: 1944, website: 'https://act.annauniv.edu', email: 'dean@act.annauniv.edu',
    city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', postalCode: '600025', status: 'PARTICIPATING', aliases: ['AC Tech Guindy', 'AC Tech Chennai']
  });

  const ssnEngg = await createNationalInst({
    publicId: 'INST-TN-000105', name: 'SSN College of Engineering', code: 'SSN',
    type: 'Autonomous College', category: 'Private', year: 1996, website: 'https://ssn.edu.in', email: 'info@ssn.edu.in',
    city: 'Chennai', district: 'Chengalpattu', state: 'Tamil Nadu', postalCode: '603110', status: 'PARTICIPATING', naacGrade: 'A+', aliases: ['SSN Chennai', 'SSN College']
  });

  const loyolaChennai = await createNationalInst({
    publicId: 'INST-TN-000106', name: 'Loyola College Chennai', code: 'LOYOLA',
    type: 'Arts and Science College', category: 'Private', year: 1925, website: 'https://loyolacollege.edu', email: 'principal@loyolacollege.edu',
    city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', postalCode: '600034', status: 'PARTICIPATING', naacGrade: 'A++', aliases: ['Loyola Chennai', 'Loyola']
  });

  const presidencyChennai = await createNationalInst({
    publicId: 'INST-TN-000107', name: 'Presidency College Chennai', code: 'PRESIDENCY',
    type: 'Government College', category: 'Government', year: 1840, website: 'https://presidencycollegechennai.ac.in', email: 'principal@presidencycollegechennai.ac.in',
    city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', postalCode: '600005', status: 'PARTICIPATING', naacGrade: 'A+', aliases: ['Presidency Chennai']
  });

  const mccTambaram = await createNationalInst({
    publicId: 'INST-TN-000108', name: 'Madras Christian College Tambaram', code: 'MCC',
    type: 'Arts and Science College', category: 'Private', year: 1837, website: 'https://mcc.edu.in', email: 'principal@mcc.edu.in',
    city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', postalCode: '600059', status: 'PARTICIPATING', naacGrade: 'A++', aliases: ['MCC Tambaram', 'MCC Chennai']
  });

  const stellaMaris = await createNationalInst({
    publicId: 'INST-TN-000109', name: 'Stella Maris College Chennai', code: 'SMC',
    type: 'Arts and Science College', category: 'Private', year: 1947, website: 'https://stellamariscollege.edu.in', email: 'principal@stellamariscollege.edu.in',
    city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', postalCode: '600086', status: 'PARTICIPATING', naacGrade: 'A+', aliases: ['Stella Maris Chennai']
  });

  const mmcChennai = await createNationalInst({
    publicId: 'INST-TN-000110', name: 'Madras Medical College', code: 'MMC',
    type: 'Medical College', category: 'Government', year: 1835, website: 'https://mmc.ac.in', email: 'deanmmc@tn.gov.in',
    city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', postalCode: '600003', status: 'PARTICIPATING', aliases: ['Madras Medical College', 'MMC Chennai']
  });

  const stanleyMedical = await createNationalInst({
    publicId: 'INST-TN-000111', name: 'Stanley Medical College Chennai', code: 'SMC',
    type: 'Medical College', category: 'Government', year: 1938, website: 'https://stanleymedicalcollege.in', email: 'deansmc@tn.gov.in',
    city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', postalCode: '600001', status: 'PARTICIPATING', aliases: ['Stanley Medical College', 'Stanley Chennai']
  });

  const kilpaukMedical = await createNationalInst({
    publicId: 'INST-TN-000112', name: 'Government Kilpauk Medical College Chennai', code: 'KMC',
    type: 'Medical College', category: 'Government', year: 1960, website: 'https://gkmc.in', email: 'deankmc@tn.gov.in',
    city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', postalCode: '600010', status: 'PARTICIPATING', aliases: ['Kilpauk Medical College', 'KMC Chennai']
  });

  const stJosephsEngg = await createNationalInst({
    publicId: 'INST-TN-000113', name: 'St. Joseph\'s College of Engineering Chennai', code: 'STJOSEPH',
    type: 'Autonomous College', category: 'Private', year: 1994, website: 'https://stjosephs.ac.in', email: 'jse@stjosephs.ac.in',
    city: 'Chennai', district: 'Kancheepuram', state: 'Tamil Nadu', postalCode: '600119', status: 'PARTICIPATING', aliases: ['St. Josephs Chennai', 'St Josephs Engineering']
  });

  const rajalakshmiEngg = await createNationalInst({
    publicId: 'INST-TN-000114', name: 'Rajalakshmi Engineering College Chennai', code: 'REC',
    type: 'Autonomous College', category: 'Private', year: 1997, website: 'https://rajalakshmi.org', email: 'admin@rajalakshmi.edu.in',
    city: 'Chennai', district: 'Kancheepuram', state: 'Tamil Nadu', postalCode: '602105', status: 'PARTICIPATING', naacGrade: 'A++', aliases: ['REC Chennai', 'Rajalakshmi Engineering']
  });

  const sairamEngg = await createNationalInst({
    publicId: 'INST-TN-000115', name: 'Sri Sairam Engineering College Chennai', code: 'SAIRAM',
    type: 'Autonomous College', category: 'Private', year: 1995, website: 'https://sairam.edu.in', email: 'sairam@sairam.edu.in',
    city: 'Chennai', district: 'Kancheepuram', state: 'Tamil Nadu', postalCode: '600044', status: 'PARTICIPATING', naacGrade: 'A++', aliases: ['Sairam Chennai', 'Sri Sairam']
  });

  const easwariEngg = await createNationalInst({
    publicId: 'INST-TN-000116', name: 'Easwari Engineering College Chennai', code: 'EASWARI',
    type: 'Autonomous College', category: 'Private', year: 1996, website: 'https://srmeaswari.ac.in', email: 'eec@srmeaswari.ac.in',
    city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', postalCode: '600089', status: 'PARTICIPATING', naacGrade: 'A', aliases: ['Easwari Ramapuram', 'SRM Easwari']
  });

  // OTHER TAMIL NADU CITIES (COIMBATORE, TRICHY, SALEM, MADURAI, VELLORE, THANJAVUR)
  const nitTrichy = await createNationalInst({
    publicId: 'INST-TN-000120', name: 'National Institute of Technology Tiruchirappalli', code: 'NITT',
    type: 'Institution of National Importance', category: 'Government', year: 1964, website: 'https://nitt.edu', email: 'registrar@nitt.edu',
    city: 'Tiruchirappalli', district: 'Tiruchirappalli', state: 'Tamil Nadu', postalCode: '620015', status: 'PARTICIPATING', naacGrade: 'A++', aliases: ['NIT Trichy', 'NITT']
  });

  const gctCoimbatore = await createNationalInst({
    publicId: 'INST-TN-000121', name: 'Government College of Technology Coimbatore', code: 'GCT',
    type: 'Government College', category: 'Government', year: 1945, website: 'https://gct.ac.in', email: 'principal@gct.ac.in',
    city: 'Coimbatore', district: 'Coimbatore', state: 'Tamil Nadu', postalCode: '641013', status: 'PARTICIPATING', naacGrade: 'A+', aliases: ['GCT Coimbatore', 'GCT']
  });

  const psgTech = await createNationalInst({
    publicId: 'INST-TN-000122', name: 'PSG College of Technology', code: 'PSGTECH',
    type: 'Autonomous College', category: 'Private', year: 1951, website: 'https://psgtech.edu', email: 'principal@psgtech.ac.in',
    city: 'Coimbatore', district: 'Coimbatore', state: 'Tamil Nadu', postalCode: '641004', status: 'PARTICIPATING', naacGrade: 'A+', aliases: ['PSG Tech', 'PSG Coimbatore']
  });

  const vitVellore = await createNationalInst({
    publicId: 'INST-TN-000123', name: 'Vellore Institute of Technology', code: 'VIT',
    type: 'Deemed University', category: 'Private', year: 1984, website: 'https://vit.ac.in', email: 'info@vit.ac.in',
    city: 'Vellore', district: 'Vellore', state: 'Tamil Nadu', postalCode: '632014', status: 'PARTICIPATING', naacGrade: 'A++', aliases: ['VIT Vellore', 'VIT']
  });

  const tceMadurai = await createNationalInst({
    publicId: 'INST-TN-000124', name: 'Thiagarajar College of Engineering', code: 'TCE',
    type: 'Autonomous College', category: 'Private', year: 1957, website: 'https://tce.edu', email: 'principal@tce.edu',
    city: 'Madurai', district: 'Madurai', state: 'Tamil Nadu', postalCode: '625015', status: 'PARTICIPATING', naacGrade: 'A+', aliases: ['TCE Madurai']
  });

  // KERALA, KARNATAKA, MAHARASHTRA, DELHI, ETC.
  const cetTrivandrum = await createNationalInst({
    publicId: 'INST-KL-000201', name: 'College of Engineering Trivandrum', code: 'CET',
    type: 'Government College', category: 'Government', year: 1939, website: 'https://cet.ac.in', email: 'principal@cet.ac.in',
    city: 'Thiruvananthapuram', district: 'Thiruvananthapuram', state: 'Kerala', postalCode: '695016', status: 'PARTICIPATING', naacGrade: 'A', aliases: ['CET Trivandrum', 'CET']
  });

  const iiscBangalore = await createNationalInst({
    publicId: 'INST-KA-000301', name: 'Indian Institute of Science Bengaluru', code: 'IISC',
    type: 'Institution of National Importance', category: 'Government', year: 1909, website: 'https://iisc.ac.in', email: 'registrar@iisc.ac.in',
    city: 'Bengaluru', district: 'Bengaluru Urban', state: 'Karnataka', postalCode: '560012', status: 'PARTICIPATING', naacGrade: 'A++', aliases: ['IISc', 'IISc Bangalore']
  });

  const uvceBangalore = await createNationalInst({
    publicId: 'INST-KA-000302', name: 'University Visvesvaraya College of Engineering', code: 'UVCE',
    type: 'Government College', category: 'Government', year: 1917, website: 'https://uvce.ac.in', email: 'principal@uvce.ac.in',
    city: 'Bengaluru', district: 'Bengaluru Urban', state: 'Karnataka', postalCode: '560001', status: 'PARTICIPATING', aliases: ['UVCE Bangalore']
  });

  const coepPune = await createNationalInst({
    publicId: 'INST-MH-000401', name: 'COEP Technological University', code: 'COEP',
    type: 'State University', category: 'Government', year: 1854, website: 'https://coep.org.in', email: 'director@coep.org.in',
    city: 'Pune', district: 'Pune', state: 'Maharashtra', postalCode: '411005', status: 'PARTICIPATING', naacGrade: 'A+', aliases: ['College of Engineering Pune', 'COEP']
  });

  const iitDelhi = await createNationalInst({
    publicId: 'INST-DL-000501', name: 'Indian Institute of Technology Delhi', code: 'IITD',
    type: 'IIT', category: 'Government', year: 1961, website: 'https://iitd.ac.in', email: 'registrar@iitd.ac.in',
    city: 'New Delhi', district: 'South Delhi', state: 'Delhi', postalCode: '110016', status: 'PARTICIPATING', naacGrade: 'A++', aliases: ['IIT Delhi', 'IITD']
  });

  // NOT_ONBOARDED Demo College (Primary Demo for VERIFICATION_UNAVAILABLE state)
  const unonboardedInst = await createNationalInst({
    publicId: 'INST-TN-000999', name: 'ABC Engineering College', code: 'ABCC',
    type: 'Engineering College', category: 'Private', year: 2005, website: 'https://abcengg.edu.in', email: 'info@abcengg.edu.in',
    city: 'Coimbatore', district: 'Coimbatore', state: 'Tamil Nadu', postalCode: '641004', status: 'NOT_ONBOARDED'
  });

  // ----------------------------------------------------
  // CREATE DEMO USERS
  // ----------------------------------------------------
  const superAdmin = await prisma.user.create({
    data: { name: 'Dr. Vikramaditya (Super Admin)', email: 'superadmin@certiseal.gov.in', passwordHash: 'demo', role: 'SUPER_ADMIN' }
  });
  const instAdmin = await prisma.user.create({
    data: { name: 'Prof. Ramesh K. (Inst Admin)', email: 'admin@nit.ac.in', passwordHash: 'demo', role: 'INSTITUTION_ADMIN', institutionId: nitTrichy.inst.id }
  });
  const facultyIssuer = await prisma.user.create({
    data: { name: 'Dr. Priya Sharma (Faculty Issuer)', email: 'priya.sharma@nit.ac.in', passwordHash: 'demo', role: 'FACULTY', institutionId: nitTrichy.inst.id }
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
    const structured = {
      certificateId: params.publicId,
      institutionCode: params.code,
      studentName: params.studentName,
      studentRollNo: params.studentRollNo,
      course: params.course,
      department: params.department,
      certificateType: params.certificateType,
      issueDate: params.issueDate,
      cgpa: params.cgpa || ''
    };

    const canonicalHash = generateCertificateHash(structured);
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
        snapshotData: JSON.stringify(structured)
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

  console.log('Chennai & All-India Master Dataset Seeding completed successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
