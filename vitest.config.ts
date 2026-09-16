import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// フロント（jsdom）と Lambda（node）を 1 つのランナーで動かす。
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    projects: [
      {
        // Vitest 5 は既定で extends: true（ルートの plugins/globals を継承）
        test: {
          name: 'frontend',
          environment: 'jsdom',
          include: ['src/**/*.test.{ts,tsx}'],
          setupFiles: ['src/test/setup.ts'],
        },
      },
      {
        test: {
          name: 'lambda',
          environment: 'node',
          include: ['tests/lambda/**/*.test.js'],
          setupFiles: ['tests/lambda/setupEnv.js'],
        },
      },
    ],
  },
})
