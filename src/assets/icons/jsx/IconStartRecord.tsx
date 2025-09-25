import { type SVGAttributes } from 'react'
import Icon from '@ant-design/icons'

type IconParams = Omit<Parameters<typeof Icon>[0], 'component'>

const iconSvg = (props: SVGAttributes<SVGElement>) => {
  return (
    <svg viewBox="0 0 1024 1024" {...props}>
      <path
        d="M716.8 213.333333c28.16 0 51.2 23.04 51.2 51.2v183.808l168.448-168.96A51.370667 51.370667 0 0 1 1024 315.733333V725.333333c0 28.16-23.04 51.2-51.2 51.2-14.336 0-27.136-5.632-36.352-15.36L768 592.725333V776.533333c0 28.16-23.04 51.2-51.2 51.2H51.2c-28.16 0-51.2-23.04-51.2-51.2v-512C0 236.373333 23.04 213.333333 51.2 213.333333zM330.666667 341.333333v341.333334l256-170.666667-256-170.666667z"
        fill="currentColor"
      ></path>
    </svg>
  )
}

/**![icon](data:image/svg+xml;base64,PHN2ZyB0PSIxNzU3MzA5NzYzNDUyIiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjEwNTgyIiB3aWR0aD0iNDgiIGhlaWdodD0iNDgiPjxwYXRoIGQ9Ik03MTYuOCAyMTMuMzMzMzMzYzI4LjE2IDAgNTEuMiAyMy4wNCA1MS4yIDUxLjJ2MTgzLjgwOGwxNjguNDQ4LTE2OC45NkE1MS4zNzA2NjcgNTEuMzcwNjY3IDAgMCAxIDEwMjQgMzE1LjczMzMzM1Y3MjUuMzMzMzMzYzAgMjguMTYtMjMuMDQgNTEuMi01MS4yIDUxLjItMTQuMzM2IDAtMjcuMTM2LTUuNjMyLTM2LjM1Mi0xNS4zNkw3NjggNTkyLjcyNTMzM1Y3NzYuNTMzMzMzYzAgMjguMTYtMjMuMDQgNTEuMi01MS4yIDUxLjJINTEuMmMtMjguMTYgMC01MS4yLTIzLjA0LTUxLjItNTEuMnYtNTEyQzAgMjM2LjM3MzMzMyAyMy4wNCAyMTMuMzMzMzMzIDUxLjIgMjEzLjMzMzMzM3pNMzMwLjY2NjY2NyAzNDEuMzMzMzMzdjM0MS4zMzMzMzRsMjU2LTE3MC42NjY2NjctMjU2LTE3MC42NjY2Njd6IiBwLWlkPSIxMDU4MyIgZmlsbD0iI2M3ZDFkYyI+PC9wYXRoPjwvc3ZnPg==) */
const IconStartRecord = (props: IconParams) => (
  <Icon component={iconSvg} {...props} />
)

export default IconStartRecord
