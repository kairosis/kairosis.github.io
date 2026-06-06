# Kairosis Docs

Source for **[kairosis.github.io](https://kairosis.github.io)** — the Kairosis documentation site.

Built with [Astro Starlight](https://starlight.astro.build). Deployed automatically to GitHub Pages on every push to `main`, and whenever connector or event sources change in [kairosis/kairosis](https://github.com/kairosis/kairosis).

## Local development

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # production build → dist/
npm run preview    # preview the build
```

## Structure

```
src/
  content/
    docs/           Markdown and MDX pages
  assets/           Images and static files
public/             Favicons and other public assets
astro.config.mjs    Site config (title, sidebar, etc.)
```

Pages are `.md` or `.mdx` files under `src/content/docs/`. File path = URL path.

## Syncing from kairosis/kairosis

Connector and event docs are generated automatically from the source in `kairosis/kairosis`. The `sync` script (triggered by GitHub Actions) reads connector manifests and event package sources from `_kairosis/` and writes the corresponding pages into `src/content/docs/`.
