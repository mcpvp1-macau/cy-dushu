import { defineConfig, mergeConfig } from 'vite'
import commonConfig from '../common'

export default mergeConfig(
  commonConfig,
  defineConfig({
    server: {
      host: '0.0.0.0',
      proxy: {
        // 4A 接口
        '/proxyApi': {
          target: 'http://117.68.88.170:31851/',
          // target: 'http://117.68.88.170:32711/',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/proxyApi/, ''),
        },
        '/proxy4aApi': {
          // target: 'http://117.68.88.170:31851/',
          target: 'http://117.68.88.170:32711/',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/proxy4aApi/, ''),
        },
        '/proxyWsApi': {
          target: 'ws://117.68.88.170:31851/',
          // target: 'ws://127.0.0.1:7001/',
          ws: true,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/proxyWsApi/, ''),
        },
        // 全局 WebSocket
        '/ws': {
          target: 'ws://117.68.88.170:32201',
          ws: true,
          changeOrigin: true,
        },
        // 设备websocket直连
        '/v3': {
          target: 'wss://117.68.88.170:32590',
          ws: true,
          changeOrigin: true,
        },
        '/storage': {
          target: 'http://117.68.88.170:32205',
          changeOrigin: true,
        },
        '/data': {
          target: 'http://61.153.111.197:32650',
          changeOrigin: true,
        },
        // 瓦片地图
        '/ja-map': {
          target: 'http://117.68.88.170:32712',
          changeOrigin: true,
        },
        '/raster': {
          target: 'http://api.mapbox.com',
          // secure: false,
          changeOrigin: true,
        },
        '/asr': {
          target: 'ws://121.196.145.43:10096',
          ws: true,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/asr/, ''),
        },
        '/upload': {
          target: 'http://117.68.88.170:32000',
          changeOrigin: true,
          // pathRewrite: { '^/upload': '' },
          rewrite: (path) => path.replace(/^\/upload/, ''),
        },
      },
    },
    define: {
      // 用于合并 window.config 的配置
      __DEV_MERGE_CONFIG__: {
        systemName: 'jingqi',
        loginUrl: 'https://117.68.88.170:32712/login',
        globalWs: 'ws',
      },
    },
  }),
)
