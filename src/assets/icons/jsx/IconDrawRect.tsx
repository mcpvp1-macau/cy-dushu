import { type SVGAttributes } from 'react'
import Icon from '@ant-design/icons'

type IconParams = Omit<Parameters<typeof Icon>[0], 'component'>

const iconSvg = (props: SVGAttributes<SVGElement>) => {
  return (
    <svg viewBox="0 0 1066 1024" id="mx_n_1728534658326" {...props}>
      <path
        d="M411.221333 145.237333v68.266667H68.224v742.186667h703.402667v-379.733334h68.266666V1024H0V145.237333zM1025.706667 174.165333v68.266667H591.701333v-68.266667z"
        fill="currentColor"
      ></path>
      <path
        d="M841.386667 0v416.597333h-68.266667V0z"
        fill="currentColor"
      ></path>
    </svg>
  )
}

/**![icon](data:image/svg+xml;base64,PHN2ZyB0PSIxNzI4NTM0NjU4MzI1IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwNjYgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjI3Njc0IiBpZD0ibXhfbl8xNzI4NTM0NjU4MzI2IiB3aWR0aD0iNDgiIGhlaWdodD0iNDgiPjxwYXRoIGQ9Ik00MTEuMjIxMzMzIDE0NS4yMzczMzN2NjguMjY2NjY3SDY4LjIyNHY3NDIuMTg2NjY3aDcwMy40MDI2Njd2LTM3OS43MzMzMzRoNjguMjY2NjY2VjEwMjRIMFYxNDUuMjM3MzMzek0xMDI1LjcwNjY2NyAxNzQuMTY1MzMzdjY4LjI2NjY2N0g1OTEuNzAxMzMzdi02OC4yNjY2Njd6IiBwLWlkPSIyNzY3NSIgZmlsbD0iI2M3ZDFkYyI+PC9wYXRoPjxwYXRoIGQ9Ik04NDEuMzg2NjY3IDB2NDE2LjU5NzMzM2gtNjguMjY2NjY3VjB6IiBwLWlkPSIyNzY3NiIgZmlsbD0iI2M3ZDFkYyI+PC9wYXRoPjwvc3ZnPg==) */
const IconDrawRect = (props: IconParams) => (
  <Icon component={iconSvg} {...props} />
)

export default IconDrawRect
