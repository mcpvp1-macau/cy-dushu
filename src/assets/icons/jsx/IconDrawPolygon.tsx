import { type SVGAttributes } from 'react'
import Icon from '@ant-design/icons'

type IconParams = Omit<Parameters<typeof Icon>[0], 'component'>

const iconSvg = (props: SVGAttributes<SVGElement>) => {
  return (
    <svg viewBox="0 0 1112 1024" {...props}>
      <path
        d="M459.733333 138.581333v68.266667H288.554667l-165.973334 402.133333 317.141334 333.397334 380.416-164.693334v-208.341333h68.266666v253.184L423.168 1024l-380.501333-400.085333L242.858667 138.581333zM1071.274667 174.165333v68.266667H637.269333v-68.266667z"
        fill="currentColor"
      ></path>
      <path
        d="M886.954667 0v416.597333h-68.266667V0z"
        fill="currentColor"
      ></path>
    </svg>
  )
}

/**![icon](data:image/svg+xml;base64,PHN2ZyB0PSIxNzI4NTM0NzAyMTg4IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDExMTIgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjI3OTM1IiB3aWR0aD0iNDgiIGhlaWdodD0iNDgiPjxwYXRoIGQ9Ik00NTkuNzMzMzMzIDEzOC41ODEzMzN2NjguMjY2NjY3SDI4OC41NTQ2NjdsLTE2NS45NzMzMzQgNDAyLjEzMzMzMyAzMTcuMTQxMzM0IDMzMy4zOTczMzQgMzgwLjQxNi0xNjQuNjkzMzM0di0yMDguMzQxMzMzaDY4LjI2NjY2NnYyNTMuMTg0TDQyMy4xNjggMTAyNGwtMzgwLjUwMTMzMy00MDAuMDg1MzMzTDI0Mi44NTg2NjcgMTM4LjU4MTMzM3pNMTA3MS4yNzQ2NjcgMTc0LjE2NTMzM3Y2OC4yNjY2NjdINjM3LjI2OTMzM3YtNjguMjY2NjY3eiIgcC1pZD0iMjc5MzYiIGZpbGw9IiNjN2QxZGMiPjwvcGF0aD48cGF0aCBkPSJNODg2Ljk1NDY2NyAwdjQxNi41OTczMzNoLTY4LjI2NjY2N1YweiIgcC1pZD0iMjc5MzciIGZpbGw9IiNjN2QxZGMiPjwvcGF0aD48L3N2Zz4=) */
const IconDrawPolygon = (props: IconParams) => (
  <Icon component={iconSvg} {...props} />
)

export default IconDrawPolygon
