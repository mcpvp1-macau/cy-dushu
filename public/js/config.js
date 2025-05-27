window.config = {
  title: '牍术·无人装备智能引擎',
  systemName: 'jingqi-v3', // 应用名称
  version: 'v3.13.0',
  loginUrl: 'http://test.4a.jing-an.com:32712/login',
  globalWs: 'ws', // 全局
  useShanghaiBanRoutes: false, // 使用上海禁飞航线
  defaultImageries: [
    {
      url: '/data/maptiler-satellite-lowres/{z}/{x}/{y}.jpg',
      min: 0,
      max: 5,
      cacheOption: {
        ver: 0,
      },
    },
    {
      url: '/data/maptiler-satellite/{z}/{x}/{y}.webp',
      min: 6,
      max: 12,
      cacheOption: {
        ver: 0,
      },
    },
    {
      url: 'https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.png',
      min: 13,
      max: 18,
      cacheOption: {
        ver: 0,
      },
    },
    {
      url: 'http://47.111.155.82:32650/styles/dark/{z}/{x}/{y}@3x.png',
      min: 0,
      max: 18,
      cacheOption: {
        ver: 0,
      },
    },
    // {
    //   url: 'https://api.map.baidu.com/api_tile/v1/png?qt=vtile&x={x}&y={y}&z={z}&styles=sl&scaler=2&udt=20250410&showtext=1&manufacturer=didi&ak=lAsOZvyB3LuDw8scMpR9LRN8DjqXDDaq',
    //   crs: 'baidu',
    //   min: 1,
    //   max: 18,
    // },
  ],
  videoBuffer: 0,
  videoBufferDelay: 0.2,
  daotongServer: 'http://135.100.11.130:28080',
  controlRoom: {
    uav: {
      particularHeader: false,
    },
  },
  isHaveBacktracking: true,
  useTerrain: true,
  // useGuizhouProjects: true,
  // terrainUrl: '/ja-map/terrain/{z}/{x}/{y}.png',
}
