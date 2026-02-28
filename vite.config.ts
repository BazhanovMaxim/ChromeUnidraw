import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Один бандл без code splitting — надёжнее для Chrome extension
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
      output: {
        entryFileNames: 'assets/popup.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
        // Всё в один чанк — нет проблем с динамической загрузкой
        manualChunks: undefined,
      },
    },
    // Поднимаем лимит — mermaid большой, это ОК для локального расширения
    chunkSizeWarningLimit: 5000,
  },
})
