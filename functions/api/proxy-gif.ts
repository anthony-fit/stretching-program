export async function onRequestGet(context: any) {
  const requestUrl = new URL(context.request.url);
  const url = requestUrl.searchParams.get("url");

  if (!url) {
    return new Response("No URL provided", { status: 400 });
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to fetch source image: " + response.statusText);
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";

    return new Response(response.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: any) {
    // SVG fallback exactly matching server.ts behavior
    const svgFallback = `<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#f1ece5" />
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="20" font-weight="bold" fill="#7d7c75">Animation Unavailable</text>
  <text x="50%" y="58%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#a4a29a">External server is currently down</text>
</svg>`;

    return new Response(svgFallback, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "no-cache",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}
