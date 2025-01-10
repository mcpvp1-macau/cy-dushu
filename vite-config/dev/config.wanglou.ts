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
          target: 'http://10.0.0.201:32711/',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/proxyApi/, '/'),
        },
        '/proxyWsApi': {
          target: 'ws://10.0.0.201:31851/',
          ws: true,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/proxyWsApi/, '/'),
        },
        // 全局 WebSocket
        '/ws': {
          target: 'ws://10.0.0.201:32201',
          ws: true,
          changeOrigin: true,
        },
        // 设备websocket直连
        '/v3': {
          target: 'ws://10.0.0.201:32041',
          ws: true,
          changeOrigin: true,
        },
        '/storage': {
          target: 'http://10.0.0.201:32205',
          changeOrigin: true,
        },
        '/data': {
          target: 'http://172.21.30.201:32650',
          changeOrigin: true,
        },
        // 瓦片地图
        '/ja-map': {
          target: 'http://47.111.155.82:32712',
          changeOrigin: true,
        },
        '/raster': {
          target: 'http://api.mapbox.com',
          // secure: false,
          changeOrigin: true,
          
        },
      },
    },
    define: {
      // 用于合并 window.config 的配置
      __DEV_MERGE_CONFIG__: {
        systemName: 'jingqi',
        loginUrl: 'http://10.0.0.201:32712/login',
      },
    },
  }),
)
