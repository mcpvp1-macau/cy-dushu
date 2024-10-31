import { type SVGAttributes } from 'react'
import Icon from '@ant-design/icons'

type IconParams = Omit<Parameters<typeof Icon>[0], 'component'>

const iconSvg = (props: SVGAttributes<SVGElement>) => {
  return (
    <svg fill="none" viewBox="0 0 14 14" {...props}>
      <g>
        <path
          d="M13.2222,0L0.777778,0C0.35,0,0,0.35,0,0.777778C0,0.995556,0.0855556,1.19,0.225556,1.33L4.66667,5.76333L4.66667,13.2222C4.66667,13.65,5.01667,14,5.44444,14C5.66222,14,5.85667,13.9144,5.99667,13.7744L9.10778,10.6633C9.24778,10.5233,9.33333,10.3289,9.33333,10.1111L9.33333,5.76333L13.7744,1.32222C13.9144,1.19,14,0.995556,14,0.777778C14,0.35,13.65,0,13.2222,0Z"
          fill="currentColor"
          fillRule="evenodd"
          fillOpacity="1"
        />
      </g>
    </svg>
  )
}

/**![icon](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBmaWxsPSJub25lIiB2ZXJzaW9uPSIxLjEiIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDE0IDE0Ij48Zz48cGF0aCBkPSJNMTMuMjIyMiwwTDAuNzc3Nzc4LDBDMC4zNSwwLDAsMC4zNSwwLDAuNzc3Nzc4QzAsMC45OTU1NTYsMC4wODU1NTU2LDEuMTksMC4yMjU1NTYsMS4zM0w0LjY2NjY3LDUuNzYzMzNMNC42NjY2NywxMy4yMjIyQzQuNjY2NjcsMTMuNjUsNS4wMTY2NywxNCw1LjQ0NDQ0LDE0QzUuNjYyMjIsMTQsNS44NTY2NywxMy45MTQ0LDUuOTk2NjcsMTMuNzc0NEw5LjEwNzc4LDEwLjY2MzNDOS4yNDc3OCwxMC41MjMzLDkuMzMzMzMsMTAuMzI4OSw5LjMzMzMzLDEwLjExMTFMOS4zMzMzMyw1Ljc2MzMzTDEzLjc3NDQsMS4zMjIyMkMxMy45MTQ0LDEuMTksMTQsMC45OTU1NTYsMTQsMC43Nzc3NzhDMTQsMC4zNSwxMy42NSwwLDEzLjIyMjIsMFoiIGZpbGwtcnVsZT0iZXZlbm9kZCIgZmlsbD0iI0M3RDFEQyIgZmlsbC1vcGFjaXR5PSIxIi8+PC9nPjwvc3ZnPg==) */
const IconFilter = (props: IconParams) => (
  <Icon component={iconSvg} {...props} />
)

export default IconFilter
