import { NextResponse } from 'next/server';
import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const NFIS_SOURCE_PLATFORMS = 'NFIS,nfis.in,nfis';

export async function GET() {
  try {
    const response = await axios.get(
      `${BACKEND_URL}/api/exhibitor-registrations/?source_platform=${NFIS_SOURCE_PLATFORMS}`
    );
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error in exhibitor proxy route:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch exhibitors from local backend' },
      { status: error.response?.status || 500 }
    );
  }
}
