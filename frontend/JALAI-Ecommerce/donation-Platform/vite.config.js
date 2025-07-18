import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

// ESM-safe __dirname replacement
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
// This configuration sets up Vite for a React project, allowing for path aliasing
// and ensuring compatibility with ESM modules. The `@` alias points to the `src` directory,
// making imports cleaner and more manageable. The `fileURLToPath` and `path` modules
// are used to create a safe `__dirname` equivalent in ESM, which is necessary for resolving paths correctly in the Vite configuration.