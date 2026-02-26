import { NextResponse, type NextRequest } from "next/server";

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

const API_PROXY_BASE_URL = `https://${process.env.AZURE_RESOURCE_NAME}.openai.azure.com/openai/deployments`;
const API_VERSION = process.env.AZURE_API_VERSION || "";

async function handler(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug: path } = await params;
  let body;
  if (req.method.toUpperCase() !== "GET") {
    body = await req.json();
  }
  const searchParams = req.nextUrl.searchParams;


  if (API_VERSION) searchParams.append("api-version", API_VERSION);
  const paramsStr = searchParams.toString();

  try {
    if (API_PROXY_BASE_URL === "") {
      throw new Error("API base url is missing.");
    }
    let url = `${API_PROXY_BASE_URL}/${decodeURIComponent(path.join("/"))}`;
    if (paramsStr) url += `?${paramsStr}`;
    console.log(url);
    const payload: RequestInit = {
      method: req.method,
      headers: {
        "Content-Type": req.headers.get("Content-Type") || "application/json",
        "api-key": req.headers.get("api-key") || "",
      },
    };
    if (body) payload.body = JSON.stringify(body);
    const response = await fetch(url, payload);
    return new NextResponse(response.body, response);
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      return NextResponse.json(
        { code: 500, message: error.message },
        { status: 500 }
      );
    }
  }
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE };
