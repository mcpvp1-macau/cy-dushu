import { type SVGAttributes } from 'react'
import Icon from '@ant-design/icons'

type IconParams = Omit<Parameters<typeof Icon>[0], 'component'>

const iconSvg = (props: SVGAttributes<SVGElement>) => {
  return (
    <svg fill="none" viewBox="0 0 15.97607421875 16" {...props}>
      <g>
        <g>
          <path
            d="M-4.9999925977317616e-8,9.38701701171875L5.188589950000074,10.80368701171875L6.603139950000074,15.99998701171875L11.316399950000074,4.66668701171875L-4.9999925977317616e-8,9.38701701171875Z"
            fill="currentColor"
            fillRule="evenodd"
            fillOpacity="1"
          />
        </g>
        <g>
          <ellipse
            cx="14.311887741088867"
            cy="1.6666667461395264"
            rx="1.6641826629638672"
            ry="1.6666667461395264"
            fill="currentColor"
            fillOpacity="1"
          />
        </g>
        <g>
          <path
            d="M14.016791850097656,1.3600539654693602L14.707113850097656,2.0825750654693604L9.729663850097657,6.852387965469361L9.039343850097655,6.12986796546936L14.016791850097656,1.3600539654693602Z"
            fill="currentColor"
            fillOpacity="1"
          />
        </g>
      </g>
    </svg>
  )
}

/**![icon](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBmaWxsPSJub25lIiB2ZXJzaW9uPSIxLjEiIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDE1Ljk3NjA3NDIxODc1IDE2Ij48Zz48Zz48cGF0aCBkPSJNLTQuOTk5OTkyNTk3NzMxNzYxNmUtOCw5LjM4NzAxNzAxMTcxODc1TDUuMTg4NTg5OTUwMDAwMDc0LDEwLjgwMzY4NzAxMTcxODc1TDYuNjAzMTM5OTUwMDAwMDc0LDE1Ljk5OTk4NzAxMTcxODc1TDExLjMxNjM5OTk1MDAwMDA3NCw0LjY2NjY4NzAxMTcxODc1TC00Ljk5OTk5MjU5NzczMTc2MTZlLTgsOS4zODcwMTcwMTE3MTg3NVoiIGZpbGwtcnVsZT0iZXZlbm9kZCIgZmlsbD0iI0M3RDFEQyIgZmlsbC1vcGFjaXR5PSIxIi8+PC9nPjxnPjxlbGxpcHNlIGN4PSIxNC4zMTE4ODc3NDEwODg4NjciIGN5PSIxLjY2NjY2Njc0NjEzOTUyNjQiIHJ4PSIxLjY2NDE4MjY2Mjk2Mzg2NzIiIHJ5PSIxLjY2NjY2Njc0NjEzOTUyNjQiIGZpbGw9IiNDN0QxREMiIGZpbGwtb3BhY2l0eT0iMSIvPjwvZz48Zz48cGF0aCBkPSJNMTQuMDE2NzkxODUwMDk3NjU2LDEuMzYwMDUzOTY1NDY5MzYwMkwxNC43MDcxMTM4NTAwOTc2NTYsMi4wODI1NzUwNjU0NjkzNjA0TDkuNzI5NjYzODUwMDk3NjU3LDYuODUyMzg3OTY1NDY5MzYxTDkuMDM5MzQzODUwMDk3NjU1LDYuMTI5ODY3OTY1NDY5MzZMMTQuMDE2NzkxODUwMDk3NjU2LDEuMzYwMDUzOTY1NDY5MzYwMloiIGZpbGw9IiNDN0QxREMiIGZpbGwtb3BhY2l0eT0iMSIvPjwvZz48L2c+PC9zdmc+) */
const IconPointFly = (props: IconParams) => (
  <Icon component={iconSvg} {...props} />
)

export default IconPointFly
