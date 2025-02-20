import { defineConfig, mergeConfig } from 'vite'
import commonConfig from '../common'

export default mergeConfig(
  commonConfig,
  defineConfig({
    server: {
      proxy: {
        // 4A 接口
        '/proxyApi': {
          target: 'http://172.21.30.105:32711/',
          // target: 'http://127.0.0.1:7001/',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/proxyApi/, '/'),
        },
        // 全局 WebSocket
        '/ws': {
          target: 'ws://172.21.30.105:32201',
          ws: true,
          changeOrigin: true,
        },
        // 设备websocket直连
        '/v3': {
          target: 'ws://172.21.30.105:32041',
          ws: true,
          changeOrigin: true,
        },
        '/storage': {
          target: 'http://172.21.30.105:32205',
          changeOrigin: true,
        },
        // 历史视频
        '/stream': {
          target: 'http://172.21.30.105:32011',
          changeOrigin: true,
        },
      },
    },
    define: {
      // 用于合并 window.config 的配置
      __DEV_MERGE_CONFIG__: {
        systemName: 'jingqi',
        loginUrl: 'http://172.21.30.105:32712/login',
      },
    },
  }),
)
