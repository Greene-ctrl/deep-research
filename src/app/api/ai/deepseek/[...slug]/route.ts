import { NextResponse, type NextRequest } from "next/server";
import { DEEPSEEK_BASE_URL } from "@/constants/urls";

export const runtime = "edge";
export const preferredRegion = [
  "cle1",
  "iad1",
  "pdx1",
  "sfo1",
  "sin1",
  "syd1",
  "hnd1",
  "kix1",
];

const API_PROXY_BASE_URL = process.env.DEEPSEEK_API_BASE_URL || DEEPSEEK_BASE_URL || "https://api.deepseek.com";

async function handler(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  try {
    const { slug: path } = await params;
    let body;
    if (req.method.toUpperCase() !== "GET" && req.method.toUpperCase() !== "HEAD") {
      body = await req.json().catch(() => undefined);
    }
    const searchParams = req.nextUrl.searchParams;
    const paramsStr = searchParams.toString();

    let url = `${API_PROXY_BASE_URL}/${decodeURIComponent(path.join("/"))}`;
    if (paramsStr) url += `?${paramsStr}`;

    const payload: RequestInit = {
      method: req.method,
      headers: {
        "Content-Type": req.headers.get("Content-Type") || "application/json",
        Authorization: req.headers.get("Authorization") || "",
      },
    };
    if (body) payload.body = JSON.stringify(body);

    const response = await fetch(url, payload);

    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      if (!["content-encoding", "transfer-encoding", "content-length"].includes(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    });

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Proxy error (deepseek):", error);
    return NextResponse.json(
      { code: 500, message: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE };
