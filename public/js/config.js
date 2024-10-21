window.config = {
  systemName: 'jingqi-v3', // 应用名称
  loginUrl: 'http://4a.jing-an.com:32712/login',
  globalWs: 'ws', // 全局
  defDeviceType: 'UAV',
  isHaveATAK: false,
  distanceDisplayCondition: [0, 3280000],
  voiceConfig: {
    voiceUrl: 'wss://jingqi.jing-an.com:32012/signaling',
    voiceStun: 'stun:jingqi.jing-an.com:3478',
    voiceTurn: 'turn:jingqi.jing-an.com:3478',
  },
  RadarRangeForm: true,
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
  cesiumToken:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlNDk1M2U1NC03Y2YzLTRjNGQtYmNlZi0zYzIyOWExYzJjNjQiLCJpZCI6NTI2ODcsImlhdCI6MTYxOTQxOTk2MX0.wsOPCgRigh9oNFv5jQSwLP_amHEytiEMktVXiMy7taY',
  // mapboxToken:
  //   'pk.eyJ1IjoicWlhb2Jhbmd6aHUiLCJhIjoiY2twNGQwdDYzMDd1aDJvb3VzY3plemhqYSJ9.P6BGwgvFq9y8aDZ8RjJByQ',
  showSite: false, // 水库相关功能
  videoBuffer: 0,
  videoBufferDelay: 0.2,
  maptilerUrl: '', // 公网
  vodVideoUrl: 'http://172.21.30.201:31118',
  controlServerUploadUrl: 'http://172.21.30.201:32041',
  isPublicNetwork: false,
  videoProxy: false,
  addPublicTerr: true,
  originDeviceLng: 120,
  originDeviceLat: 30,
  wanglouSpeed: 500,
  isPublic: true, // 是否公网
}
