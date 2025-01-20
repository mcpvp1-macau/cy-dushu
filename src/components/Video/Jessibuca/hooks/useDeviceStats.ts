import {
  supportMse,
  supportSimd,
  supportWCS,
  supportWCSHevc,
} from '@/utils/video/video-support'

/** 获取设备信息 */
const useDeviceStats = () => {
  return useMemo(() => {
    // CPU 核心数目
    const cpuCores = navigator.hardwareConcurrency

    /** @ts-ignore */
    // 内存
    const memory = navigator.deviceMemory ?? -1

    // GPU 信息
    const canvas = document.createElement('canvas')
    let gpuInfo = ''
    const gl = canvas.getContext('webgl')
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
      if (debugInfo) {
        gpuInfo = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) ?? ''
      }
    }

    // 操作系统 & 浏览器
    const userAgent = navigator.userAgent

    // 视频解码器们
    const decoders: string[] = []

    if (supportWCS && supportWCSHevc) {
      decoders.push('wcs')
    }

    if (supportSimd) {
      decoders.push('simd')
    }

    if (supportMse) {
      decoders.push('mse')
    }

    if (typeof WebAssembly === 'object') {
      decoders.push('wasm')
    }

    return {
      cpuCores,
      memory,
      gpuInfo,
      userAgent,
      decoders,
    }
  }, [])
}

export default useDeviceStats
