import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(_req: NextRequest) {
  const res = NextResponse.next();
  res.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  res.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
  return res;
}

export const config = {
  matcher: '/:path*',
};
