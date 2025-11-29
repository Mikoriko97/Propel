import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const target = searchParams.get('url');
    if (!target) {
      return new NextResponse('Missing url', { status: 400 });
    }
    const res = await fetch(target, { method: 'GET' });
    if (!res.ok) {
      return new NextResponse('Upstream error', { status: 502 });
    }
    const buf = await res.arrayBuffer();
    const contentType = res.headers.get('content-type') || 'application/octet-stream';
    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Cross-Origin-Resource-Policy', 'same-origin');
    headers.set('Cache-Control', 'public, max-age=300');
    return new NextResponse(Buffer.from(buf), { status: 200, headers });
  } catch (e) {
    return new NextResponse('Proxy error', { status: 500 });
  }
}
