# NOCTYRA
**WHERE SILENCE MEETS INFINITY.**

An endless universe of procedurally generated identities. Static files only: `index.html`, `style.css`, `script.js`.

## Deploy on GitHub Pages
1. Put `index.html`, `style.css`, `script.js` and the background image `3db23560f4989b80a653c5aab34e714a.jpg` in the same folder of the repository (the image is already in `InfiniteProfile/NOCTYRA`).
2. Settings, Pages, deploy from the `main` branch root.
3. Open `https://<user>.github.io/NOCTYRA/`.

All paths are relative, so it works under a repository path. If the local image is missing, the site falls back to the repository's raw URL.

## Direct links
`?profile=IDENTIFIER` opens a profile, for example `?profile=0`, `?profile=100`, `?profile=999999999999999999999999999999`.
Identifiers are decimal strings handled with BigInt, so there is no upper limit. Every profile is computed from its identifier alone (seeded PRNG), so the same link shows the same identity everywhere.

Handles look like `@name-family.<base36 id>`; the identifier is recoverable from the handle, so searching a handle opens that profile directly.

## Search
Accepts a profile number, a handle, a profile link, or a name. Names are searched in a bounded stretch of the universe near your position in the directory (4,000 identities at a time, with a button to scan further), because an endless set has no complete index.

## Testing a failed batch
In the browser console run `NOCTYRA_TEST.failNext(1)` and scroll: a retry button appears, and pressing it resumes loading.
