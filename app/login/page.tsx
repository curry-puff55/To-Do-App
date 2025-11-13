'use client';

import React, { useState } from 'react';
import db from '@/lib/db';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const [sentEmail, setSentEmail] = useState('');
  const router = useRouter();

  // Check if already signed in
  const { user, isLoading } = db.useAuth();

  React.useEffect(() => {
    if (user) {
      router.push('/dashboard/new');
    }
  }, [user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F0F1A] via-[#1A1A2E] to-[#2A2A45]">
        <div className="text-[#8B8BB8]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F0F1A] via-[#1A1A2E] to-[#2A2A45] p-8">
      <div className="max-w-md w-full">
        {!sentEmail ? (
          <EmailStep onSendEmail={setSentEmail} />
        ) : (
          <CodeStep sentEmail={sentEmail} />
        )}
      </div>
    </div>
  );
}

function EmailStep({ onSendEmail }: { onSendEmail: (email: string) => void }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await db.auth.sendMagicCode({ email });
      onSendEmail(email);
    } catch (err: any) {
      setError(err.body?.message || 'Failed to send code');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="backdrop-blur-xl rounded-2xl border border-[#2A2A45]/60 bg-[#1A1A2E]/60 p-10 shadow-lg">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-[#2A2A45]/80 to-[#4A4A6A]/60 rounded-full flex items-center justify-center border border-[#4A4A6A]">
            <span>👻</span>
          </div>
          <h1 className="text-2xl font-semibold text-[#8B8BB8]">Ghosts</h1>
        </div>
        <h2 className="text-lg text-[#6B6B9A] mb-2">Sign in to your haunting grounds</h2>
        <p className="text-sm text-[#4A4A6A]">
          Enter your email and we'll send you a magic code
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium mb-2 tracking-wider uppercase opacity-70 text-[#6B6B9A]">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            autoFocus
            disabled={isLoading}
            className="w-full px-4 py-3 text-sm backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-1 bg-[#2A2A45]/50 border-[#4A4A6A] text-[#8B8BB8] placeholder-[#4A4A6A] focus:ring-[#6B6B9A] hover:bg-[#2A2A45]/70"
          />
        </div>

        {error && (
          <div className="text-sm text-red-400 bg-red-900/20 border border-red-800/50 rounded-lg px-4 py-2">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-6 py-3 rounded-xl text-sm bg-gradient-to-br from-[#6B6B9A] to-[#4A4A6A] text-white hover:shadow-lg hover:shadow-[#6B6B9A]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Sending...' : 'Send Magic Code'}
        </button>
      </div>
    </form>
  );
}

function CodeStep({ sentEmail }: { sentEmail: string }) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await db.auth.signInWithMagicCode({ email: sentEmail, code });
      // Router will redirect automatically on success
    } catch (err: any) {
      setError(err.body?.message || 'Invalid code');
      setCode('');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="backdrop-blur-xl rounded-2xl border border-[#2A2A45]/60 bg-[#1A1A2E]/60 p-10 shadow-lg">
      <div className="mb-6">
        <h2 className="text-lg text-[#8B8BB8] mb-2">Enter your magic code</h2>
        <p className="text-sm text-[#6B6B9A]">
          We sent a code to <span className="text-[#8B8BB8] font-medium">{sentEmail}</span>
        </p>
        <p className="text-xs text-[#4A4A6A] mt-2">
          Check your email and paste the 6-digit code
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium mb-2 tracking-wider uppercase opacity-70 text-[#6B6B9A]">
            Magic Code
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
            required
            autoFocus
            maxLength={6}
            disabled={isLoading}
            className="w-full px-4 py-3 text-sm backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-1 bg-[#2A2A45]/50 border-[#4A4A6A] text-[#8B8BB8] placeholder-[#4A4A6A] focus:ring-[#6B6B9A] hover:bg-[#2A2A45]/70 text-center text-2xl tracking-widest font-mono"
          />
        </div>

        {error && (
          <div className="text-sm text-red-400 bg-red-900/20 border border-red-800/50 rounded-lg px-4 py-2">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || code.length !== 6}
          className="w-full px-6 py-3 rounded-xl text-sm bg-gradient-to-br from-[#6B6B9A] to-[#4A4A6A] text-white hover:shadow-lg hover:shadow-[#6B6B9A]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Verifying...' : 'Verify Code'}
        </button>
      </div>
    </form>
  );
}
