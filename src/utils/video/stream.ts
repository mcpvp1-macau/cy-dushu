/** 获取 streamId */
export const calcStreamId = (url: string) => {
  if (!url) {
    return ''
  }
  const searchParams = new URLSearchParams(url)
  let streamId = searchParams.get('stream')
  const match = url.match(/\/rtp\/(.*?)\.flv/i)
  if (match) {
    streamId = match[1]
  }
  return streamId
}
