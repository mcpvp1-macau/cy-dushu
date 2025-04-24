import { type SVGAttributes } from 'react'
import Icon from '@ant-design/icons'

type IconParams = Omit<Parameters<typeof Icon>[0], 'component'>

const iconSvg = (props: SVGAttributes<SVGElement>) => {
  return (
    <svg viewBox="0 0 1024 1024" {...props}>
      <path
        d="M630.186667 285.525333V128L1024 364.288l-393.813333 236.330667v-157.525334c-261.034667 0-472.661333 211.584-472.661334 472.618667H0c0-348.032 282.112-630.186667 630.186667-630.186667z"
        fill="currentColor"
      ></path>
    </svg>
  )
}

/**![icon](data:image/svg+xml;base64,PHN2ZyB0PSIxNzQyMDI1NzY0NTc5IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjE4MzM0IiB3aWR0aD0iNDgiIGhlaWdodD0iNDgiPjxwYXRoIGQ9Ik02MzAuMTg2NjY3IDI4NS41MjUzMzNWMTI4TDEwMjQgMzY0LjI4OGwtMzkzLjgxMzMzMyAyMzYuMzMwNjY3di0xNTcuNTI1MzM0Yy0yNjEuMDM0NjY3IDAtNDcyLjY2MTMzMyAyMTEuNTg0LTQ3Mi42NjEzMzQgNDcyLjYxODY2N0gwYzAtMzQ4LjAzMiAyODIuMTEyLTYzMC4xODY2NjcgNjMwLjE4NjY2Ny02MzAuMTg2NjY3eiIgcC1pZD0iMTgzMzUiIGZpbGw9IiNjN2QxZGMiPjwvcGF0aD48L3N2Zz4=) */
const IconTurnRight2 = (props: IconParams) => (
  <Icon component={iconSvg} {...props} />
)

export default IconTurnRight2
