import { type SVGAttributes } from 'react'
import Icon from '@ant-design/icons'

type IconParams = Omit<Parameters<typeof Icon>[0], 'component'>

const iconSvg = (props: SVGAttributes<SVGElement>) => {
  return (
    <svg viewBox="0 0 1024 1024" {...props}>
      <path
        d="M512 96C282.304 96 96 282.304 96 512s186.304 416 416 416 416-186.304 416-416S741.696 96 512 96zm0 704c-158.784 0-288-129.216-288-288S353.216 224 512 224s288 129.216 288 288-129.216 288-288 288z"
        fill="currentColor"
      />
      <path
        d="M512 336a112 112 0 1 0 112 112A112 112 0 0 0 512 336zm0 160a48 48 0 1 1 48-48 48 48 0 0 1-48 48z"
        fill="currentColor"
      />
      <path
        d="M320 480h72a24 24 0 0 1 24 24v16a24 24 0 0 1-24 24h-72a24 24 0 0 1-24-24v-16a24 24 0 0 1 24-24zm312 40v-16a24 24 0 0 1 24-24h72a24 24 0 0 1 24 24v16a24 24 0 0 1-24 24h-72a24 24 0 0 1-24-24zM488 344v-72a24 24 0 0 1 24-24h16a24 24 0 0 1 24 24v72a24 24 0 0 1-24 24h-16a24 24 0 0 1-24-24zm0 408v-72a24 24 0 0 1 24-24h16a24 24 0 0 1 24 24v72a24 24 0 0 1-24 24h-16a24 24 0 0 1-24-24z"
        fill="currentColor"
      />
      <path
        d="M624.96 320a24 24 0 0 1-1.216-33.952l64-68.224a24 24 0 0 1 31.648-2.592l144 104a24 24 0 0 1-7.2 42.256l-176 48a24 24 0 0 1-18.208-2.256l-51.2-27.776a24 24 0 0 1-10.624-19.456zm81.12-8.864-33.472 35.68 12.224 6.624 74.432-20.288z"
        fill="currentColor"
      />
    </svg>
  )
}

const IconUavMapFollow = (props: IconParams) => <Icon component={iconSvg} {...props} />

export default IconUavMapFollow
