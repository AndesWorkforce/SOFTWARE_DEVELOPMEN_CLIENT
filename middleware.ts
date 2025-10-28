// client/middleware.ts
import { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './packages/internationalization/routing';

// creamos la función de intl
const intl = createMiddleware({
  locales: routing.locales,
  defaultLocale: routing.defaultLocale,
});

// Next 16 requiere exportar una FUNCIÓN
export default function middleware(req: NextRequest) {
  return intl(req);
}

// opcional: limitar en qué rutas corre
export const config = {
  matcher: [
    // aplica a todo, excepto assets/_next/api/trpc y archivos estáticos comunes
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico)|api|trpc).*)',
    '/',
  ],
};
