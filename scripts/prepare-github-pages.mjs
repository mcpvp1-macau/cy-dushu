import fs from 'node:fs/promises'
import path from 'node:path'

const distDir = path.resolve('dist')
const rawBase = process.env.VITE_BASE || '/cy-dushu/'
const base = `/${rawBase.replace(/^\/+|\/+$/g, '')}/`
const baseNoTrailing = base.replace(/\/$/, '')
const textExtensions = new Set(['.css', '.html', '.js', '.json', '.map', '.svg', '.txt'])
const publicPathPattern = /(^|[^:\w])\/(audio|data|iconfonts|images|js)\//g
const faviconPattern = /(^|[^:\w])\/(favicon(?:-dark)?\.svg)/g
const spaEntryRoutes = ['action']

const prefixPublicPaths = (content) =>
  content
    .replace(publicPathPattern, (_, prefix, dir) => `${prefix}${baseNoTrailing}/${dir}/`)
    .replace(faviconPattern, (_, prefix, file) => `${prefix}${baseNoTrailing}/${file}`)

const walk = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        return walk(fullPath)
      }
      return fullPath
    }),
  )

  return files.flat()
}

const run = async () => {
  await fs.access(distDir)

  const files = await walk(distDir)
  await Promise.all(
    files
      .filter((file) => textExtensions.has(path.extname(file)))
      .map(async (file) => {
        const content = await fs.readFile(file, 'utf8')
        const next = prefixPublicPaths(content)
        if (next !== content) {
          await fs.writeFile(file, next)
        }
      }),
  )

  await fs.copyFile(path.join(distDir, 'index.html'), path.join(distDir, '404.html'))
  await Promise.all(
    spaEntryRoutes.map(async (route) => {
      const routeDir = path.join(distDir, route)
      await fs.mkdir(routeDir, { recursive: true })
      await fs.copyFile(path.join(distDir, 'index.html'), path.join(routeDir, 'index.html'))
    }),
  )
  await fs.writeFile(path.join(distDir, '.nojekyll'), '')
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
