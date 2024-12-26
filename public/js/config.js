window.config = {
  title: '牍术·无人装备智能引擎',
  systemName: 'jingqi-v3', // 应用名称
  loginUrl: 'http://4a.jing-an.com:32712/login',
  globalWs: 'ws', // 全局
  defaultImageries: [
    {
      url: '/data/maptiler-satellite-lowres/{z}/{x}/{y}.jpg',
      min: 0,
      max: 5,
    },
    {
      url: '/data/maptiler-satellite/{z}/{x}/{y}.webp',
      min: 6,
      max: 12,
    },
    {
      url: 'https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.png',
      min: 13,
      max: 18,
    },
  ],
  videoBuffer: 0,
  videoBufferDelay: 0.2,
}
