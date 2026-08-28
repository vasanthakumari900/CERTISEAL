import { NextResponse } from 'next/server';
import { findNearMeInstitutions } from '@/lib/services/institution-registry-service';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const latStr = searchParams.get('lat');
    const lngStr = searchParams.get('lng');
    const radiusStr = searchParams.get('radius') || '100';

    if (!latStr || !lngStr) {
      return NextResponse.json(
        { error: 'Latitude (lat) and Longitude (lng) parameters are required for local geolocation search.' },
        { status: 400 }
      );
    }

    const userLat = parseFloat(latStr);
    const userLng = parseFloat(lngStr);
    const radiusKm = parseFloat(radiusStr);

    if (isNaN(userLat) || isNaN(userLng)) {
      return NextResponse.json(
        { error: 'Invalid latitude or longitude format.' },
        { status: 400 }
      );
    }

    const result = await findNearMeInstitutions(userLat, userLng, radiusKm);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error processing local institution search' }, { status: 500 });
  }
}
