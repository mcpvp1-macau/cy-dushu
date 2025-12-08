import { defineConfig, mergeConfig } from 'vite'
import commonConfig from '../common'

export default mergeConfig(
  commonConfig,
  defineConfig({
    server: {
      host: '0.0.0.0',
      https: {
        key: 'ssl/keystore.key',
        cert: 'ssl/keystore.pem',
      },
      proxy: {
        '/img_w': {
          target: 'http://t0.tianditu.gov.cn',
          changeOrigin: true,
          secure: false,
        },
        // 4A 接口
        '/proxyApi': {
          target: 'http://47.111.155.82:31851/',
          // target: 'http://47.111.155.82:32711/',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/proxyApi/, ''),
        },
        '/proxy4aApi': {
          // target: 'http://47.111.155.82:31851/',
          target: 'http://47.111.155.82:32711/',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/proxy4aApi/, ''),
        },
        '/proxyWsApi': {
          target: 'ws://47.111.155.82:31851/',
          // target: 'ws://127.0.0.1:7001/',
          ws: true,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/proxyWsApi/, ''),
        },
        // 全局 WebSocket
        '/ws': {
          target: 'ws://47.111.155.82:32201',
          ws: true,
          changeOrigin: true,
        },
        // 设备websocket直连
        '/v3': {
          target: 'wss://test.dushu.jing-an.com:32591',
          ws: true,
          changeOrigin: true,
        },
        '/storage': {
          target: 'http://47.111.155.82:32205',
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
          target: 'http://47.111.155.82:32000',
          changeOrigin: true,
          // pathRewrite: { '^/upload': '' },
          rewrite: (path) => path.replace(/^\/upload/, ''),
        },
        '/api': {
          target: 'http://47.111.155.82:32680',
          changeOrigin: true,
        },
        '/geoserver': {
          target: 'http://172.22.219.30:31880',
          changeOrigin: true,
        },
      },
    },
    define: {
      // 用于合并 window.config 的配置
      __DEV_MERGE_CONFIG__: {
        systemName: 'jingqi-v3',
        loginUrl: 'http://test.4a.jing-an.com:32712/login',
        globalWs: 'wss',
      },
    },
  }),
)
