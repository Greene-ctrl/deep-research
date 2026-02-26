import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { verifySignature } from "@/utils/signature";

const NODE_ENV = process.env.NODE_ENV;
const accessPassword = process.env.ACCESS_PASSWORD || "";
const DISABLED_AI_PROVIDER = process.env.NEXT_PUBLIC_DISABLED_AI_PROVIDER || "";
const DISABLED_SEARCH_PROVIDER = process.env.NEXT_PUBLIC_DISABLED_SEARCH_PROVIDER || "";

// Limit the middleware to paths starting with `/api/`
export const config = {
  matcher: "/api/:path*",
};

const ERRORS = {
  NO_PERMISSIONS: {
    code: 403,
    message: "No permissions",
    status: "FORBIDDEN",
  },
};

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    // Skip authorization for non-sensitive API routes
    if (!pathname.startsWith("/api/ai") && !pathname.startsWith("/api/search") && !pathname.startsWith("/api/sse") && !pathname.startsWith("/api/mcp") && !pathname.startsWith("/api/crawler")) {
      return NextResponse.next();
    }

    if (NODE_ENV === "production") {
      console.log(`[Middleware] ${request.method} ${pathname}`);
    }

    const isAuthorized = (authStr: string) => {
      if (!accessPassword) return true; // If no password set, allow
      if (!authStr) return false;
      const token = authStr.startsWith("Bearer ") ? authStr.substring(7) : authStr;
      return verifySignature(token, accessPassword, Date.now());
    };

    // 1. Check AI Provider restrictions
    if (pathname.startsWith("/api/ai")) {
      const provider = pathname.split("/")[3];
      const disabledAIProviders = DISABLED_AI_PROVIDER ? DISABLED_AI_PROVIDER.split(",") : [];
      const authHeader = request.headers.get("x-goog-api-key") || request.headers.get("authorization") || request.headers.get("api-key") || "";

      if (!isAuthorized(authHeader) || disabledAIProviders.includes(provider)) {
        return NextResponse.json({ error: ERRORS.NO_PERMISSIONS }, { status: 403 });
      }
      // Note: Model-level restrictions are now handled in individual route handlers to avoid consuming request streams in middleware.
    }

    // 2. Check Search Provider restrictions
    if (pathname.startsWith("/api/search")) {
      const provider = pathname.split("/")[3];
      const disabledSearchProviders = DISABLED_SEARCH_PROVIDER ? DISABLED_SEARCH_PROVIDER.split(",") : [];
      const authHeader = request.headers.get("authorization") || "";
      if (!isAuthorized(authHeader) || disabledSearchProviders.includes(provider)) {
        return NextResponse.json({ error: ERRORS.NO_PERMISSIONS }, { status: 403 });
      }
    }

    // 3. Check SSE/MCP/Crawler restrictions
    if (pathname.startsWith("/api/sse") || pathname.startsWith("/api/mcp") || pathname.startsWith("/api/crawler")) {
      let auth = request.headers.get("authorization") || "";
      if (auth.startsWith("Bearer ")) auth = auth.substring(7);
      else if (request.method === "GET") auth = request.nextUrl.searchParams.get("password") || "";

      if (accessPassword && auth !== accessPassword) {
        return NextResponse.json({ error: ERRORS.NO_PERMISSIONS }, { status: 403 });
      }
    }

    return NextResponse.next();
  } catch (err) {
    console.error("Middleware crash prevented:", err);
    return NextResponse.next();
  }
}
