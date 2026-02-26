import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getCustomModelList, multiApiKeyPolling } from "@/utils/model";
import { verifySignature } from "@/utils/signature";
import { generateAuthToken } from "@/utils/vertexAuth";

const NODE_ENV = process.env.NODE_ENV;
const accessPassword = process.env.ACCESS_PASSWORD || "";

// AI provider API key
const GOOGLE_GENERATIVE_AI_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY || "";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "";
const XAI_API_KEY = process.env.XAI_API_KEY || "";
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY || "";
const AZURE_API_KEY = process.env.AZURE_API_KEY || "";
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL || "";
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY || "";
const GOOGLE_PRIVATE_KEY_ID = process.env.GOOGLE_PRIVATE_KEY_ID || "";
const OPENAI_COMPATIBLE_API_KEY = process.env.OPENAI_COMPATIBLE_API_KEY || "";

// Search provider API key
const TAVILY_API_KEY = process.env.TAVILY_API_KEY || "";
const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY || "";
const EXA_API_KEY = process.env.EXA_API_KEY || "";
const BOCHA_API_KEY = process.env.BOCHA_API_KEY || "";

// Disabled Provider
const DISABLED_AI_PROVIDER = process.env.NEXT_PUBLIC_DISABLED_AI_PROVIDER || "";
const DISABLED_SEARCH_PROVIDER = process.env.NEXT_PUBLIC_DISABLED_SEARCH_PROVIDER || "";
const MODEL_LIST = process.env.NEXT_PUBLIC_MODEL_LIST || "";

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
  NO_API_KEY: {
    code: 500,
    message: "The server does not have an API key.",
    status: "Internal Server Error",
  },
};

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    // Skip middleware for non-AI/Search/SSE API routes if any
    if (!pathname.startsWith("/api/ai") && !pathname.startsWith("/api/search") && !pathname.startsWith("/api/sse") && !pathname.startsWith("/api/mcp") && !pathname.startsWith("/api/crawler")) {
      return NextResponse.next();
    }

    const disabledAIProviders = DISABLED_AI_PROVIDER ? DISABLED_AI_PROVIDER.split(",") : [];
    const disabledSearchProviders = DISABLED_SEARCH_PROVIDER ? DISABLED_SEARCH_PROVIDER.split(",") : [];

    const hasDisabledGeminiModel = () => {
      if (request.method.toUpperCase() === "GET") return false;
      const { availableModelList, disabledModelList } = getCustomModelList(
        MODEL_LIST ? MODEL_LIST.split(",") : []
      );
      const isAvailableModel = availableModelList.some((availableModel) =>
        pathname.includes(`models/${availableModel}:`)
      );
      if (isAvailableModel) return false;
      if (disabledModelList.includes("all")) return true;
      return disabledModelList.some((disabledModel) =>
        pathname.includes(`models/${disabledModel}:`)
      );
    };

    const hasDisabledAIModel = async () => {
      if (request.method.toUpperCase() === "GET") return false;
      try {
        const clonedRequest = request.clone();
        const body = await clonedRequest.json().catch(() => ({}));
        const { model = "" } = body;
        const { availableModelList, disabledModelList } = getCustomModelList(
          MODEL_LIST ? MODEL_LIST.split(",") : []
        );
        const isAvailableModel = availableModelList.some(
          (availableModel) => availableModel === model
        );
        if (isAvailableModel) return false;
        if (disabledModelList.includes("all")) return true;
        return disabledModelList.some((disabledModel) => disabledModel === model);
      } catch {
        return false;
      }
    };

    // Helper for signature verification
    const isAuthorized = (authStr: string) => {
      if (!accessPassword) return true; // If no password set, allow
      if (!authStr) return false;
      const token = authStr.startsWith("Bearer ") ? authStr.substring(7) : authStr;
      return verifySignature(token, accessPassword, Date.now());
    };

    if (pathname.startsWith("/api/ai/google")) {
      const authorization = request.headers.get("x-goog-api-key") || "";
      if (!isAuthorized(authorization) || disabledAIProviders.includes("google") || hasDisabledGeminiModel()) {
        return NextResponse.json({ error: ERRORS.NO_PERMISSIONS }, { status: 403 });
      }
      const apiKey = multiApiKeyPolling(GOOGLE_GENERATIVE_AI_API_KEY);
      if (!apiKey) return NextResponse.json({ error: ERRORS.NO_API_KEY }, { status: 500 });

      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-goog-api-key", apiKey);
      return NextResponse.next({ request: { headers: requestHeaders } });
    }

    if (pathname.startsWith("/api/ai/openrouter")) {
      const authorization = request.headers.get("authorization") || "";
      if (!isAuthorized(authorization) || disabledAIProviders.includes("openrouter") || await hasDisabledAIModel()) {
        return NextResponse.json({ error: ERRORS.NO_PERMISSIONS }, { status: 403 });
      }
      const apiKey = multiApiKeyPolling(OPENROUTER_API_KEY);
      if (!apiKey) return NextResponse.json({ error: ERRORS.NO_API_KEY }, { status: 500 });

      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("Authorization", `Bearer ${apiKey}`);
      return NextResponse.next({ request: { headers: requestHeaders } });
    }

    if (pathname.startsWith("/api/ai/openaicompatible")) {
      const authorization = request.headers.get("authorization") || "";
      if (!isAuthorized(authorization) || disabledAIProviders.includes("openaicompatible") || await hasDisabledAIModel()) {
        return NextResponse.json({ error: ERRORS.NO_PERMISSIONS }, { status: 403 });
      }
      const apiKey = multiApiKeyPolling(OPENAI_COMPATIBLE_API_KEY);
      if (!apiKey) return NextResponse.json({ error: ERRORS.NO_API_KEY }, { status: 500 });

      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("Authorization", `Bearer ${apiKey}`);
      return NextResponse.next({ request: { headers: requestHeaders } });
    }

    if (pathname.startsWith("/api/ai/openai")) {
      const authorization = request.headers.get("authorization") || "";
      if (!isAuthorized(authorization) || disabledAIProviders.includes("openai") || await hasDisabledAIModel()) {
        return NextResponse.json({ error: ERRORS.NO_PERMISSIONS }, { status: 403 });
      }
      const apiKey = multiApiKeyPolling(OPENAI_API_KEY);
      if (!apiKey) return NextResponse.json({ error: ERRORS.NO_API_KEY }, { status: 500 });

      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("Authorization", `Bearer ${apiKey}`);
      return NextResponse.next({ request: { headers: requestHeaders } });
    }

    if (pathname.startsWith("/api/ai/anthropic")) {
      const authorization = request.headers.get("x-api-key") || request.headers.get("authorization") || "";
      if (!isAuthorized(authorization) || disabledAIProviders.includes("anthropic") || await hasDisabledAIModel()) {
        return NextResponse.json({ error: ERRORS.NO_PERMISSIONS }, { status: 403 });
      }
      const apiKey = multiApiKeyPolling(ANTHROPIC_API_KEY);
      if (!apiKey) return NextResponse.json({ error: ERRORS.NO_API_KEY }, { status: 500 });

      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-api-key", apiKey);
      return NextResponse.next({ request: { headers: requestHeaders } });
    }

    if (pathname.startsWith("/api/ai/deepseek")) {
      const authorization = request.headers.get("authorization") || "";
      if (!isAuthorized(authorization) || disabledAIProviders.includes("deepseek") || await hasDisabledAIModel()) {
        return NextResponse.json({ error: ERRORS.NO_PERMISSIONS }, { status: 403 });
      }
      const apiKey = multiApiKeyPolling(DEEPSEEK_API_KEY);
      if (!apiKey) return NextResponse.json({ error: ERRORS.NO_API_KEY }, { status: 500 });

      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("Authorization", `Bearer ${apiKey}`);
      return NextResponse.next({ request: { headers: requestHeaders } });
    }

    if (pathname.startsWith("/api/ai/xai")) {
      const authorization = request.headers.get("authorization") || "";
      if (!isAuthorized(authorization) || disabledAIProviders.includes("xai") || await hasDisabledAIModel()) {
        return NextResponse.json({ error: ERRORS.NO_PERMISSIONS }, { status: 403 });
      }
      const apiKey = multiApiKeyPolling(XAI_API_KEY);
      if (!apiKey) return NextResponse.json({ error: ERRORS.NO_API_KEY }, { status: 500 });

      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("Authorization", `Bearer ${apiKey}`);
      return NextResponse.next({ request: { headers: requestHeaders } });
    }

    if (pathname.startsWith("/api/ai/mistral")) {
      const authorization = request.headers.get("authorization") || "";
      if (!isAuthorized(authorization) || disabledAIProviders.includes("mistral") || await hasDisabledAIModel()) {
        return NextResponse.json({ error: ERRORS.NO_PERMISSIONS }, { status: 403 });
      }
      const apiKey = multiApiKeyPolling(MISTRAL_API_KEY);
      if (!apiKey) return NextResponse.json({ error: ERRORS.NO_API_KEY }, { status: 500 });

      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("Authorization", `Bearer ${apiKey}`);
      return NextResponse.next({ request: { headers: requestHeaders } });
    }

    if (pathname.startsWith("/api/ai/azure")) {
      const authorization = request.headers.get("api-key") || request.headers.get("authorization") || "";
      if (!isAuthorized(authorization) || disabledAIProviders.includes("azure") || await hasDisabledAIModel()) {
        return NextResponse.json({ error: ERRORS.NO_PERMISSIONS }, { status: 403 });
      }
      const apiKey = multiApiKeyPolling(AZURE_API_KEY);
      if (!apiKey) return NextResponse.json({ error: ERRORS.NO_API_KEY }, { status: 500 });

      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("api-key", apiKey);
      return NextResponse.next({ request: { headers: requestHeaders } });
    }

    if (pathname.startsWith("/api/ai/google-vertex")) {
      const authorization = request.headers.get("authorization") || "";
      if (!isAuthorized(authorization) || disabledAIProviders.includes("google-vertex") || await hasDisabledAIModel()) {
        return NextResponse.json({ error: ERRORS.NO_PERMISSIONS }, { status: 403 });
      }
      const apiKey = await generateAuthToken({
        clientEmail: GOOGLE_CLIENT_EMAIL,
        privateKey: GOOGLE_PRIVATE_KEY,
        privateKeyId: GOOGLE_PRIVATE_KEY_ID,
      });
      if (!apiKey) return NextResponse.json({ error: ERRORS.NO_API_KEY }, { status: 500 });

      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("Authorization", `Bearer ${apiKey}`);
      return NextResponse.next({ request: { headers: requestHeaders } });
    }

    if (pathname.startsWith("/api/ai/pollinations") || pathname.startsWith("/api/ai/ollama")) {
      const authorization = request.headers.get("authorization") || "";
      if (!isAuthorized(authorization) || await hasDisabledAIModel()) {
        return NextResponse.json({ error: ERRORS.NO_PERMISSIONS }, { status: 403 });
      }
      return NextResponse.next();
    }

    if (pathname.startsWith("/api/search")) {
      const authorization = request.headers.get("authorization") || "";
      const provider = pathname.split("/")[3];
      if (!isAuthorized(authorization) || disabledSearchProviders.includes(provider)) {
        return NextResponse.json({ error: ERRORS.NO_PERMISSIONS }, { status: 403 });
      }

      let apiKey = "";
      if (provider === "tavily") apiKey = multiApiKeyPolling(TAVILY_API_KEY);
      else if (provider === "firecrawl") apiKey = multiApiKeyPolling(FIRECRAWL_API_KEY);
      else if (provider === "exa") apiKey = multiApiKeyPolling(EXA_API_KEY);
      else if (provider === "bocha") apiKey = multiApiKeyPolling(BOCHA_API_KEY);

      if (provider !== "searxng" && !apiKey) {
        return NextResponse.json({ error: ERRORS.NO_API_KEY }, { status: 500 });
      }

      const requestHeaders = new Headers(request.headers);
      if (apiKey) requestHeaders.set("Authorization", `Bearer ${apiKey}`);
      if (provider === "searxng") requestHeaders.delete("Authorization");

      return NextResponse.next({ request: { headers: requestHeaders } });
    }

    if (pathname.startsWith("/api/sse")) {
      let auth = request.headers.get("authorization") || "";
      if (auth.startsWith("Bearer ")) auth = auth.substring(7);
      else if (request.method === "GET") auth = request.nextUrl.searchParams.get("password") || "";

      if (accessPassword && auth !== accessPassword) {
        return NextResponse.json({ error: ERRORS.NO_PERMISSIONS }, { status: 403 });
      }
      return NextResponse.next();
    }

    return NextResponse.next();
  } catch (err) {
    console.error("Middleware error:", err);
    return NextResponse.next(); // Fallback to next if middleware itself fails
  }
}
