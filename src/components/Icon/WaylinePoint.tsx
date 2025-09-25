type PropsType = {
  text: string | number
  color: string
  outlineColor?: string
}

const WaylinePointBillboard: FC<PropsType> = ({
  text,
  color,
  outlineColor = '#FFFFFF',
}) => {
  return (
    <svg
      width="24px"
      height="24px"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g transform="translate(0.000000, 2.000000)" fillRule="nonzero">
          <polygon
            fill={outlineColor}
            transform="translate(12.000000, 10.392305) scale(1, -1) translate(-12.000000, -10.392305) "
            points="12 0 24 20.7846097 1.53028272e-12 20.7846097"
          ></polygon>
          <polygon
            fill={color}
            transform="translate(12.032392, 9.765291) scale(1, -1) translate(-12.032392, -9.765291) "
            points="12.0327879 1.27329294 2.22720289 18.2572883 21.8375811 18.2572883"
          ></polygon>
          <text x="12" y="13" text-anchor="middle" fill="#FFFFFF" fontSize="14">
            {text}
          </text>
        </g>
      </g>
    </svg>
  )
}

export const getWaylinePointBillboardSvgURI = (props: PropsType) => {
  return (
    'data:image/svg+xml;utf-8,' +
    encodeURIComponent(`<svg width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(0, 2)" fill-rule="nonzero">
            <polygon fill="${
              props.outlineColor ?? '#FFF'
            }" transform="translate(12, 10.392) scale(1, -1) translate(-12, -10.392) " points="12 0 24 20.7846097 1.53028272e-12 20.7846097"></polygon>
            <polygon fill="${
              props.color ?? '#03D68F'
            }" transform="translate(12.032, 9.765) scale(1, -1) translate(-12.032, -9.765) " points="12.0327 1.27329294 2.22720289 18.2572883 21.8375811 18.2572883"></polygon>
            <text x="12" y="13" text-anchor="middle" fill="#FFFFFF" font-size="14">${
              props.text
            }</text>
        </g>
</svg>`)
  )
}

export default WaylinePointBillboard
