import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    endpoints: [
      {
        method: "GET",
        path: "/health",
        purpose: "Returns HTTP 200 when the app is ready. Required for Hugging Face to transition the Space from starting to running.",
        request: {},
        response: {
          status: "ok"
        }
      },
      {
        method: "GET",
        path: "/api-docs",
        purpose: "Documents all available API endpoints.",
        request: {},
        response: {
          endpoints: "Array of endpoint objects"
        }
      }
    ]
  }, { status: 200 });
}
