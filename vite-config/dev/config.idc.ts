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
          target: 'http://61.153.111.197:31851',
          // target: 'http://172.27.95.212:32711/',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/proxyApi/, ''),
        },
        '/proxyWsApi': {
          target: 'ws://61.153.111.197:31851/',
          // target: 'ws://127.0.0.1:7001/',
          ws: true,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/proxyWsApi/, ''),
        },
        // 全局 WebSocket
        '/ws': {
          target: 'ws://61.153.111.197:32201',
          ws: true,
          changeOrigin: true,
        },
        // 设备websocket直连
        '/v3': {
          target: 'ws://61.153.111.197:32591',
          ws: true,
          changeOrigin: true,
        },
        '/storage': {
          target: 'http://61.153.111.197:32205',
          changeOrigin: true,
        },
        '/data': {
          target: 'http://61.153.111.197:32650',
          changeOrigin: true,
        },
        // 瓦片地图
        '/ja-map': {
          target: 'http://61.153.111.197:32712',
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
        '/_ws_proxy/': {
          target: 'ws://115.231.236.108:10080', // 默认需要动态设置，见 `configure` 部分
          ws: true, // 启用 WebSocket 支持
          changeOrigin: true, // 修改请求头中的 `Host` 为目标地址
          rewrite: (path) => {
            // 移除 /_ws_proxy/ 前缀
            return path.replace(/^\/_ws_proxy\//, '')
          },
        },
      },
    },
    define: {
      // 用于合并 window.config 的配置
      __DEV_MERGE_CONFIG__: {
        systemName: 'jingqi',
        loginUrl: 'http://61.153.111.197:32712/login',
        globalWs: 'ws',
        videoProxy: true,
      },
    },
  }),
)
