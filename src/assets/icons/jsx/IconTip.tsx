import { type SVGAttributes } from 'react'
import Icon from '@ant-design/icons'

type IconParams = Omit<Parameters<typeof Icon>[0], 'component'>

const iconSvg = (props: SVGAttributes<SVGElement>) => {
  return (
    <svg viewBox="0 0 1024 1024" {...props}>
      <path
        d="M512 1024A512 512 0 1 1 512 0a512 512 0 0 1 0 1024z m0-102.4a409.6 409.6 0 1 0 0-819.2 409.6 409.6 0 0 0 0 819.2z m51.2-102.4H460.8V716.8h102.4v102.4z m0-153.6H460.8V204.8h102.4v460.8z"
        fill="currentColor"
      ></path>
    </svg>
  )
}

const IconTip = (props: IconParams) => <Icon component={iconSvg} {...props} />

export default IconTip
