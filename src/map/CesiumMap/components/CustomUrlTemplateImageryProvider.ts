import * as Cesium from 'cesium'

type Options = ConstructorParameters<
  typeof Cesium.UrlTemplateImageryProvider
>[0]

const createUrlTemplateImageryProvider = (
  shouldSendRequestFun: (level: number, x?: number, y?: number) => boolean,
) => {
  // 创建一个自定义的 ImageryProvider 类，继承自 UrlTemplateImageryProvider
  function CustomUrlTemplateImageryProvider(options: Options) {
    // @ts-ignore
    Cesium.UrlTemplateImageryProvider.call(this, options)
  }

  CustomUrlTemplateImageryProvider.prototype = Object.create(
    Cesium.UrlTemplateImageryProvider.prototype,
  )

  // 覆盖 requestImage 方法，根据条件决定是否发送请求
  CustomUrlTemplateImageryProvider.prototype.requestImage = async function (
    x: number,
    y: number,
    level: number,
  ) {
    const shouldSendRequest = shouldSendRequestFun(level, x, y) // || level >= 12; // 根据条件确定是否发送请求
    if (!shouldSendRequest) {
      // 如果不满足条件，直接返回一个 resolved 的 Promise，表示不发送请求
      return Promise.resolve(undefined)
    }
    try {
      const resp = await fetch(
        this.url.replace('{z}', level).replace('{x}', x).replace('{y}', y),
        {
          method: 'GET',
          priority: 'low',
        },
      )
      const data = await resp.blob()
      return createImageBitmap(data, {
        imageOrientation: 'flipY',
      })
    } catch (e) {
      return Promise.resolve(undefined)
    }
  }
  return CustomUrlTemplateImageryProvider as unknown as typeof Cesium.UrlTemplateImageryProvider
}

export default createUrlTemplateImageryProvider
