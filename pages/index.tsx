import React from 'react';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with the main app
const SecurityMonitor = dynamic(() => import('../components/SecurityMonitor'), {
  ssr: false
});

export default function Home() {
  return <SecurityMonitor />;
}