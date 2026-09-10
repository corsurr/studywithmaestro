function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}

export async function onRequestPost() {
  return json({
    code: 'public_text_only',
    error: 'PDF and DOCX extraction is available in the local prototype only. Export the material as .txt or .md for the public build.'
  }, 415);
}
