import { type SVGAttributes } from 'react'
import Icon from '@ant-design/icons'

type IconParams = Omit<Parameters<typeof Icon>[0], 'component'>

const iconSvg = (props: SVGAttributes<SVGElement>) => {
  return (
    <svg
      viewBox="0 0 14 14"
      stroke="currentColor"
      fill="none"
      strokeWidth="0.4"
      {...props}
    >
      <path d="M 6 5 L 8 5 L 8 7 L 6 7 Z" />
      <path d="M 6 5 L 4.5 4 M 8 5 L 9.5 4 M 6 7 L 4.5 8 M 8 7 L 9.5 8" />
      <path d="M 4 4 H 5 M 9 4 H 10 M 4 8 H 5 M 9 8 H 10" />
      <path d="M 2 10 Q 7 12 12 10" />
    </svg>
  )
}

/**![icon](data:image/svg+xml;base64,PHN2ZyBzdHJva2Utd2lkdGg9IjEiIHZpZXdCb3g9IjAgMCAxNCAxNCIgc3Ryb2tlPSIjNDc1NTY5IiBmaWxsPSJub25lIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPgogIDxwYXRoIGQ9Ik0gNiA1IEwgOCA1IEwgOCA3IEwgNiA3IFoiLz4KICA8cGF0aCBkPSJNIDYgNSBMIDQuNSA0IE0gOCA1IEwgOS41IDQgTSA2IDcgTCA0LjUgOCBNIDggNyBMIDkuNSA4Ii8+CiAgPHBhdGggZD0iTSA0IDQgSCA1IE0gOSA0IEggMTAgTSA0IDggSCA1IE0gOSA4IEggMTAiLz4KICA8cGF0aCBkPSJNIDIgMTAgUSA3IDEyIDEyIDEwIi8+Cjwvc3ZnPg==) */
const IconXXX = (props: IconParams) => <Icon component={iconSvg} {...props} />

export default IconXXX
