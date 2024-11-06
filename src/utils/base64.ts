/** 文件转 base64 */
export const fileToBase64 = (file: File) => {
  return new Promise<string | null>((resolve) => {
    const reader = new FileReader()
    reader.addEventListener('load', () =>
      resolve(reader.result?.toString() ?? null),
    )
    reader.readAsDataURL(file)
  })
}

/** base64 转文件 */
export const base64ToFile = (base64: string, filename: string) => {
  const arr = base64.split(',')
  const mime = arr[0].match(/:(.*?);/)![1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
}
