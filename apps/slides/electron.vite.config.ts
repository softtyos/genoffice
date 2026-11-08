import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'

const here = dirname(fileURLToPath(import.meta.url))

// Pin resolution to this repo's workspace sources (matches tsconfig paths;
// avoids bundling stale implementations when node_modules links point elsewhere)
const workspaceAlias = {
  // Subpath before the bare name: string aliases are prefix replacements
  '@softty/pptx-engine/table-grid': resolve(
    here,
    '../../packages/pptx-engine/src/table-grid.ts',
  ),
  '@softty/pptx-engine/identity': resolve(here, '../../packages/pptx-engine/src/identity.ts'),
  '@softty/pptx-engine/named-action': resolve(
    here,
    '../../packages/pptx-engine/src/named-action.ts',
  ),
  '@softty/pptx-engine/custgeom': resolve(here, '../../packages/pptx-engine/src/custgeom.ts'),
  '@softty/pptx-engine/background-promote': resolve(
    here,
    '../../packages/pptx-engine/src/background-promote.ts',
  ),
  '@softty/pptx-engine/model3d': resolve(here, '../../packages/pptx-engine/src/model3d.ts'),
  '@softty/pptx-engine/chart-workbook': resolve(
    here,
    '../../packages/pptx-engine/src/chart-workbook.ts',
  ),
  '@softty/pptx-engine': resolve(here, '../../packages/pptx-engine/src/index.ts'),
  '@softty/pptx-ops/op-docs': resolve(here, '../../packages/pptx-ops/src/op-docs.ts'),
  '@softty/pptx-ops/font-size': resolve(here, '../../packages/pptx-ops/src/font-size.ts'),
  '@softty/pptx-ops': resolve(here, '../../packages/pptx-ops/src/index.ts'),
  '@softty/pptx-render/preset-geometry': resolve(
    here,
    '../../packages/pptx-render/src/preset-geometry.ts',
  ),
  '@softty/pptx-render': resolve(here, '../../packages/pptx-render/src/index.ts'),
  '@softty/pipelines/slides/layout-audit': resolve(
    here,
    '../../packages/pipelines/src/slides/layout-audit.ts',
  ),
  '@softty/pipelines/slides': resolve(here, '../../packages/pipelines/src/slides/index.ts'),
  // Metafile (EMF/WMF) rasterizer shared with the docs engine (renderer-only: needs canvas)
  '@softty/docx-engine/metafile': resolve(here, '../../packages/docx-engine/src/metafile.ts'),
  '@softty/docx-engine/math': resolve(here, '../../packages/docx-engine/src/math.ts'),
}

export default defineConfig({
  // Main process/preload must bundle @softty/* sources (they are pulled in as TS
  // source with extensionless relative imports; externalizing them under Node
  // yields ERR_MODULE_NOT_FOUND).
  main: {
    resolve: { alias: workspaceAlias },
    // Bundle opentype.js too (the packaged app ships only out/**, so external deps are unresolvable at runtime)
    plugins: [
      externalizeDepsPlugin({
        exclude: [
          '@softty/pptx-engine',
          '@softty/pptx-ops',
          '@softty/pptx-render',
          '@softty/pipelines',
          '@softty/ai-search',
          '@softty/file-parse',
          '@softty/xlsx-gateway',
          '@softty/electron-utils',
          'opentype.js',
        ],
      }),
    ],
  },
  preload: {
    // electron-utils ships raw TS source — must be bundled, not left external
    plugins: [externalizeDepsPlugin({ exclude: ['@softty/electron-utils'] })],
  },
  renderer: {
    resolve: { alias: workspaceAlias },
    plugins: [react()],
    server: {
      port: Number(process.env.SLIDES_DEV_PORT) || 5175,
      strictPort: Boolean(process.env.SLIDES_DEV_PORT),
    },
  },
})
