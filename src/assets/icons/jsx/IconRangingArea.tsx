import { type SVGAttributes } from 'react'
import Icon from '@ant-design/icons'

type IconParams = Omit<Parameters<typeof Icon>[0], 'component'>

const iconSvg = (props: SVGAttributes<SVGElement>) => {
  return (
    <svg viewBox="0 0 1066 1024" {...props}>
      <path
        d="M527.786667 0v66.773333H95.274667v890.453334h886.741333V523.434667H1048.746667V1024H28.458667V0z"
        fill="currentColor"
      ></path>
      <path
        d="M872.021333 265.130667l-89.770666-97.066667-265.984 238.08L494.08 512l110.208-7.253333 267.733333-239.616z m89.130667-91.733334l-75.904-84.992-0.170667-0.170666a9.429333 9.429333 0 0 0-13.056-0.512l-75.861333 67.84 89.728 97.109333 74.538667-66.730667a8.789333 8.789333 0 0 0 0.725333-12.501333z"
        fill="currentColor"
      ></path>
    </svg>
  )
}

/**![icon](data:image/svg+xml;base64,PHN2ZyB0PSIxNzI4NjE2NTIwOTMyIiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwNjYgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjIyMTc5IiB3aWR0aD0iNDgiIGhlaWdodD0iNDgiPjxwYXRoIGQ9Ik01MjcuNzg2NjY3IDB2NjYuNzczMzMzSDk1LjI3NDY2N3Y4OTAuNDUzMzM0aDg4Ni43NDEzMzNWNTIzLjQzNDY2N0gxMDQ4Ljc0NjY2N1YxMDI0SDI4LjQ1ODY2N1YweiIgcC1pZD0iMjIxODAiIGZpbGw9IiNjN2QxZGMiPjwvcGF0aD48cGF0aCBkPSJNODcyLjAyMTMzMyAyNjUuMTMwNjY3bC04OS43NzA2NjYtOTcuMDY2NjY3LTI2NS45ODQgMjM4LjA4TDQ5NC4wOCA1MTJsMTEwLjIwOC03LjI1MzMzMyAyNjcuNzMzMzMzLTIzOS42MTZ6IG04OS4xMzA2NjctOTEuNzMzMzM0bC03NS45MDQtODQuOTkyLTAuMTcwNjY3LTAuMTcwNjY2YTkuNDI5MzMzIDkuNDI5MzMzIDAgMCAwLTEzLjA1Ni0wLjUxMmwtNzUuODYxMzMzIDY3Ljg0IDg5LjcyOCA5Ny4xMDkzMzMgNzQuNTM4NjY3LTY2LjczMDY2N2E4Ljc4OTMzMyA4Ljc4OTMzMyAwIDAgMCAwLjcyNTMzMy0xMi41MDEzMzN6IiBwLWlkPSIyMjE4MSIgZmlsbD0iI2M3ZDFkYyI+PC9wYXRoPjwvc3ZnPg==) */
const IconRangingArea = (props: IconParams) => (
  <Icon component={iconSvg} {...props} />
)

export default IconRangingArea
