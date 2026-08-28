import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address format').optional(),
  password: z.string().min(1, 'Password is required').optional(),
  role: z.enum(['SUPER_ADMIN', 'REGISTRY_ADMIN', 'INSTITUTION_ADMIN', 'FACULTY', 'COMPANY_HR', 'STUDENT', 'PUBLIC_VERIFIER']).optional()
});

export const CertificateIssuanceSchema = z.object({
  studentName: z.string().min(2, 'Student name is required'),
  studentRollNo: z.string().min(1, 'Student roll number is required'),
  course: z.string().min(2, 'Course / program title is required'),
  department: z.string().min(2, 'Department is required'),
  certificateType: z.string().min(2, 'Certificate type is required'),
  issueDate: z.string().min(4, 'Issue date is required'),
  completionDate: z.string().optional(),
  marks: z.string().optional(),
  cgpa: z.string().optional(),
  graduationYear: z.string().optional(),
  additionalMetadata: z.any().optional()
});

export const StatusChangeSchema = z.object({
  certificateId: z.string().min(1, 'Certificate ID is required'),
  status: z.enum(['VERIFIED', 'ON_HOLD', 'RELEASED', 'REVOKED']),
  reason: z.string().min(3, 'Reason for status change is required')
});

export const OnboardingRequestSchema = z.object({
  officerName: z.string().min(2, 'Nodal officer name is required'),
  officerDesignation: z.string().min(2, 'Designation is required'),
  officialDomainEmail: z.string().email('Valid official domain email required'),
  institutionName: z.string().min(3, 'Institution name is required'),
  officialWebsite: z.string().optional(),
  documentationDetails: z.string().optional()
});
