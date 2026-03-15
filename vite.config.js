import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      src: path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist', // 构建输出目录
    sourcemap: false, // 生产环境一般不开 sourcemap，调试需求可改 true
  },
  server: {
    host: '0.0.0.0', // 让外网可访问
    allowedHosts: [
      '1386-171-83-6-195.ngrok-free.app', // 必须写 ngrok 当前分配的域名
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:4399', // 后端地址
        changeOrigin: true,
      },
    },
  },
})
