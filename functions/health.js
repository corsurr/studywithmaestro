export async function onRequestGet() {
  return new Response(JSON.stringify({ ok: true, service: 'maestro-app', documentExtraction: false }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}
