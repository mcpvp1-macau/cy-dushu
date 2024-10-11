import Icon from '@ant-design/icons'

type IconParams = Omit<Parameters<typeof Icon>[0], 'component'>

const iconSvg = () => {
  return (
    <svg
      fill="none"
      version="1.1"
      width="16"
      height="16.462890625"
      viewBox="0 0 16 16.462890625"
    >
      <defs>
        <linearGradient x1="0.5" y1="0" x2="0.5" y2="1" id="master_svg0_0_8594">
          <stop offset="0%" stopColor="#15B371" stopOpacity="0" />
          <stop offset="100%" stopColor="#15B371" stopOpacity="1" />
        </linearGradient>
        <linearGradient x1="0.5" y1="0" x2="0.5" y2="1" id="master_svg1_0_8597">
          <stop offset="0%" stopColor="#20FFA2" stopOpacity="0" />
          <stop offset="100%" stopColor="#15B371" stopOpacity="1" />
        </linearGradient>
        <linearGradient x1="0.5" y1="0" x2="0.5" y2="1" id="master_svg2_0_8597">
          <stop offset="0%" stopColor="#20FFA2" stopOpacity="0" />
          <stop offset="100%" stopColor="#15B371" stopOpacity="1" />
        </linearGradient>
      </defs>
      <g>
        <g>
          <path
            d="M8.183832265625,9.7387378125L5.058132265625,3.5219378125L3.549072265625,0.5205078125L12.132322265625,0.5205078125L8.183832265625,9.7387378125Z"
            fillRule="evenodd"
            fill="url(#master_svg0_0_8594)"
            fillOpacity="1"
          />
        </g>
        <g>
          <path
            d="M3.4320451445007327,0.30280082657623286L4.025975144500732,-0.000006173423767102948L8.532085144500734,8.838352826576234L7.938165144500733,9.141162826576233L3.4320451445007327,0.30280082657623286Z"
            fill="url(#master_svg1_0_8597)"
            fillOpacity="1"
          />
        </g>
        <g transform="matrix(-1,0,0,1,36.42184829711914,0)">
          <path
            d="M24.28123414855957,0.3480751286315918L24.89246414855957,0.0819091286315918L28.77682414855957,9.001930128631592L28.16557414855957,9.268100128631591L24.28123414855957,0.3480751286315918Z"
            fill="url(#master_svg2_0_8597)"
            fillOpacity="1"
          />
        </g>
        <g>
          <path
            d="M3.406005859375,16.46287763671875L8.088435859375,5.12957763671875L12.743105859375,16.46287763671875L8.041045859375,13.82897763671875L3.406005859375,16.46287763671875Z"
            fillRule="evenodd"
            fill="currentColor"
            fillOpacity="1"
          />
        </g>
      </g>
    </svg>
  )
}

/**![icon](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBmaWxsPSJub25lIiB2ZXJzaW9uPSIxLjEiIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDE2IDE2LjQ2Mjg5MDYyNSI+PGRlZnM+PGxpbmVhckdyYWRpZW50IHgxPSIwLjUiIHkxPSIwIiB4Mj0iMC41IiB5Mj0iMSIgaWQ9Im1hc3Rlcl9zdmcwXzBfODU5NCI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzE1QjM3MSIgc3RvcC1vcGFjaXR5PSIwIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMTVCMzcxIiBzdG9wLW9wYWNpdHk9IjEiLz48L2xpbmVhckdyYWRpZW50PjxsaW5lYXJHcmFkaWVudCB4MT0iMC41IiB5MT0iMCIgeDI9IjAuNSIgeTI9IjEiIGlkPSJtYXN0ZXJfc3ZnMV8wXzg1OTciPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMyMEZGQTIiIHN0b3Atb3BhY2l0eT0iMCIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzE1QjM3MSIgc3RvcC1vcGFjaXR5PSIxIi8+PC9saW5lYXJHcmFkaWVudD48bGluZWFyR3JhZGllbnQgeDE9IjAuNSIgeTE9IjAiIHgyPSIwLjUiIHkyPSIxIiBpZD0ibWFzdGVyX3N2ZzJfMF84NTk3Ij48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMjBGRkEyIiBzdG9wLW9wYWNpdHk9IjAiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMxNUIzNzEiIHN0b3Atb3BhY2l0eT0iMSIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxnPjxnPjxwYXRoIGQ9Ik04LjE4MzgzMjI2NTYyNSw5LjczODczNzgxMjVMNS4wNTgxMzIyNjU2MjUsMy41MjE5Mzc4MTI1TDMuNTQ5MDcyMjY1NjI1LDAuNTIwNTA3ODEyNUwxMi4xMzIzMjIyNjU2MjUsMC41MjA1MDc4MTI1TDguMTgzODMyMjY1NjI1LDkuNzM4NzM3ODEyNVoiIGZpbGwtcnVsZT0iZXZlbm9kZCIgZmlsbD0idXJsKCNtYXN0ZXJfc3ZnMF8wXzg1OTQpIiBmaWxsLW9wYWNpdHk9IjEiLz48L2c+PGc+PHBhdGggZD0iTTMuNDMyMDQ1MTQ0NTAwNzMyNywwLjMwMjgwMDgyNjU3NjIzMjg2TDQuMDI1OTc1MTQ0NTAwNzMyLC0wLjAwMDAwNjE3MzQyMzc2NzEwMjk0OEw4LjUzMjA4NTE0NDUwMDczNCw4LjgzODM1MjgyNjU3NjIzNEw3LjkzODE2NTE0NDUwMDczMyw5LjE0MTE2MjgyNjU3NjIzM0wzLjQzMjA0NTE0NDUwMDczMjcsMC4zMDI4MDA4MjY1NzYyMzI4NloiIGZpbGw9InVybCgjbWFzdGVyX3N2ZzFfMF84NTk3KSIgZmlsbC1vcGFjaXR5PSIxIi8+PC9nPjxnIHRyYW5zZm9ybT0ibWF0cml4KC0xLDAsMCwxLDM2LjQyMTg0ODI5NzExOTE0LDApIj48cGF0aCBkPSJNMjQuMjgxMjM0MTQ4NTU5NTcsMC4zNDgwNzUxMjg2MzE1OTE4TDI0Ljg5MjQ2NDE0ODU1OTU3LDAuMDgxOTA5MTI4NjMxNTkxOEwyOC43NzY4MjQxNDg1NTk1Nyw5LjAwMTkzMDEyODYzMTU5MkwyOC4xNjU1NzQxNDg1NTk1Nyw5LjI2ODEwMDEyODYzMTU5MUwyNC4yODEyMzQxNDg1NTk1NywwLjM0ODA3NTEyODYzMTU5MThaIiBmaWxsPSJ1cmwoI21hc3Rlcl9zdmcyXzBfODU5NykiIGZpbGwtb3BhY2l0eT0iMSIvPjwvZz48Zz48cGF0aCBkPSJNMy40MDYwMDU4NTkzNzUsMTYuNDYyODc3NjM2NzE4NzVMOC4wODg0MzU4NTkzNzUsNS4xMjk1Nzc2MzY3MTg3NUwxMi43NDMxMDU4NTkzNzUsMTYuNDYyODc3NjM2NzE4NzVMOC4wNDEwNDU4NTkzNzUsMTMuODI4OTc3NjM2NzE4NzVMMy40MDYwMDU4NTkzNzUsMTYuNDYyODc3NjM2NzE4NzVaIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGZpbGw9IiNGRkZGRkYiIGZpbGwtb3BhY2l0eT0iMSIvPjwvZz48L2c+PC9zdmc+) */
const IconIntelligentTrack = (props: IconParams) => (
  <Icon component={iconSvg} {...props} />
)

export default IconIntelligentTrack
