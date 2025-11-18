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
          target: 'http://172.21.30.240:31851/',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/proxyApi/, ''),
        },
        // 全局 WebSocket
        '/ws': {
          target: 'ws://172.21.30.240:32201',
          ws: true,
          changeOrigin: true,
        },
        // 设备websocket直连
        '/v3': {
          target: 'ws://172.21.30.240:32041',
          ws: true,
          changeOrigin: true,
        },
        '/storage': {
          target: 'http://172.21.30.240:32205',
          changeOrigin: true,
        },
        // 历史视频
        '/stream': {
          target: 'http://172.21.30.240:32011',
          changeOrigin: true,
        },
        '/data': {
          target: 'http://61.153.111.197:32650',
          changeOrigin: true,
        },
        '/vod/download': {
          target: 'http://172.21.30.240:31118',
          changeOrigin: true,
        },
        '/upload': {
          target: 'http://172.21.30.240:32000',
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
        loginUrl: 'https://172.21.30.240:32712/login',
      },
    },
  }),
)
