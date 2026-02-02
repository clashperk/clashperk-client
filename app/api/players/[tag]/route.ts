export async function GET(
  request: Request,
  { params }: { params: Promise<{ tag: string }> }
) {
  const { tag } = await params;

  const response = await fetch(
    `https://coc-api-proxy.clashperk.com/v1/players/${encodeURIComponent(tag)}`
  );
  const data = await response.json();

  return new Response(JSON.stringify(data), { status: response.status });
}
