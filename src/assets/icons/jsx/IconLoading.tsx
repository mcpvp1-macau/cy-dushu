import { type SVGAttributes } from 'react'
import Icon from '@ant-design/icons'

type IconParams = Omit<Parameters<typeof Icon>[0], 'component'>

const iconSvg = (props: SVGAttributes<SVGElement>) => {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <rect x="5" y="16" width="2" height="2" rx="2" fill="currentColor">
        <animate
          attributeName="x"
          dur="1360ms"
          values="6;10;10;16;16"
          keyTimes="0;0.25;0.5;0.75;1"
          repeatCount="indefinite"
          keySplines="0 0.8 0.8 1"
        ></animate>
        <animate
          attributeName="y"
          dur="1360ms"
          values="16;5;5;16;16"
          keyTimes="0;0.25;0.5;0.75;1"
          repeatCount="indefinite"
          keySplines="0 0.8 0.8 1"
        ></animate>
        <animate
          attributeName="height"
          dur="680ms"
          values="2;4;4;2;2"
          keyTimes="0;0.25;0.5;0.75;1"
          repeatCount="indefinite"
          keySplines="0 0.8 0.8 1"
        ></animate>
        <animate
          attributeName="width"
          dur="680ms"
          values="2;4;4;2;2"
          keyTimes="0;0.25;0.5;0.75;1"
          repeatCount="indefinite"
          keySplines="0 0.8 0.8 1"
        ></animate>
      </rect>
      <rect x="11" y="6" width="2" height="2" rx="2" fill="currentColor">
        <animate
          attributeName="x"
          dur="1360ms"
          values="11;16;16;6;6"
          keyTimes="0;0.25;0.5;0.75;1"
          repeatCount="indefinite"
          keySplines="0 0.8 0.8 1"
        ></animate>
        <animate
          attributeName="y"
          dur="1360ms"
          values="7;15;15;16;16"
          keyTimes="0;0.25;0.5;0.75;1"
          repeatCount="indefinite"
          keySplines="0 0.8 0.8 1"
        ></animate>
        <animate
          attributeName="height"
          dur="680ms"
          values="2;4;4;2;2"
          keyTimes="0;0.25;0.5;0.75;1"
          repeatCount="indefinite"
          keySplines="0 0.8 0.8 1"
        ></animate>
        <animate
          attributeName="width"
          dur="680ms"
          values="2;4;4;2;2"
          keyTimes="0;0.25;0.5;0.75;1"
          repeatCount="indefinite"
          keySplines="0 0.8 0.8 1"
        ></animate>
      </rect>
      <rect x="17" y="16" width="2" height="2" rx="2" fill="currentColor">
        <animate
          attributeName="x"
          dur="1360ms"
          values="16;4;4;11;11"
          keyTimes="0;0.25;0.5;0.75;1"
          repeatCount="indefinite"
          keySplines="0 0.8 0.8 1; 0 0.8 0.8 1; 0 0.8 0.8 1"
        ></animate>
        <animate
          attributeName="y"
          dur="1360ms"
          values="16;15;15;7;7"
          keyTimes="0;0.25;0.5;0.75;1"
          repeatCount="indefinite"
          keySplines="0 0.8 0.8 1; 0 0.8 0.8 1; 0 0.8 0.8 1"
        ></animate>
        <animate
          attributeName="height"
          dur="680ms"
          values="2;4;4;2;2"
          keyTimes="0;0.25;0.5;0.75;1"
          repeatCount="indefinite"
          keySplines="0 0.8 0.8 1"
        ></animate>
        <animate
          attributeName="width"
          dur="680ms"
          values="2;4;4;2;2"
          keyTimes="0;0.25;0.5;0.75;1"
          repeatCount="indefinite"
          keySplines="0 0.8 0.8 1"
        ></animate>
      </rect>
    </svg>
  )
}

/**![icon](data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSI1IiB5PSIxNiIgd2lkdGg9IjIiIGhlaWdodD0iMiIgcng9IjIiIGZpbGw9ImN1cnJlbnRDb2xvciI+PGFuaW1hdGUgYXR0cmlidXRlTmFtZT0ieCIgZHVyPSIxMzYwbXMiIHZhbHVlcz0iNjsxMDsxMDsxNjsxNiIga2V5VGltZXM9IjA7MC4yNTswLjU7MC43NTsxIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIga2V5U3BsaW5lcz0iMCAwLjggMC44IDEiPjwvYW5pbWF0ZT48YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSJ5IiBkdXI9IjEzNjBtcyIgdmFsdWVzPSIxNjs1OzU7MTY7MTYiIGtleVRpbWVzPSIwOzAuMjU7MC41OzAuNzU7MSIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiIGtleVNwbGluZXM9IjAgMC44IDAuOCAxIj48L2FuaW1hdGU+PGFuaW1hdGUgYXR0cmlidXRlTmFtZT0iaGVpZ2h0IiBkdXI9IjY4MG1zIiB2YWx1ZXM9IjI7NDs0OzI7MiIga2V5VGltZXM9IjA7MC4yNTswLjU7MC43NTsxIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIga2V5U3BsaW5lcz0iMCAwLjggMC44IDEiPjwvYW5pbWF0ZT48YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSJ3aWR0aCIgZHVyPSI2ODBtcyIgdmFsdWVzPSIyOzQ7NDsyOzIiIGtleVRpbWVzPSIwOzAuMjU7MC41OzAuNzU7MSIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiIGtleVNwbGluZXM9IjAgMC44IDAuOCAxIj48L2FuaW1hdGU+PC9yZWN0PjxyZWN0IHg9IjExIiB5PSI2IiB3aWR0aD0iMiIgaGVpZ2h0PSIyIiByeD0iMiIgZmlsbD0iY3VycmVudENvbG9yIj48YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSJ4IiBkdXI9IjEzNjBtcyIgdmFsdWVzPSIxMTsxNjsxNjs2OzYiIGtleVRpbWVzPSIwOzAuMjU7MC41OzAuNzU7MSIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiIGtleVNwbGluZXM9IjAgMC44IDAuOCAxIj48L2FuaW1hdGU+PGFuaW1hdGUgYXR0cmlidXRlTmFtZT0ieSIgZHVyPSIxMzYwbXMiIHZhbHVlcz0iNzsxNTsxNTsxNjsxNiIga2V5VGltZXM9IjA7MC4yNTswLjU7MC43NTsxIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIga2V5U3BsaW5lcz0iMCAwLjggMC44IDEiPjwvYW5pbWF0ZT48YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSJoZWlnaHQiIGR1cj0iNjgwbXMiIHZhbHVlcz0iMjs0OzQ7MjsyIiBrZXlUaW1lcz0iMDswLjI1OzAuNTswLjc1OzEiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIiBrZXlTcGxpbmVzPSIwIDAuOCAwLjggMSI+PC9hbmltYXRlPjxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9IndpZHRoIiBkdXI9IjY4MG1zIiB2YWx1ZXM9IjI7NDs0OzI7MiIga2V5VGltZXM9IjA7MC4yNTswLjU7MC43NTsxIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIga2V5U3BsaW5lcz0iMCAwLjggMC44IDEiPjwvYW5pbWF0ZT48L3JlY3Q+PHJlY3QgeD0iMTciIHk9IjE2IiB3aWR0aD0iMiIgaGVpZ2h0PSIyIiByeD0iMiIgZmlsbD0iY3VycmVudENvbG9yIj48YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSJ4IiBkdXI9IjEzNjBtcyIgdmFsdWVzPSIxNjs0OzQ7MTE7MTEiIGtleVRpbWVzPSIwOzAuMjU7MC41OzAuNzU7MSIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiIGtleVNwbGluZXM9IjAgMC44IDAuOCAxOyAwIDAuOCAwLjggMTsgMCAwLjggMC44IDEiPjwvYW5pbWF0ZT48YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSJ5IiBkdXI9IjEzNjBtcyIgdmFsdWVzPSIxNjsxNTsxNTs3OzciIGtleVRpbWVzPSIwOzAuMjU7MC41OzAuNzU7MSIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiIGtleVNwbGluZXM9IjAgMC44IDAuOCAxOyAwIDAuOCAwLjggMTsgMCAwLjggMC44IDEiPjwvYW5pbWF0ZT48YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSJoZWlnaHQiIGR1cj0iNjgwbXMiIHZhbHVlcz0iMjs0OzQ7MjsyIiBrZXlUaW1lcz0iMDswLjI1OzAuNTswLjc1OzEiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIiBrZXlTcGxpbmVzPSIwIDAuOCAwLjggMSI+PC9hbmltYXRlPjxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9IndpZHRoIiBkdXI9IjY4MG1zIiB2YWx1ZXM9IjI7NDs0OzI7MiIga2V5VGltZXM9IjA7MC4yNTswLjU7MC43NTsxIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIga2V5U3BsaW5lcz0iMCAwLjggMC44IDEiPjwvYW5pbWF0ZT48L3JlY3Q+PC9zdmc+) */
const IconLoading = (props: IconParams) => (
  <Icon component={iconSvg} {...props} />
)

export default IconLoading
