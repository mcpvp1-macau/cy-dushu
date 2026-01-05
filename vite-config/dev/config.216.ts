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
          target: 'http://47.96.225.165:31851/',
          // target: 'http://127.0.0.1:7001/',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/proxyApi/, ''),
        },
        '/proxyWsApi': {
          target: 'ws://47.96.225.165:31851/',
          // target: 'ws://127.0.0.1:7001/',
          ws: true,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/proxyWsApi/, ''),
        },
        // 全局 WebSocket
        '/ws': {
          target: 'ws://47.96.225.165:32201',
          ws: true,
          changeOrigin: true,
        },
        // 设备websocket直连
        '/v3': {
          target: 'ws://47.96.225.165:32041',
          ws: true,
          changeOrigin: true,
        },
        '/storage': {
          target: 'http://47.96.225.165:32205',
          changeOrigin: true,
        },
        '/data': {
          target: 'http://61.153.111.197:32650',
          changeOrigin: true,
        },
        // 瓦片地图
        '/ja-map': {
          target: 'https://dushu.jing-an.com:32716',
          changeOrigin: true,
        },
        // 历史视频
        '/stream': {
          target: 'http://47.96.225.165:32011',
          changeOrigin: true,
        },
        // 视频下载
        '/vod/download': {
          target: 'http://47.96.225.165:31118',
          changeOrigin: true,
        },
        '/_ws_proxy/': {
          target: 'ws://video.jing-an.com:10080', // 默认需要动态设置，见 `configure` 部分
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
        loginUrl: 'https://4a.jing-an.com:32712/login',
        videoProxy: true,
        logo: '/ja-map/images/logo-jinghang2.png',
      },
    },
  }),
)
