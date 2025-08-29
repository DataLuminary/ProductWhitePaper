# ProductWhitePaper

ProductWhitePaper is the RsPress site for DataLuminary user and developer
documentation.

## Setup

Install the dependencies:

```bash
pnpm install
```

## Get started

Start the dev server:

```bash
pnpm run dev
```

Build the website for production:

```bash
pnpm run build
```

Preview the production build locally:

```bash
pnpm run preview
```

## Deployment

Docs are deployed to [docs.dataluminary.dev](https://docs.dataluminary.dev) via GitHub Pages.

- **Workflow**: `.github/workflows/deploy-pages.yml` (runs on push to `main`)
- **Build output**: `doc_build/`
- **Custom domain**: `docs.dataluminary.dev` (CNAME → `dataluminary.github.io`)

### DNS (Cloudflare / registrar)

| Type  | Name  | Value                    |
|-------|-------|--------------------------|
| CNAME | docs  | dataluminary.github.io   |

After the first deploy, enable **GitHub Pages → Source: GitHub Actions** in repo settings if not already configured.

## License

[Polyform Noncommercial License 1.0.0](LICENSE) (Polyform-NC). See DataLuminary meta repo for commercial licensing.
