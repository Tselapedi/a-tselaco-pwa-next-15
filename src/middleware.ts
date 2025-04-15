import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  
  // List of paths that require authentication
  const protectedPaths = ['/coming-soon', '/ride'];
  
  // Don't redirect if the path is not protected or if we're already on auth pages
  const isProtectedPath = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path));
  const isAuthPath = request.nextUrl.pathname.startsWith('/auth');
  
  if (!token && isProtectedPath) {
    // Redirect to login if accessing protected route without token
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  if (token && isAuthPath) {
    // Redirect to coming soon if trying to access auth pages while logged in
    return NextResponse.redirect(new URL('/coming-soon', request.url));
  }
  
  return NextResponse.next();
}