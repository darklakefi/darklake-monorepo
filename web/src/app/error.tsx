'use client';
import Link from 'next/link';

export default function Error() {
  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center h-screen">
      <h1>Error</h1>
      <p className="text-center text-black text-light">
        Click{' '}
        <Link href="/" className="underline">
          here
        </Link>{' '}
        to go back to the main page.
      </p>
    </div>
  );
}
