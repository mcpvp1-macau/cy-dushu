import { defineConfig, mergeConfig } from 'vite'
import commonConfig from '../common'

export default mergeConfig(
  commonConfig,
  defineConfig({
    server: {
      proxy: {
        // 4A 接口
        '/proxyApi': {
          target: 'http://36.133.175.183:32711/',
          // target: 'http://127.0.0.1:7001/',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/proxyApi/, '/'),
        },
        // 全局 WebSocket
        '/ws': {
          target: 'http://36.133.175.183:32201',
          ws: true,
          changeOrigin: true,
        },
        // 设备websocket直连
        '/v3': {
          target: 'https://36.133.175.183:32713',
          ws: true,
          changeOrigin: true,
        },
        '/storage': {
          target: 'http://36.133.175.183:32205',
          changeOrigin: true,
        },
        '/data': {
          target: 'http://36.133.175.183:32650',
          changeOrigin: true,
        },
        // 瓦片地图
        '/ja-map': {
          target: 'http://36.133.175.183:32712',
          changeOrigin: true,
        },
      },
    },
    define: {
      // 用于合并 window.config 的配置
      __DEV_MERGE_CONFIG__: {
        systemName: 'jingqi',
        loginUrl: 'http://36.133.175.183:32712/login',
      },
    },
  }),
)
