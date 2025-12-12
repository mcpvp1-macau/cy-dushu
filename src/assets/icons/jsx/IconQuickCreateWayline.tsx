import { type SVGAttributes } from 'react'
import Icon from '@ant-design/icons'

type IconParams = Omit<Parameters<typeof Icon>[0], 'component'>

const iconSvg = (props: SVGAttributes<SVGElement>) => {
  return (
    <svg viewBox="0 0 1024 1024" {...props}>
      <path
        d="M1024 242.261333L624.810667 42.666667l86.784 199.594666-86.784 199.594667L1024 242.261333z m-242.986667 0h121.514667l-173.568 95.445334 52.053333-95.445334z"
        fill="currentColor"
      />
      <path
        d="M711.594667 502.613333H312.405333a104.106667 104.106667 0 1 1 0-208.298666h295.04V207.530667H312.405333a190.933333 190.933333 0 0 0 0 381.866666h399.189334a104.106667 104.106667 0 0 1 0 208.213334H381.824v86.826666h329.770667a190.933333 190.933333 0 0 0 0-381.866666z m-512 182.186667H112.810667v112.853333H0v86.784h112.810667v112.810667h86.784v-112.810667h112.810666v-86.784H199.594667V684.8z"
        fill="currentColor"
      />
    </svg>
  )
}

const IconQuickCreateWayline = (props: IconParams) => (
  <Icon component={iconSvg} {...props} />
)

export default IconQuickCreateWayline
