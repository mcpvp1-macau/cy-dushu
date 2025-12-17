import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import cesium from 'vite-plugin-cesium'
import AutoImport from '../plugins/auto-import'
import path from 'path'
// import legacy from '@vitejs/plugin-legacy'
import ViteYaml from '@modyfi/vite-plugin-yaml'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'

// 公共的配置, 开发时, 生产时都需要的配置
export default defineConfig({
  plugins: [
    wasm(),
    react(),
    cesium(),
    // legacy({
    //   targets: ['defaults', 'not IE 11'],
    // }),
    ViteYaml(),
    AutoImport,
    topLevelAwait(),
  ],
  worker: {
    format: 'es',
    plugins: () => [wasm(), topLevelAwait()],
  },
  // root 默认是 process.cwd()，即执行 vite 命令的当前目录
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src'),
    },
  },
  define: {
    // 用于合并 window.config 的配置, 仅仅在 dev 环境下生效
    __DEV_MERGE_CONFIG__: {},
  },
})
