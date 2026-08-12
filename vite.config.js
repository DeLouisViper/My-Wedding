import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' giúp app chạy đúng dù được deploy ở bất kỳ đường dẫn con nào trên GitHub Pages
export default defineConfig({
  plugins: [react()],
  base: './',
})
