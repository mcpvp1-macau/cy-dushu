import markdownit from 'markdown-it'

const resolveResp = (resp: any) => {
  console.log('resp', resp)
  if (Array.isArray(resp)) {
    resp = resp.map((item) => {
      if (item.type === 'TEXT') {
        item.content = markdownit().render(item.content)
      }
      return item
    })
  } else {
    if (resp.type === 'TEXT') {
      resp.content = markdownit().render(resp.content)
    }
  }
  return resp
}

export default resolveResp
