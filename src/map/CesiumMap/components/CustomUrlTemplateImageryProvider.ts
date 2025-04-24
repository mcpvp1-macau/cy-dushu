import * as Cesium from 'cesium'
import localforage from 'localforage'

type Options = ConstructorParameters<
  typeof Cesium.UrlTemplateImageryProvider
>[0]

const imageryStore = localforage.createInstance({
  name: 'imagery',
  driver: localforage.INDEXEDDB,
  storeName: 'imagery',
})

type ImageData = {
  blob: Blob
  t: number
  ver: number
}

/** 获取缓存图片总大小 */
export const getCacheImageTotalSize = async () => {
  const keys = await imageryStore.keys()
  let size = 0
  for (const key of keys) {
    const data = await imageryStore.getItem<ImageData>(key)
    size += data?.blob?.size ?? 0
  }
  return size
}

export const clearCacheImage = async () => imageryStore.clear()

export const penddingAbortControllers = new Set<
  readonly [number[], AbortController]
>()

const getImageData = async (
  url: string,
  x: number,
  y: number,
  z: number,
  cacheOption?: { ver: number; staleDays?: number },
) => {
  const now = dayjs()
  if (cacheOption) {
    const imageData = await imageryStore.getItem<ImageData>(url)
    if (imageData) {
      if (
        imageData.ver === cacheOption.ver &&
        now.diff(dayjs(imageData.t), 'day') < (cacheOption.staleDays ?? 30)
      ) {
        return imageData.blob
      }
      await imageryStore.removeItem(url)
    }
  }

  const abortController = new AbortController()
  const entry = [[x, y, z] as number[], abortController] as const
  penddingAbortControllers.add(entry)
  try {
    const resp = await fetch(url, {
      method: 'GET',
      priority: 'low',
      signal: abortController.signal,
    })
    const data = await resp.blob()
    if (cacheOption) {
      await imageryStore.setItem(url, {
        blob: data,
        t: now.valueOf(),
        ver: cacheOption.ver,
      })
    }
    return data
  } finally {
    penddingAbortControllers.delete(entry)
  }
}

const createUrlTemplateImageryProvider = (
  shouldSendRequestFun: (level: number, x?: number, y?: number) => boolean,
  cacheOption?: { ver: number; staleDays?: number },
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
      return Promise.reject(undefined)
    }
    try {
      const data = await getImageData(
        (this.url as string)
          .replace('{z}', level.toString())
          .replace('{x}', x.toString())
          .replace('{y}', y.toString()),
        x,
        y,
        level,
        cacheOption,
      )
      return createImageBitmap(data, {
        imageOrientation: 'flipY',
      })
    } catch (e) {
      console.log('e', e)
      return Promise.reject(undefined)
    }
  }
  return CustomUrlTemplateImageryProvider as unknown as typeof Cesium.UrlTemplateImageryProvider
}

export default createUrlTemplateImageryProvider
