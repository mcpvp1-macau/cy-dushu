import { type SVGAttributes } from 'react'
import Icon from '@ant-design/icons'

type IconParams = Omit<Parameters<typeof Icon>[0], 'component'>

const iconSvg = (props: SVGAttributes<SVGElement>) => {
  return (
    <svg viewBox="0 0 1024 1024" {...props}>
      <path
        d="M972.8 264.533333c-14.336 0-27.136 5.632-36.352 14.848L768 448.341333V264.533333c0-28.16-23.04-51.2-51.2-51.2H51.2C23.04 213.333333 0 236.373333 0 264.533333v512c0 28.16 23.04 51.2 51.2 51.2h665.6c28.16 0 51.2-23.04 51.2-51.2v-183.808l168.448 168.448c9.216 9.728 22.016 15.36 36.352 15.36 28.16 0 51.2-23.04 51.2-51.2V315.733333c0-28.16-23.04-51.2-51.2-51.2z"
        fill="currentColor"
      ></path>
    </svg>
  )
}

/**![icon](data:image/svg+xml;base64,PHN2ZyB0PSIxNzI2MzA1OTMyNzMyIiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjE4OTgxIiB3aWR0aD0iNDgiIGhlaWdodD0iNDgiPjxwYXRoIGQ9Ik05NzIuOCAyNjQuNTMzMzMzYy0xNC4zMzYgMC0yNy4xMzYgNS42MzItMzYuMzUyIDE0Ljg0OEw3NjggNDQ4LjM0MTMzM1YyNjQuNTMzMzMzYzAtMjguMTYtMjMuMDQtNTEuMi01MS4yLTUxLjJINTEuMkMyMy4wNCAyMTMuMzMzMzMzIDAgMjM2LjM3MzMzMyAwIDI2NC41MzMzMzN2NTEyYzAgMjguMTYgMjMuMDQgNTEuMiA1MS4yIDUxLjJoNjY1LjZjMjguMTYgMCA1MS4yLTIzLjA0IDUxLjItNTEuMnYtMTgzLjgwOGwxNjguNDQ4IDE2OC40NDhjOS4yMTYgOS43MjggMjIuMDE2IDE1LjM2IDM2LjM1MiAxNS4zNiAyOC4xNiAwIDUxLjItMjMuMDQgNTEuMi01MS4yVjMxNS43MzMzMzNjMC0yOC4xNi0yMy4wNC01MS4yLTUxLjItNTEuMnoiIHAtaWQ9IjE4OTgyIiBmaWxsPSIjYzdkMWRjIj48L3BhdGg+PC9zdmc+) */
const IconCameraVideo = (props: IconParams) => (
  <Icon component={iconSvg} {...props} />
)

export default IconCameraVideo
