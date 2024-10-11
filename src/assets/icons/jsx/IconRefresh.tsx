import { type SVGAttributes } from 'react'
import Icon from '@ant-design/icons'

type IconParams = Omit<Parameters<typeof Icon>[0], 'component'>

const iconSvg = (props: SVGAttributes<SVGElement>) => {
  return (
    <svg fill="none" viewBox="0 0 14 14" {...props}>
      <g>
        <path
          d="M9.8,4.2C9.8,4.585,10.115,4.9,10.5,4.9L13.3,4.9C13.685,4.9,14,4.585,14,4.2L14,1.4C14,1.015,13.685,0.7,13.3,0.7C12.915,0.7,12.6,1.015,12.6,1.4L12.6,2.835C11.326,1.12,9.303,0,7,0C3.136,0,0,3.136,0,7C0,10.864,3.136,14,7,14C10.864,14,14,10.864,14,7C14,6.615,13.685,6.3,13.3,6.3C12.915,6.3,12.6,6.615,12.6,7C12.6,10.094,10.094,12.6,7,12.6C3.906,12.6,1.4,10.094,1.4,7C1.4,3.906,3.906,1.4,7,1.4C8.771,1.4,10.339,2.219,11.368,3.5L10.5,3.5C10.115,3.5,9.8,3.815,9.8,4.2Z"
          fill="currentColor"
          fillRule="evenodd"
          fillOpacity="1"
        />
      </g>
    </svg>
  )
}

/**![icon](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBmaWxsPSJub25lIiB2ZXJzaW9uPSIxLjEiIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDE0IDE0Ij48Zz48cGF0aCBkPSJNOS44LDQuMkM5LjgsNC41ODUsMTAuMTE1LDQuOSwxMC41LDQuOUwxMy4zLDQuOUMxMy42ODUsNC45LDE0LDQuNTg1LDE0LDQuMkwxNCwxLjRDMTQsMS4wMTUsMTMuNjg1LDAuNywxMy4zLDAuN0MxMi45MTUsMC43LDEyLjYsMS4wMTUsMTIuNiwxLjRMMTIuNiwyLjgzNUMxMS4zMjYsMS4xMiw5LjMwMywwLDcsMEMzLjEzNiwwLDAsMy4xMzYsMCw3QzAsMTAuODY0LDMuMTM2LDE0LDcsMTRDMTAuODY0LDE0LDE0LDEwLjg2NCwxNCw3QzE0LDYuNjE1LDEzLjY4NSw2LjMsMTMuMyw2LjNDMTIuOTE1LDYuMywxMi42LDYuNjE1LDEyLjYsN0MxMi42LDEwLjA5NCwxMC4wOTQsMTIuNiw3LDEyLjZDMy45MDYsMTIuNiwxLjQsMTAuMDk0LDEuNCw3QzEuNCwzLjkwNiwzLjkwNiwxLjQsNywxLjRDOC43NzEsMS40LDEwLjMzOSwyLjIxOSwxMS4zNjgsMy41TDEwLjUsMy41QzEwLjExNSwzLjUsOS44LDMuODE1LDkuOCw0LjJaIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGZpbGw9IiNDN0QxREMiIGZpbGwtb3BhY2l0eT0iMSIvPjwvZz48L3N2Zz4=) */
const IconRefresh = (props: IconParams) => (
  <Icon component={iconSvg} {...props} />
)

export default IconRefresh
