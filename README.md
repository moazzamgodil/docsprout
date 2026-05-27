# docsprout

`docsprout` is a plug-and-play documentation platform for existing projects.

Install it, run `init`, and get:
- a documentation site (`/docs`)
- an admin CMS (`/docs-admin`)
- auto-generated navigation from your Markdown files

## Installation

```bash
npm install -D docsprout
```

## Quick Start (Existing Project)

From your project root:

```bash
npx docsprout init
npx docsprout dev
```

`init` creates:
1. `docsprout/` content + generated data folders
2. `apps/web` docs runtime app

On first `dev`, dependencies for `docsprout/web` are installed automatically.

## Commands

### `npx docsprout init`
Initial setup.

Creates:
- `docsprout/config.json`
- `docsprout/sidebar.json`
- `docsprout/content/`
- `docsprout/generated/`
- `docsprout/themes/`
- `docsprout/uploads/`
- `docsprout/cache/`
- `docsprout/web` (Next.js docs + admin app)

### `npx docsprout scan`
Rescans Markdown files and regenerates sidebar/search data.

### `npx docsprout dev`
Starts development mode:
- watches Markdown changes
- regenerates generated data on change
- runs docs/admin with hot reload

### `npx docsprout build`
Creates production build.

### `npx docsprout publish`
Builds published-only output:
- draft pages excluded
- search index excludes drafts

## Using in Existing Projects

### 1) Add your docs files
Place docs anywhere in your repo:
- root `README.md`
- `docs/**/*.md`
- `packages/*/**/*.md` (monorepos)
- `apps/*/**/*.md`

### 2) Configure discovery
Edit `docsprout/config.json`:

```json
{
  "contentRoots": [".", "packages/*", "apps/*"],
  "ignore": [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/coverage/**",
    "**/.next/**",
    "**/.*/**"
  ],
  "basePath": "/docs",
  "adminPath": "/docs-admin"
}
```

### 3) Mark drafts and published pages
Use frontmatter:

```md
---
title: API Overview
status: draft
order: 3
tags: [api, backend]
---
```

- `status: published` => visible in production
- `status: draft` => CMS/dev preview only

### 4) Run in your workflow

```bash
npx docsprout scan
npx docsprout dev
npx docsprout build
```

## NPM Scripts (Recommended)

Add to your project `package.json`:

```json
{
  "scripts": {
    "docs:init": "docsprout init",
    "docs:scan": "docsprout scan",
    "docs:dev": "docsprout dev",
    "docs:build": "docsprout build",
    "docs:publish": "docsprout publish"
  }
}
```

## Monorepo Support

`docsprout` works with:
- npm workspaces
- Turborepo
- Nx

Recommended:
- run commands from monorepo root
- set `contentRoots` to match workspace layout

## Production Notes

- Only `published` pages are included in production output.
- Run `docsprout publish` in CI for production docs builds.
- Keep `docsprout/config.json` in version control.

## Troubleshooting

### `Web app not found. Run \`docsprout init\` first.`
Run `npx docsprout init` from project root. This command scaffolds `docsprout/web`.

### Docs page is empty
- Run `npx docsprout scan`
- Check `contentRoots` paths
- Ensure files end in `.md` or `.mdx`

### Page missing in production
- Confirm frontmatter has `status: published`

### Sidebar order looks wrong
- Add frontmatter `order` values

## License

MIT


