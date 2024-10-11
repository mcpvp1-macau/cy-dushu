import { type SVGAttributes } from 'react'
import Icon from '@ant-design/icons'

type IconParams = Omit<Parameters<typeof Icon>[0], 'component'>

const iconSvg = (props: SVGAttributes<SVGElement>) => {
  return (
    <svg fill="none" viewBox="0 0 14 14" {...props}>
      <g>
        <path
          d="M13,6L8,6L8,1C8,0.45,7.55,0,7,0C6.45,0,6,0.45,6,1L6,6L1,6C0.45,6,0,6.45,0,7C0,7.55,0.45,8,1,8L6,8L6,13C6,13.55,6.45,14,7,14C7.55,14,8,13.55,8,13L8,8L13,8C13.55,8,14,7.55,14,7C14,6.45,13.55,6,13,6Z"
          fill="currentColor"
          fillRule="evenodd"
          fillOpacity="1"
        />
      </g>
    </svg>
  )
}

/**![icon](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBmaWxsPSJub25lIiB2ZXJzaW9uPSIxLjEiIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDE0IDE0Ij48Zz48cGF0aCBkPSJNMTMsNkw4LDZMOCwxQzgsMC40NSw3LjU1LDAsNywwQzYuNDUsMCw2LDAuNDUsNiwxTDYsNkwxLDZDMC40NSw2LDAsNi40NSwwLDdDMCw3LjU1LDAuNDUsOCwxLDhMNiw4TDYsMTNDNiwxMy41NSw2LjQ1LDE0LDcsMTRDNy41NSwxNCw4LDEzLjU1LDgsMTNMOCw4TDEzLDhDMTMuNTUsOCwxNCw3LjU1LDE0LDdDMTQsNi40NSwxMy41NSw2LDEzLDZaIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGZpbGw9IiNDN0QxREMiIGZpbGwtb3BhY2l0eT0iMSIvPjwvZz48L3N2Zz4=) */
const IconPlus = (props: IconParams) => <Icon component={iconSvg} {...props} />

export default IconPlus
