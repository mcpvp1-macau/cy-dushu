import Icon from '@ant-design/icons'

type IconParams = Omit<Parameters<typeof Icon>[0], 'component'>

const iconSvg = (props: any) => {
  return (
    <svg viewBox="0 0 1024 1024" {...props}>
      <path
        d="M950.869333 213.333333c-20.48 0-38.784 8.064-51.925333 21.205334L512 622.208 125.056 234.538667A72.917333 72.917333 0 0 0 73.130667 213.333333 73.386667 73.386667 0 0 0 0 286.464c0 20.48 8.064 38.784 21.205333 51.925333l438.869334 438.869334c13.141333 13.184 31.445333 21.205333 51.925333 21.205333 20.48 0 38.784-8.021333 51.925333-21.205333L1002.794667 338.389333c13.141333-13.141333 21.205333-31.445333 21.205333-51.925333A73.386667 73.386667 0 0 0 950.869333 213.333333z"
        p-id="49343"
      ></path>
    </svg>
  )
}

const IconExpand = (props: IconParams) => (
  <Icon component={iconSvg} {...props} />
)

export default IconExpand
