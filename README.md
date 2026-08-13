# portfolio-2026

Two projects live in this repo:

| Folder | Stack | What it is |
| --- | --- | --- |
| [`atomic-v4/`](atomic-v4) | Astro + Lenis | The portfolio site build (HOME V4). |
| [`showreel/`](showreel) | Remotion | The hero showreel video, rendered to MP4/WebM. |

## Running

```bash
# site
cd atomic-v4 && npm install && npm run dev

# showreel
cd showreel && npm install && npm run dev   # Remotion Studio
cd showreel && npm run render               # HeroReel -> out/hero-reel-30s.mp4
```

Build output (`dist/`, `out/`, `.astro/`) and `node_modules/` are not tracked.
