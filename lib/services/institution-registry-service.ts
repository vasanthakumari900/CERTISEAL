import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface InstitutionSearchOptions {
  query?: string;
  state?: string;
  city?: string;
  type?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export async function searchNationalRegistry(options: InstitutionSearchOptions = {}) {
  const limit = options.limit || 100;
  const offset = options.offset || 0;

  const whereClause: any = {};

  if (options.state && options.state !== 'ALL') {
    whereClause.state = { contains: options.state };
  }
  if (options.city && options.city !== 'ALL') {
    whereClause.city = { contains: options.city };
  }
  if (options.type && options.type !== 'ALL') {
    whereClause.institutionType = options.type;
  }
  if (options.status && options.status !== 'ALL') {
    whereClause.status = options.status;
  }

  if (options.query) {
    const q = options.query.trim();
    const qLower = q.toLowerCase();
    const qClean = qLower.replace(/[^a-z0-9]/g, '');

    whereClause.OR = [
      { officialName: { contains: q } },
      { normalizedName: { contains: qClean } },
      { shortName: { contains: q } },
      { publicId: { contains: q } },
      { city: { contains: q } },
      { state: { contains: q } },
      { aliases: { some: { alias: { contains: q } } } }
    ];
  }

  const [institutions, totalCount] = await Promise.all([
    prisma.institution.findMany({
      where: whereClause,
      include: {
        regulatoryRecords: true,
        accreditations: true,
        sources: true,
        aliases: true,
        parentAffiliations: { include: { university: { select: { officialName: true } } } },
        _count: { select: { certificates: true } }
      },
      orderBy: { officialName: 'asc' },
      take: limit,
      skip: offset
    }),
    prisma.institution.count({ where: whereClause })
  ]);

  return {
    total: totalCount,
    limit,
    offset,
    institutions
  };
}

export async function detectDuplicateInstitution(params: {
  officialName: string;
  city: string;
  state: string;
  website?: string;
}) {
  const normalized = params.officialName.toLowerCase().replace(/[^a-z0-9]/g, '');

  const existing = await prisma.institution.findFirst({
    where: {
      OR: [
        { normalizedName: normalized },
        {
          AND: [
            { city: params.city },
            { state: params.state },
            { officialWebsite: params.website || 'N/A' }
          ]
        }
      ]
    }
  });

  return existing ? { isDuplicate: true, matchedInstitution: existing } : { isDuplicate: false, matchedInstitution: null };
}
