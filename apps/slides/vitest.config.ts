import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const here = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  // Pin resolution to this repo's workspace sources (matches tsconfig paths)
  resolve: {
    alias: {
      // Subpath before the bare name: string aliases are prefix replacements
      '@softty/pptx-engine/table-grid': resolve(
        here,
        '../../packages/pptx-engine/src/table-grid.ts',
      ),
      '@softty/pptx-engine/identity': resolve(
        here,
        '../../packages/pptx-engine/src/identity.ts',
      ),
      '@softty/pptx-engine/named-action': resolve(
        here,
        '../../packages/pptx-engine/src/named-action.ts',
      ),
      '@softty/pptx-engine/background-promote': resolve(
        here,
        '../../packages/pptx-engine/src/background-promote.ts',
      ),
      '@softty/pptx-engine/custgeom': resolve(
        here,
        '../../packages/pptx-engine/src/custgeom.ts',
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
      '@softty/docx-engine/metafile': resolve(
        here,
        '../../packages/docx-engine/src/metafile.ts',
      ),
    },
  },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'jsdom',
    testTimeout: 20000,
  },
})
