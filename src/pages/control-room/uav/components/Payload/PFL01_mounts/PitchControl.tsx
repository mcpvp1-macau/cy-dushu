import IconTurnLeft from '@/assets/icons/jsx/uav/IconTurnLeft'

type Props = {
  fov?: number
  value?: number
  onLeftClick?: () => void
  onRightClick?: () => void
}

const PitchControl: React.FC<Props> = ({
  value = 0,
  fov = 60,
  onLeftClick,
  onRightClick,
}) => {
  const handleLeft = () => {
    onLeftClick?.()
  }

  const handleRight = () => {
    onRightClick?.()
  }

  const getSectorPath = (
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
  ) => {
    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180

    const x1 = x + radius * Math.cos(startRad)
    const y1 = y + radius * Math.sin(startRad)
    const x2 = x + radius * Math.cos(endRad)
    const y2 = y + radius * Math.sin(endRad)

    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'

    return [
      'M',
      x,
      y,
      'L',
      x1,
      y1,
      'A',
      radius,
      radius,
      0,
      largeArcFlag,
      1,
      x2,
      y2,
      'Z',
    ].join(' ')
  }

  const visualAngleOffset = 0
  const displayAngle = value + visualAngleOffset
  const startAngle = displayAngle - fov / 2
  const endAngle = displayAngle + fov / 2

  return (
    <div className="w-[170px] h-[126px] relative">
      <div className="absolute abs-center flex items-center scale-90">
        {/* Left Button */}
        <button
          className={`
            size-24 rounded-full 
            flex items-center justify-start pl-7
            focus:outline-none cursor-pointer
            relative z-10
            transform translate-x-16
            shadow-lg transition-transform active:scale-[0.98]
          `}
          style={{
            boxShadow:
              'inset 0 1px 1px rgba(255,255,255,0.05), 0 2px 4px rgba(0,0,0,0.5)',
          }}
          onClick={handleLeft}
          onTouchStart={handleLeft}
          aria-label="Rotate Left"
        >
          <IconTurnLeft className="absolute left-2 -rotate-90" />
        </button>

        {/* Center Radar Unit */}
        <div className="relative z-20 mx-[-10px]">
          {/* Outer Ring */}
          <div
            className="size-[140px] rounded-full flex items-center justify-center"
            style={{
              backgroundColor: 'rgb(var(--ground-color-3))',
              boxShadow:
                'inset 0 1px 1px rgba(255,255,255,0.05), 0 2px 4px rgba(0,0,0,0.5)',
            }}
          >
            {/* Inner Radar Screen */}
            <div className="w-[124px] h-[124px] rounded-full relative overflow-hidden bg-black">
              {/* Background Grid/Target */}
              <div className="absolute inset-0 opacity-30">
                {/* Crosshair */}
                <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gray-500 transform -translate-x-1/2"></div>
                <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-gray-500 transform -translate-y-1/2"></div>
                {/* Circles */}
                <div className="absolute left-1/2 top-1/2 w-[60%] h-[60%] border border-gray-600 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute left-1/2 top-1/2 w-[30%] h-[30%] border border-gray-700 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
              </div>

              {/* Radar Sector */}
              <svg
                className="w-full h-full relative z-10"
                viewBox="0 0 100 100"
              >
                <path
                  d={getSectorPath(50, 50, 48, startAngle, endAngle)}
                  fill="rgba(59, 130, 246, 0.6)"
                  stroke="rgba(59, 130, 246, 0.8)"
                  strokeWidth="1"
                />
                {/* Center Pivot */}
                <circle cx="50" cy="50" r="4" fill="#60a5fa" />
              </svg>

              {/* Glass/Gloss Effect */}
              <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  background:
                    'radial-gradient(circle at 50% 30%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 60%)',
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Right Button */}
        <button
          className={`
            size-24 rounded-full 
            flex items-center justify-end pr-7
            focus:outline-none cursor-pointer
            relative z-10
            transform -translate-x-16
            shadow-lg transition-transform active:scale-[0.98]
          `}
          style={{
            backgroundColor: 'var(rgb(--ground-color-3))',
            boxShadow:
              'inset 0 1px 1px rgba(255,255,255,0.05), 0 2px 4px rgba(0,0,0,0.5)',
          }}
          onClick={handleRight}
          onTouchStart={handleRight}
          aria-label="Rotate Right"
        >
          <IconTurnLeft className="absolute right-1.5 rotate-90" />
        </button>
      </div>
    </div>
  )
}

export default PitchControl
