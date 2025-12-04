import { type SVGAttributes } from 'react'
import Icon from '@ant-design/icons'

type IconParams = Omit<Parameters<typeof Icon>[0], 'component'>

const iconSvg = (props: SVGAttributes<SVGElement>) => {
  return (
    <svg viewBox="0 0 1024 1024" {...props}>
      <path
        d="M512 64c247.424 0 448 200.576 448 448S759.424 960 512 960 64 759.424 64 512 264.576 64 512 64zm0 80C308.768 144 144 308.768 144 512S308.768 880 512 880 880 715.232 880 512 715.232 144 512 144z"
        fill="currentColor"
      />
      <path
        d="M512 224c17.664 0 32 14.336 32 32v192h192c17.664 0 32 14.336 32 32s-14.336 32-32 32H544v192c0 17.664-14.336 32-32 32s-32-14.336-32-32V512H288c-17.664 0-32-14.336-32-32s14.336-32 32-32h192V256c0-17.664 14.336-32 32-32z"
        fill="currentColor"
      />
    </svg>
  )
}

const IconApplyGlobal = (props: IconParams) => (
  <Icon component={iconSvg} {...props} />
)

export default IconApplyGlobal
