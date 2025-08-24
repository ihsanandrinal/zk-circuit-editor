/**
 * Health Check API Endpoint
 * Provides system status and service health information
 */

import { NextResponse } from 'next/server';

export async function GET() {
  const startTime = Date.now();
  
  try {
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      services: {
        zkService: await checkZKService(),
        database: 'not applicable',
        cache: await checkLocalStorage(),
      },
      performance: {
        responseTime: Date.now() - startTime,
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          limit: Math.round(process.memoryUsage().rss / 1024 / 1024)
        }
      }
    };

    // Add response time after calculating
    healthData.performance.responseTime = Date.now() - startTime;

    return NextResponse.json(healthData, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    }, { status: 503 });
  }
}

async function checkZKService() {
  try {
    // Check if MidnightJS endpoint is configured
    const endpoint = process.env.NEXT_PUBLIC_MIDNIGHT_ENDPOINT;
    
    if (!endpoint) {
      return {
        status: 'demo_mode',
        message: 'No MidnightJS endpoint configured, running in demo mode'
      };
    }

    // Simple connectivity check (in a real app, you might ping the service)
    return {
      status: 'configured',
      endpoint: endpoint ? 'configured' : 'not_configured',
      message: 'ZK service endpoint is configured'
    };
  } catch (error) {
    return {
      status: 'error',
      message: error.message
    };
  }
}

async function checkLocalStorage() {
  // Since this is server-side, we can't check localStorage
  // This would be checked on the client-side
  return {
    status: 'client_side',
    message: 'Local storage availability checked on client'
  };
}