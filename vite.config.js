import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),      // 你的首页
        gallery: resolve(__dirname, 'gallery.html'),  // 你的第二个页面
      },
    },
  },
});
