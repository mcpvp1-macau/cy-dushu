import { defineConfig, mergeConfig } from 'vite'
import commonConfig from '../common'

export default mergeConfig(
  commonConfig,
  defineConfig({
    server: {
      proxy: {
        // 4A 接口
        '/proxyApi': {
          target: 'http://172.31.0.19:32711',
          // target: 'http://127.0.0.1:7001/',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/proxyApi/, '/'),
        },
        // 全局 WebSocket
        '/ws': {
          target: 'ws://172.31.0.19:32201',
          ws: true,
          changeOrigin: true,
        },
        // 设备websocket直连
        '/v3': {
          target: 'ws://172.31.0.19:32041',
          ws: true,
          changeOrigin: true,
        },
        '/storage': {
          target: 'http://172.31.0.19:32205',
          changeOrigin: true,
          // rewrite: (path) => path.replace(/^\/storage/, '/'),
        },
        // 历史视频
        '/stream': {
          target: 'http://172.31.0.19:32011',
          changeOrigin: true,
        },
        '/ja-map': {
          target: 'http://172.31.0.19:32712',
          changeOrigin: true,
        },
        // 视频下载
        '/vod/download': {
          target: 'http://172.31.0.19:31118',
          changeOrigin: true,
        },
      },
    },
    define: {
      // 用于合并 window.config 的配置
      __DEV_MERGE_CONFIG__: {
        systemName: 'jingqi-v3',
        loginUrl: 'http://172.31.0.19:32712/login',
        defaultImageries: [
          {
            url: '/ja-map/td_map/shanghai_img-z0-18/{z}/{x}/{y}.jpg',
            min: 0,
            max: 18,
          },
          {
            url: '/ja-map/td_map/shanghai_cia-z0-18/{z}/{x}/{y}.jpg',
            min: 0,
            max: 18,
          },
        ],
      },
    },
  }),
)
