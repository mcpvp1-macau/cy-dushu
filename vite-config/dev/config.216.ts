// 公网生产环境 配置文件

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
          target: 'http://172.27.95.216:31851/',
          // target: 'http://127.0.0.1:7001/',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/proxyApi/, '/'),
        },
        '/proxyWsApi': {
          target: 'ws://172.27.95.216:31851/',
          // target: 'ws://127.0.0.1:7001/',
          ws: true,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/proxyWsApi/, '/'),
        },
        // 全局 WebSocket
        '/ws': {
          target: 'ws://172.27.95.216:32201',
          ws: true,
          changeOrigin: true,
        },
        // 设备websocket直连
        '/v3': {
          target: 'ws://121.196.192.216:32041',
          ws: true,
          changeOrigin: true,
        },
        '/storage': {
          target: 'http://172.27.95.216:32205',
          changeOrigin: true,
        },
        '/data': {
          target: 'http://61.153.111.197:32650',
          changeOrigin: true,
        },
        // 瓦片地图
        '/ja-map': {
          target: 'http://47.111.155.82:32712',
          changeOrigin: true,
        },
        // 历史视频
        '/stream': {
          target: 'http://172.27.95.216:32011',
          changeOrigin: true,
        },
        // 视频下载
        '/vod/download': {
          target: 'http://172.27.95.216:31118',
          changeOrigin: true,
        },
      },
    },
    define: {
      // 用于合并 window.config 的配置
      __DEV_MERGE_CONFIG__: {
        systemName: 'jingqi',
        loginUrl: 'https://4a.jing-an.com:32712/login',
      },
    },
  }),
)
