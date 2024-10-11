import { defineConfig, mergeConfig } from 'vite'
import commonConfig from '../common'

export default mergeConfig(
  commonConfig,
  defineConfig({
    server: {
      proxy: {
        // 4A 接口
        '/proxyApi': {
          target: 'http://135.100.11.103:32711/',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/proxyApi/, '/'),
        },
        // 全局 WebSocket
        '/ws': {
          target: 'ws://135.100.11.103:8081',
          ws: true,
          changeOrigin: true,
        },
        // 设备websocket直连
        '/v3': {
          target: 'ws://135.100.11.103:32041',
          ws: true,
          changeOrigin: true,
        },
        '/storage': {
          target: 'http://135.100.11.110:32205',
          changeOrigin: true,
        },
        // 历史视频
        '/stream': {
          target: 'http://135.100.11.103:32011',
          changeOrigin: true,
        },
        '/ja-map': {
          target: 'http://135.100.11.110:32712',
          changeOrigin: true,
        },
      },
    },
    define: {
      // 用于合并 window.config 的配置
      __DEV_MERGE_CONFIG__: {
        systemName: 'jingqi',
        loginUrl: 'http://135.100.11.103:32712/login',
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
