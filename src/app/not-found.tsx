import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900 dark:bg-[#0b0c0d] dark:text-gray-100">
      <div className="text-center p-8 rounded">
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <p className="mb-4">Page not found.</p>
        <Link href="/" className="underline">Return home</Link>
      </div>
    </div>
  );
}
