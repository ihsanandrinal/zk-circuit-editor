/**
 * Error Analytics Endpoint
 * Collects and processes client-side errors
 */

import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const errorData = await request.json();
    
    // Add server-side metadata
    const enrichedError = {
      ...errorData,
      serverTimestamp: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      referer: request.headers.get('referer'),
      environment: process.env.NODE_ENV
    };

    // In development, just log the error
    if (process.env.NODE_ENV === 'development') {
      console.error('Client Error:', enrichedError);
      return NextResponse.json({ status: 'logged' });
    }

    // In production, you would send this to your error tracking service
    // Examples:
    // - await sendToSentry(enrichedError);
    // - await sendToBugsnag(enrichedError);
    // - await sendToDatadog(enrichedError);
    
    // For now, we'll just log it (you can replace this with your service)
    console.error('Production Error:', enrichedError);
    
    // You could also store in a database or send to external service
    // await storeErrorInDatabase(enrichedError);

    return NextResponse.json({ status: 'recorded' });

  } catch (error) {
    console.error('Failed to process error report:', error);
    return NextResponse.json(
      { error: 'Failed to process error report' },
      { status: 500 }
    );
  }
}