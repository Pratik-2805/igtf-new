import { NextResponse } from 'next/server';
import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function GET() {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/investor-registrations/`);
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error in investor proxy route:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch investors from local backend' },
      { status: error.response?.status || 500 }
    );
  }
}
