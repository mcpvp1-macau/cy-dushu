import { type SVGAttributes } from 'react'
import Icon from '@ant-design/icons'

type IconParams = Omit<Parameters<typeof Icon>[0], 'component'>

const iconSvg = (props: SVGAttributes<SVGElement>) => {
  return (
    <svg viewBox="0 0 1024 1024" {...props}>
      <path
        d="M393.813333 285.525333V128L0 364.288l393.813333 236.330667v-157.525334c261.034667 0 472.661333 211.584 472.661334 472.618667H1024c0-348.032-282.112-630.186667-630.186667-630.186667z"
        fill="currentColor"
      ></path>
    </svg>
  )
}

/**![icon](data:image/svg+xml;base64,PHN2ZyB0PSIxNzQyMDI1ODgzNTI1IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjE5MjE5IiB3aWR0aD0iNDgiIGhlaWdodD0iNDgiPjxwYXRoIGQ9Ik0zOTMuODEzMzMzIDI4NS41MjUzMzNWMTI4TDAgMzY0LjI4OGwzOTMuODEzMzMzIDIzNi4zMzA2Njd2LTE1Ny41MjUzMzRjMjYxLjAzNDY2NyAwIDQ3Mi42NjEzMzMgMjExLjU4NCA0NzIuNjYxMzM0IDQ3Mi42MTg2NjdIMTAyNGMwLTM0OC4wMzItMjgyLjExMi02MzAuMTg2NjY3LTYzMC4xODY2NjctNjMwLjE4NjY2N3oiIHAtaWQ9IjE5MjIwIiBmaWxsPSIjYzdkMWRjIj48L3BhdGg+PC9zdmc+) */
const IconTurnLeft2 = (props: IconParams) => (
  <Icon component={iconSvg} {...props} />
)

export default IconTurnLeft2
