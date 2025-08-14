import { defineConfig, mergeConfig } from 'vite'
import commonConfig from '../common'

export default mergeConfig(
  commonConfig,
  defineConfig({
    server: {
      host: '0.0.0.0',
      proxy: {
        '/proxyApi/otherService/jingqi/autoPhotograph': {
          target: 'http://172.21.30.163:11593',
          changeOrigin: true,
          rewrite: (path) =>
            path.replace(
              /^\/proxyApi\/otherService\/jingqi\/autoPhotograph/,
              '',
            ),
        },
        '/ditingTanqiServer': {
          target: 'http://172.21.30.114:8090',
          rewrite: (path) => path.replace(/^\/ditingTanqiServer/, ''),
          preserveHeaderKeyCase: true,
        },
        // 4A 接口
        '/proxyApi': {
          target: 'http://172.21.30.105:31851/',
          // target: 'http://127.0.0.1:7001/',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/proxyApi/, '/'),
        },
        // 全局 WebSocket
        '/ws': {
          target: 'ws://172.21.30.105:32201',
          ws: true,
          changeOrigin: true,
        },
        // 设备websocket直连
        '/v3': {
          target: 'ws://172.21.30.105:32041',
          ws: true,
          changeOrigin: true,
        },
        '/storage': {
          target: 'http://172.21.30.105:32205',
          changeOrigin: true,
        },
        // 历史视频
        '/stream': {
          target: 'http://172.21.30.105:32011',
          changeOrigin: true,
        },
        '/_ws_proxy/': {
          target: 'ws://172.21.30.105:10080', // 默认需要动态设置，见 `configure` 部分
          ws: true, // 启用 WebSocket 支持
          changeOrigin: true, // 修改请求头中的 `Host` 为目标地址
          rewrite: (path) => {
            // 移除 /_ws_proxy/ 前缀
            return path.replace(/^\/_ws_proxy\//, '')
          },
        },
        '/upload': {
          target: 'http://172.21.30.201:32000',
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
        loginUrl: 'http://172.21.30.105:32712/login',
        videoProxy: true,
      },
    },
  }),
)
