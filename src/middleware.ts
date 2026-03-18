import createMiddleware from "next-intl/middleware";
import { NextRequest } from "next/server";
import { routing, COUNTRY_LOCALE_MAP } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  // If user already has a locale cookie, let next-intl handle it
  const localeCookie = request.cookies.get("NEXT_LOCALE")?.value;
  if (!localeCookie) {
    // Try geo-detection from CDN/proxy headers
    const country = (
      request.headers.get("cf-ipcountry") ||
      request.headers.get("x-vercel-ip-country") ||
      request.headers.get("x-country-code") ||
      ""
    ).toUpperCase();

    const geoLocale = COUNTRY_LOCALE_MAP[country];
    if (geoLocale) {
      // Set the cookie so next-intl picks it up
      const response = intlMiddleware(request);
      // Check if user is on root or a non-locale path — redirect to geo locale
      const pathname = request.nextUrl.pathname;
      if (pathname === "/" || !routing.locales.some((l) => pathname.startsWith(`/${l}`))) {
        const url = request.nextUrl.clone();
        url.pathname = `/${geoLocale}${pathname === "/" ? "" : pathname}`;
        const redirectResponse = Response.redirect(url);
        redirectResponse.headers.set(
          "Set-Cookie",
          `NEXT_LOCALE=${geoLocale};path=/;max-age=${365 * 24 * 60 * 60};SameSite=Lax`
        );
        return redirectResponse;
      }
      return response;
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/",
    "/(ar|en|tr|fr|es|fa)/:path*",
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
