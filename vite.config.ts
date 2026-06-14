import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages project site base path — update if the repo name changes
const base = process.env.VITE_BASE_PATH ?? '/Marketplace-ERP/'

export default defineConfig({
  base,
  plugins: [react()],
})
