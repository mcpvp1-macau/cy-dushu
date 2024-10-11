import { type SVGAttributes } from 'react'
import Icon from '@ant-design/icons'

type IconParams = Omit<Parameters<typeof Icon>[0], 'component'>

const iconSvg = (props: SVGAttributes<SVGElement>) => {
  return (
    <svg fill="none" viewBox="0 0 14 14.0001220703125" {...props}>
      <g>
        <path
          d="M11.0163,0.51625C11.3313,0.1925,11.7688,0,12.25,0C13.2125,0,14,0.7875,14,1.75C14,2.23125,13.8075,2.66875,13.4925,2.9925L12.0488,4.43625L9.57251,1.96L11.0163,0.51625ZM2.26627,9.26638L4.74252,11.7426L11.4363,5.04888L8.96002,2.57263L2.26627,9.26638ZM0,14.0001L3.85875,12.6089L1.4,10.1676L0,14.0001Z"
          fill="currentColor"
          fillRule="evenodd"
          fillOpacity="1"
        />
      </g>
    </svg>
  )
}

/**![icon](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBmaWxsPSJub25lIiB2ZXJzaW9uPSIxLjEiIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDE0IDE0LjAwMDEyMjA3MDMxMjUiPjxnPjxwYXRoIGQ9Ik0xMS4wMTYzLDAuNTE2MjVDMTEuMzMxMywwLjE5MjUsMTEuNzY4OCwwLDEyLjI1LDBDMTMuMjEyNSwwLDE0LDAuNzg3NSwxNCwxLjc1QzE0LDIuMjMxMjUsMTMuODA3NSwyLjY2ODc1LDEzLjQ5MjUsMi45OTI1TDEyLjA0ODgsNC40MzYyNUw5LjU3MjUxLDEuOTZMMTEuMDE2MywwLjUxNjI1Wk0yLjI2NjI3LDkuMjY2MzhMNC43NDI1MiwxMS43NDI2TDExLjQzNjMsNS4wNDg4OEw4Ljk2MDAyLDIuNTcyNjNMMi4yNjYyNyw5LjI2NjM4Wk0wLDE0LjAwMDFMMy44NTg3NSwxMi42MDg5TDEuNCwxMC4xNjc2TDAsMTQuMDAwMVoiIGZpbGwtcnVsZT0iZXZlbm9kZCIgZmlsbD0iI0M3RDFEQyIgZmlsbC1vcGFjaXR5PSIxIi8+PC9nPjwvc3ZnPg==) */
const IconEdit2 = (props: IconParams) => <Icon component={iconSvg} {...props} />

export default IconEdit2
