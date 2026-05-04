import { NextResponse } from 'next/server';
import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const response = await axios.post(`${BACKEND_URL}/api/register/`, body);
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error in register proxy route:', error.response?.data || error.message);
    return NextResponse.json(
      error.response?.data || { error: 'Registration failed' },
      { status: error.response?.status || 500 }
    );
  }
}
