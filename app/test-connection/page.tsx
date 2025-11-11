'use client';

import { useState } from 'react';
import { createBrowserClient } from '@/lib/supabase';

export default function TestConnectionPage() {
  const [status, setStatus] = useState<string>('Not tested yet');
  const [details, setDetails] = useState<any>(null);

  const testSupabase = async () => {
    setStatus('Testing...');
    const supabase = createBrowserClient();

    try {
      // Test 1: Check if client is initialized
      setStatus('✓ Supabase client initialized');

      // Test 2: Try to fetch from public schema (should work even without auth)
      const { data, error } = await supabase
        .from('conversations')
        .select('count');

      if (error) {
        // This error is expected if tables don't exist yet
        if (error.message.includes('relation') || error.message.includes('does not exist')) {
          setStatus('⚠️ Supabase connected, but database tables not set up yet');
          setDetails({
            message: 'Run supabase-schema.sql in Supabase SQL Editor',
            error: error.message,
          });
        } else {
          setStatus('❌ Database error: ' + error.message);
          setDetails(error);
        }
      } else {
        setStatus('✅ Supabase connected and tables exist!');
        setDetails({ data });
      }

      // Test 3: Check auth configuration
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setStatus((prev) => prev + '\n✓ User is authenticated');
      }
    } catch (err: any) {
      setStatus('❌ Connection failed: ' + err.message);
      setDetails(err);
    }
  };

  const testSignup = async () => {
    const supabase = createBrowserClient();
    setStatus('Testing signup...');

    try {
      const testEmail = `test${Date.now()}@example.com`;
      const testPassword = 'testpass123';

      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      });

      if (error) {
        setStatus('❌ Signup error: ' + error.message);
        setDetails({
          error: error.message,
          code: error.code,
          status: error.status,
        });
      } else {
        setStatus('✅ Signup successful!');
        setDetails({
          user: data.user?.email,
          session: data.session ? 'Yes' : 'No (email confirmation required)',
        });
      }
    } catch (err: any) {
      setStatus('❌ Signup failed: ' + err.message);
      setDetails(err);
    }
  };

  return (
    <div className="min-h-screen bg-bg-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-text-100 mb-6">
          Supabase Connection Test
        </h1>

        <div className="card mb-4">
          <h2 className="text-xl font-semibold mb-4 text-text-100">
            Environment Variables
          </h2>
          <div className="space-y-2 text-sm font-mono">
            <div>
              <span className="text-text-300">SUPABASE_URL:</span>{' '}
              <span className="text-text-100">
                {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '❌ Missing'}
              </span>
            </div>
            <div>
              <span className="text-text-300">SUPABASE_ANON_KEY:</span>{' '}
              <span className="text-text-100">
                {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
                  ? '✓ Set'
                  : '❌ Missing'}
              </span>
            </div>
            <div>
              <span className="text-text-300">DEEPSEEK_API_KEY:</span>{' '}
              <span className="text-text-100">
                {process.env.DEEPSEEK_API_KEY ? '✓ Set' : '❌ Missing'}
              </span>
            </div>
          </div>
        </div>

        <div className="card mb-4">
          <h2 className="text-xl font-semibold mb-4 text-text-100">Tests</h2>
          <div className="space-y-3">
            <button onClick={testSupabase} className="btn-primary w-full">
              Test Database Connection
            </button>
            <button
              onClick={testSignup}
              className="btn-primary w-full bg-accent-secondary-100"
            >
              Test Signup Flow
            </button>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4 text-text-100">Results</h2>
          <div className="bg-bg-300 p-4 rounded-lg">
            <pre className="text-sm text-text-100 whitespace-pre-wrap">
              {status}
            </pre>
            {details && (
              <pre className="text-xs text-text-200 mt-4 whitespace-pre-wrap">
                {JSON.stringify(details, null, 2)}
              </pre>
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <a
            href="/auth/signup"
            className="text-accent-main-100 hover:underline"
          >
            ← Back to Signup
          </a>
        </div>
      </div>
    </div>
  );
}
