import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CERTX — Digital Certificate Verification & Trust Infrastructure',
  description: 'Verify. Trust. Hire. Three-surface academic certificate trust platform featuring envelope encryption, per-certificate DEKs, KMS abstraction, and 8-level verification.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-navy-950 text-slate-100 min-h-screen flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
