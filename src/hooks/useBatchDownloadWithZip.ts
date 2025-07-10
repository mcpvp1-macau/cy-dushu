import { useLatest } from 'ahooks'
import JSZIP from 'jszip'

/** 批量下载, 并生成 ZIP 压缩包 */
const useBatchDownloadWithZip = () => {
  // 是否正在下载
  const [downloading, setDownloading] = useState(false)
  const latestDownloading = useLatest(downloading)

  // 已经下载的数量
  const [downloadedCnt, setDownloadedCnt] = useState(0)
  // 总数量
  const [totalCnt, setTotalCnt] = useState(0)

  // 用于存储 AbortController 实例
  // 以便在下载过程中可以取消请求
  const signals = useRef<Set<AbortController>>(new Set())

  const startDownload = async (urls: string[], fileName: string) => {
    setDownloading(true)
    setDownloadedCnt(0)
    setTotalCnt(urls.length)
    try {
      const resps = await Promise.all(
        urls.map(async (url) => {
          const controller = new AbortController()
          signals.current.add(controller)
          try {
            const resp = await fetch(url, {
              signal: controller.signal,
            })
            if (!resp.ok) {
              throw new Error(`Failed to fetch ${url}: ${resp.statusText}`)
            }
            if (latestDownloading.current) {
              setDownloadedCnt((prev) => prev + 1)
            }
            signals.current.delete(controller)
            return resp
          } catch (error) {
            console.error(`Error fetching ${url}:`, error)
            return new Response(null, { status: 500, statusText: 'Error' })
          }
        }),
      )
      const zip = new JSZIP()
      for (const resp of resps) {
        if (resp.ok) {
          const blob = await resp.blob()
          const fileName = resp.url.split('/').pop() || 'unknown'
          zip.file(fileName, blob)
        } else {
          console.error(`Failed to fetch ${resp.url}: ${resp.statusText}`)
        }
      }
      const content = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(content)
      const a = document.createElement('a')
      a.href = url
      a.download = `${fileName}${fileName.endsWith('.zip') ? '' : '.zip'}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (e) {
      // 取消
      signals.current.values().forEach((s) => s.abort())
    } finally {
      setDownloadedCnt(0)
      setDownloading(false)
    }
  }

  return {
    downloading,
    downloadedCnt,
    totalCnt,
    startDownload,
  }
}

export default useBatchDownloadWithZip
