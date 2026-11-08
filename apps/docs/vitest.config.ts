import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// resolve sibling source packages by path (not via node_modules), so a git
// worktree whose node_modules is linked to another checkout still tests
// against this checkout's edits (same convention as packages/pdf2docx)
const local = (rel: string) => fileURLToPath(new URL(rel, import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@softty/docx-engine/lazy-media': local('../../packages/docx-engine/src/lazy-media.ts'),
      '@softty/docx-engine/zip-splice': local('../../packages/docx-engine/src/zip-splice.ts'),
      '@softty/docx-engine': local('../../packages/docx-engine/src/index.ts'),
      '@softty/font-metrics/resolve': local('../../packages/font-metrics/src/resolve.ts'),
      '@softty/font-metrics/word-faces.json': local(
        '../../packages/font-metrics/word-faces.json',
      ),
      '@softty/font-metrics': local('../../packages/font-metrics/src/index.ts'),
      // subpath before the bare name: string aliases are prefix replacements
      '@softty/electron-utils/headless-export': local(
        '../../packages/electron-utils/src/headless-export.ts',
      ),
      '@softty/electron-utils/atomic-write': local(
        '../../packages/electron-utils/src/atomic-write.ts',
      ),
      '@softty/electron-utils/safe-external-url': local(
        '../../packages/electron-utils/src/safe-external-url.ts',
      ),
      '@softty/electron-utils/print-cups': local(
        '../../packages/electron-utils/src/print-cups.ts',
      ),
      '@softty/electron-utils/print-job': local(
        '../../packages/electron-utils/src/print-job.ts',
      ),
      '@softty/electron-utils/generated-images': local(
        '../../packages/electron-utils/src/generated-images.ts',
      ),
      '@softty/electron-utils/remote-image': local(
        '../../packages/electron-utils/src/remote-image.ts',
      ),
      '@softty/electron-utils/safe-remote-url': local(
        '../../packages/electron-utils/src/safe-remote-url.ts',
      ),
      '@softty/electron-utils': local('../../packages/electron-utils/src/index.ts'),
      '@softty/ai-provider/codex-app-server': local(
        '../../packages/ai-provider/src/codex-app-server.ts',
      ),
      '@softty/ai-provider/trace': local('../../packages/ai-provider/src/trace.ts'),
      '@softty/ai-provider/custom-models': local(
        '../../packages/ai-provider/src/custom-models.ts',
      ),
      '@softty/ai-provider/browser': local('../../packages/ai-provider/src/browser.ts'),
      '@softty/ai-provider': local('../../packages/ai-provider/src/index.ts'),
      '@softty/i18n': local('../../packages/i18n/src/index.ts'),
      '@softty/ui': local('../../packages/ui/src/index.ts'),
    },
  },
  test: {
    include: ['tests/**/*.test.ts'],
    // the engine's display-only `effective` keys stay out of saved-model toEqual
    setupFiles: [local('../../packages/docx-engine/tests/setup-equality.ts')],
    environment: 'jsdom',
    testTimeout: 20000,
  },
})
