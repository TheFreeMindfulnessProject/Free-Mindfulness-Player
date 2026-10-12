const CACHE_NAME = 'lthtr-meditation-audio-v1';

export async function isTrackCached(trackId: string, url: string): Promise<boolean> {
  if (typeof window === 'undefined' || !('caches' in window)) return false;
  try {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(url);
    return !!cachedResponse;
  } catch (err) {
    console.warn('Cache check failed:', err);
    return false;
  }
}

export async function cacheTrackAudio(
  trackId: string,
  url: string,
  onProgress?: (percent: number) => void
): Promise<boolean> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    throw new Error('Offline storage is not supported in this browser.');
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download audio: ${response.statusText}`);
    }

    let blob: Blob;
    const contentLength = response.headers.get('content-length');
    const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;

    if (totalBytes > 0 && response.body && 'getReader' in response.body) {
      try {
        const reader = response.body.getReader();
        const chunks: Uint8Array[] = [];
        let receivedBytes = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            chunks.push(value);
            receivedBytes += value.length;
            if (onProgress) {
              onProgress(Math.min(99, Math.round((receivedBytes / totalBytes) * 100)));
            }
          }
        }
        blob = new Blob(chunks as unknown as BlobPart[], { type: 'audio/mpeg' });
      } catch (streamErr) {
        console.warn('Stream reader failed, falling back to direct blob fetch:', streamErr);
        const fallbackRes = await fetch(url);
        blob = await fallbackRes.blob();
      }
    } else {
      blob = await response.blob();
    }

    if (onProgress) {
      onProgress(100);
    }

    const responseToCache = new Response(blob, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': blob.size.toString(),
      },
    });

    const cache = await caches.open(CACHE_NAME);
    await cache.put(url, responseToCache);
    return true;
  } catch (err) {
    console.error('Error caching track:', err);
    throw err;
  }
}

export async function removeTrackFromCache(url: string): Promise<boolean> {
  if (typeof window === 'undefined' || !('caches' in window)) return false;
  try {
    const cache = await caches.open(CACHE_NAME);
    return await cache.delete(url);
  } catch (err) {
    console.warn('Failed to delete cached track:', err);
    return false;
  }
}

export async function getCachedAudioBlobUrl(url: string): Promise<string | null> {
  if (typeof window === 'undefined' || !('caches' in window)) return null;
  try {
    const cache = await caches.open(CACHE_NAME);
    const matched = await cache.match(url);
    if (!matched) return null;
    const blob = await matched.blob();
    return URL.createObjectURL(blob);
  } catch (err) {
    console.warn('Failed to retrieve cached blob:', err);
    return null;
  }
}
