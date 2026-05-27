# internal.md

Internal development notes for maintainers of the `docsprout` repository.

## Local Development

```bash
npm install
npm run build -w @docsprout/core
npm run build -w docsprout
```

## Local CLI Testing

```bash
npm link ./packages/cli
```

In a separate sample project:

```bash
docsprout init
docsprout dev
```

## Internal Repository Structure

- `packages/core`: scanner + generation logic
- `packages/cli`: end-user command interface
- `packages/shared`: shared types/constants
- `packages/themes`: theme defaults/presets
- `apps/web`: internal scaffold reference app
- `templates/base`: base content/config templates
- `packages/cli/templates/web`: runtime template shipped to users

## Release Checklist

1. Build key packages:
   - `npm run build -w @docsprout/core`
   - `npm run build -w docsprout`
2. Verify scaffold flow:
   - `docsprout init`
   - `docsprout dev`
   - `docsprout build`
   - `docsprout publish`
3. Verify admin config/theme save and diagram rendering.
4. Update `README.md` if user-facing behavior changed.
5. Publish package to npm.

## Do Not Commit

- `node_modules/`
- `.next/`
- `dist/`
- generated runtime `docsprout/`
- local test sandboxes (`tmp-existing-project/`)
