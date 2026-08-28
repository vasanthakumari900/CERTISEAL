import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ImportInstitutionRecord {
  aisheCode: string;
  officialName: string;
  shortName?: string;
  institutionType: string;
  managementType: string;
  institutionCategory?: string;
  establishedYear?: number;
  officialWebsite: string;
  officialEmail: string;
  officialPhone?: string;
  address: string;
  city: string;
  district: string;
  state: string;
  country?: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  status?: string;
  source: 'AISHE' | 'UGC' | 'NMC' | 'AICTE';
  sourceUrl: string;
  sourceRecordId: string;
  affiliatedUniversity?: string;
  recognitionStatus: string;
  accreditation?: string;
}

export const NATIONAL_INSTITUTION_DATASET: ImportInstitutionRecord[] = [
  // TAMIL NADU
  {
    aisheCode: 'U-0456',
    officialName: 'National Institute of Technology Tiruchirappalli',
    shortName: 'NITT',
    institutionType: 'NIT',
    managementType: 'Government',
    institutionCategory: 'Central',
    establishedYear: 1964,
    officialWebsite: 'https://www.nitt.edu',
    officialEmail: 'admin@nitt.edu',
    officialPhone: '+91-431-2503000',
    address: 'Tanjore Main Road, National Highway 67, Tiruchirappalli',
    city: 'Tiruchirappalli',
    district: 'Tiruchirappalli',
    state: 'Tamil Nadu',
    postalCode: '620015',
    latitude: 10.7600,
    longitude: 78.8143,
    status: 'PARTICIPATING',
    source: 'AISHE',
    sourceUrl: 'https://dashboard.aishe.gov.in/',
    sourceRecordId: 'AISHE-U-0456',
    recognitionStatus: 'Institute of National Importance (INI Act 2007)',
    accreditation: 'NAAC Grade A++'
  },
  {
    aisheCode: 'U-0439',
    officialName: 'Anna University',
    shortName: 'ANNAUNIV',
    institutionType: 'State Public University',
    managementType: 'Government',
    institutionCategory: 'State',
    establishedYear: 1978,
    officialWebsite: 'https://www.annauniv.edu',
    officialEmail: 'registrar@annauniv.edu',
    officialPhone: '+91-44-22357004',
    address: 'Sardar Patel Road, Guindy, Chennai',
    city: 'Chennai',
    district: 'Chennai',
    state: 'Tamil Nadu',
    postalCode: '600025',
    latitude: 13.0102,
    longitude: 80.2354,
    status: 'PARTICIPATING',
    source: 'UGC',
    sourceUrl: 'https://www.ugc.gov.in/stateuniversitylist.aspx?id=31',
    sourceRecordId: 'UGC-ST-TN-01',
    recognitionStatus: 'UGC Recognized Section 12(B) & 2(f)',
    accreditation: 'NAAC Grade A++'
  },
  {
    aisheCode: 'U-0455',
    officialName: 'Indian Institute of Technology Madras',
    shortName: 'IITM',
    institutionType: 'IIT',
    managementType: 'Government',
    institutionCategory: 'Central',
    establishedYear: 1959,
    officialWebsite: 'https://www.iitm.ac.in',
    officialEmail: 'registrar@iitm.ac.in',
    officialPhone: '+91-44-22578101',
    address: 'IIT P.O., Chennai',
    city: 'Chennai',
    district: 'Chennai',
    state: 'Tamil Nadu',
    postalCode: '600036',
    latitude: 12.9915,
    longitude: 80.2337,
    status: 'PARTICIPATING',
    source: 'AISHE',
    sourceUrl: 'https://dashboard.aishe.gov.in/',
    sourceRecordId: 'AISHE-U-0455',
    recognitionStatus: 'Institute of National Importance (IIT Act 1961)',
    accreditation: 'NIRF Rank 1 Overall'
  },
  {
    aisheCode: 'C-24902',
    officialName: 'College of Engineering Guindy',
    shortName: 'CEG',
    institutionType: 'Autonomous College',
    managementType: 'Government',
    institutionCategory: 'State',
    establishedYear: 1794,
    officialWebsite: 'https://ceg.annauniv.edu',
    officialEmail: 'dean@ceg.annauniv.edu',
    officialPhone: '+91-44-22358201',
    address: '12, Sardar Patel Road, Guindy, Chennai',
    city: 'Chennai',
    district: 'Chennai',
    state: 'Tamil Nadu',
    postalCode: '600025',
    latitude: 13.0104,
    longitude: 80.2358,
    status: 'PARTICIPATING',
    source: 'UGC',
    sourceUrl: 'https://www.ugc.gov.in/autonomouscollege.aspx',
    sourceRecordId: 'UGC-AUT-TN-CEG',
    affiliatedUniversity: 'Anna University',
    recognitionStatus: 'UGC Autonomous College (Anna University Campus)',
    accreditation: 'NBA Accredited Tier-1'
  },
  {
    aisheCode: 'C-24905',
    officialName: 'Madras Institute of Technology',
    shortName: 'MIT',
    institutionType: 'Autonomous College',
    managementType: 'Government',
    institutionCategory: 'State',
    establishedYear: 1949,
    officialWebsite: 'https://mitindia.edu',
    officialEmail: 'dean@mitindia.edu',
    officialPhone: '+91-44-22516002',
    address: 'MIT Road, Radhanagar, Chromepet, Chennai',
    city: 'Chennai',
    district: 'Chengalpattu',
    state: 'Tamil Nadu',
    postalCode: '600044',
    latitude: 12.9483,
    longitude: 80.1402,
    status: 'PARTICIPATING',
    source: 'AICTE',
    sourceUrl: 'https://www.aicte-india.org/',
    sourceRecordId: 'AICTE-1-4321908',
    affiliatedUniversity: 'Anna University',
    recognitionStatus: 'AICTE Approved / UGC Autonomous Campus',
    accreditation: 'NBA Accredited'
  },
  {
    aisheCode: 'C-16624',
    officialName: 'SSN College of Engineering',
    shortName: 'SSNCE',
    institutionType: 'Engineering / Technical Institution',
    managementType: 'Private',
    institutionCategory: 'Private',
    establishedYear: 1996,
    officialWebsite: 'https://www.ssn.edu.in',
    officialEmail: 'info@ssn.edu.in',
    officialPhone: '+91-44-27469700',
    address: 'Rajiv Gandhi Salai (OMR), Kalavakkam',
    city: 'Chennai',
    district: 'Chengalpattu',
    state: 'Tamil Nadu',
    postalCode: '603110',
    latitude: 12.7511,
    longitude: 80.1972,
    status: 'NOT_ONBOARDED',
    source: 'AICTE',
    sourceUrl: 'https://www.aicte-india.org/',
    sourceRecordId: 'AICTE-1-1090123',
    affiliatedUniversity: 'Anna University',
    recognitionStatus: 'AICTE Approved / Autonomous Status',
    accreditation: 'NAAC Grade A+'
  },
  {
    aisheCode: 'C-24910',
    officialName: 'Madras Medical College',
    shortName: 'MMC',
    institutionType: 'Medical College',
    managementType: 'Government',
    institutionCategory: 'State',
    establishedYear: 1835,
    officialWebsite: 'https://www.mmc.ac.in',
    officialEmail: 'dean@mmc.ac.in',
    officialPhone: '+91-44-25305000',
    address: 'EVR Periyar Salai, Park Town, Chennai',
    city: 'Chennai',
    district: 'Chennai',
    state: 'Tamil Nadu',
    postalCode: '600003',
    latitude: 13.0815,
    longitude: 80.2762,
    status: 'REGISTRY_LISTED',
    source: 'NMC',
    sourceUrl: 'https://www.nmc.org.in/information-desk/medical-colleges-courses/',
    sourceRecordId: 'NMC-MED-TN-01',
    affiliatedUniversity: 'The Tamil Nadu Dr. M.G.R. Medical University',
    recognitionStatus: 'NMC Approved Medical Institution (MBBS 250 Seats)',
    accreditation: 'Govt Medical College Registry'
  },
  {
    aisheCode: 'C-24915',
    officialName: 'Loyola College Chennai',
    shortName: 'LOYOLA',
    institutionType: 'Autonomous College',
    managementType: 'Government-Aided',
    institutionCategory: 'Private',
    establishedYear: 1925,
    officialWebsite: 'https://www.loyolacollege.edu',
    officialEmail: 'principal@loyolacollege.edu',
    officialPhone: '+91-44-28178200',
    address: 'Sterling Road, Nungambakkam, Chennai',
    city: 'Chennai',
    district: 'Chennai',
    state: 'Tamil Nadu',
    postalCode: '600034',
    latitude: 13.0623,
    longitude: 80.2341,
    status: 'REGISTRY_LISTED',
    source: 'UGC',
    sourceUrl: 'https://www.ugc.gov.in/autonomouscollege.aspx',
    sourceRecordId: 'UGC-AUT-TN-LOYOLA',
    affiliatedUniversity: 'University of Madras',
    recognitionStatus: 'UGC Autonomous College / College with Potential for Excellence',
    accreditation: 'NAAC Grade A++'
  },
  {
    aisheCode: 'C-24920',
    officialName: 'Madras Christian College',
    shortName: 'MCC',
    institutionType: 'Autonomous College',
    managementType: 'Government-Aided',
    institutionCategory: 'Private',
    establishedYear: 1837,
    officialWebsite: 'https://mcc.edu.in',
    officialEmail: 'principal@mcc.edu.in',
    officialPhone: '+91-44-22390675',
    address: 'East Tambaram, Chennai',
    city: 'Chennai',
    district: 'Chengalpattu',
    state: 'Tamil Nadu',
    postalCode: '600059',
    latitude: 12.9229,
    longitude: 80.1275,
    status: 'REGISTRY_LISTED',
    source: 'UGC',
    sourceUrl: 'https://www.ugc.gov.in/autonomouscollege.aspx',
    sourceRecordId: 'UGC-AUT-TN-MCC',
    affiliatedUniversity: 'University of Madras',
    recognitionStatus: 'UGC Autonomous College Section 12(B)',
    accreditation: 'NAAC Grade A+'
  },
  {
    aisheCode: 'C-24925',
    officialName: 'PSG College of Technology',
    shortName: 'PSGTECH',
    institutionType: 'Autonomous College',
    managementType: 'Government-Aided',
    institutionCategory: 'Private',
    establishedYear: 1951,
    officialWebsite: 'https://www.psgtech.edu',
    officialEmail: 'principal@psgtech.ac.in',
    officialPhone: '+91-422-2572177',
    address: 'Post Box No. 1611, Peelamedu, Coimbatore',
    city: 'Coimbatore',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    postalCode: '641004',
    latitude: 11.0247,
    longitude: 77.0028,
    status: 'REGISTRY_LISTED',
    source: 'AICTE',
    sourceUrl: 'https://www.aicte-india.org/',
    sourceRecordId: 'AICTE-1-4091823',
    affiliatedUniversity: 'Anna University',
    recognitionStatus: 'AICTE Approved / UGC Autonomous College',
    accreditation: 'NAAC Grade A+'
  },

  // KARNATAKA
  {
    aisheCode: 'U-0205',
    officialName: 'Indian Institute of Science Bengaluru',
    shortName: 'IISc',
    institutionType: 'Institution of National Importance',
    managementType: 'Government',
    institutionCategory: 'Central',
    establishedYear: 1909,
    officialWebsite: 'https://www.iisc.ac.in',
    officialEmail: 'registrar@iisc.ac.in',
    officialPhone: '+91-80-22932004',
    address: 'CV Raman Rd, Bengaluru',
    city: 'Bengaluru',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    postalCode: '560012',
    latitude: 13.0184,
    longitude: 77.5670,
    status: 'PARTICIPATING',
    source: 'UGC',
    sourceUrl: 'https://www.ugc.gov.in/deemeduniversitylist.aspx',
    sourceRecordId: 'UGC-DEEMED-KA-01',
    recognitionStatus: 'Deemed to be University / Institution of Eminence',
    accreditation: 'NAAC Grade A++'
  },
  {
    aisheCode: 'U-0221',
    officialName: 'National Institute of Technology Karnataka Surathkal',
    shortName: 'NITK',
    institutionType: 'NIT',
    managementType: 'Government',
    institutionCategory: 'Central',
    establishedYear: 1960,
    officialWebsite: 'https://www.nitk.ac.in',
    officialEmail: 'registrar@nitk.ac.in',
    officialPhone: '+91-824-2474000',
    address: 'NH 66, Srinivasnagar, Surathkal, Mangaluru',
    city: 'Mangaluru',
    district: 'Dakshina Kannada',
    state: 'Karnataka',
    postalCode: '575025',
    latitude: 13.0108,
    longitude: 74.7943,
    status: 'REGISTRY_LISTED',
    source: 'AISHE',
    sourceUrl: 'https://dashboard.aishe.gov.in/',
    sourceRecordId: 'AISHE-U-0221',
    recognitionStatus: 'Institute of National Importance (INI Act 2007)',
    accreditation: 'NAAC Grade A+'
  },
  {
    aisheCode: 'C-12301',
    officialName: 'RV College of Engineering',
    shortName: 'RVCE',
    institutionType: 'Autonomous College',
    managementType: 'Private',
    institutionCategory: 'Private',
    establishedYear: 1963,
    officialWebsite: 'https://www.rvce.edu.in',
    officialEmail: 'principal@rvce.edu.in',
    officialPhone: '+91-80-68188100',
    address: 'RV Vidyanikethan Post, Mysore Road, Bengaluru',
    city: 'Bengaluru',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    postalCode: '560059',
    latitude: 12.9237,
    longitude: 77.4987,
    status: 'REGISTRY_LISTED',
    source: 'AICTE',
    sourceUrl: 'https://www.aicte-india.org/',
    sourceRecordId: 'AICTE-1-1002341',
    affiliatedUniversity: 'Visvesvaraya Technological University',
    recognitionStatus: 'AICTE Approved / VTU Autonomous College',
    accreditation: 'NBA Accredited'
  },

  // MAHARASHTRA
  {
    aisheCode: 'U-0220',
    officialName: 'Indian Institute of Technology Bombay',
    shortName: 'IITB',
    institutionType: 'IIT',
    managementType: 'Government',
    institutionCategory: 'Central',
    establishedYear: 1958,
    officialWebsite: 'https://www.iitb.ac.in',
    officialEmail: 'registrar@iitb.ac.in',
    officialPhone: '+91-22-25722545',
    address: 'Powai, Mumbai',
    city: 'Mumbai',
    district: 'Mumbai Suburban',
    state: 'Maharashtra',
    postalCode: '400076',
    latitude: 19.1334,
    longitude: 72.9133,
    status: 'PARTICIPATING',
    source: 'AISHE',
    sourceUrl: 'https://dashboard.aishe.gov.in/',
    sourceRecordId: 'AISHE-U-0220',
    recognitionStatus: 'Institute of National Importance (IIT Act 1961)',
    accreditation: 'NIRF Rank 3 Overall'
  },
  {
    aisheCode: 'C-41201',
    officialName: 'College of Engineering Pune',
    shortName: 'COEP',
    institutionType: 'Autonomous College',
    managementType: 'Government',
    institutionCategory: 'State',
    establishedYear: 1854,
    officialWebsite: 'https://www.coep.org.in',
    officialEmail: 'director@coep.ac.in',
    officialPhone: '+91-20-25507000',
    address: 'Wellesley Rd, Shivajinagar, Pune',
    city: 'Pune',
    district: 'Pune',
    state: 'Maharashtra',
    postalCode: '411005',
    latitude: 18.5293,
    longitude: 73.8565,
    status: 'REGISTRY_LISTED',
    source: 'UGC',
    sourceUrl: 'https://www.ugc.gov.in/autonomouscollege.aspx',
    sourceRecordId: 'UGC-AUT-MH-COEP',
    affiliatedUniversity: 'Savitribai Phule Pune University',
    recognitionStatus: 'COEP Technological University (Unitary Public University)',
    accreditation: 'NAAC Grade A+'
  },

  // DELHI
  {
    aisheCode: 'U-0100',
    officialName: 'University of Delhi',
    shortName: 'DU',
    institutionType: 'Central University',
    managementType: 'Government',
    institutionCategory: 'Central',
    establishedYear: 1922,
    officialWebsite: 'https://www.du.ac.in',
    officialEmail: 'registrar@du.ac.in',
    officialPhone: '+91-11-27667853',
    address: 'Benito Juarez Marg, South Campus, New Delhi',
    city: 'New Delhi',
    district: 'New Delhi',
    state: 'Delhi',
    postalCode: '110021',
    latitude: 28.6904,
    longitude: 77.2072,
    status: 'PARTICIPATING',
    source: 'UGC',
    sourceUrl: 'https://www.ugc.gov.in/centraluniversitylist.aspx',
    sourceRecordId: 'UGC-CU-DL-01',
    recognitionStatus: 'Central University (UGC Act 1956)',
    accreditation: 'NAAC Grade A+'
  },
  {
    aisheCode: 'U-0263',
    officialName: 'All India Institute of Medical Sciences New Delhi',
    shortName: 'AIIMS-ND',
    institutionType: 'AIIMS',
    managementType: 'Government',
    institutionCategory: 'Central',
    establishedYear: 1956,
    officialWebsite: 'https://www.aiims.edu',
    officialEmail: 'director@aiims.edu',
    officialPhone: '+91-11-26588500',
    address: 'Sri Aurobindo Marg, Ansari Nagar, New Delhi',
    city: 'New Delhi',
    district: 'South Delhi',
    state: 'Delhi',
    postalCode: '110029',
    latitude: 28.5672,
    longitude: 77.2100,
    status: 'PARTICIPATING',
    source: 'NMC',
    sourceUrl: 'https://www.nmc.org.in/',
    sourceRecordId: 'NMC-AIIMS-01',
    recognitionStatus: 'Institute of National Importance (AIIMS Act 1956)',
    accreditation: 'NIRF Rank 1 Medical'
  },
  {
    aisheCode: 'U-0098',
    officialName: 'Indian Institute of Technology Delhi',
    shortName: 'IITD',
    institutionType: 'IIT',
    managementType: 'Government',
    institutionCategory: 'Central',
    establishedYear: 1961,
    officialWebsite: 'https://home.iitd.ac.in',
    officialEmail: 'registrar@admin.iitd.ac.in',
    officialPhone: '+91-11-26591000',
    address: 'Hauz Khas, New Delhi',
    city: 'New Delhi',
    district: 'South Delhi',
    state: 'Delhi',
    postalCode: '110016',
    latitude: 28.5450,
    longitude: 77.1926,
    status: 'REGISTRY_LISTED',
    source: 'AISHE',
    sourceUrl: 'https://dashboard.aishe.gov.in/',
    sourceRecordId: 'AISHE-U-0098',
    recognitionStatus: 'Institute of National Importance (IIT Act 1961)',
    accreditation: 'NIRF Rank 2 Engineering'
  },

  // WEST BENGAL
  {
    aisheCode: 'U-0570',
    officialName: 'Jadavpur University',
    shortName: 'JU',
    institutionType: 'State Public University',
    managementType: 'Government',
    institutionCategory: 'State',
    establishedYear: 1955,
    officialWebsite: 'http://www.jaduniv.edu.in',
    officialEmail: 'registrar@jadavpuruniversity.in',
    officialPhone: '+91-33-24146666',
    address: '188, Raja S.C. Mallick Road, Kolkata',
    city: 'Kolkata',
    district: 'Kolkata',
    state: 'West Bengal',
    postalCode: '700032',
    latitude: 22.4990,
    longitude: 88.3712,
    status: 'REGISTRY_LISTED',
    source: 'UGC',
    sourceUrl: 'https://www.ugc.gov.in/stateuniversitylist.aspx',
    sourceRecordId: 'UGC-ST-WB-01',
    recognitionStatus: 'UGC Recognized State University Section 12(B)',
    accreditation: 'NAAC Grade A'
  },
  {
    aisheCode: 'U-0500',
    officialName: 'Indian Institute of Technology Kharagpur',
    shortName: 'IITKGP',
    institutionType: 'IIT',
    managementType: 'Government',
    institutionCategory: 'Central',
    establishedYear: 1951,
    officialWebsite: 'https://www.iitkgp.ac.in',
    officialEmail: 'reg-off@adm.iitkgp.ac.in',
    officialPhone: '+91-3222-255221',
    address: 'Kharagpur, Paschim Medinipur',
    city: 'Kharagpur',
    district: 'Paschim Medinipur',
    state: 'West Bengal',
    postalCode: '721302',
    latitude: 22.3149,
    longitude: 87.3105,
    status: 'PARTICIPATING',
    source: 'AISHE',
    sourceUrl: 'https://dashboard.aishe.gov.in/',
    sourceRecordId: 'AISHE-U-0500',
    recognitionStatus: 'Institute of National Importance (IIT Act 1961)',
    accreditation: 'NAAC Grade A++'
  },

  // UTTAR PRADESH
  {
    aisheCode: 'U-0502',
    officialName: 'Banaras Hindu University',
    shortName: 'BHU',
    institutionType: 'Central University',
    managementType: 'Government',
    institutionCategory: 'Central',
    establishedYear: 1916,
    officialWebsite: 'https://www.bhu.ac.in',
    officialEmail: 'registrar@bhu.ac.in',
    officialPhone: '+91-542-2368558',
    address: 'Ajagara, Varanasi',
    city: 'Varanasi',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    postalCode: '221005',
    latitude: 25.2677,
    longitude: 82.9913,
    status: 'REGISTRY_LISTED',
    source: 'UGC',
    sourceUrl: 'https://www.ugc.gov.in/centraluniversitylist.aspx',
    sourceRecordId: 'UGC-CU-UP-01',
    recognitionStatus: 'Central University Section 12(B)',
    accreditation: 'NAAC Grade A'
  },
  {
    aisheCode: 'U-0516',
    officialName: 'Indian Institute of Technology Kanpur',
    shortName: 'IITK',
    institutionType: 'IIT',
    managementType: 'Government',
    institutionCategory: 'Central',
    establishedYear: 1959,
    officialWebsite: 'https://www.iitk.ac.in',
    officialEmail: 'registrar@iitk.ac.in',
    officialPhone: '+91-512-2597200',
    address: 'Kalyanpur, Kanpur',
    city: 'Kanpur',
    district: 'Kanpur Nagar',
    state: 'Uttar Pradesh',
    postalCode: '208016',
    latitude: 26.5123,
    longitude: 80.2329,
    status: 'REGISTRY_LISTED',
    source: 'AISHE',
    sourceUrl: 'https://dashboard.aishe.gov.in/',
    sourceRecordId: 'AISHE-U-0516',
    recognitionStatus: 'Institute of National Importance (IIT Act 1961)',
    accreditation: 'NIRF Rank 4 Engineering'
  },

  // TELANGANA
  {
    aisheCode: 'U-0013',
    officialName: 'Osmania University',
    shortName: 'OU',
    institutionType: 'State Public University',
    managementType: 'Government',
    institutionCategory: 'State',
    establishedYear: 1918,
    officialWebsite: 'https://www.osmania.ac.in',
    officialEmail: 'registrar@osmania.ac.in',
    officialPhone: '+91-40-27098048',
    address: 'Administrative Building, Osmania University Campus, Hyderabad',
    city: 'Hyderabad',
    district: 'Hyderabad',
    state: 'Telangana',
    postalCode: '500007',
    latitude: 17.4137,
    longitude: 78.5283,
    status: 'REGISTRY_LISTED',
    source: 'UGC',
    sourceUrl: 'https://www.ugc.gov.in/stateuniversitylist.aspx',
    sourceRecordId: 'UGC-ST-TS-01',
    recognitionStatus: 'UGC Recognized State University Section 12(B)',
    accreditation: 'NAAC Grade A+'
  },
  {
    aisheCode: 'U-0017',
    officialName: 'International Institute of Information Technology Hyderabad',
    shortName: 'IIITH',
    institutionType: 'IIIT',
    managementType: 'Government-Aided',
    institutionCategory: 'Deemed',
    establishedYear: 1998,
    officialWebsite: 'https://www.iiit.ac.in',
    officialEmail: 'registrar@iiit.ac.in',
    officialPhone: '+91-40-66531000',
    address: 'Prof. CR Rao Road, Gachibowli, Hyderabad',
    city: 'Hyderabad',
    district: 'Ranga Reddy',
    state: 'Telangana',
    postalCode: '500032',
    latitude: 17.4451,
    longitude: 78.3489,
    status: 'REGISTRY_LISTED',
    source: 'UGC',
    sourceUrl: 'https://www.ugc.gov.in/deemeduniversitylist.aspx',
    sourceRecordId: 'UGC-DEEMED-TS-01',
    recognitionStatus: 'Deemed to be University Section 3',
    accreditation: 'NAAC Grade A'
  },

  // ANDHRA PRADESH
  {
    aisheCode: 'U-0002',
    officialName: 'Andhra University',
    shortName: 'AU',
    institutionType: 'State Public University',
    managementType: 'Government',
    institutionCategory: 'State',
    establishedYear: 1926,
    officialWebsite: 'https://www.andhrauniversity.edu.in',
    officialEmail: 'registrar@andhrauniversity.edu.in',
    officialPhone: '+91-891-2844000',
    address: 'Waltair Junction, Visakhapatnam',
    city: 'Visakhapatnam',
    district: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    postalCode: '530003',
    latitude: 17.7317,
    longitude: 83.3168,
    status: 'REGISTRY_LISTED',
    source: 'UGC',
    sourceUrl: 'https://www.ugc.gov.in/stateuniversitylist.aspx',
    sourceRecordId: 'UGC-ST-AP-01',
    recognitionStatus: 'UGC Recognized Section 12(B)',
    accreditation: 'NAAC Grade A++'
  },

  // KERALA
  {
    aisheCode: 'U-0306',
    officialName: 'National Institute of Technology Calicut',
    shortName: 'NITC',
    institutionType: 'NIT',
    managementType: 'Government',
    institutionCategory: 'Central',
    establishedYear: 1961,
    officialWebsite: 'https://www.nitc.ac.in',
    officialEmail: 'registrar@nitc.ac.in',
    officialPhone: '+91-495-2286101',
    address: 'NITC Campus P.O., Calicut',
    city: 'Kozhikode',
    district: 'Kozhikode',
    state: 'Kerala',
    postalCode: '673601',
    latitude: 11.3216,
    longitude: 75.9336,
    status: 'REGISTRY_LISTED',
    source: 'AISHE',
    sourceUrl: 'https://dashboard.aishe.gov.in/',
    sourceRecordId: 'AISHE-U-0306',
    recognitionStatus: 'Institute of National Importance (INI Act 2007)',
    accreditation: 'NAAC Grade A+'
  },

  // GUJARAT
  {
    aisheCode: 'U-0140',
    officialName: 'Gujarat Technological University',
    shortName: 'GTU',
    institutionType: 'State Public University',
    managementType: 'Government',
    institutionCategory: 'State',
    establishedYear: 2007,
    officialWebsite: 'https://www.gtu.ac.in',
    officialEmail: 'registrar@gtu.ac.in',
    officialPhone: '+91-79-23267521',
    address: 'Visat - Gandhinagar Highway, Chandkheda, Ahmedabad',
    city: 'Ahmedabad',
    district: 'Ahmedabad',
    state: 'Gujarat',
    postalCode: '382424',
    latitude: 23.1065,
    longitude: 72.5950,
    status: 'REGISTRY_LISTED',
    source: 'AICTE',
    sourceUrl: 'https://www.aicte-india.org/',
    sourceRecordId: 'AICTE-GTU-01',
    recognitionStatus: 'State Technical University Section 12(B)',
    accreditation: 'NAAC Grade A'
  },

  // RAJASTHAN
  {
    aisheCode: 'U-0402',
    officialName: 'Malaviya National Institute of Technology Jaipur',
    shortName: 'MNIT',
    institutionType: 'NIT',
    managementType: 'Government',
    institutionCategory: 'Central',
    establishedYear: 1963,
    officialWebsite: 'http://www.mnit.ac.in',
    officialEmail: 'registrar@mnit.ac.in',
    officialPhone: '+91-141-2529078',
    address: 'Jawaharlal Nehru Marg, Jaipur',
    city: 'Jaipur',
    district: 'Jaipur',
    state: 'Rajasthan',
    postalCode: '302017',
    latitude: 26.8634,
    longitude: 75.8106,
    status: 'REGISTRY_LISTED',
    source: 'AISHE',
    sourceUrl: 'https://dashboard.aishe.gov.in/',
    sourceRecordId: 'AISHE-U-0402',
    recognitionStatus: 'Institute of National Importance (INI Act 2007)',
    accreditation: 'NAAC Grade A+'
  },

  // ASSAM
  {
    aisheCode: 'U-0052',
    officialName: 'Gauhati University',
    shortName: 'GU',
    institutionType: 'State Public University',
    managementType: 'Government',
    institutionCategory: 'State',
    establishedYear: 1948,
    officialWebsite: 'https://www.gauhati.ac.in',
    officialEmail: 'registrar@gauhati.ac.in',
    officialPhone: '+91-361-2570415',
    address: 'Gopinath Bordoloi Nagar, Jalukbari, Guwahati',
    city: 'Guwahati',
    district: 'Kamrup Metropolitan',
    state: 'Assam',
    postalCode: '781014',
    latitude: 26.1557,
    longitude: 91.6622,
    status: 'REGISTRY_LISTED',
    source: 'UGC',
    sourceUrl: 'https://www.ugc.gov.in/stateuniversitylist.aspx',
    sourceRecordId: 'UGC-ST-AS-01',
    recognitionStatus: 'UGC Recognized Section 12(B)',
    accreditation: 'NAAC Grade A'
  }
];

export async function importNationalInstitutions() {
  console.log('Starting CERTISEAL National Institution Directory Data Import...');

  let insertedCount = 0;
  let updatedCount = 0;
  let duplicateSkippedCount = 0;
  let invalidCount = 0;

  const sourceCounts: Record<string, number> = { AISHE: 0, UGC: 0, NMC: 0, AICTE: 0 };
  const stateCounts: Record<string, number> = {};

  for (const record of NATIONAL_INSTITUTION_DATASET) {
    if (!record.officialName || !record.state || !record.aisheCode) {
      invalidCount++;
      continue;
    }

    const normalized = record.officialName.toLowerCase().replace(/[^a-z0-9]/g, '');

    const existing = await prisma.institution.findFirst({
      where: {
        OR: [
          { aisheCode: record.aisheCode },
          { normalizedName: normalized },
          {
            AND: [
              { officialName: record.officialName },
              { state: record.state }
            ]
          }
        ]
      }
    });

    const stateCode = record.state.substring(0, 2).toUpperCase();
    const seqNum = Math.floor(100000 + Math.random() * 900000);
    const publicId = existing ? existing.publicId : `INST-${stateCode}-${seqNum}`;

    if (existing) {
      await prisma.institution.update({
        where: { id: existing.id },
        data: {
          officialName: record.officialName,
          normalizedName: normalized,
          aisheCode: record.aisheCode,
          shortName: record.shortName || existing.shortName,
          managementType: record.managementType,
          institutionType: record.institutionType,
          institutionCategory: record.institutionCategory,
          establishedYear: record.establishedYear,
          officialWebsite: record.officialWebsite,
          officialEmail: record.officialEmail,
          officialPhone: record.officialPhone,
          address: record.address,
          city: record.city,
          district: record.district,
          state: record.state,
          country: record.country || 'India',
          postalCode: record.postalCode,
          latitude: record.latitude,
          longitude: record.longitude,
          lastVerifiedAt: new Date()
        }
      });
      updatedCount++;
    } else {
      await prisma.institution.create({
        data: {
          publicId,
          officialName: record.officialName,
          normalizedName: normalized,
          aisheCode: record.aisheCode,
          shortName: record.shortName || null,
          managementType: record.managementType,
          institutionType: record.institutionType,
          institutionCategory: record.institutionCategory,
          establishedYear: record.establishedYear,
          officialWebsite: record.officialWebsite,
          officialEmail: record.officialEmail,
          officialPhone: record.officialPhone,
          address: record.address,
          city: record.city,
          district: record.district,
          state: record.state,
          country: record.country || 'India',
          postalCode: record.postalCode,
          latitude: record.latitude,
          longitude: record.longitude,
          status: record.status || 'REGISTRY_LISTED',
          lastVerifiedAt: new Date(),
          sources: {
            create: {
              sourceName: record.source,
              sourceType: 'GOVERNMENT_REGISTRY',
              sourceUrl: record.sourceUrl,
              sourceRecordId: record.sourceRecordId,
              confidence: 1.0,
              dataVersion: '2026.08'
            }
          },
          regulatoryRecords: {
            create: {
              regulatoryBody: record.source,
              recognitionType: record.recognitionStatus,
              recognitionStatus: 'APPROVED'
            }
          },
          accreditations: record.accreditation ? {
            create: {
              body: record.accreditation.includes('NAAC') ? 'NAAC' : 'NIRF',
              grade: record.accreditation.replace('NAAC Grade ', ''),
              status: 'ACTIVE'
            }
          } : undefined
        }
      });
      insertedCount++;
    }

    sourceCounts[record.source] = (sourceCounts[record.source] || 0) + 1;
    stateCounts[record.state] = (stateCounts[record.state] || 0) + 1;
  }

  const totalCount = await prisma.institution.count();

  console.log('\n============================================================');
  console.log(' CERTISEAL NATIONAL DIRECTORY IMPORT STATISTICS');
  console.log('============================================================');
  console.log('Total Institutions in Database:', totalCount);
  console.log('New Records Inserted:', insertedCount);
  console.log('Existing Records Updated:', updatedCount);
  console.log('Duplicate Records Skipped:', duplicateSkippedCount);
  console.log('Invalid Records Rejected:', invalidCount);
  console.log('------------------------------------------------------------');
  console.log('BREAKDOWN BY SOURCE:');
  Object.entries(sourceCounts).forEach(([s, c]) => console.log(`  ${s}: ${c}`));
  console.log('------------------------------------------------------------');
  console.log('BREAKDOWN BY STATE:');
  Object.entries(stateCounts).forEach(([st, c]) => console.log(`  ${st}: ${c}`));
  console.log('============================================================\n');

  return {
    totalInDb: totalCount,
    inserted: insertedCount,
    updated: updatedCount,
    duplicatesSkipped: duplicateSkippedCount,
    invalid: invalidCount,
    sourceCounts,
    stateCounts
  };
}

if (require.main === module) {
  importNationalInstitutions()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}
