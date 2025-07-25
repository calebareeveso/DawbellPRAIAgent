import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const domain = searchParams.get("domain");

//   https://github.com/DaWe35/Similarweb-free-API 
  // https://data.similarweb.com/api/v1/data?domain=github.com

  const response = await fetch(
    `https://data.similarweb.com/api/v1/data?domain=${domain}`
  );
  const data = await response.json();

  return NextResponse.json(data);
}
