import { type SVGAttributes } from 'react'
import Icon from '@ant-design/icons'

type IconParams = Omit<Parameters<typeof Icon>[0], 'component'>

const iconSvg = (props: SVGAttributes<SVGElement>) => {
  return (
    <svg fill="none" viewBox="0 0 14 14" {...props}>
      <g>
        <path
          d="M8.40158,0C7.76018,0.641403,7.81561,1.80543,8.41742,2.97738L3.91176,5.97851C2.19344,4.8224,0.649321,4.3948,0,5.04412L3.91968,8.9638L1.75827e-16,14L5.0362,10.0803L8.95588,14C9.6052,13.3507,9.16968,11.8066,8.01357,10.0882L11.0226,5.58258C12.1867,6.18439,13.3507,6.24774,14,5.59842L8.40158,0Z"
          fill="currentColor"
          fillRule="evenodd"
          fillOpacity="1"
        />
      </g>
    </svg>
  )
}

/**![icon](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBmaWxsPSJub25lIiB2ZXJzaW9uPSIxLjEiIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDE0IDE0Ij48Zz48cGF0aCBkPSJNOC40MDE1OCwwQzcuNzYwMTgsMC42NDE0MDMsNy44MTU2MSwxLjgwNTQzLDguNDE3NDIsMi45NzczOEwzLjkxMTc2LDUuOTc4NTFDMi4xOTM0NCw0LjgyMjQsMC42NDkzMjEsNC4zOTQ4LDAsNS4wNDQxMkwzLjkxOTY4LDguOTYzOEwxLjc1ODI3ZS0xNiwxNEw1LjAzNjIsMTAuMDgwM0w4Ljk1NTg4LDE0QzkuNjA1MiwxMy4zNTA3LDkuMTY5NjgsMTEuODA2Niw4LjAxMzU3LDEwLjA4ODJMMTEuMDIyNiw1LjU4MjU4QzEyLjE4NjcsNi4xODQzOSwxMy4zNTA3LDYuMjQ3NzQsMTQsNS41OTg0Mkw4LjQwMTU4LDBaIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGZpbGw9IiNDN0QxREMiIGZpbGwtb3BhY2l0eT0iMSIvPjwvZz48L3N2Zz4=) */
const IconDing = (props: IconParams) => <Icon component={iconSvg} {...props} />

export default IconDing
