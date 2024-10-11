import { type SVGAttributes } from 'react'
import Icon from '@ant-design/icons'

type IconParams = Omit<Parameters<typeof Icon>[0], 'component'>

const iconSvg = (props: SVGAttributes<SVGElement>) => {
  return (
    <svg viewBox="0 0 1024 1024" id="mx_n_1725451357762" {...props}>
      <path
        d="M134.741333 384a134.741333 134.741333 0 1 1 0 269.482667 134.741333 134.741333 0 0 1 0-269.482667z m754.517334 0a134.741333 134.741333 0 1 1 0 269.482667 134.741333 134.741333 0 0 1 0-269.482667zM512 384a134.741333 134.741333 0 1 1 0 269.482667A134.741333 134.741333 0 0 1 512 384z"
        fill="currentColor"
      ></path>
    </svg>
  )
}

/**![icon](data:image/svg+xml;base64,PHN2ZyB0PSIxNzI1NDUxMzU3NzYxIiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjQzNzY0IiBpZD0ibXhfbl8xNzI1NDUxMzU3NzYyIiB3aWR0aD0iNDgiIGhlaWdodD0iNDgiPjxwYXRoIGQ9Ik0xMzQuNzQxMzMzIDM4NGExMzQuNzQxMzMzIDEzNC43NDEzMzMgMCAxIDEgMCAyNjkuNDgyNjY3IDEzNC43NDEzMzMgMTM0Ljc0MTMzMyAwIDAgMSAwLTI2OS40ODI2Njd6IG03NTQuNTE3MzM0IDBhMTM0Ljc0MTMzMyAxMzQuNzQxMzMzIDAgMSAxIDAgMjY5LjQ4MjY2NyAxMzQuNzQxMzMzIDEzNC43NDEzMzMgMCAwIDEgMC0yNjkuNDgyNjY3ek01MTIgMzg0YTEzNC43NDEzMzMgMTM0Ljc0MTMzMyAwIDEgMSAwIDI2OS40ODI2NjdBMTM0Ljc0MTMzMyAxMzQuNzQxMzMzIDAgMCAxIDUxMiAzODR6IiBwLWlkPSI0Mzc2NSIgZmlsbD0iI2M3ZDFkYyI+PC9wYXRoPjwvc3ZnPg==) */
const IconMore = (props: IconParams) => <Icon component={iconSvg} {...props} />

export default IconMore
