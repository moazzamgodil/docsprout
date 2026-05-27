# docsprout

`docsprout` is a plug-and-play documentation platform for existing projects.

Install it, run one command, and get:
- public docs site (`/docs`)
- admin CMS (`/docs-admin`)
- automatic Markdown discovery and sidebar generation

## Installation

```bash
npm install -D docsprout
```

## Quick Start

From your project root:

```bash
npx docsprout init
npx docsprout dev
```

Then open:
- `http://localhost:3000/docs`
- `http://localhost:3000/docs-admin`

## CLI Commands

### `npx docsprout init`
Initialize docsprout in your project.

Creates a `docsprout/` folder with config, generated data, and web runtime.

### `npx docsprout upgrade`
Upgrade your generated docs runtime (`docsprout/web`) to the latest scaffold template.

### `npx docsprout scan`
Rescan Markdown files and regenerate pages/sidebar/search data.

### `npx docsprout dev`
Run docs + admin in development mode with Markdown file watching.

### `npx docsprout build`
Create a production build.

### `npx docsprout publish`
Create a published-only production build (drafts excluded).

## How Markdown Is Discovered

By default, docsprout scans configured content roots for:
- `README.md`
- `*.md`
- `*.mdx`

Default ignore patterns include:
- `node_modules`
- `dist`
- `build`
- `coverage`
- `.next`
- hidden folders

## Configuration

Edit `docsprout/config.json`:

```json
{
  "projectName": "My Project",
  "contentRoots": [".", "packages/*", "apps/*"],
  "ignore": [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/coverage/**",
    "**/.next/**",
    "**/.*/**"
  ],
  "theme": "default",
  "basePath": "/docs",
  "adminPath": "/docs-admin",
  "outputDir": "docsprout",
  "includeDraftsInDev": true
}
```

## Draft/Publish Workflow

Use frontmatter in Markdown files:

```md
---
title: API Overview
status: draft
order: 3
tags: [api, backend]
---
```

Rules:
- `status: draft` => visible in admin/dev workflows
- `status: published` => included in public docs and production outputs

## Admin CMS Features

`/docs-admin` includes:
- page listing and search
- create/edit pages
- markdown editor with toolbar
- preview mode
- diagram-friendly markdown authoring
- project config editing

## Diagram Support

Docs and preview support Mermaid and common diagram syntaxes using fenced code blocks, for example:

<pre>
```mermaid
flowchart LR
  A[Start] --> B[Done]
```
</pre>

## Suggested NPM Scripts

```json
{
  "scripts": {
    "docs:init": "docsprout init",
    "docs:upgrade": "docsprout upgrade",
    "docs:scan": "docsprout scan",
    "docs:dev": "docsprout dev",
    "docs:build": "docsprout build",
    "docs:publish": "docsprout publish"
  }
}
```

## Monorepo Support

Works well with:
- npm workspaces
- Turborepo
- Nx

Recommended: run commands from monorepo root.

## Troubleshooting

### Docs not updating
Run:

```bash
npx docsprout scan
```

### Page missing from production
Check frontmatter status:
- must be `published`

### Runtime scaffold upgrade
Run:

```bash
npx docsprout upgrade
```

## License

MIT
