import { expose } from 'comlink'

const WatermarkImage = {
  async addTextToLeftBottom(image: ImageBitmap, texts: string[]) {
    const canvas = new OffscreenCanvas(image.width, image.height)
    const ctx = canvas.getContext('2d')!

    ctx.drawImage(image, 0, 0)

    // 文字样式
    ctx.font = `${Math.max(12, (28 / 1920) * canvas.width)}px Arial`
    ctx.fillStyle = '#e74341'
    ctx.textBaseline = 'bottom'

    // 设置描边
    ctx.lineWidth = Math.max(3, (4 / 1920) * canvas.width) // 描边宽度
    ctx.strokeStyle = 'rgba(50,50,50,0.8)'

    for (let i = texts.length - 1; i >= 0; i--) {
      const line = texts[i]
      const x = 20
      const y =
        canvas.height -
        20 -
        (texts.length - 1 - i) * Math.max(20, (40 / 1920) * canvas.width) // 每行文字间隔40px

      // 描边文字
      ctx.strokeText(line, x, y)
      // 填充文字
      ctx.fillText(line, x, y)
    }

    return canvas.convertToBlob()
  },
}

export type WorkerAPI = typeof WatermarkImage

expose(WatermarkImage)
