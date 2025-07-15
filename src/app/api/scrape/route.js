// app/api/scrape/route.js

export async function POST(request) {
  const { url } = await request.json();

  // Simulate scraping (later we can make this real)
  const fakeContent = `This is the full blog text scraped from: ${url}`;

  return Response.json({ text: fakeContent });
}
