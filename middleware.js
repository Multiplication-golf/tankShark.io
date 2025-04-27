import { NextResponse } from 'next/server';

export function middleware(request) {
  const hostname = request.headers.get('host');

  if (hostname === 'tank-shark-io.vercel.app') {
    return NextResponse.redirect(`https://tankshark.fun${request.nextUrl.pathname}`, 308);
  }

  return NextResponse.next();
}