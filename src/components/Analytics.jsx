/**
 * Analytics Component
 * Handles error tracking and performance monitoring
 */

'use client';

import { useEffect } from 'react';

export default function Analytics() {
  useEffect(() => {
    // Initialize error tracking
    const handleError = (error) => {
      console.error('Application Error:', error);
      
      // In production, send to error tracking service
      if (process.env.NODE_ENV === 'production') {
        trackError(error);
      }
    };

    const handleUnhandledRejection = (event) => {
      console.error('Unhandled Promise Rejection:', event.reason);
      
      if (process.env.NODE_ENV === 'production') {
        trackError(event.reason);
      }
    };

    // Performance tracking
    const trackPerformance = () => {
      if (typeof window !== 'undefined' && window.performance) {
        const navigation = performance.getEntriesByType('navigation')[0];
        const paint = performance.getEntriesByType('paint');
        
        const metrics = {
          pageLoad: navigation?.loadEventEnd - navigation?.navigationStart,
          domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.navigationStart,
          firstPaint: paint.find(entry => entry.name === 'first-paint')?.startTime,
          firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime,
          timestamp: new Date().toISOString()
        };

        if (process.env.NODE_ENV === 'production') {
          trackPerformanceMetrics(metrics);
        } else {
          console.log('Performance Metrics:', metrics);
        }
      }
    };

    // Add event listeners
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    // Track performance when page loads
    if (document.readyState === 'complete') {
      trackPerformance();
    } else {
      window.addEventListener('load', trackPerformance);
    }

    // Track user interactions for ZK operations
    const trackZKOperation = (operation, success, duration) => {
      const event = {
        type: 'zk_operation',
        operation,
        success,
        duration,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      if (process.env.NODE_ENV === 'production') {
        trackCustomEvent(event);
      } else {
        console.log('ZK Operation Event:', event);
      }
    };

    // Make tracking functions available globally
    window.trackZKOperation = trackZKOperation;

    // Cleanup
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('load', trackPerformance);
    };
  }, []);

  return null; // This component doesn't render anything
}

function trackError(error) {
  // Simple error tracking - in production, integrate with services like:
  // - Sentry
  // - LogRocket
  // - Bugsnag
  // - Vercel Analytics
  
  const errorData = {
    message: error.message || error,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    type: 'client_error'
  };

  // Send to analytics endpoint
  fetch('/api/analytics/error', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(errorData)
  }).catch(err => {
    console.warn('Failed to send error to analytics:', err);
  });
}

function trackPerformanceMetrics(metrics) {
  // Send performance metrics to analytics
  fetch('/api/analytics/performance', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...metrics,
      type: 'performance_metrics'
    })
  }).catch(err => {
    console.warn('Failed to send performance metrics:', err);
  });
}

function trackCustomEvent(event) {
  // Send custom events to analytics
  fetch('/api/analytics/event', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event)
  }).catch(err => {
    console.warn('Failed to send custom event:', err);
  });
}