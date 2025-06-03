import markdownit from 'markdown-it'

const resolveResp = (resp: any) => {
  if (Array.isArray(resp)) {
    resp = resp.map((item) => {
      if (item.type === 'TEXT') {
        item.content = markdownit().render(
          item.content.replace(/<details[\s\S]*?<\/details>\n?\n?/g, ''),
        )
      }
      return item
    })
  } else {
    if (resp.type === 'TEXT') {
      resp.content = markdownit().render(
        resp.content.replace(/<details[\s\S]*?<\/details>\n?\n?/g, ''),
      )
    }
  }
  return resp
}

export default resolveResp
