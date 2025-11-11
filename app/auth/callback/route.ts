import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/';

  console.log('OAuth callback received:', {
    hasCode: !!code,
    url: requestUrl.toString()
  });

  if (code) {
    const cookieStore = cookies();
    const response = NextResponse.redirect(new URL(next, requestUrl.origin));

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value, ...options });
              response.cookies.set({ name, value, ...options });
            } catch (error) {
              // Cookies set in response
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: '', ...options });
              response.cookies.set({ name, value: '', ...options });
            } catch (error) {
              // Cookies removed in response
            }
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('OAuth callback error:', {
        message: error.message,
        status: error.status,
        name: error.name,
      });
      return NextResponse.redirect(
        new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
      );
    }

    console.log('OAuth callback success:', {
      hasSession: !!data.session,
      hasUser: !!data.user,
    });

    return response;
  }

  console.log('No code in callback, redirecting to home');
  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
