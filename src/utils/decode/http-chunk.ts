export async function* chunkBuffer(
  reader: ReadableStreamDefaultReader<Uint8Array<ArrayBufferLike>>,
) {
  let buffer = ''
  const decoder = new TextDecoder()

  try {
    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        // 在结束时返回剩余的数据
        if (buffer.length > 0) {
          yield buffer
        }
        break
      }

      if (value) {
        // 将字节数据解码为字符串并添加到缓冲区
        buffer += decoder.decode(value, { stream: true })

        // 查找 \n\n 分隔符
        let delimiterIndex
        while ((delimiterIndex = buffer.indexOf('\n\n')) !== -1) {
          // 提取分隔符之前的数据
          const chunk = buffer.slice(0, delimiterIndex)
          if (chunk.length > 0) {
            yield chunk
          }
          // 移除已处理的数据，包括分隔符
          buffer = buffer.slice(delimiterIndex + 2)
        }
      }
    }
  } catch (error) {
    console.error('Error reading stream:', error)
    throw error
  } finally {
    reader.releaseLock()
  }
}
