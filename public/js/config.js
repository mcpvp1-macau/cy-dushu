function isDomainOrIP() {
  var hostname = window.location.hostname
  var ipRegex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  return ipRegex.test(hostname) ? 'IP' : 'Domain'
}

function isPublic() {
  return isDomainOrIP() === 'Domain'
}

window.config = {
  title: '牍术·无人装备智能引擎',
  systemName: 'jingqi-v3', // 应用名称
  loginUrl: 'http://test.4a.jing-an.com:32712/login',
  globalWs: 'ws', // 全局
  useShanghaiBanRoutes: true, // 使用上海禁飞航线
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
  ],
  videoBuffer: 0,
  videoBufferDelay: 0.2,
  daotongServer: 'http://135.100.11.130:18099/',
  controlRoom: {
    uav: {
      particularHeader: false,
    },
  },
  isHaveBacktracking: true,
  terrainUrl: '/ja-map/terrain/{z}/{x}/{y}.png',
}

if (isPublic()) {
  window.config.defaultImageries.push({
    url: 'https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.png',
    min: 1,
    max: 18,
  })
} else {
  window.config.defaultImageries.push(
    ...[
      {
        url: '/data/jingan/{z}/{x}/{y}.jpg',
        min: 13,
        max: 18,
      },
      {
        url: '/data/jingan-poi/{z}/{x}/{y}.jpg',
        min: 13,
        max: 18,
      },
    ],
  )
}
