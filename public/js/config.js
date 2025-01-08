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
  systemName: 'jingqi',
  loginUrl: isPublic() ? 'https://4a.jing-an.com:32712/login' : '',
  loginHttps: true,
  globalWs: 'wss',
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
  videoProxy: true,
  daotongServer: 'http://135.100.11.130:18099/'
}

if (isPublic()) {
  window.config.defaultImageries.push({
    url: 'https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.png',
    min: 13,
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

