import { prisma } from '../prisma';

export interface InstitutionSearchOptions {
  query?: string;
  state?: string;
  district?: string;
  city?: string;
  type?: string;
  management?: string;
  source?: string;
  status?: string;
  university?: string;
  aisheCode?: string;
  page?: number;
  limit?: number;
  offset?: number;
}

export async function searchNationalRegistry(options: InstitutionSearchOptions = {}) {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(100, Math.max(1, options.limit || 15));
  const offset = options.offset !== undefined ? options.offset : (page - 1) * limit;

  const whereClause: any = {};

  if (options.state && options.state !== 'ALL') {
    whereClause.state = { contains: options.state };
  }
  if (options.district && options.district !== 'ALL') {
    whereClause.district = { contains: options.district };
  }
  if (options.city && options.city !== 'ALL') {
    whereClause.city = { contains: options.city };
  }
  if (options.type && options.type !== 'ALL') {
    whereClause.institutionType = options.type;
  }
  if (options.management && options.management !== 'ALL') {
    whereClause.managementType = options.management;
  }
  if (options.status && options.status !== 'ALL') {
    whereClause.status = options.status;
  }
  if (options.aisheCode) {
    whereClause.aisheCode = { contains: options.aisheCode };
  }
  if (options.source && options.source !== 'ALL') {
    whereClause.sources = {
      some: { sourceName: options.source }
    };
  }

  if (options.query) {
    const q = options.query.trim();
    const qLower = q.toLowerCase();
    const qClean = qLower.replace(/[^a-z0-9]/g, '');

    whereClause.OR = [
      { officialName: { contains: q } },
      { normalizedName: { contains: qClean } },
      { shortName: { contains: q } },
      { aisheCode: { contains: q } },
      { publicId: { contains: q } },
      { city: { contains: q } },
      { district: { contains: q } },
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

  const totalPages = Math.ceil(totalCount / limit);

  return {
    total: totalCount,
    page,
    totalPages,
    limit,
    offset,
    lastSynchronized: '2026-08-28T00:00:00.000Z',
    institutions
  };
}

/**
 * Calculates radial distance between user geolocation (lat, lng) and institution records
 * using the Haversine formula.
 */
export async function findNearMeInstitutions(userLat: number, userLng: number, maxDistanceKm = 100) {
  const allInsts = await prisma.institution.findMany({
    include: {
      regulatoryRecords: true,
      accreditations: true,
      sources: true
    }
  });

  const R = 6371; // Earth's radius in km

  const withDistance = allInsts.map(inst => {
    if (!inst.latitude || !inst.longitude) {
      return { ...inst, distanceKm: null };
    }
    const dLat = ((inst.latitude - userLat) * Math.PI) / 180;
    const dLng = ((inst.longitude - userLng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((userLat * Math.PI) / 180) *
        Math.cos((inst.latitude * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = R * c;

    return { ...inst, distanceKm: Math.round(distanceKm * 10) / 10 };
  });

  const sorted = withDistance
    .filter(i => i.distanceKm !== null && i.distanceKm <= maxDistanceKm)
    .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));

  return {
    userCoordinates: { lat: userLat, lng: userLng },
    radiusKm: maxDistanceKm,
    totalFound: sorted.length,
    institutions: sorted
  };
}

export async function detectDuplicateInstitution(params: {
  officialName: string;
  city: string;
  state: string;
  website?: string;
  aisheCode?: string;
}) {
  const normalized = params.officialName.toLowerCase().replace(/[^a-z0-9]/g, '');

  const existing = await prisma.institution.findFirst({
    where: {
      OR: [
        { aisheCode: params.aisheCode || 'NO_MATCH' },
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
