const StatusPic: React.FC = () => {
  const { t } = useTranslation()

  const render = (label, column, style) => {
    return (
      <div
        className={clsx(
          'absolute flex border-[1px] border-[#37414d] rounded-[3px]',
          'w-[74px] h-[24px] justify-center text-[12px] leading-[24px]',
          'shadow',
        )}
        style={{
          top: style.top,
          left: style.left,
        }}
      >
        {label}
      </div>
    )
  }
  return (
    <div
      className={clsx(
        "bg-[url('@/assets/imgs/car/laser.png')] size-full bg-origin-content bg-no-repeat bg-center bg-contain grid grid-cols-2 gap-x-2",
        'p-[0px]',
        'h-[132px]',
      )}
    >
      {/* {render('光电', 'edgeComputeStatus', {
        top: 60,
        left: `calc(50% - 74px - 74px - 10px)`,
      })}
      {render('激光', 'infraredStatus', {
        top: 110,
        left: `calc(50% - 74px - 74px - 10px)`,
      })}
      {render('火炮', 'remainingPower', {
        top: 50,
        left: `calc(50% + 80px)`,
      })}
      {render('搜索雷达', 'edgeComputeDeviceStatus', {
        top: 85,
        left: `calc(50% + 80px)`,
      })}
      {render('跟踪雷达', 'visibleLightStatus', {
        top: 120,
        left: `calc(50% + 80px)`,
      })} */}
      
    </div>
  )
}

export default StatusPic
