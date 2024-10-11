// @ts-nocheck

function getBrowser() {
  const UserAgent = window.navigator.userAgent.toLowerCase() || ''

  const browserInfo = {
    type: '',
    version: 0,
  }

  const browserArray: any = {
    /** @ts-ignore */
    IE: window.ActiveXObject || 'ActiveXObject' in window, // IE
    Chrome:
      UserAgent.indexOf('chrome') > -1 && UserAgent.indexOf('safari') > -1, // Chrome浏览器
    Firefox: UserAgent.indexOf('firefox') > -1, // 火狐浏览器
    Opera: UserAgent.indexOf('opera') > -1, // Opera浏览器
    Safari:
      UserAgent.indexOf('safari') > -1 && UserAgent.indexOf('chrome') === -1, // safari浏览器
    Edge: UserAgent.indexOf('edge') > -1, // Edge浏览器
    QQBrowser: /qqbrowser/.test(UserAgent), // qq浏览器
    WeixinBrowser: /MicroMessenger/i.test(UserAgent), // 微信浏览器
  }
  // console.log(browserArray)
  for (let i in browserArray) {
    if (browserArray[i]) {
      let versions = ''
      if (i === 'IE') {
        const versionArray = UserAgent.match(/(msie\s|trident.*rv:)([\w.]+)/)
        if (versionArray && versionArray.length > 2) {
          versions = UserAgent.match(/(msie\s|trident.*rv:)([\w.]+)/)[2]
        }
      } else if (i === 'Chrome') {
        for (const mt in navigator.mimeTypes) {
          //检测是否是360浏览器(测试只有pc端的360才起作用)
          if (
            navigator.mimeTypes[mt]['type'] === 'application/360softmgrplugin'
          ) {
            i = '360'
          }
        }
        const versionArray = UserAgent.match(/chrome\/([\d.]+)/)
        if (versionArray && versionArray.length > 1) {
          versions = versionArray[1]
        }
      } else if (i === 'Firefox') {
        const versionArray = UserAgent.match(/firefox\/([\d.]+)/)
        if (versionArray && versionArray.length > 1) {
          versions = versionArray[1]
        }
      } else if (i === 'Opera') {
        const versionArray = UserAgent.match(/opera\/([\d.]+)/)
        if (versionArray && versionArray.length > 1) {
          versions = versionArray[1]
        }
      } else if (i === 'Safari') {
        const versionArray = UserAgent.match(/version\/([\d.]+)/)
        if (versionArray && versionArray.length > 1) {
          versions = versionArray[1]
        }
      } else if (i === 'Edge') {
        const versionArray = UserAgent.match(/edge\/([\d.]+)/)
        if (versionArray && versionArray.length > 1) {
          versions = versionArray[1]
        }
      } else if (i === 'QQBrowser') {
        const versionArray = UserAgent.match(/qqbrowser\/([\d.]+)/)
        if (versionArray && versionArray.length > 1) {
          versions = versionArray[1]
        }
      }
      browserInfo.type = i
      browserInfo.version = parseInt(versions)
    }
  }
  return browserInfo
}

function checkSupportMSEHevc() {
  return (
    window.MediaSource &&
    window.MediaSource.isTypeSupported('video/mp4; codecs="hev1.1.6.L123.b0"')
  )
}

function checkSupportMSEH264() {
  return (
    window.MediaSource &&
    window.MediaSource.isTypeSupported('video/mp4; codecs="avc1.64002A"')
  )
}

function checkSupportWCS() {
  return 'VideoEncoder' in window
}

function checkSupportWCSHevc() {
  const browserInfo = getBrowser()
  const supportWCS = checkSupportWCS()

  return (
    supportWCS &&
    browserInfo.type.toLowerCase() === 'chrome' &&
    browserInfo.version >= 107 &&
    (location.protocol === 'https:' || location.hostname === 'localhost')
  )
}

// function checkSupportWasm() {
//   try {
//     if (
//       typeof window.WebAssembly === 'object' &&
//       typeof window.WebAssembly.instantiate === 'function'
//     ) {
//       const module = new window.WebAssembly.Module(
//         Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00),
//       );
//       if (module instanceof window.WebAssembly.Module) {
//         return (
//           new window.WebAssembly.Instance(module) instanceof
//           window.WebAssembly.Instance
//         );
//       }
//     }
//     return false;
//   } catch (e) {
//     return false;
//   }
// }

function checkSupportSIMD() {
  return (
    WebAssembly &&
    WebAssembly.validate(
      new Uint8Array([
        0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10,
        1, 8, 0, 65, 0, 253, 15, 253, 98, 11,
      ]),
    )
  )
}

export const supportWCS = checkSupportWCS()
export const supportWCSHevc = checkSupportWCSHevc()
export const supportSimd = checkSupportSIMD()
export const supportMse = checkSupportMSEH264()
export const supportMSEHevc = checkSupportMSEHevc()
