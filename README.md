# MAESTRO App Prototype

A local, dependency-light prototype of the first MAESTRO learning loop:

Upload material -> generate a reviewer -> practice questions -> answer -> receive feedback -> see weak topics.

## Run locally

From this folder, run:

```powershell
node server.mjs
```

Then open http://localhost:4173.

The app accepts `.txt`, `.md`, `.text`, `.pdf`, and `.docx` files. Text files are read in the browser; PDF and DOCX files are extracted by the local server using free system tools, then kept in local app state. If no AI key is configured, the built-in local reviewer still works.

PDF extraction currently expects selectable text; scanned/image-only PDFs need OCR, which is intentionally not added to keep the local toolchain free and lightweight.

The interface now includes Overview, Syllabus, Practice, Quiz library, Coverage map, Materials, and Settings menus. Syllabus selectors are available in the sidebar and top bar. Settings includes larger text, high contrast, reduced motion, and local-progress reset. Navigation, uploads, and reviewer generation show loading feedback, and the layout adapts for smaller screens.

## Optional Gemini reviewer

The AI reviewer uses the official Google Gemini API through the local server. The key never belongs in browser code or in chat.

1. Copy `.env.example` to `.env`.
2. Create your own key at https://aistudio.google.com/apikey.
3. Put that key only in the local `.env` file as `GEMINI_API_KEY=...`.
4. Restart `node server.mjs` and open http://localhost:4173.

Never commit or share `.env`. The `.gitignore` file already excludes it. API availability, model access, and quotas can change, so the local fallback remains available if Gemini is unavailable.

## Current boundary

This prototype does not yet parse PowerPoint files, authenticate users, store data in a database, process payments, or deploy to the public internet. The local server currently uses `pdftotext` and Python's standard library for document extraction; those host tools are not automatically available on every public platform. Before deployment, the extraction endpoint needs either a platform-compatible adapter or a deliberate text-only public mode.

A public AI reviewer must keep `GEMINI_API_KEY` in the host's private environment settings. Never place it in frontend JavaScript, a public repository, or chat. The app should be deployable without a key using its local/fallback reviewer behavior, then AI generation can be enabled after the host secret is configured.

## Cloudflare Pages deployment

The project now includes a Pages Functions adapter under `functions/`:

- `/api/reviewer` calls Gemini server-side using the private `GEMINI_API_KEY` secret.
- `/api/extract` deliberately returns a clear text-only boundary; PDF/DOCX extraction remains local until a Workers-compatible parser is chosen.
- `/health` reports the deployment mode for smoke tests.
- `functions/_middleware.js` adds conservative security headers.

For a Pages project, use the repository root as the build output directory and leave the build command empty for this dependency-light static build. Add `GEMINI_API_KEY` and optionally `GEMINI_MODEL` under the project’s private Variables and Secrets settings for the Production environment. Do not paste keys into chat, commit them, or put them in frontend code.

Before calling the public build ready, verify `/health`, upload a `.txt` file, generate a reviewer with the local fallback and then with the private Gemini secret, and confirm a PDF/DOCX upload explains that public text-only mode is active. If the API endpoint is unavailable, the frontend should still fall back to the local reviewer.
