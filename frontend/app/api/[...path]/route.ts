import { NextRequest, NextResponse } from "next/server"

const backendBaseUrl = process.env.BACKEND_INTERNAL_URL || "http://127.0.0.1:8080"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params
  const targetUrl = new URL(`${backendBaseUrl}/${path.join("/")}`)
  targetUrl.search = request.nextUrl.search

  const response = await fetch(targetUrl, {
    cache: "no-store",
    headers: {
      accept: "application/json",
    },
  })

  return new NextResponse(response.body, {
    status: response.status,
    headers: {
      "content-type": response.headers.get("content-type") || "application/json; charset=utf-8",
    },
  })
}
