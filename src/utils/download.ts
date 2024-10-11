/** 下载一个文件并且重命名 */
export const downloadAndRename = async (
  url: string,
  filename: string,
  headers?: Record<string, any>,
) => {
  const response = await fetch(url, {
    headers: headers,
  })
  const blob = await response.blob()
  const objectURL = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = objectURL
  a.download = filename
  a.click()
  a.remove()
}
