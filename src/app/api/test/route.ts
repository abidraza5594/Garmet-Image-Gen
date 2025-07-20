import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check environment variables
    const envApiKey = process.env.GOOGLE_AI_API_KEY;
    
    return NextResponse.json({
      success: true,
      hasEnvKey: !!envApiKey,
      envKeyLength: envApiKey ? envApiKey.length : 0,
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
