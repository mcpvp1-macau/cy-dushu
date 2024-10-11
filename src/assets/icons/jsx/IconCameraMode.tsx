import { type SVGAttributes } from 'react'
import Icon from '@ant-design/icons'

type IconParams = Omit<Parameters<typeof Icon>[0], 'component'>

const iconSvg = (props: SVGAttributes<SVGElement>) => {
  return (
    <svg viewBox="0 0 1024 1024" {...props}>
      <path
        d="M1024 128v768H0V128h1024z m-42.666667 45.184H42.666667V850.773333h938.666666V173.226667z"
        fill="currentColor"
      ></path>
      <path
        d="M85.333333 213.333333h853.333334v597.333334H85.333333z"
        fill="currentColor"
      ></path>
    </svg>
  )
}

/**![icon](data:image/svg+xml;base64,PHN2ZyB0PSIxNzI2MzA1MjgwMTQ5IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjE4Njg1IiB3aWR0aD0iNDgiIGhlaWdodD0iNDgiPjxwYXRoIGQ9Ik0xMDI0IDEyOHY3NjhIMFYxMjhoMTAyNHogbS00Mi42NjY2NjcgNDUuMTg0SDQyLjY2NjY2N1Y4NTAuNzczMzMzaDkzOC42NjY2NjZWMTczLjIyNjY2N3oiIHAtaWQ9IjE4Njg2IiBmaWxsPSIjYzdkMWRjIj48L3BhdGg+PHBhdGggZD0iTTg1LjMzMzMzMyAyMTMuMzMzMzMzaDg1My4zMzMzMzR2NTk3LjMzMzMzNEg4NS4zMzMzMzN6IiBwLWlkPSIxODY4NyIgZmlsbD0iI2M3ZDFkYyI+PC9wYXRoPjwvc3ZnPg==) */
const IconCameraMode = (props: IconParams) => (
  <Icon component={iconSvg} {...props} />
)

export default IconCameraMode
