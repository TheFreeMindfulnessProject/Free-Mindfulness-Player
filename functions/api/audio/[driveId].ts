interface EventContext {
  request: Request;
  params: {
    driveId: string;
  };
}

export async function onRequest(context: EventContext): Promise<Response> {
  const driveId = context.params.driveId;
  if (!driveId || !/^[a-zA-Z0-9_-]+$/.test(driveId)) {
    return new Response(JSON.stringify({ error: 'Invalid drive ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const rangeHeader = context.request.headers.get('range');
  const targetUrl = `https://drive.usercontent.google.com/download?id=${driveId}&export=download`;

  const fetchHeaders: Record<string, string> = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  };
  if (rangeHeader) {
    fetchHeaders['Range'] = rangeHeader;
  }

  try {
    const upstreamResponse = await fetch(targetUrl, {
      headers: fetchHeaders,
      redirect: 'follow',
    });

    const responseHeaders = new Headers(upstreamResponse.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Headers', 'Range, Accept');
    responseHeaders.set('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges');
    responseHeaders.set('Cache-Control', 'public, max-age=86400');

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers: responseHeaders,
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to fetch audio stream' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
